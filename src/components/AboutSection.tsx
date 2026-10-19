import React from 'react';
import { AboutCompanyContent } from '../types';
import { SiteSettings } from '../services/storage';
import { ROCKNET_INFO } from '../data/content';
import { 
  Wifi, 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle,
  Sparkles,
  Quote
} from 'lucide-react';

interface AboutSectionProps {
  content?: AboutCompanyContent;
  settings?: SiteSettings;
  onOpenContract: (planId?: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  content,
  settings,
  onOpenContract,
}) => {
  if (content && content.enabled === false) {
    return null;
  }

  const title = content?.title || 'A Rocknet Telecom';
  const subtitle = content?.subtitle || 'Muito mais que um provedor de internet: uma infraestrutura de fibra óptica de última geração conectando pessoas, famílias e empresas ao futuro.';
  
  const p1 = content?.historyParagraph1 || 'Nascemos com a missão de transformar o cenário de telecomunicações em Camilos e região. Em um mercado onde conexões instáveis e atendimentos impessoais eram a regra, a Rocknet surgiu para provar que é possível entregar ultravelocidade com estabilidade e respeito ao assinante.';
  const p2 = content?.historyParagraph2 || 'Investimos continuamente em uma rede 100% fibra óptica de ponta a ponta (FTTH), eliminando cabos antigos e interferências. Do nosso anel óptico de alta disponibilidade até o roteador dentro da sua residência, cada detalhe é projetado para garantir latência mínima, downloads ultrarrápidos e disponibilidade ininterrupta.';
  const p3 = content?.historyParagraph3 || 'Hoje, nos orgulhamos de conectar milhares de famílias, profissionais em home office, gamers e empresas locais. Nosso compromisso vai além dos Megabytes: estamos presentes na comunidade com suporte técnico ágil feito por pessoas reais da própria cidade, gerando empregos e impulsionando o desenvolvimento regional.';

  const quote = content?.quoteText || 'Conectar pessoas é encurtar distâncias e abrir portas para o mundo. Fazemos isso todos os dias com paixão pela tecnologia e compromisso com você.';
  const quoteAuthor = content?.quoteAuthor || 'Equipe Rocknet Telecom';



  const differentials = content?.differentials && content.differentials.length > 0 ? content.differentials : [
    { title: 'Fibra Óptica de Verdade', desc: 'Sinal 100% digital e imune a chuvas, ventos ou descargas atmosféricas. Conexão estável do início ao fim.' },
    { title: 'Equipamentos de Alta Potência', desc: 'Roteadores Wi-Fi Gigabit inclusos para cobrir todos os cômodos da sua casa sem pontos cegos.' },
    { title: 'Atendimento Humanizado', desc: 'Chega de robôs confusos. Nossos técnicos atendem você pelo WhatsApp com agilidade e conhecimento técnico real.' },
    { title: 'Planos Transparentes', desc: 'Sem franquia oculta, sem pegadinhas contratuais e com a velocidade real simétrica que você contratou.' },
  ];

  const imageUrl = content?.imageUrl || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80';
  const imageCaption = content?.imageCaption || 'Infraestrutura com tecnologia de última geração e fibra óptica ponta a ponta';

  const ctaTitle = content?.ctaTitle || 'Faça parte da história da internet mais rápida da região';
  const ctaSubtitle = content?.ctaSubtitle || 'Descubra os nossos planos de fibra óptica ou fale diretamente com a nossa equipe de especialistas.';
  const ctaButtonText = content?.ctaButtonText || 'Conhecer Nossos Planos';

  const phoneRaw = settings?.phoneRaw || ROCKNET_INFO.phoneRaw;
  const whatsappUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent('Olá! Gostaria de conhecer mais sobre os planos da Rocknet Telecom.')}`;

  return (
    <section id="sobre-empresa" className="py-12 sm:py-16 md:py-20 bg-neutral-950 border-b border-neutral-900 relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>

        {/* Section 1: Editorial Storytelling & Institutional Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-10 sm:mb-14">
          
          {/* Left Column: Storytelling Paragraphs */}
          <div className="lg:col-span-7 space-y-5 text-neutral-300 text-sm sm:text-base leading-relaxed">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Nossa Trajetória & DNA de Inovação</span>
            </div>

            <p className="text-white text-base sm:text-lg font-medium leading-relaxed text-center">
              {p1}
            </p>

            <p className="text-neutral-300 leading-relaxed text-center">
              {p2}
            </p>

            <p className="text-neutral-300 leading-relaxed text-center">
              {p3}
            </p>

            {/* Quote Card */}
            {quote && (
              <div className="mt-6 p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 relative">
                <Quote className="w-8 h-8 text-cyan-500/30 absolute top-4 right-4" />
                <p className="text-sm italic text-neutral-200 leading-relaxed mb-2">
                  "{quote}"
                </p>
                <span className="text-xs font-bold text-cyan-400 block tracking-wide">
                  — {quoteAuthor}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Institutional Image Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl shadow-cyan-950/20">
              <div className="aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback to high-tech server room / fiber infrastructure
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />

              {/* Image Info Tag */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-neutral-950/85 backdrop-blur-md border border-neutral-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Rede Própria FTTH</p>
                  <p className="text-[11px] text-neutral-400 truncate">{imageCaption}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: Key Differentials */}
        <div className="mb-10 sm:mb-14">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Diferenciais que você sente na primeira navegação
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {differentials.map((item, index) => (
              <div 
                key={index}
                className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-3.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-white text-sm mb-2">{item.title}</h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Institutional CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h4 className="text-xl sm:text-2xl font-black text-white mb-2">
                {ctaTitle}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => onOpenContract()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>{ctaButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-neutral-700 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
