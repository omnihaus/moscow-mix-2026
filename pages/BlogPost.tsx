
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Clock, Calendar, User, Tag } from 'lucide-react';
import SEO, { generateArticleSchema } from '../components/SEO';
import Breadcrumbs, { getBlogBreadcrumbs } from '../components/Breadcrumbs';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const { config } = useSiteConfig();
  const post = config.blogPosts.find(p => p.id === id);

  // Check if post should be visible (published, legacy, or scheduled and past date)
  const isVisible = post && (
    !post.status ||
    post.status === 'published' ||
    (post.status === 'scheduled' && post.scheduledDate && new Date(post.scheduledDate) <= new Date())
  );

  if (!post || !isVisible) return <div className="pt-32 text-center text-white">Article not found</div>;

  // Generate article schema
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage,
    url: `https://www.moscowmix.com/journal/${post.id}`,
    datePublished: post.publishedAt || new Date().toISOString(),
    author: post.author
  });

  // Generate breadcrumbs
  const breadcrumbItems = getBlogBreadcrumbs(post.title);

  return (
    <div className="bg-stone-950 min-h-screen pt-32 pb-24">
      <SEO
        title={post.title}
        description={post.metaDescription || post.excerpt}
        image={post.coverImage}
        url={`https://www.moscowmix.com/journal/${post.id}`}
        type="article"
        publishedTime={post.publishedAt}
        author={post.author}
        schemaData={articleSchema}
      />
      {/* Custom Styles for Blog Content to support the Admin Editor's HTML output */}
      <style>{`
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
          color: #d6d3d1; /* stone-300 */
        }
        .blog-content h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #fff;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        .blog-content h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          color: #fff;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content strong {
            color: #fff;
            font-weight: 600;
        }
        .blog-content em {
            color: #d6d3d1;
            font-style: italic;
        }
        .blog-content a {
            color: #3b82f6 !important; /* Blue-500 to match prompt request */
            text-decoration: underline;
            transition: color 0.2s;
        }
        .blog-content a:hover {
            color: #60a5fa !important; /* Blue-400 */
        }
        .blog-content blockquote {
          border-left: 2px solid #9f5f46; /* copper-500 */
          padding-left: 1.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-style: italic;
          color: #d6d3d1;
          margin: 2.5rem 0;
        }
        .blog-content .image-block {
            margin: 3rem 0;
            background: #1c1917; /* stone-900 */
            padding: 1rem;
            border: 1px solid #292524;
        }
        .blog-content .image-block img {
            width: 100%;
            height: auto;
            display: block;
        }
        .blog-content .caption {
            display: block;
            text-align: center;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #78716c; /* stone-500 */
            margin-top: 0.75rem;
        }
        /* Drop Cap for first paragraph only */
        .blog-content > p:first-of-type::first-letter {
            float: left;
            font-family: 'Cormorant Garamond', serif;
            font-size: 3.5rem;
            line-height: 0.8;
            padding-right: 0.5rem;
            color: #9f5f46; /* copper-500 */
            font-weight: 700;
            margin-top: 5px;
        }
      `}</style>

      <article className="max-w-3xl mx-auto px-6">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-stone-500 text-xs uppercase tracking-widest mb-6 font-medium">
            <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock size={14} /> {post.readTime}</span>
            <span className="flex items-center gap-2 text-copper-400"><User size={14} /> {post.author}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white mb-8 leading-tight">{post.title}</h1>
          <p className="text-xl text-stone-300 italic font-serif leading-relaxed">"{post.excerpt}"</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex justify-center gap-2 mt-8">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] border border-stone-800 px-3 py-1 rounded-full text-stone-400 uppercase tracking-widest">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Hero Image */}
        <div className="w-full aspect-video bg-stone-900 mb-16 overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content Rendered as HTML */}
        <div
          className="blog-content font-sans text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-stone-800 flex justify-between items-center">
          <div>
            <span className="text-stone-500 text-xs uppercase tracking-widest block mb-1">Written By</span>
            <span className="text-white font-serif text-lg">{post.author}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-stone-500 text-xs uppercase tracking-widest cursor-pointer hover:text-white">Share Article</span>
          </div>
        </div>

      </article>
    </div>
  );
}
