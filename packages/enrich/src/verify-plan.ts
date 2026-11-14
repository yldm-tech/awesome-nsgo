import { createHash } from 'node:crypto';
import type { Entry } from './source.ts';

// The rules of the weekly check of listed entries (verify.ts) that need no network: what an entry becomes when its repository moved, where its pull request lives, and whether a maintainer already declined the same change.

// The branch of an entry's pull request: verify/<dir>/<slug>, one per entry, so each fix is merged or closed on its own.
export const VERIFY_PREFIX = 'verify/';
export const verifyBranch = (dir: string, slug: string) => `${VERIFY_PREFIX}${dir}/${slug}`;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Rewrites, in place, what names the repository GitHub moved from one owner/name to another (renamed or transferred): repo, the GitHub links and the GitHub Pages site among url, docs and homepage, and the author when it was the old owner's login. Returns the fields it changed. A link elsewhere, such as an app's own website or a Pages site on a custom domain, is left as it is.
//
// GitHub redirects the repository's old address but not its Pages site: https://<owner>.github.io/<name>/ moves with the repository and the old one answers 404, which is how Kubai Icons' homepage broke when it moved from oneo-me to nsgo-dev.
export function movedRepo(entry: Entry, from: string, to: string): string[] {
	const changed: string[] = [];
	if (typeof entry.repo === 'string' && entry.repo.toLowerCase() === from.toLowerCase()) {
		entry.repo = to;
		changed.push('repo');
	}
	const [fromOwner, fromName] = from.split('/');
	const [toOwner, toName] = to.split('/');
	const moves: [RegExp, string][] = [
		[new RegExp(`^https://github\\.com/${escapeRe(from)}(?=$|[/#?])`, 'i'), `https://github.com/${to}`],
		[new RegExp(`^https://${escapeRe(fromOwner)}\\.github\\.io/${escapeRe(fromName)}(?=$|[/#?])`, 'i'), `https://${toOwner.toLowerCase()}.github.io/${toName}`],
	];
	for (const key of ['url', 'docs', 'homepage']) {
		const v = entry[key];
		if (typeof v !== 'string') continue;
		const move = moves.find(([old]) => old.test(v));
		if (move) {
			entry[key] = v.replace(move[0], move[1]);
			changed.push(key);
		}
	}
	if (fromOwner.toLowerCase() !== toOwner.toLowerCase() && typeof entry.author === 'string' && entry.author.toLowerCase() === fromOwner.toLowerCase()) {
		entry.author = toOwner;
		changed.push('author');
	}
	return changed;
}

// Sets a field the entry does not have yet in place, right after another, as in the files written by hand, since the entry is written back in its key order; at the end when that one is missing.
export function setAfter(entry: Entry, key: string, value: unknown, after: string): void {
	const fields = Object.entries(entry).filter(([k]) => k !== key);
	for (const k of Object.keys(entry)) delete entry[k];
	for (const [k, v] of fields) {
		entry[k] = v;
		if (k === after) entry[key] = value;
	}
	if (!(key in entry)) entry[key] = value;
}

// Drops an image from the stand-ins once the project's own replaced it, and the list with its last one (the catalog rejects an empty provisional).
export function dropProvisional(entry: Entry, image: 'icon' | 'screenshot'): void {
	const list = Array.isArray(entry.provisional) ? (entry.provisional as string[]).filter((v) => v !== image) : [];
	if (list.length) entry.provisional = list;
	else delete entry.provisional;
}

// A short name for a set of changes, such as ["repo: a/b -> c/d"], the same whatever their order, which the pull request carries in a comment so a later run can tell the change was proposed before.
export function changeKey(changes: readonly string[]): string {
	return createHash('sha256').update([...changes].sort().join('\n')).digest('hex').slice(0, 12);
}

export const changeMarker = (key: string) => `<!-- verify-listed: ${key} -->`;

export interface BranchPull {
	html_url: string;
	state: string;
	merged_at: string | null;
	body: string | null;
}

// What the entry's earlier pull requests say about a change: one still open waits for review, so nothing new is proposed beside it; a closed one that was not merged and carried the same change was declined, so it is not proposed again. A merged one does not count, as main already has its change.
export function pastPulls(prs: readonly BranchPull[], key: string): { open?: string; declined?: string } {
	const open = prs.find((p) => p.state === 'open');
	if (open) return { open: open.html_url };
	const declined = prs.find((p) => p.state === 'closed' && !p.merged_at && (p.body ?? '').includes(changeMarker(key)));
	return declined ? { declined: declined.html_url } : {};
}
