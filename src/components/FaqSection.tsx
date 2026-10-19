import React, { useState } from 'react';
import { FAQS, ROCKNET_INFO } from '../data/content';
import { FaqItem, FrontendContent } from '../types';
import { ChevronDown, MessageSquare } from 'lucide-react';

interface FaqSectionProps {
  faqs?: FaqItem[];
  content?: FrontendContent['faq'];
  phoneDisplay?: string;
  phoneRaw?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ 
  faqs, 
  content,
  phoneDisplay,
  phoneRaw,
}) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const badgeText = content?.badge || 'Tire Suas Dúvidas';
  const titleText = content?.title || 'Perguntas Frequentes sobre a Rocknet';
  const subtitleText = content?.subtitle || 'Tudo o que você precisa saber sobre a nossa rede de fibra óptica e contratação.';
  
  const activeFaqs = faqs && faqs.length > 0 ? faqs : FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f }));
  const displayPhone = phoneDisplay || ROCKNET_INFO.phoneDisplay;
  const rawPhone = phoneRaw || ROCKNET_INFO.phoneRaw;
  const whatsappUrl = `https://wa.me/${rawPhone}`;

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-neutral-950 border-b border-neutral-900 scroll-mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
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

        {/* Accordion list */}
        <div className="space-y-3">
          {activeFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={faq.id || idx}
                className="rounded-2xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra help bar */}
        <div className="mt-12 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-neutral-300">
              Ainda tem alguma dúvida específica? Fale agora mesmo com nosso atendente no WhatsApp:
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap hover:underline cursor-pointer"
          >
            Chamar no WhatsApp ({displayPhone}) →
          </a>
        </div>

      </div>
    </section>
  );
};
