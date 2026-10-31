import config from "@/config";

export const POSTS_PER_PAGE = config.posts.perPage;

/** Number of pages needed to show `count` posts. */
export function getLastPage(count: number, perPage = POSTS_PER_PAGE) {
  return Math.max(1, Math.ceil(count / perPage));
}

/**
 * URL of a page in the post listing.
 *
 * The legacy Octopress site paginated as /blog/ (page 1) then
 * /blog/page/2/, /blog/page/3/, … so the shape is kept as-is.
 */
export function getPageUrl(page: number): string {
  return page <= 1 ? "/blog/" : `/blog/page/${page}/`;
}
