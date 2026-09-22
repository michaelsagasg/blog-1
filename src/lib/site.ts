import { getCollection, type CollectionEntry } from 'astro:content';
import config from '../../site.config.json';

export const site = config;
export type Post = CollectionEntry<'posts'>;

// Astro's `base` config (e.g. "/blog-1/" when deployed under a GitHub Pages
// project subpath) is NOT applied automatically to hand-written absolute
// hrefs/srcs, only to assets Astro itself resolves. Every root-relative link
// in this site must go through this helper instead of a bare "/..." string,
// or it 404s once deployed anywhere but the domain root.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // '' at the domain root, '/blog-1' under a subpath
export const withBase = (p: string) => BASE + p;
export const stripBase = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname);

export const folderOf = (p: Post) => p.id.split('/').slice(0, -1).join('/');
export const slugOf = (p: Post) => p.id.split('/').pop() as string;
export const postUrl = (p: Post) => withBase(`/posts/${p.id}/`);

// site.config.json/advertiser.json keep the banner URL clean (no UTM) so check_advertiser.py's
// competitor/URL-match checks run against the real destination; UTM is added only at render time.
const utm = `utm_source=${site.slug}&utm_medium=blog`;
export const bannerHref = (url: string) => url + (url.includes('?') ? '&' : '?') + utm;

// advertiser.json lives outside this repo (workspace root, gitignored here), so it isn't checked
// out in CI and can't be read at build time -- these represent the site itself as publisher.
export const orgJsonLd = (origin: string | URL) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: new URL(withBase('/'), origin).href,
});

export const articleJsonLd = (post: Post) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.date.toISOString(),
  author: { '@type': 'Organization', name: site.name },
  publisher: { '@type': 'Organization', name: site.name },
});

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts');
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

export function countBy(posts: Post[], key: (p: Post) => string): [string, number][] {
  const m = new Map<string, number>();
  for (const p of posts) m.set(key(p), (m.get(key(p)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const readingTime = (p: Post) => Math.max(1, Math.round((p.body ?? '').split(/\s+/).filter(Boolean).length / 220));
export const rawUrl = (p: Post) => withBase(`/posts/${p.id}.md`);

export const catLabel = (c: string) => {
  const t = c.replace(/-/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const CAT_BLURB: Record<string, string> = {
  retatrutide: 'Trial results, timelines and what the data shows.',
  'side-effects': 'What people report, why it happens and how to manage it.',
  basics: 'How these drugs, trials and peptides work.',
  'buying-guide': 'Pricing, pen sizes, delivery and what to have ready before you order.',
};
const CAT_SHORT: Record<string, string> = { 'buying-guide': 'Buying', 'side-effects': 'Side effects' };
export const catShort = (c: string) => CAT_SHORT[c] ?? catLabel(c);

export const catBlurb = (c: string) => CAT_BLURB[c] ?? 'Guides from the archive.';

const TONES = ['amber', 'green', 'coral', 'cobalt'] as const;
const CAT_TONE: Record<string, (typeof TONES)[number]> = { retatrutide: 'amber', basics: 'green', 'side-effects': 'coral', 'buying-guide': 'cobalt' };
export const catTone = (c: string) => CAT_TONE[c] ?? TONES[[...c].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length];

const CAT_SYMBOL: Record<string, string> = { retatrutide: 'Rt', basics: 'Ba', 'side-effects': 'Se', 'buying-guide': 'Bg' };
export const catSymbol = (c: string) => {
  if (CAT_SYMBOL[c]) return CAT_SYMBOL[c];
  const l = c.replace(/[^a-z]/gi, '');
  return l.charAt(0).toUpperCase() + l.charAt(1).toLowerCase();
};
