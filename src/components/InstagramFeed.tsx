import React from 'react';
import { ROCKNET_INFO, INSTAGRAM_HIGHLIGHTS } from '../data/content';
import { InstagramPost, FrontendContent } from '../types';
import { Instagram, ExternalLink, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';

interface InstagramFeedProps {
  instagramUrl: string;
  instagramHandle: string;
  content?: FrontendContent['instagramSection'];
  posts?: InstagramPost[];
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ 
  instagramUrl, 
  instagramHandle,
  content,
  posts,
}) => {
  const badgeText = content?.badge || 'Comunidade Rocknet';
  const titleText = content?.title || 'Siga nosso Instagram oficial';
  const subtitleText = content?.subtitle || 'Acompanhe novidades, expansões de fibra em Camilos, sorteios e dicas técnicas diárias.';
  const followBtnText = content?.followButtonText || 'Seguir';

  const feedPosts = posts && posts.length > 0 ? posts : INSTAGRAM_HIGHLIGHTS;

  return (
    <section id="instagram" className="py-12 sm:py-16 md:py-20 bg-neutral-950/80 border-b border-neutral-900 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1.5">
              {badgeText}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
              {titleText}
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              {subtitleText}
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Instagram className="w-4 h-4" />
            <span>{followBtnText} {instagramHandle}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Post Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedPosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-pink-500/40 hover:bg-neutral-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                        <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                    </div>
                    <span className="font-semibold text-neutral-200">
                      {instagramHandle ? instagramHandle.replace('@', '') : 'rocknet_camilos'}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500">{post.date}</span>
                </div>

                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  {post.category}
                </span>
                <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors mb-2">
                  {post.title}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {post.caption}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="font-mono text-[11px]">{post.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-mono text-[11px]">Comentar</span>
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Ver no Instagram →
                </span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

