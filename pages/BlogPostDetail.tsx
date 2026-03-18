import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';
import { Calendar, User, ArrowLeft, Loader2, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import Markdown from 'react-markdown';

export const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setPost(data as BlogPost);
        else navigate('/blog');

        // Fetch recent posts
        const { data: recentData } = await supabase
          .from('blogs')
          .select('*')
          .neq('id', id)
          .limit(3)
          .order('created_at', { ascending: false });
        
        if (recentData) setRecentPosts(recentData as BlogPost[]);

      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Loading article...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/blog" 
          className="inline-flex items-center text-slate-500 hover:text-orange-600 font-medium mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
              Blog
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {post.author.charAt(0)}
              </div>
              <span className="font-medium text-slate-900">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-blue-600">
                <Facebook size={18} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-blue-400">
                <Twitter size={18} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <LinkIcon size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <img 
            src={post.image_url || 'https://picsum.photos/seed/blog/1200/800'} 
            alt={post.title} 
            className="w-full aspect-video object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-slate prose-lg max-w-none mb-16">
          <div className="markdown-body">
            <Markdown>{post.content}</Markdown>
          </div>
        </article>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="border-t border-slate-100 pt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">More from our blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentPosts.map((recent) => (
                <Link 
                  key={recent.id} 
                  to={`/blog/${recent.id}`}
                  className="group block"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={recent.image_url || 'https://picsum.photos/seed/blog/400/300'} 
                      alt={recent.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {recent.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
