import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck, Clock } from 'lucide-react';
import { SiteSettings } from '../services/storage';

// Official WhatsApp Brand SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface FloatingWhatsAppProps {
  settings: SiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const sendWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${settings.phoneRaw}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const quickMessages = [
    {
      title: 'Quero assinar fibra óptica',
      text: 'Olá! Estou no site da Rocknet e gostaria de saber mais sobre a instalação dos planos de fibra óptica.',
    },
    {
      title: 'Verificar cobertura na minha rua',
      text: 'Olá! Gostaria de consultar se a fibra óptica da Rocknet já está disponível no meu endereço em Camilos.',
    },
    {
      title: 'Suporte Técnico Humanizado',
      text: 'Olá equipe Rocknet! Preciso de um auxílio técnico com a minha conexão de internet.',
    },
    {
      title: '2ª Via de Boleto / Chave PIX',
      text: 'Olá, gostaria de solicitar a 2ª via da minha fatura / chave PIX para pagamento.',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popover Chat Card */}
      {isOpen && (
        <div className="mb-3 w-[90vw] sm:w-[360px] bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-neutral-900 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">Atendimento WhatsApp</h4>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Online agora · {settings.phoneDisplay}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body message preview */}
          <div className="p-4 bg-neutral-950/60 max-h-80 overflow-y-auto space-y-3 text-xs">
            <div className="bg-neutral-800/90 text-neutral-200 p-3 rounded-2xl rounded-tl-sm border border-neutral-700/50 shadow-sm leading-relaxed">
              <p className="font-medium text-white mb-1">Olá! Bem-vindo à Rocknet Fibra Óptica 👋</p>
              <p>Como nossa equipe de Camilos pode te ajudar hoje? Escolha um assunto rápido ou digite sua mensagem:</p>
            </div>

            {/* Quick choices */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
                Atalhos Frequentes
              </p>
              {quickMessages.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendWhatsApp(item.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-neutral-900/90 hover:bg-emerald-950/40 border border-neutral-800 hover:border-emerald-500/50 text-neutral-300 hover:text-white transition-all text-xs font-medium flex items-center justify-between group cursor-pointer"
                >
                  <span>{item.title}</span>
                  <Send className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom text sender */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customMsg.trim()) {
                  sendWhatsApp(customMsg);
                }
              }}
              placeholder="Digite sua mensagem direta..."
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (customMsg.trim()) {
                  sendWhatsApp(customMsg);
                } else {
                  sendWhatsApp('Olá! Vim pelo site da Rocknet e gostaria de tirar uma dúvida.');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-700/30 cursor-pointer active:scale-95"
              title="Iniciar conversa no WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-neutral-950 text-[10px] text-neutral-500 flex items-center justify-between border-t border-neutral-800/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Canal Oficial Rocknet
            </span>
            <span className="font-mono text-neutral-400">88 9 92675749</span>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button - Ícone Original do WhatsApp apenas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 hover:scale-105 ${
          !isOpen ? 'animate-whatsapp-pulse' : ''
        }`}
        aria-label="Abrir WhatsApp da Rocknet"
        title="WhatsApp Rocknet"
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white stroke-[2.5]" />
        ) : (
          <WhatsAppIcon className="w-8 h-8 sm:w-9 sm:h-9" />
        )}
      </button>
    </div>
  );
};
