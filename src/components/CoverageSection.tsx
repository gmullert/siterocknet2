import React, { useState, useMemo } from 'react';
import { CoverageArea, FrontendContent } from '../types';
import { ROCKNET_INFO } from '../data/content';
import { MapPin, CheckCircle, Clock, Send, ArrowUpRight, X } from 'lucide-react';

interface CoverageSectionProps {
  coverageAreas: CoverageArea[];
  content?: FrontendContent['coverageSection'];
  phoneRaw?: string;
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const CoverageSection: React.FC<CoverageSectionProps> = ({ 
  coverageAreas,
  content,
  phoneRaw,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<CoverageArea | null>(null);

  const rawPhone = phoneRaw || ROCKNET_INFO.phoneRaw;

  const badgeText = content?.badge || 'Área de Cobertura Rocknet';
  const titleText = content?.title || 'Fibra óptica de alta densidade em Camilos e região.';
  const subtitleText = content?.subtitle || 'Estamos em constante expansão com anéis ópticos redundantes. Consulte a viabilidade imediata para a sua rua ou bairro.';
  const placeholderText = content?.searchPlaceholder || 'Digite o nome da sua rua, número ou bairro em Camilos...';
  const ctaBtnText = content?.ctaButtonText || 'Consultar Viabilidade no WhatsApp';

  // Real-time filter across name, zone, fiber type, and status
  const filteredAreas = useMemo(() => {
    const term = normalize(searchTerm);
    if (!term) return coverageAreas;

    return coverageAreas.filter((area) => {
      const name = normalize(area.name);
      const zone = normalize(area.zone);
      const fiberType = normalize(area.fiberType || '');
      const statusLabel = normalize(area.statusLabel || '');

      return (
        name.includes(term) ||
        zone.includes(term) ||
        fiberType.includes(term) ||
        statusLabel.includes(term)
      );
    });
  }, [coverageAreas, searchTerm]);

  const handleConsultWhatsApp = (addressName?: string) => {
    const addressToQuery = addressName || searchTerm.trim() || 'meu endereço em Camilos';
    const text = `Olá, equipe Rocknet! Gostaria de consultar a disponibilidade de fibra óptica para instalação no endereço: ${addressToQuery}. Podem verificar a caixa óptica mais próxima para mim?`;
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedArea(null);
  };


  return (
    <section id="cobertura" className="py-12 sm:py-16 md:py-20 bg-neutral-950/70 border-b border-neutral-900 scroll-mt-12">
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

        {/* Real-time Address Viability Checker Box (Targets focus-mode CSS selector) */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-12 p-5 sm:p-7 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholderText}
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => handleConsultWhatsApp()}
              className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 whitespace-nowrap active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{ctaBtnText}</span>
            </button>
          </div>

          {/* Live Search Result Feedback Status */}
          {searchTerm.trim() && (
            <div className="mt-3.5 p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                {filteredAreas.length > 0 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-neutral-200">
                      <strong className="text-emerald-400 font-bold">{filteredAreas.length}</strong> {filteredAreas.length === 1 ? 'região atendida encontrada' : 'regiões atendidas encontradas'} para <span className="text-cyan-400 font-semibold">"{searchTerm}"</span>
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-neutral-300">
                      Endereço <span className="text-amber-300 font-semibold">"{searchTerm}"</span> em análise de expansão imediata.
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleConsultWhatsApp(searchTerm)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer shrink-0"
              >
                Confirmar no WhatsApp →
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-center sm:justify-end text-[11px] text-neutral-400 px-1 border-t border-neutral-800/60 pt-2.5">
            <span className="text-cyan-400 font-medium">Instalação prioritária disponível</span>
          </div>
        </div>

        {/* Neighborhoods Grid / Directory */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-white font-display">Bairros e Regiões Mapeadas</h3>
              <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                {filteredAreas.length} de {coverageAreas.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              {searchTerm 
                ? `Exibindo resultados filtrados por "${searchTerm}"` 
                : 'Selecione para ver detalhes de instalação e portas ópticas'}
            </p>
          </div>

          {/* Search filter indicator or reset button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-neutral-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar busca e ver todos</span>
            </button>
          )}
        </div>

        {/* Areas Grid */}
        {filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAreas.map((area) => {
              const isAvail = area.status === 'disponivel';
              const isDemand = area.status === 'alta_demanda';

              return (
                <div
                  key={area.id}
                  onClick={() => setSelectedArea(area)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedArea?.id === area.id
                      ? 'bg-neutral-900 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-950/40'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          Zona {area.zone}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {area.name}
                        </h4>
                      </div>
                      
                      {/* Status indicator */}
                      <span className={`text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
                        isAvail ? 'text-emerald-400' : isDemand ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {isAvail ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{area.statusLabel}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-300 mb-4 border-t border-neutral-800/80 pt-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Prazo de Instalação:</span>
                        <span className="font-medium text-white">{area.installationTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Estrutura:</span>
                        <span className="font-medium text-neutral-300">{area.fiberType}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConsultWhatsApp(area.name);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-emerald-600/30 text-neutral-200 hover:text-emerald-300 border border-neutral-700/60 hover:border-emerald-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Pedir Ligação neste Bairro</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Nenhum bairro pré-cadastrado como "{searchTerm}"</h4>
              <p className="text-xs text-neutral-400 mt-1">
                A Rocknet está presente em diversas ruas e setores de Camilos. Envie sua localização ou endereço para checarmos a viabilidade da caixa óptica agora mesmo!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConsultWhatsApp(searchTerm)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Consultar "{searchTerm}" no WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Ver todos os bairros
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
