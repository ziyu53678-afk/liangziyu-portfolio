/** Resolve local assets under both a domain root and a GitHub Pages project path. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
