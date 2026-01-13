# StackBlitz Portfolio Template

Pre-configured React + Vite template for fast StackBlitz cold starts.

## Features

- ✅ React 18.2
- ✅ Vite 5
- ✅ Framer Motion
- ✅ Phosphor Icons
- ✅ TypeScript
- ✅ Tailwind CSS (via CDN)
- ✅ Inter font (Google Fonts)

## Usage

This template is used by the CV Platform to embed portfolios with near-instant load times.

```typescript
import sdk from '@stackblitz/sdk';

sdk.openGithubProject('your-org/stackblitz-portfolio-template', {
  files: {
    'src/App.tsx': generatedAppCode,
    'src/components/Hero.tsx': generatedHeroCode,
    // ... other generated files
  }
});
```

The template has all dependencies pre-installed in StackBlitz's CDN, skipping the npm install step entirely.
