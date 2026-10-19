import React from 'react';
import { SiteTool, FrontendContent } from '../types';
import { Gauge, MapPin, FileText, Wifi, Shield, Camera, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface SiteToolsSectionProps {
  tools: SiteTool[];
  onOpenContract: () => void;
  phoneRaw: string;
  content?: FrontendContent['toolsSection'];
}

export const SiteToolsSection: React.FC<SiteToolsSectionProps> = ({
  tools,
  onOpenContract,
  phoneRaw,
  content,
}) => {
  const activeTools = tools.filter((t) => t.active);

  const badgeText = content?.badge || 'Recursos & Serviços';
  const titleText = content?.title || 'Ferramentas & Soluções Rocknet';
  const subtitleText = content?.subtitle || 'Utilidades integradas para testar sua rede, consultar disponibilidade e solicitar serviços extras para sua conexão.';

  const getIcon = (iconName: SiteTool['iconName']) => {
    switch (iconName) {
      case 'speed':
        return <Gauge className="w-5 h-5 text-cyan-400" />;
      case 'map':
        return <MapPin className="w-5 h-5 text-emerald-400" />;
      case 'bill':
        return <FileText className="w-5 h-5 text-amber-400" />;
      case 'wifi':
        return <Wifi className="w-5 h-5 text-cyan-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-indigo-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleToolAction = (tool: SiteTool) => {
    if (tool.actionType === 'scroll') {
      const el = document.querySelector(tool.actionTarget);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tool.actionType === 'whatsapp') {
      const url = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(tool.actionTarget)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (tool.actionType === 'modal') {
      onOpenContract();
    }
  };

  return (
    <section id="ferramentas" className="py-12 sm:py-16 md:py-20 bg-neutral-950 border-b border-neutral-900 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1.5">
              {badgeText}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display">
              {titleText}
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-xl">
              {subtitleText}
            </p>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            {activeTools.length} ferramentas ativas disponíveis
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => handleToolAction(tool)}
              className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-900 transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getIcon(tool.iconName)}
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold text-cyan-400 border border-cyan-800/60 bg-cyan-950/60 px-2.5 py-0.5 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {tool.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-neutral-800/70 flex items-center justify-between text-xs">
                {tool.price ? (
                  <span className="font-semibold text-neutral-300">
                    {tool.price}
                  </span>
                ) : (
                  <span className="text-neutral-500">Autoatendimento</span>
                )}
                
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-semibold">
                  <span>Acessar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
