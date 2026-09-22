import { getCollection, type CollectionEntry } from 'astro:content';
import config from '../../site.config.json';

export const site = config;
export type Post = CollectionEntry<'posts'>;

export const folderOf = (p: Post) => p.id.split('/').slice(0, -1).join('/');
export const slugOf = (p: Post) => p.id.split('/').pop() as string;
export const postUrl = (p: Post) => `/posts/${p.id}/`;

export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', (p) => !p.data.draft);
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
export const rawUrl = (p: Post) => `/posts/${p.id}.md`;

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
