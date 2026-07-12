export const GRID_POSTS_PAGE_1 = 6;
export const POSTS_PER_PAGE = 9;

export function getJournalPageCount(postCount: number): number {
  const gridCount = Math.max(0, postCount - 1);
  return 1 + Math.ceil(Math.max(0, gridCount - GRID_POSTS_PAGE_1) / POSTS_PER_PAGE);
}
