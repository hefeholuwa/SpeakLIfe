# Vercel Deployment Guide

## Prerequisites

1. **Environment Variables**: Set these in your Vercel dashboard:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key (for AI features)
   - `VITE_SCRIPTURE_API_KEY` - Your Scripture API key (optional)

## Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

2. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all the required variables listed above

4. **Deploy**:
   - Click "Deploy" and wait for the build to complete

## Build Optimizations Applied

- ✅ **Code Splitting**: Separated vendor, UI, and utility chunks
- ✅ **Bundle Size**: Optimized chunk sizes for better loading
- ✅ **Terser Minification**: Added terser for better compression
- ✅ **Environment Variables**: Fixed for Vercel compatibility
- ✅ **Vercel Configuration**: Added proper vercel.json settings

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Ensure `terser` is installed (already added to package.json)
- Check the build logs in Vercel dashboard

### Runtime Errors
- Verify environment variables are correctly set
- Check browser console for any missing dependencies
- Ensure Supabase connection is working

### Performance Issues
- The app uses code splitting to reduce initial bundle size
- Large chunks are split into smaller, manageable pieces
- Service worker is included for caching

## File Structure
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── vendor-[hash].js
│   ├── utils-[hash].js
│   ├── ui-[hash].js
│   ├── supabase-[hash].js
│   └── index-[hash].js
└── [other static files]
```

## Support
If you encounter any issues, check:
1. Vercel build logs
2. Browser console errors
3. Network tab for failed requests
4. Environment variable configuration
