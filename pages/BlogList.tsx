
import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { ArrowRight } from 'lucide-react';

export default function BlogList() {
  const { config } = useSiteConfig();

  // Filter posts to only show published ones on the public site
  // Show: published, undefined status (legacy), or scheduled posts past their date
  const visiblePosts = config.blogPosts.filter(post => {
    // Legacy posts without status field - show them
    if (!post.status || post.status === 'published') {
      return true;
    }
    // Scheduled posts - only show if scheduled date has passed
    if (post.status === 'scheduled' && post.scheduledDate) {
      return new Date(post.scheduledDate) <= new Date();
    }
    // Drafts are never shown
    return false;
  });

  const featuredPost = visiblePosts[0];
  const remainingPosts = visiblePosts.slice(1);

  return (
    <div className="bg-stone-950 min-h-screen pt-24 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center border-b border-stone-900 mb-16">
        <h1 className="font-serif text-5xl md:text-7xl text-white mb-4">The Journal</h1>
        <p className="text-stone-400 text-lg">Stories of craft, ritual, and the elemental lifestyle.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* Featured Post */}
        {featuredPost && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-center">
            <Link to={`/journal/${featuredPost.id}`} className="block overflow-hidden group">
              <div className="aspect-video w-full bg-stone-900 overflow-hidden relative">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
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
                <Link to={`/journal/${featuredPost.id}`}>{featuredPost.title}</Link>
              </h2>
              <p className="text-stone-400 text-lg mb-8 leading-relaxed line-clamp-3">
                {featuredPost.excerpt}
              </p>
              <Link to={`/journal/${featuredPost.id}`} className="inline-flex items-center gap-2 text-white hover:text-copper-400 transition-colors uppercase tracking-widest text-xs font-bold border-b border-stone-800 pb-1">
                Read Article <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Recent Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {remainingPosts.map(post => (
            <article key={post.id} className="group">
              <Link to={`/journal/${post.id}`} className="block mb-6 overflow-hidden">
                <div className="aspect-[3/2] bg-stone-900 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
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
                <Link to={`/journal/${post.id}`}>{post.title}</Link>
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
