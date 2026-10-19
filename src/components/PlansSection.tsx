import React, { useState } from 'react';
import { Plan, FrontendContent } from '../types';
import { Check, Zap, Sparkles, HelpCircle, Users, Gamepad2, Tv, Building2 } from 'lucide-react';

interface PlansSectionProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  content?: FrontendContent['plansSection'];
}

export const PlansSection: React.FC<PlansSectionProps> = ({ plans, onSelectPlan, content }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'residencial' | 'gamer' | 'empresarial'>('all');
  const [showAdvisor, setShowAdvisor] = useState(false);
  
  // Advisor state
  const [peopleCount, setPeopleCount] = useState<number>(3);
  const [heavyUsage, setHeavyUsage] = useState<boolean>(true);

  const titleText = content?.title || 'Escolha a velocidade ideal para a sua casa ou empresa.';
  const subtitleText = content?.subtitle || 'Conexão 100% fibra óptica com roteadores inclusos para máxima cobertura em todos os cômodos e suporte humanizado local.';

  const filteredPlans = plans.filter((p) => {
    if (selectedFilter === 'all') return true;
    return p.category === selectedFilter;
  });

  const getRecommendedPlan = (): Plan | undefined => {
    if (peopleCount >= 5 || (heavyUsage && peopleCount >= 4)) {
      return plans.find((p) => p.speed >= 600) || plans[plans.length - 1];
    }
    if (peopleCount >= 3 || heavyUsage) {
      return plans.find((p) => p.speed === 400) || plans[1] || plans[0];
    }
    return plans.find((p) => p.speed === 300) || plans[0];
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <section id="planos" className="py-12 sm:py-16 md:py-20 bg-neutral-950 border-b border-neutral-900 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display text-balance">
            {titleText}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400">
            {subtitleText}
          </p>

          {/* Interactive filter tabs (functional buttons) with responsive wrap */}
          <div className="mt-6 flex flex-wrap justify-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl max-w-full">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-cyan-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todos os Planos ({plans.length})
            </button>
            <button
              onClick={() => setSelectedFilter('residencial')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'residencial'
                  ? 'bg-cyan-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Residenciais
            </button>
            <button
              onClick={() => setSelectedFilter('gamer')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'gamer'
                  ? 'bg-cyan-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Gamer & Alta Demanda
            </button>
            <button
              onClick={() => setSelectedFilter('empresarial')}
              className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === 'empresarial'
                  ? 'bg-cyan-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Empresariais
            </button>
          </div>

          {/* Advisor toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvisor(!showAdvisor)}
              className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 font-medium underline underline-offset-4 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showAdvisor ? 'Ocultar recomendador de plano' : 'Dúvida de qual escolher? Use o calculador de velocidade'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Advisor Box if toggled */}
        {showAdvisor && (
          <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-neutral-900/90 border border-cyan-500/30 max-w-3xl mx-auto shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Calculadora de Velocidade Recomendada</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Quantas pessoas usam a internet na residência?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-cyan-400 text-base min-w-[3rem] text-right">
                    {peopleCount} {peopleCount === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Costumam jogar online ou transmitir em 4K?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHeavyUsage(true)}
                    className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-all ${
                      heavyUsage ? 'bg-cyan-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Sim, streaming 4K & Jogos
                  </button>
                  <button
                    onClick={() => setHeavyUsage(false)}
                    className={`flex-1 py-2 px-3 text-xs rounded-lg font-medium transition-all ${
                      !heavyUsage ? 'bg-cyan-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    Uso moderado / Redes
                  </button>
                </div>
              </div>
            </div>

            {recommendedPlan && (
              <div className="mt-6 pt-5 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Plano Recomendado para o seu perfil:
                  </span>
                  <p className="text-lg font-bold text-white">
                    {recommendedPlan.name} · <span className="text-cyan-400">{recommendedPlan.speed} {recommendedPlan.speedUnit}</span> (R$ {recommendedPlan.price}{recommendedPlan.cents}/mês)
                  </p>
                </div>
                <button
                  onClick={() => onSelectPlan(recommendedPlan)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                >
                  Contratar este Plano
                </button>
              </div>
            )}
          </div>
        )}

        {/* Plans Grid */}
        <div className={`grid grid-cols-1 ${filteredPlans.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 items-stretch`}>
          {filteredPlans.map((plan) => {
            const isFeatured = plan.featured;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl flex flex-col transition-all duration-300 ${
                  isFeatured
                    ? 'bg-neutral-900/95 border-2 border-cyan-400 shadow-xl shadow-cyan-500/10 lg:-translate-y-2'
                    : 'bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Visual Highlight Ribbon for featured plan */}
                {plan.tag && (
                  <div className="px-4 py-1.5 bg-cyan-400 text-neutral-950 text-[10px] font-extrabold uppercase tracking-wider text-center rounded-t-xl">
                    {plan.tag}
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  {/* Plan Name & Category */}
                  <div className="mb-4">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                      {plan.category === 'residencial' ? 'Fibra Residencial' : plan.category === 'gamer' ? 'Alta Performance' : 'Empresarial'}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Speed Display */}
                  <div className="mb-6 pb-6 border-b border-neutral-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                        {plan.speed}
                      </span>
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                        {plan.speedUnit}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      100% fibra óptica pura ponta a ponta
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-neutral-400">R$</span>
                      <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-lg font-bold text-neutral-300">
                        {plan.cents}
                      </span>
                      <span className="text-xs text-neutral-400 ml-1">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <span className="text-[11px] text-neutral-500 line-through">
                        De R$ {plan.originalPrice}/mês
                      </span>
                    )}
                  </div>

                  {/* Equipment note */}
                  <div className="p-3 mb-6 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs text-neutral-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-cyan-400">Roteadores Inclusos:</span>
                      {plan.routerCount && (
                        <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-[10px]">
                          {plan.routerCount} {plan.routerCount === 1 ? 'Roteador' : 'Roteadores'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">{plan.equipment}</p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2.5 mb-8 flex-1 text-xs text-neutral-300">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 ${
                      isFeatured
                        ? 'bg-cyan-400 hover:bg-cyan-300 text-neutral-950 shadow-md shadow-cyan-400/25'
                        : 'bg-neutral-800 hover:bg-cyan-400 text-neutral-200 hover:text-neutral-950 border border-neutral-700'
                    }`}
                  >
                    <span>Contratar Plano Online</span>
                  </button>

                  <p className="text-[10px] text-center text-neutral-500 mt-2">
                    Contratação rápida com confirmação no WhatsApp
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Todos os planos contam com ativação ágil em Camilos</h4>
              <p className="text-neutral-400">Instalação com cabos ópticos certificados, fusão com máquina de precisão e testes de sinal no ato.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-neutral-400 shrink-0">
            <span>Roteador em Comodato</span>
            <span aria-hidden="true">·</span>
            <span>Sem Limite de Franquia</span>
            <span aria-hidden="true">·</span>
            <span>Upload Simétrico</span>
          </div>
        </div>

      </div>
    </section>
  );
};
