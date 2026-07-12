
'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPostSlug } from './BlogPost';
import { GRID_POSTS_PAGE_1, POSTS_PER_PAGE } from '../lib/journal-pagination';

function pageHref(page: number): string {
  return page === 1 ? '/journal' : `/journal/page/${page}`;
}

export default function BlogList({ currentPage = 1 }: { currentPage?: number }) {
  const { config } = useSiteConfig();

  // Filter posts to only show published ones on the public site
  const visiblePosts = config.blogPosts.filter(post => {
    if (!post.status || post.status === 'published') {
      return true;
    }
    if (post.status === 'scheduled' && post.scheduledDate) {
      return new Date(post.scheduledDate) <= new Date();
    }
    return false;
  });

  const featuredPost = visiblePosts[0];
  const allGridPosts = visiblePosts.slice(1);

  // Calculate pagination
  const totalGridPosts = allGridPosts.length;

  // Page 1 shows GRID_POSTS_PAGE_1 posts, subsequent pages show POSTS_PER_PAGE
  const getPagePosts = () => {
    if (currentPage === 1) {
      return allGridPosts.slice(0, GRID_POSTS_PAGE_1);
    } else {
      const startIndex = GRID_POSTS_PAGE_1 + (currentPage - 2) * POSTS_PER_PAGE;
      return allGridPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
    }
  };

  // Calculate total pages
  const postsAfterPage1 = Math.max(0, totalGridPosts - GRID_POSTS_PAGE_1);
  const additionalPages = Math.ceil(postsAfterPage1 / POSTS_PER_PAGE);
  const totalPages = 1 + additionalPages;

  const currentPosts = getPagePosts();

  return (
    <div className="bg-stone-950 min-h-screen pt-24 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center border-b border-stone-900 mb-16">
        <h1 className="font-serif text-5xl md:text-7xl text-white mb-4">The Journal</h1>
        <p className="text-stone-400 text-lg">Stories of craft, ritual, and the elemental lifestyle.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Featured Post - Only on page 1 */}
        {currentPage === 1 && featuredPost && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-center">
            <Link href={`/journal/${getPostSlug(featuredPost)}`} className="block overflow-hidden group">
              <div className="aspect-video w-full bg-stone-900 overflow-hidden relative">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors"></div>
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-4 text-xs text-copper-500 font-bold uppercase tracking-widest mb-4">
                <span>Featured</span>
                <span className="w-8 h-[1px] bg-copper-500"></span>
                <span>{featuredPost.readTime}</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight hover:text-copper-400 transition-colors">
                <Link href={`/journal/${getPostSlug(featuredPost)}`}>{featuredPost.title}</Link>
              </h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <Link href={`/journal/${getPostSlug(featuredPost)}`} className="inline-flex items-center gap-2 text-white hover:text-copper-400 transition-colors uppercase tracking-widest text-xs font-bold border-b border-stone-800 pb-1">
                Read Article <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {currentPosts.map(post => (
            <article key={post.id} className="group">
              <Link href={`/journal/${getPostSlug(post)}`} className="block mb-6 overflow-hidden">
                <div className="aspect-[3/2] bg-stone-900 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                </div>
              </Link>
              <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                <span className="uppercase tracking-widest">{post.date}</span>
                <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-copper-400 transition-colors">
                <Link href={`/journal/${getPostSlug(post)}`}>{post.title}</Link>
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 pt-16 border-t border-stone-900">
            {/* Previous Button */}
            <Link
              href={pageHref(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              className={`p-3 border border-stone-800 rounded transition-colors ${currentPage === 1
                ? 'text-stone-700 cursor-not-allowed'
                : 'text-stone-400 hover:text-white hover:border-copper-500'
                }`}
            >
              <ChevronLeft size={18} />
            </Link>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Link
                key={page}
                href={pageHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`w-10 h-10 flex items-center justify-center text-sm font-bold uppercase tracking-widest rounded transition-colors ${page === currentPage
                  ? 'bg-copper-600 text-white'
                  : 'text-stone-400 hover:text-white border border-stone-800 hover:border-copper-500'
                  }`}
              >
                {page}
              </Link>
            ))}

            {/* Next Button */}
            <Link
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage === totalPages}
              className={`p-3 border border-stone-800 rounded transition-colors ${currentPage === totalPages
                ? 'text-stone-700 cursor-not-allowed'
                : 'text-stone-400 hover:text-white hover:border-copper-500'
                }`}
            >
              <ChevronRight size={18} />
            </Link>
          </div>
        )}

        {/* Page Info */}
        {totalPages > 1 && (
          <p className="text-center text-stone-600 text-xs uppercase tracking-widest mt-6">
            Page {currentPage} of {totalPages} • {visiblePosts.length} Articles
          </p>
        )}
      </div>
    </div>
  );
}
