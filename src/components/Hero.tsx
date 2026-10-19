import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ROCKNET_INFO } from '../data/content';
import { SiteSettings } from '../services/storage';
import { FrontendContent } from '../types';
import { 
  ArrowRight, 
  Gauge, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles 
} from 'lucide-react';

import heroImg1 from '../assets/images/hero_rocknet_fiber_1791389439031.jpg';
import heroImg2 from '../assets/images/hero_rocknet_gaming_1791747749928.jpg';
import heroImg3 from '../assets/images/hero_rocknet_wifi_1791747764508.jpg';
import heroImg4 from '../assets/images/hero_rocknet_streaming_1791747780717.jpg';
import heroImg5 from '../assets/images/rocknet_tech_support_1791389449777.jpg';

interface HeroProps {
  onOpenContract: (planId?: string) => void;
  content?: FrontendContent['hero'];
  settings?: SiteSettings;
}

interface CarouselSlide {
  id: number;
  image: string;
  tag: string;
  title: string;
  latency: string;
  tech: string;
  device: string;
}

const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: heroImg1,
    tag: '100% Fibra Pura',
    title: 'Ultravelocidade FTTH conectando toda a sua família',
    latency: '~5ms a 10ms',
    tech: 'FTTH Fibra Pura',
    device: 'Wi-Fi Dual Band',
  },
  {
    id: 2,
    image: heroImg2,
    tag: 'Modo Gamer',
    title: 'Zero Lag, ping mínimo e rotas otimizadas para jogos',
    latency: '< 8ms Estável',
    tech: 'Banda Simétrica',
    device: 'Baixa Latência',
  },
  {
    id: 3,
    image: heroImg3,
    tag: 'Super Cobertura',
    title: 'Roteadores Wi-Fi 6 potentes para cobrir todos os cômodos',
    latency: 'Sinal 100%',
    tech: 'Dual Band 5GHz',
    device: 'Até 3 Roteadores',
  },
  {
    id: 4,
    image: heroImg4,
    tag: 'Streaming 4K',
    title: 'Multitelas em ultra-alta definição sem travamentos',
    latency: 'Zero Buffer',
    tech: 'Sem Franquia',
    device: 'Smart TVs & 4K',
  },
  {
    id: 5,
    image: heroImg5,
    tag: 'Suporte Local',
    title: 'Equipe técnica humanizada e instalação ágil em Camilos',
    latency: 'Em até 24h a 48h',
    tech: 'Plantão Técnico',
    device: 'Suporte WhatsApp',
  },
];

export const Hero: React.FC<HeroProps> = ({ onOpenContract, content, settings }) => {
  const topBadge = content?.topBadge || 'Provedor de Camilos · 100% Fibra Pura (FTTH) · Roteador Incluso';
  const title = content?.title || 'Ultravelocidade em fibra óptica para conectar toda a sua vida.';
  const subtitle = content?.subtitle || 'Jogue online sem quedas de ping, assista filmes em 4K sem travamentos e trabalhe com estabilidade máxima. A Rocknet leva fibra óptica de ponta a ponta até a sua casa em Camilos.';
  const ctaPrimaryText = content?.ctaPrimaryText || 'Conhecer Planos a partir de R$ 70,00';
  const ctaPrimaryLink = content?.ctaPrimaryLink || '#planos';
  const ctaSecondaryText = content?.ctaSecondaryText || 'Consultar Minha Rua';
  const ctaSecondaryLink = content?.ctaSecondaryLink || '#cobertura';
  const statLatency = content?.statLatency || '~6ms a 12ms';
  const statUptime = content?.statUptime || 'FTTH Fibra Pura';

  // Build the 5 carousel slides merging default assets with any custom URLs configured
  const slides: CarouselSlide[] = React.useMemo(() => {
    const customList = content?.carouselImages || [];
    return DEFAULT_CAROUSEL_SLIDES.map((defaultSlide, idx) => {
      let customImg = defaultSlide.image;
      let customTitle = defaultSlide.title;
      let customTag = defaultSlide.tag;

      const customItem = customList[idx] as any;
      if (typeof customItem === 'string' && customItem.trim()) {
        customImg = customItem.trim();
      } else if (customItem && typeof customItem === 'object') {
        if (customItem.url && typeof customItem.url === 'string' && customItem.url.trim()) {
          customImg = customItem.url.trim();
        }
        if (customItem.title && typeof customItem.title === 'string' && customItem.title.trim()) {
          customTitle = customItem.title.trim();
        }
        if (customItem.tag && typeof customItem.tag === 'string' && customItem.tag.trim()) {
          customTag = customItem.tag.trim();
        }
      } else if (idx === 0 && content?.imageUrl && content.imageUrl.trim()) {
        customImg = content.imageUrl.trim();
      }

      return {
        ...defaultSlide,
        image: customImg,
        title: customTitle,
        tag: customTag,
      };
    }).slice(0, 5); // Max 5 images
  }, [content]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [totalSlides]);

  const handleSelect = (idx: number) => {
    if (idx === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(idx);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Automatic transition every 4.5 seconds
  useEffect(() => {
    if (!isPlaying || isHovered || totalSlides <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, totalSlides, handleNext]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 border-b border-neutral-900 bg-radial from-cyan-950/20 via-neutral-950 to-neutral-950">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Proposition and Direct Actions */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Zero-pill metadata line */}
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
              <span>{topBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance font-display break-words text-center font-['Outfit']">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed text-center">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={ctaPrimaryLink}
                className="px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/35 transition-all text-center flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>{ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={ctaSecondaryLink}
                className="px-6 py-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 font-semibold text-sm transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{ctaSecondaryText}</span>
              </a>
            </div>



          </div>

          {/* Right Column: High-Fidelity 5-Image Carousel with Automatic Transition */}
          <div className="lg:col-span-5 relative">
            <div 
              className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 group select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Primary Active Image (Maintains exact selector compatibility) */}
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                fetchPriority="high"
                decoding="async"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />

              {/* Seamless Cross-fade Overlay for Smooth Transition */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {slides.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              
              {/* Measured contrast scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/35 to-transparent pointer-events-none z-10" />

              {/* Top Bar: Tag Badge, Index Counter and Auto-play Control */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                    <span>{currentSlide.tag}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'Pausar carrossel' : 'Iniciar carrossel'}
                    className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-900 backdrop-blur-md border border-neutral-700/80 text-neutral-300 hover:text-cyan-400 transition-all cursor-pointer shadow-md"
                    title={isPlaying ? 'Pausar rotação automática' : 'Ativar rotação automática'}
                  >
                    {isPlaying && !isHovered ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Prev / Next Navigation Arrows */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Imagem anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-950/75 hover:bg-neutral-900 backdrop-blur-md border border-neutral-700/70 text-white hover:text-cyan-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-20 cursor-pointer shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Próxima imagem"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-neutral-950/75 hover:bg-neutral-900 backdrop-blur-md border border-neutral-700/70 text-white hover:text-cyan-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-20 cursor-pointer shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Carousel Indicators: 5 interactive dots with active progression bar */}
              <div className="absolute bottom-[72px] sm:bottom-[76px] left-4 right-4 flex items-center justify-center gap-1.5 z-20">
                {slides.map((_, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      aria-label={`Ver imagem ${idx + 1}`}
                      className={`relative h-1.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                        isActive
                          ? 'w-9 bg-cyan-400 shadow-md shadow-cyan-400/50'
                          : 'w-2.5 bg-neutral-700/80 hover:bg-neutral-500 hover:w-3.5'
                      }`}
                    >
                      {isActive && isPlaying && !isHovered && (
                        <span 
                          className="absolute inset-0 bg-white/40 animate-pulse" 
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Floating Performance Indicator Box */}
              <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 flex items-center justify-between text-xs z-20 shadow-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Latência Média</span>
                    <p className="font-mono font-bold text-white text-xs">{currentSlide.latency || statLatency}</p>
                  </div>
                </div>

                <div className="h-7 w-px bg-neutral-800" />

                <div>
                  <span className="text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Tecnologia</span>
                  <p className="font-bold text-cyan-400 text-xs">{currentSlide.tech || statUptime}</p>
                </div>

                <div className="h-7 w-px bg-neutral-800 hidden sm:block" />

                <div className="hidden sm:block">
                  <span className="text-[9px] uppercase font-semibold tracking-wider text-neutral-400">Destaque</span>
                  <p className="font-bold text-white text-xs truncate max-w-[120px]">{currentSlide.device}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
