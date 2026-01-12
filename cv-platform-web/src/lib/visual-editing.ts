'use client';

// ============================================
// Visual Editing Utilities for Sandpack Injection
// ============================================

/**
 * The source code for the useVisualEditing hook.
 * This gets injected into the user's project as a file.
 */
export const VISUAL_EDITING_HOOK_CODE = `
import { useEffect, useState } from 'react';

export function useVisualEditing() {
  const [enabled, setEnabled] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    // Listen for enable/disable messages from parent editor
    const handleMessage = (event) => {
      if (event.data?.type === 'VISUAL_EDITING_TOGGLE') {
        setEnabled(event.data.enabled);
      }
    };
    window.addEventListener('message', handleMessage);
    
    // Notify parent that we're ready
    window.parent.postMessage({ type: 'VISUAL_EDITING_READY' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Cleanup any lingering styles
      document.querySelectorAll('[data-ve-highlight]').forEach(el => {
        el.removeAttribute('data-ve-highlight');
        el.style.outline = '';
        el.style.cursor = '';
      });
      return;
    }

    const handleMouseOver = (e) => {
      e.stopPropagation();
      const target = e.target;
      if (target === document.body || target === document.documentElement) return;
      
      // Clear previous highlight
      document.querySelectorAll('[data-ve-highlight]').forEach(el => {
        if (el !== target) {
          el.removeAttribute('data-ve-highlight');
          el.style.outline = '';
          el.style.cursor = '';
        }
      });
      
      // Highlight current
      target.setAttribute('data-ve-highlight', 'true');
      target.style.outline = '2px solid #3b82f6';
      target.style.outlineOffset = '2px';
      target.style.cursor = 'crosshair';
      
      setHoveredElement(target);
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      target.removeAttribute('data-ve-highlight');
      target.style.outline = '';
      target.style.cursor = '';
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const target = e.target;
      const tag = target.tagName.toLowerCase();
      const id = target.id || null;
      const className = target.className || null;
      const textContent = target.innerText?.substring(0, 50) || '';
      
      // Try to build a selector path
      let selectorPath = tag;
      if (id) selectorPath = '#' + id;
      else if (className && typeof className === 'string') {
        const firstClass = className.split(' ')[0];
        if (firstClass) selectorPath = tag + '.' + firstClass;
      }
      
      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        payload: {
          tag,
          id,
          className,
          textContent,
          selectorPath,
        }
      }, '*');
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      // Final cleanup
      document.querySelectorAll('[data-ve-highlight]').forEach(el => {
        el.removeAttribute('data-ve-highlight');
        el.style.outline = '';
        el.style.cursor = '';
      });
    };
  }, [enabled]);

  return { enabled };
}
`;

/**
 * Interface for the selected element payload
 */
export interface SelectedElement {
  tag: string;
  id: string | null;
  className: string | null;
  textContent: string;
  selectorPath: string;
}

/**
 * Injects the visual editing hook into a set of Sandpack files.
 * This modifies the files in-place to add the hook and patch src/App.tsx.
 * 
 * @param files - The current Sandpack files object
 * @returns A new files object with visual editing injected
 */
export function injectVisualEditing(
  files: Record<string, string | { code: string }>
): Record<string, string | { code: string }> {
  const result = { ...files };

  // 1. Add the hook file (inside src/ for proper Vite resolution)
  result['/src/hooks/use-visual-editing.ts'] = VISUAL_EDITING_HOOK_CODE;

  // 2. Patch src/App.tsx (Vite root component)
  const appPath = '/src/App.tsx';
  const existingApp = result[appPath];

  if (existingApp) {
    const appCode = typeof existingApp === 'string' ? existingApp : existingApp.code;

    // Check if already patched
    if (!appCode.includes('useVisualEditing')) {
      // Patch: Add import
      let patchedCode = appCode;

      // Find the last import line
      const importRegex = /^import .+ from .+;?\s*$/gm;
      let lastImportMatch: RegExpExecArray | null = null;
      let match;
      while ((match = importRegex.exec(appCode)) !== null) {
        lastImportMatch = match;
      }

      if (lastImportMatch) {
        const insertPosition = lastImportMatch.index + lastImportMatch[0].length;
        patchedCode =
          appCode.slice(0, insertPosition) +
          "\nimport { useVisualEditing } from './hooks/use-visual-editing';" +
          appCode.slice(insertPosition);
      } else {
        patchedCode = "import { useVisualEditing } from './hooks/use-visual-editing';\n" + patchedCode;
      }

      // Patch: Add hook call inside the component
      // Try multiple patterns to find the start of the component body
      const patterns = [
        /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/, // export default function App() {
        /^function\s+\w+\s*\([^)]*\)\s*\{/m,                   // function App() {
        /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/                // const App = () => {
      ];

      let funcMatch = null;
      for (const pattern of patterns) {
        funcMatch = pattern.exec(patchedCode);
        if (funcMatch) break;
      }

      if (funcMatch) {
        const insertPos = funcMatch.index + funcMatch[0].length;
        patchedCode =
          patchedCode.slice(0, insertPos) +
          "\n  useVisualEditing();" +
          patchedCode.slice(insertPos);
      }

      result[appPath] = patchedCode;
    }
  } else {
    console.warn('Could not find src/App.tsx to inject visual editing');
  }

  return result;
}

/**
 * Removes visual editing injection from files.
 * Useful for cleaning up before saving to database.
 * 
 * @param files - The Sandpack files with visual editing
 * @returns Clean files without the hook
 */
export function removeVisualEditing(
  files: Record<string, string | { code: string }>
): Record<string, string | { code: string }> {
  const result = { ...files };

  // Remove the hook file
  delete result['/src/hooks/use-visual-editing.ts'];

  return result;
}
