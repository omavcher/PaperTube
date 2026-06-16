export type HrefLang = {
  rel: 'alternate' | 'canonical';
  href: string;
  hrefLang?: string;
};

const REGIONS = ['us', 'uk', 'au', 'ca'];

export function getHreflangs(pathname: string): HrefLang[] {
  let cleanPath = pathname || '/';
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  if (cleanPath.endsWith('/') && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const parts = cleanPath.split('/');
  const firstSegment = parts[1];
  
  let currentRegion = '';
  let basePagePath = cleanPath;

  if (firstSegment && REGIONS.includes(firstSegment)) {
    currentRegion = firstSegment;
    basePagePath = '/' + parts.slice(2).join('/');
    if (basePagePath.endsWith('/') && basePagePath.length > 1) {
      basePagePath = basePagePath.slice(0, -1);
    }
    if (basePagePath === '/') {
      basePagePath = '';
    }
  }

  if (basePagePath === '/') {
    basePagePath = '';
  }

  const domain = 'https://paperxify.com';
  const hreflangs: HrefLang[] = [];

  // Canonical (Self-referencing)
  const canonicalUrl = currentRegion 
    ? `${domain}/${currentRegion}${basePagePath}` 
    : `${domain}${basePagePath}`;
  
  hreflangs.push({
    rel: 'canonical',
    href: canonicalUrl || `${domain}/`,
  });

  // Alternates
  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'en-US',
    href: `${domain}/us${basePagePath}`,
  });

  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'en-GB',
    href: `${domain}/uk${basePagePath}`,
  });

  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'en-AU',
    href: `${domain}/au${basePagePath}`,
  });

  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'en-CA',
    href: `${domain}/ca${basePagePath}`,
  });

  hreflangs.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${domain}${basePagePath}` || `${domain}/`,
  });

  return hreflangs;
}
