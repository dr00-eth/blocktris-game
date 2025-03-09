# BlockTris SEO & PWA Implementation Guide

This document provides information about the SEO (Search Engine Optimization) and PWA (Progressive Web App) features implemented in the BlockTris project.

## SEO Enhancements

The following SEO enhancements have been implemented:

1. **Meta Tags**: Essential meta tags have been added to improve search engine visibility:
   - Title and description
   - Keywords
   - Author information
   - Viewport settings

2. **Open Graph & Twitter Cards**: Social media sharing tags have been added to create rich previews when sharing on platforms like:
   - Facebook
   - Twitter
   - LinkedIn
   - Other social media platforms

3. **Structured Data**: JSON-LD structured data has been added to help search engines understand the content:
   - WebApplication schema
   - Organization information
   - Pricing details

4. **Canonical URL**: Prevents duplicate content issues by specifying the preferred URL.

5. **Sitemap.xml**: Helps search engines discover and index all pages of the site.

6. **Robots.txt**: Provides guidance to search engine crawlers.

## PWA Features

The following Progressive Web App features have been implemented:

1. **Web App Manifest**: Allows users to install the app on their devices:
   - App name and description
   - Icons in various sizes
   - Theme colors
   - Display preferences

2. **Service Worker**: Enables offline functionality and improved performance:
   - Caches essential assets
   - Serves cached content when offline
   - Updates cache when new content is available

3. **Favicon**: Multiple formats for different devices and contexts:
   - SVG vector format (modern browsers)
   - PNG raster formats (various sizes)
   - Apple Touch Icon for iOS devices

## How to Use

### Customizing SEO Information

1. **Update Meta Tags**: Edit the `<head>` section in `index.html` to update:
   - Title and description to match your specific game features
   - Keywords relevant to your game
   - Author information

2. **Social Media Preview**: 
   - Replace the domain in Open Graph and Twitter Card URLs (`https://blocktris.xyz/`)
   - Generate a PNG version of the social preview image using our script:
     ```
     npm install canvas
     node public/social-image-generator.js
     ```

3. **Structured Data**: Update the JSON-LD data in `index.html` with your specific game details.

4. **Sitemap**: Update `sitemap.xml` with your actual URLs and update frequency.

### Generating Favicon Files

1. **Generate PNG Favicons**:
   ```
   npm install canvas
   node public/favicon-generator.js
   ```

2. **Generate ICO File** (optional):
   - Use an online converter like [favicon.io](https://favicon.io/) to convert the PNG to ICO
   - Or use ImageMagick: `convert public/favicon-32x32.png public/favicon.ico`

### Testing PWA Features

1. **Verify Manifest**: 
   - Open Chrome DevTools
   - Go to Application > Manifest
   - Ensure all information is correct

2. **Test Service Worker**:
   - Go to Application > Service Workers in DevTools
   - Verify the service worker is registered
   - Test offline functionality by disabling network in DevTools

3. **Test Installation**:
   - Look for the install prompt in Chrome
   - Or use "Install app" from the menu

## SEO Checklist

- [ ] Update all placeholder URLs (`https://blocktris.xyz/`)
- [ ] Generate PNG versions of SVG images
- [ ] Test social media previews using sharing debuggers:
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Verify structured data using [Google's Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Submit sitemap to search engines
- [ ] Test site performance with [Google PageSpeed Insights](https://pagespeed.web.dev/)

## PWA Checklist

- [ ] Test the app on various devices and browsers
- [ ] Verify offline functionality
- [ ] Test app installation process
- [ ] Validate manifest with [PWA Builder](https://www.pwabuilder.com/)
- [ ] Ensure all required assets are cached

## Troubleshooting

### Common Issues

1. **ES Module Errors**: If you see errors about `require is not defined in ES module scope`, make sure you're using ES module syntax (import/export) instead of CommonJS (require/module.exports).

2. **Missing Dependencies**: If you get errors about missing modules, make sure to install the required dependencies:
   ```
   npm install canvas
   ```

3. **Service Worker Not Registering**: Check the browser console for errors. Make sure the service worker file is in the correct location and accessible.

## Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Schema.org](https://schema.org/) for structured data formats 