# StackBlitz Preview Blank Page Analysis

> Investigation into why the StackBlitz previewer shows a blank page in the CV Platform Web project.

**Date**: January 2025  
**Component**: `src/components/editor/StackBlitzPreview.tsx`

---

## Executive Summary

The StackBlitz preview frequently shows a blank page due to a combination of:
1. **Premature timeout** - Loading skeleton hides after 4 seconds, but WebContainers takes 15-45 seconds
2. **Missing configuration** - No explicit `stackblitz` config in package.json
3. **AI-generated code errors** - Runtime errors crash React silently
4. **No error visibility** - Build/runtime errors aren't surfaced to users

---

## Technical Analysis

### How the Current Implementation Works

```
User submits brief
    ↓
AI generates React/Vite code (src/lib/agents/builder.ts)
    ↓
Files stored in Supabase
    ↓
EditorPage polls for files
    ↓
StackBlitzPreview embeds project via SDK
    ↓
4-second timeout → loading skeleton disappears
    ↓
User sees blank page (Vite still booting)
```

---

## Issue #1: 4-Second Timeout is Insufficient (CRITICAL)

**Location**: `StackBlitzPreview.tsx:165-168`

```typescript
// Current implementation
const vm = await sdk.embedProject(...);
vmRef.current = vm;
setLoadingStage('build');

// Problem: Only waits 4 seconds before hiding loading UI
setTimeout(() => {
    setLoadingStage('ready');
    onLoad?.();
}, 4000);
```

**Why This Fails**:

WebContainers (used by `template: 'node'`) must:

| Step | Duration | Cumulative |
|------|----------|------------|
| Boot WebContainer | 2-5s | 2-5s |
| Install npm dependencies | 5-15s | 7-20s |
| Vite cold start | 5-10s | 12-30s |
| React compilation | 3-5s | 15-35s |

The 4-second timeout hides the loading skeleton while npm is still installing dependencies.

**Solution**:

```typescript
// Option A: Increase timeout significantly
setTimeout(() => {
    setLoadingStage('ready');
    onLoad?.();
}, 30000); // 30 seconds

// Option B: Listen for actual preview ready (preferred)
const vm = await sdk.embedProject(...);

// Poll for preview URL or use postMessage from iframe
const checkReady = setInterval(async () => {
    try {
        const previewUrl = await vm.preview.getUrl();
        if (previewUrl) {
            clearInterval(checkReady);
            setLoadingStage('ready');
        }
    } catch (e) {
        // Still loading
    }
}, 1000);
```

---

## Issue #2: Missing `stackblitz` Configuration

**Location**: `StackBlitzPreview.tsx:19-43`

```typescript
// Current basePackageJson
const basePackageJson = {
    name: 'portfolio',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
    },
    dependencies: { ... },
    devDependencies: { ... }
    // ❌ Missing stackblitz config
};
```

**Per StackBlitz Documentation**:

For WebContainers projects, you should include:

```json
{
  "stackblitz": {
    "installDependencies": true,
    "startCommand": "npm run dev"
  }
}
```

This explicitly tells StackBlitz:
- To auto-install dependencies on load
- Which script to run (instead of auto-detecting)

**Solution**:

```typescript
const basePackageJson = {
    // ... existing fields ...
    "stackblitz": {
        "installDependencies": true,
        "startCommand": "npm run dev"
    }
};
```

---

## Issue #3: AI-Generated Code May Have Errors

**Location**: `src/lib/agents/builder.ts`

The AI Builder generates React code that may contain:

| Error Type | Example | Detection |
|------------|---------|-----------|
| Missing imports | Uses `motion.div` without importing framer-motion | Partially detected |
| Next.js imports | `import Image from 'next/image'` | Detected & auto-fixed |
| Syntax errors | Malformed JSX | Not detected |
| Runtime errors | Undefined variable access | Not detected |
| Missing files | Imports `./components/Footer` that doesn't exist | Not detected |

**Current Validation** (`builder.ts:464-500`):

```typescript
export function detectErrors(files: GeneratedFile[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const file of files) {
        // Checks for Next.js imports
        if (file.content.includes("from 'next/")) {
            errors.push({ ... });
        }
        
        // Checks for missing framer-motion import
        if (file.content.includes('motion.') && !file.content.includes("from 'framer-motion'")) {
            errors.push({ ... });
        }
    }
    
    return errors;
}
```

**Missing Validations**:

1. **Import resolution** - Check that all imported files exist
2. **JSX syntax** - Basic syntax validation
3. **React hooks rules** - Hooks called conditionally
4. **TypeScript errors** - Run `tsc --noEmit` equivalent

**Solution**: Add more comprehensive validation:

```typescript
function detectErrors(files: GeneratedFile[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const filePaths = new Set(files.map(f => f.path));
    
    for (const file of files) {
        // Existing checks...
        
        // NEW: Check for imports of non-existent local files
        const importMatches = file.content.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g);
        for (const match of importMatches) {
            const importPath = `src/${match[1]}`;
            const possiblePaths = [
                importPath,
                `${importPath}.tsx`,
                `${importPath}.ts`,
                `${importPath}/index.tsx`
            ];
            
            if (!possiblePaths.some(p => filePaths.has(p))) {
                errors.push({
                    file: file.path,
                    message: `Import './\${match[1]}' not found`,
                    fixable: false
                });
            }
        }
        
        // NEW: Check for unbalanced JSX
        const openTags = (file.content.match(/<[A-Z][^/>]*>/g) || []).length;
        const closeTags = (file.content.match(/<\/[A-Z][^>]*>/g) || []).length;
        const selfClosing = (file.content.match(/<[A-Z][^>]*\/>/g) || []).length;
        
        if (openTags !== closeTags + selfClosing) {
            errors.push({
                file: file.path,
                message: 'Potentially unbalanced JSX tags',
                fixable: false
            });
        }
    }
    
    return errors;
}
```

---

## Issue #4: No Error Visibility

**Problem**: When Vite fails to build or React crashes, users see a blank page with no indication of what went wrong.

**Current Error Handling** (`StackBlitzPreview.tsx:170-176`):

```typescript
} catch (err) {
    console.error('StackBlitz embed error:', err);
    const error = err instanceof Error ? err : new Error('Failed to load preview');
    setError(error.message);
    setLoadingStage('error');
    onError?.(error);
}
```

This only catches SDK embedding errors, not:
- Vite build errors
- React runtime errors
- Missing dependency errors

**Solution**: Listen for errors from the iframe:

```typescript
useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        // Listen for Vite/React errors from the iframe
        if (event.data?.type === 'vite:error' || event.data?.type === 'error') {
            setError(event.data.message || 'Build error occurred');
            setLoadingStage('error');
        }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## Issue #5: Files May Be Empty on Initial Load

**Location**: `EditorPage.tsx:58-103`

```typescript
// Polling for status when files are empty
useEffect(() => {
    if (files && files.length > 0) {
        return; // Skip if files exist
    }
    
    const pollStatus = async () => {
        // ... polling logic
    };
    
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
}, [project.id, files]);
```

**Race Condition**: 

1. `EditorPage` mounts with empty `initialFiles`
2. `StackBlitzPreview` receives empty `files` prop
3. `projectFiles` useMemo returns `null`
4. Nothing embeds
5. User sees blank container

**Solution**: Don't render StackBlitzPreview until files exist:

```typescript
// In EditorPage.tsx
const canvasContent = isLoading || files.length === 0 ? (
    <WaitingRoom status="building" message="Generating your site..." />
) : (
    <StackBlitzPreview files={sandpackFiles} />
);
```

---

## Required Files for Vite/React in StackBlitz

Per StackBlitz SDK documentation, these files are **required** for a working project:

| File | Required | Purpose |
|------|----------|---------|
| `package.json` | ✅ Yes | Dependencies and scripts |
| `index.html` | ✅ Yes | Entry HTML with `<div id="root">` |
| `src/main.tsx` | ✅ Yes | React root rendering |
| `src/App.tsx` | ✅ Yes | Root component |
| `vite.config.ts` | 🟡 Recommended | Vite + React plugin |
| `tsconfig.json` | 🟡 Recommended | TypeScript config |
| `src/index.css` | 🟡 Optional | Global styles |

### Minimum Viable `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Minimum Viable `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

## Recommended Fixes Summary

| Priority | Issue | Fix | Effort |
|----------|-------|-----|--------|
| 🔴 Critical | 4-second timeout | Increase to 30s or use event-based detection | Low |
| 🔴 Critical | Empty files race condition | Don't render preview until files exist | Low |
| 🟡 High | Missing stackblitz config | Add to basePackageJson | Low |
| 🟡 High | No error visibility | Add iframe message listener | Medium |
| 🟢 Medium | AI validation gaps | Add import resolution checks | Medium |
| 🟢 Medium | No TypeScript validation | Add pre-embed syntax check | High |

---

## Implementation Plan

### Phase 1: Quick Wins (1-2 hours)

1. **Increase timeout** to 30 seconds
2. **Add stackblitz config** to package.json
3. **Guard preview render** until files exist

### Phase 2: Error Handling (2-4 hours)

1. **Add iframe message listener** for Vite errors
2. **Show build errors** in UI instead of blank page
3. **Add retry button** for failed embeds

### Phase 3: Validation Improvements (4-8 hours)

1. **Check import resolution** in generated code
2. **Validate JSX syntax** before embedding
3. **Add fallback component** for crashed previews

---

## Testing Checklist

After implementing fixes, verify:

- [ ] Preview loads successfully after 30+ seconds
- [ ] Loading skeleton stays visible until Vite is ready
- [ ] Build errors are displayed to user
- [ ] Empty files show "Generating..." not blank page
- [ ] AI-generated code with missing imports shows error
- [ ] Retry button successfully reloads preview

---

## References

- [StackBlitz SDK Documentation](https://developer.stackblitz.com/platform/api/javascript-sdk)
- [StackBlitz SDK Options Reference](https://developer.stackblitz.com/platform/api/javascript-sdk-options)
- [WebContainers Project Configuration](https://developer.stackblitz.com/platform/webcontainers/project-config)
- [StackBlitz SDK GitHub Repository](https://github.com/stackblitz/sdk)
