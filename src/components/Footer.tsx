import React from 'react';
import { SiteSettings } from '../services/storage';
import { FrontendContent } from '../types';
import { Wifi, PhoneCall, Instagram, Lock, ArrowUp, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  content?: FrontendContent['footer'];
  onOpenAdmin: () => void;
  onOpenContract: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  settings, 
  content, 
  onOpenAdmin, 
  onOpenContract,
  onOpenLegal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bioText = content?.bio || 'Provedor de internet fibra óptica com infraestrutura de alta velocidade e suporte humanizado em Camilos - CE. Conectando residências e empresas com o melhor da tecnologia FTTH.';
  const addressText = content?.address || settings.city || 'Camilos - CE';
  const copyrightText = content?.copyrightText || `© ${new Date().getFullYear()} ${settings.name || 'Rocknet Telecom'}. Todos os direitos reservados. ${addressText}.`;

  const logoPrimary = settings.logoTextPrimary || 'Rock';
  const logoAccent = settings.logoTextAccent || 'net';

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-900 pt-12 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-neutral-900">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-white">
              {settings.logoUrl ? (
                <div className="flex items-center gap-2">
                  <img
                    src={settings.logoUrl}
                    alt={settings.name || 'Logomarca do Provedor'}
                    style={{ height: `${Math.min(settings.logoHeight || 36, 44)}px` }}
                    className="max-w-[180px] object-contain rounded"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight font-display">
                    {logoPrimary}<span className="text-cyan-400">{logoAccent}</span>
                  </span>
                </div>
              )}
            </div>

            <p className="text-neutral-400 max-w-sm leading-relaxed text-center">
              {bioText}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-pink-400 flex items-center justify-center border border-neutral-800 transition-colors"
                title={`Instagram ${settings.instagramHandle}`}
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${settings.phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 flex items-center justify-center border border-neutral-800 transition-colors"
                title="WhatsApp Oficial"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#planos" className="hover:text-cyan-400 transition-colors">
                  Planos de Fibra
                </a>
              </li>
              <li>
                <a href="#cobertura" className="hover:text-cyan-400 transition-colors">
                  Área de Cobertura
                </a>
              </li>
              <li>
                <a href="#suporte" className="hover:text-cyan-400 transition-colors">
                  Suporte Técnico Local
                </a>
              </li>
              <li>
                <a href="#instagram" className="hover:text-cyan-400 transition-colors">
                  Instagram {settings.instagramHandle || '@rocknet_camilos'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Atendimento {settings.city || 'Camilos'}
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-neutral-500 block">WhatsApp de Contratação:</span>
                <a
                  href={`https://wa.me/${settings.phoneRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  {settings.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="text-neutral-500 block">Horário de Atendimento:</span>
                <span className="text-neutral-300">{settings.workHours}</span>
              </li>
              {content?.email && (
                <li>
                  <span className="text-neutral-500 block">E-mail de Contato:</span>
                  <a
                    href={`mailto:${content.email}`}
                    className="font-mono text-white hover:text-cyan-400 transition-colors"
                  >
                    {content.email}
                  </a>
                </li>
              )}
              <li>
                <span className="text-neutral-500 block">Cidade Base:</span>
                <span className="text-neutral-300">{addressText || settings.city || 'Camilos - Ceará'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Action & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Central do Assinante
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenContract}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Assinar Online
              </button>

              <a
                href={`https://wa.me/${settings.phoneRaw}?text=${encodeURIComponent('Olá, preciso da 2ª via da minha fatura de internet Rocknet.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs transition-colors"
              >
                2ª Via de Fatura (PIX)
              </a>

              <button
                onClick={onOpenAdmin}
                className="w-full py-2 px-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-cyan-400 border border-neutral-800/80 text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Painel de Gestão (Admin)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar with Copyright & Legal Links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>{copyrightText}</p>
            <span className="hidden sm:inline text-neutral-700">·</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenLegal?.('privacy')}
                className="text-neutral-400 hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Privacidade & LGPD
              </button>
              <span className="text-neutral-700">·</span>
              <button
                onClick={() => onOpenLegal?.('terms')}
                className="text-neutral-400 hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Termos de Adesão
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Rede de Fibra Óptica FTTH
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
