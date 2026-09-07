/**
 * The canonical origin for the published site.
 *
 * Everything that needs an absolute URL — canonical tags, Open Graph, the sitemap, robots.txt and
 * the JSON-LD — reads this. Override it per environment with the SITE_URL variable; change the
 * default here if the site moves.
 */
export const DEFAULT_SITE_URL = 'https://modern-fns.vercel.app';

/** Origin for this build, with any trailing slash removed. */
export const siteUrl = (process.env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');
