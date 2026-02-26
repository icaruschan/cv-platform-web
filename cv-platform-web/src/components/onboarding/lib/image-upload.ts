/**
 * Upload a base64-encoded profile image to Supabase Storage
 * and return the public URL for use in Brief.personal.avatar_url.
 *
 * Uses the same bucket/path pattern the rest of the platform expects:
 *   profile-images/{email}/{filename}
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const BUCKET = 'profile-images';

/**
 * Convert a base64 data-URL string to a Blob.
 */
function dataUrlToBlob(dataUrl: string): Blob {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

/**
 * Upload a base64 profile image to Supabase Storage.
 * @returns The public URL of the uploaded image, or null on failure.
 */
export async function uploadProfileImage(
    base64Image: string,
    email: string
): Promise<string | null> {
    if (!base64Image || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

    try {
        const blob = dataUrlToBlob(base64Image);
        const ext = blob.type.split('/')[1] || 'png';
        const safeName = email.replace(/[^a-zA-Z0-9]/g, '_');
        const filePath = `${safeName}/avatar_${Date.now()}.${ext}`;

        // Use the Supabase Storage REST API directly
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filePath}`;

        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
                'Content-Type': blob.type,
                'x-upsert': 'true',
            },
            body: blob,
        });

        if (!res.ok) {
            console.error('Upload failed:', res.status, await res.text());
            return null;
        }

        // Build the public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`;
        return publicUrl;
    } catch (err) {
        console.error('Image upload error:', err);
        return null;
    }
}
