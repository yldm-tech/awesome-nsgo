// NSGo itself, by ONEO: where its repository, Go module, site and docs are. This site is a community catalog, not NSGo's own. Everything that names NSGo's home builds on these, so that when NSGo moves (as it did from oneo-me/nsgo and oneo-me.github.io/nsgo to nsgo-dev/nsgo and nsgo.dev) only this file changes.
//
// This module must keep zero imports, like score.ts: packages/enrich and packages/announce load it from Node by its path, where the rest of the catalog, built on Vite's import.meta.glob, cannot load.

// NSGo's GitHub repository, as owner/name.
export const NSGO_REPO_NAME = 'nsgo-dev/nsgo';
// The Go module every NSGo app requires; NSGo's official packages are folders of it.
export const NSGO_MODULE = `github.com/${NSGO_REPO_NAME}`;
export const NSGO_REPO = `https://${NSGO_MODULE}`;
// NSGo's module paths, the current first: before NSGo moved to nsgo-dev it was github.com/oneo-me/nsgo, which projects made then still require until they update.
export const NSGO_MODULES = [NSGO_MODULE, 'github.com/oneo-me/nsgo'] as const;

export const NSGO_SITE = 'https://nsgo.dev/';
export const NSGO_SHOWCASE = `${NSGO_SITE}showcases/`;
// NSGo's docs on its site, each page at DOCS_BASE + its path + '/' (docUrl in catalog.ts).
export const DOCS_BASE = `${NSGO_SITE}docs/`;
