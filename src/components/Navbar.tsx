import React, { useState } from 'react';
import { ROCKNET_INFO } from '../data/content';
import { SiteSettings } from '../services/storage';
import { FrontendContent } from '../types';
import { Menu, X, PhoneCall, Wifi } from 'lucide-react';

interface NavbarProps {
  onOpenContract: (planId?: string) => void;
  onOpenAdmin: () => void;
  settings?: SiteSettings;
  content?: FrontendContent;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenContract, 
  onOpenAdmin,
  settings,
  content,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phoneDisplay = settings?.phoneDisplay || ROCKNET_INFO.phoneDisplay;
  const phoneRaw = settings?.phoneRaw || ROCKNET_INFO.phoneRaw;
  const whatsappUrl = `https://wa.me/${phoneRaw}`;

  const navTexts = content?.navbar || {
    ctaText: 'Assinar Agora',
    aboutLinkText: 'A Rocknet',
    plansLinkText: 'Planos de Fibra',
    toolsLinkText: 'Ferramentas & Serviços',
    coverageLinkText: 'Área de Cobertura',
    supportLinkText: 'Suporte Técnico',
    instagramLinkText: 'Instagram',
  };

  const aboutLinkTitle = content?.aboutSection?.navLinkText || navTexts.aboutLinkText || 'A Rocknet';
  const showAbout = content?.aboutSection?.enabled !== false;

  const logoPrimary = settings?.logoTextPrimary || 'Rock';
  const logoAccent = settings?.logoTextAccent || 'net';

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict Top Bar Contract: 3 Zones in 1 row */}
        <div className="flex items-center justify-between h-20">
          
          {/* Zone 1: Single text element wordmark or uploaded Logo */}
          <a href="#" className="flex items-center gap-3 group text-white">
            {settings?.logoUrl ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={settings.logoUrl}
                  alt={settings.name || 'Logomarca do Provedor'}
                  style={{ height: `${settings.logoHeight || 38}px` }}
                  className="max-w-[220px] object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Wifi className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                </div>
              </div>
            )}
          </a>

          {/* Zone 2: Nav links with clean typography */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-neutral-300">
            {showAbout && (
              <a 
                href="#sobre-empresa" 
                className="hover:text-cyan-400 text-neutral-200 transition-colors flex items-center gap-1.5"
                title="Conheça a história e estrutura da Rocknet"
              >
                <span>{aboutLinkTitle}</span>
              </a>
            )}
            <a href="#planos" className="hover:text-cyan-400 transition-colors">
              {navTexts.plansLinkText}
            </a>
            <a href="#ferramentas" className="hover:text-cyan-400 transition-colors">
              {navTexts.toolsLinkText}
            </a>
            <a href="#cobertura" className="hover:text-cyan-400 transition-colors">
              {navTexts.coverageLinkText}
            </a>
            <a href="#suporte" className="hover:text-cyan-400 transition-colors">
              {navTexts.supportLinkText}
            </a>
            <a href="#instagram" className="hover:text-cyan-400 transition-colors">
              {navTexts.instagramLinkText}
            </a>
          </nav>

          {/* Zone 3: 1-2 Primary actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-cyan-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
              title="Acessar Dashboard do Provedor"
            >
              Dashboard
            </button>
            <button
              onClick={() => onOpenContract()}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              {navTexts.ctaText}
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-md whitespace-nowrap"
            >
              Admin
            </button>
            <button
              onClick={() => onOpenContract()}
              className="px-3 py-1.5 text-xs font-bold text-neutral-950 bg-cyan-400 rounded-md whitespace-nowrap"
            >
              {navTexts.ctaText}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white rounded-lg focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-900/98 px-4 pt-3 pb-6 space-y-3">
          {showAbout && (
            <a
              href="#sobre-empresa"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-cyan-400 bg-neutral-800/60 hover:bg-neutral-800"
            >
              {aboutLinkTitle}
            </a>
          )}
          <a
            href="#planos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-200 hover:bg-neutral-800 hover:text-cyan-400"
          >
            {navTexts.plansLinkText}
          </a>
          <a
            href="#ferramentas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-200 hover:bg-neutral-800 hover:text-cyan-400"
          >
            {navTexts.toolsLinkText}
          </a>
          <a
            href="#cobertura"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-200 hover:bg-neutral-800 hover:text-cyan-400"
          >
            {navTexts.coverageLinkText}
          </a>
          <a
            href="#suporte"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-200 hover:bg-neutral-800 hover:text-cyan-400"
          >
            {navTexts.supportLinkText}
          </a>
          <a
            href="#instagram"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-200 hover:bg-neutral-800 hover:text-cyan-400"
          >
            {navTexts.instagramLinkText}
          </a>

          <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm text-center transition-colors"
            >
              Painel de Gestão (Dashboard)
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>WhatsApp: {phoneDisplay}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContract();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-sm text-center transition-colors"
            >
              {navTexts.ctaText}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
