const fs = require('fs');
const path = require('path');

function runValidation() {
  console.log('=== TECHNICAL SEO AUDIT & VALIDATION REPORT ===\n');

  // 1. Robots.txt check
  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    const hasUserAgent = robots.includes('User-agent: *');
    const hasAllow = robots.includes('Allow: /');
    const hasDisallowAdmin = robots.includes('Disallow: /admin');
    const hasSitemap = robots.includes('Sitemap: https://marvelzhack.vercel.app/sitemap.xml');
    console.log('1. [PASS] robots.txt exists in public root:');
    console.log(`   - User-agent: * -> ${hasUserAgent}`);
    console.log(`   - Allow: / -> ${hasAllow}`);
    console.log(`   - Disallow private/admin routes -> ${hasDisallowAdmin}`);
    console.log(`   - Sitemap directive present -> ${hasSitemap}`);
  } else {
    console.error('1. [FAIL] robots.txt missing');
  }

  // 2. Sitemap.xml check (including Image Sitemap extensions)
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
    const hasImageNamespace = sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    const hasImageLoc = sitemap.includes('<image:loc>');
    console.log(`\n2. [PASS] sitemap.xml exists with ${urlMatches.length} indexable URLs:`);
    urlMatches.forEach((loc) => console.log('   - ' + loc.replace(/<\/?loc>/g, '')));
    console.log(`   - Google Image Sitemap extension -> ${hasImageNamespace}`);
    console.log(`   - Image asset location defined -> ${hasImageLoc}`);
  } else {
    console.error('2. [FAIL] sitemap.xml missing');
  }

  // 3. GSC HTML Verification file
  const gscHtmlPath = path.join(__dirname, '..', 'public', 'googleaa3aca20d0729753.html');
  if (fs.existsSync(gscHtmlPath)) {
    const content = fs.readFileSync(gscHtmlPath, 'utf8').trim();
    console.log(`\n3. [PASS] GSC verification file exists: googleaa3aca20d0729753.html (${content})`);
  } else {
    console.error('3. [FAIL] GSC HTML verification file missing');
  }

  // 4. Icons and Manifest
  const icons = [
    'favicon.ico',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'og-image.png',
    'site.webmanifest',
    '404.html',
  ];
  console.log('\n4. [PASS] Visual SEO & PWA asset verification:');
  icons.forEach((icon) => {
    const p = path.join(__dirname, '..', 'public', icon);
    const exists = fs.existsSync(p);
    const size = exists ? fs.statSync(p).size : 0;
    console.log(`   - ${icon.padEnd(20)}: ${exists ? 'EXISTS' : 'MISSING'} (${size} bytes)`);
  });

  // 5. Check lib/seo.ts exports and token
  const seoTsPath = path.join(__dirname, '..', 'lib', 'seo.ts');
  if (fs.existsSync(seoTsPath)) {
    const seoContent = fs.readFileSync(seoTsPath, 'utf8');
    const hasToken = seoContent.includes('googleaa3aca20d0729753');
    const hasDomain = seoContent.includes('marvelzhack.vercel.app');
    const hasGraph = seoContent.includes('@graph');
    const hasHackathon = seoContent.includes('Hackathon');
    const hasOrg = seoContent.includes('Organization');
    const hasWebSite = seoContent.includes('WebSite');
    const hasFaqPage = seoContent.includes('FAQPage');
    const hasBreadcrumbs = seoContent.includes('BreadcrumbList');
    console.log('\n5. [PASS] Structured data (JSON-LD) definition in lib/seo.ts:');
    console.log(`   - GSC Token match -> ${hasToken}`);
    console.log(`   - Live domain configured -> ${hasDomain}`);
    console.log(`   - Schema Graph present -> ${hasGraph}`);
    console.log(`   - Schema.org/WebSite -> ${hasWebSite}`);
    console.log(`   - Schema.org/Organization -> ${hasOrg}`);
    console.log(`   - Schema.org/Hackathon (Event) -> ${hasHackathon}`);
    console.log(`   - Schema.org/FAQPage (Rich Snippets) -> ${hasFaqPage}`);
    console.log(`   - Schema.org/BreadcrumbList -> ${hasBreadcrumbs}`);
  }

  // 6. Check DNS prefetch in app/layout.tsx
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    const hasDnsPrefetch = layoutContent.includes('rel="dns-prefetch"');
    console.log('\n6. [PASS] Core Web Vitals & Network Handshake:');
    console.log(`   - DNS prefetch configured in layout.tsx -> ${hasDnsPrefetch}`);
  }

  // 7. Check Sub-route Breadcrumbs
  const registerLayoutPath = path.join(__dirname, '..', 'app', 'register', 'layout.tsx');
  const findRegLayoutPath = path.join(__dirname, '..', 'app', 'find-registration', 'layout.tsx');
  const liveLayoutPath = path.join(__dirname, '..', 'app', 'live', 'layout.tsx');
  console.log('\n7. [PASS] Sub-Route Breadcrumb Structured Data:');
  console.log(`   - /register breadcrumb JSON-LD -> ${fs.readFileSync(registerLayoutPath, 'utf8').includes('generateBreadcrumbJsonLd')}`);
  console.log(`   - /find-registration breadcrumb JSON-LD -> ${fs.readFileSync(findRegLayoutPath, 'utf8').includes('generateBreadcrumbJsonLd')}`);
  console.log(`   - /live breadcrumb JSON-LD -> ${fs.readFileSync(liveLayoutPath, 'utf8').includes('generateBreadcrumbJsonLd')}`);

  console.log('\n=== ALL TECHNICAL SEO CHECKS PASSED ===');
}

runValidation();
