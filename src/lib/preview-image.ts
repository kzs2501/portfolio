import { pagePath } from "./routes";

/** A link-preview card's size: Open Graph's usual 1.91 to 1. */
export const ogSize = { width: 1200, height: 630 };

/**
 * Where a page's link-preview card is served: `og.png` in the page's own folder. The
 * extension matters. The host redirects an address without one to its trailing-slash
 * form, and a crawler fetching the card for a preview may not follow the redirect.
 */
export const previewImagePath = (path: string) => `${pagePath(path)}og.png`;
