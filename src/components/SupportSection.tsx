import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../services/storage';
import { getMediaAsset } from '../services/imageStorage';
import { FrontendContent } from '../types';
import { Headphones, Clock, FileText, Wifi } from 'lucide-react';
import techImg from '../assets/images/tecnico_rocknet_1791767860363.png';

interface SupportSectionProps {
  content?: FrontendContent['supportSection'];
  settings?: SiteSettings;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ content, settings }) => {
  const badgeText = content?.badge || 'Suporte Técnico Humanizado em Camilos';
  const titleText = content?.title || 'Atendimento direto com quem entende e resolve o seu problema.';
  const subtitleText = content?.subtitle || 'Chega de esperar horas em linhas automáticas ou falar com robôs confusos. Na Rocknet você tem canal direto com nossa equipe técnica local pelo WhatsApp.';
  const card1Title = content?.card1Title || 'Atendimento Humanizado';
  const card1Desc = content?.card1Desc || 'Conversas reais pelo WhatsApp com técnicos especializados residentes em Camilos.';
  const card2Title = content?.card2Title || 'Plantão & Visita Técnica';
  const defaultWorkHours = settings?.workHours || 'Segunda a Sábado das 07:30 às 18:00';
  const defaultSupportHours = settings?.supportHours || 'Plantão técnico estendido até as 21:00';
  const card2Desc = content?.card2Desc || (settings?.workHours ? `Atendimento: ${settings.workHours}${settings.supportHours ? ` · Plantão: ${settings.supportHours}` : ''}` : `Atendimento de ${defaultWorkHours} e ${defaultSupportHours}.`);
  const card3Title = content?.card3Title || 'Monitoramento Ativo de Rede';
  const card3Desc = content?.card3Desc || 'Nossos switches e concentradores ópticos são monitorados 24 horas para prevenir falhas.';
  const card4Title = content?.card4Title || '2ª Via & Financeiro Rápido';
  const card4Desc = content?.card4Desc || 'Receba sua fatura ou chave PIX instantaneamente no WhatsApp sem burocracia.';

  // Support exact uploaded image maintaining natural proportions and current background
  const initialImg = () => {
    if (content?.imageUrl && !content.imageUrl.startsWith('idb:')) {
      return content.imageUrl;
    }
    try {
      const customStored = localStorage.getItem('rocknet_custom_tecnico_img');
      if (customStored && !customStored.startsWith('data:')) return customStored;
    } catch {}
    return '/tecnico-rock-net2.webp';
  };

  const [imageSrc, setImageSrc] = useState<string>(initialImg);

  // Check persistent IndexedDB or server upload on mount
  useEffect(() => {
    let active = true;
    (async () => {
      // 1. Clean any oversized data from localStorage that could trigger QuotaExceededError
      try {
        const item = localStorage.getItem('rocknet_custom_tecnico_img');
        if (item && item.startsWith('data:')) {
          localStorage.removeItem('rocknet_custom_tecnico_img');
        }
      } catch {}

      // 2. Check if content.imageUrl is explicitly provided and not idb
      if (content?.imageUrl && !content.imageUrl.startsWith('idb:')) {
        if (active) setImageSrc(content.imageUrl);
        return;
      }

      // 3. Check IndexedDB
      try {
        const idbImg = await getMediaAsset('rocknet_custom_tecnico_img');
        if (idbImg && active) {
          setImageSrc(idbImg);
          return;
        }
      } catch {}

      // 4. Check server public upload
      try {
        const res = await fetch('/api/support-image');
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.url && active) {
            setImageSrc(data.url);
          }
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [content?.imageUrl]);

  // Sync with dashboard updates
  useEffect(() => {
    if (content?.imageUrl) {
      if (content.imageUrl.startsWith('idb:')) {
        getMediaAsset('rocknet_custom_tecnico_img').then((idbImg) => {
          if (idbImg) setImageSrc(idbImg);
        });
      } else {
        setImageSrc(content.imageUrl);
      }
    }
  }, [content?.imageUrl]);

  return (
    <section id="suporte" className="py-12 sm:py-16 md:py-20 bg-neutral-950 border-b border-neutral-900 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1.5">
            {badgeText}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            {titleText}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            {subtitleText}
          </p>
        </div>

        {/* Support Grid: Left features & Contact / Right image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3.5">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">{card1Title}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {card1Desc}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">{card2Title}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {card2Desc}
                  </p>
                </div>
                {settings?.supportHours && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Plantão Estendido: {settings.supportHours}</span>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3.5">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">{card3Title}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {card3Desc}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700/80 transition-all flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">{card4Title}</h4>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {card4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mascote Técnico Rocknet - Exibição no Site (Gerenciado Exclusivamente pelo Dashboard) */}
          <div 
            className="lg:col-span-5 flex items-center justify-center relative py-2 select-none cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc}
              loading="lazy"
              decoding="async"
              onError={() => {
                if (imageSrc !== '/tecnico-rock-net2.png') {
                  setImageSrc('/tecnico-rock-net2.png');
                } else if (imageSrc !== techImg) {
                  setImageSrc(techImg);
                }
              }}
              alt="Técnico Mascote Rocknet Camilos"
              className="w-auto h-auto max-h-[360px] sm:max-h-[500px] lg:max-h-[580px] max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] mx-auto block transition-transform duration-300 pointer-events-none"
            />
          </div>

        </div>

      </div>
    </section>
  );
};
