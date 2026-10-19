import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, Scale, Building2, HelpCircle } from 'lucide-react';
import { ROCKNET_INFO } from '../data/content';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Transparência & Conformidade Legal
              </h3>
              <p className="text-xs text-neutral-400">
                {ROCKNET_INFO.name} · Camilos - CE · Suporte: {ROCKNET_INFO.phoneDisplay}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6 pt-3 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Política de Privacidade (LGPD)</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Termos de Adesão do Serviço (SCM)</span>
          </button>
        </div>

        {/* Content body with custom scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-neutral-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-cyan-200">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Compromisso com a Lei Geral de Proteção de Dados (Lei 13.709/2018)
                  </h4>
                  <p>
                    A Rocknet Telecom preza pela total segurança, privacidade e transparência no tratamento dos dados de seus clientes e usuários em Camilos e região.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  1. Dados Pessoais Coletados
                </h5>
                <p>
                  Ao solicitar viabilidade técnica ou contratação de planos em nosso site ou via WhatsApp, coletamos apenas os dados essenciais para o fornecimento do serviço:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                  <li><strong>Identificação:</strong> Nome completo e CPF (para emissão de contrato e nota fiscal).</li>
                  <li><strong>Contato:</strong> Número de WhatsApp e telefone (para agendamento de visita e suporte técnico).</li>
                  <li><strong>Endereço de Instalação:</strong> Rua, número, bairro e ponto de referência em Camilos.</li>
                  <li><strong>Preferências de Faturamento:</strong> Melhor dia de vencimento para a fatura mensal.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  2. Finalidade do Tratamento
                </h5>
                <p>
                  Os dados informados têm finalidade estrita e exclusiva de:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                  <li>Verificar a viabilidade óptica na porta de atendimento da sua rua;</li>
                  <li>Agendar a visita da equipe técnica para instalação dos equipamentos de fibra óptica;</li>
                  <li>Gerar o código PIX / boleto bancário da mensalidade contratada;</li>
                  <li>Prestar suporte técnico humanizado e manutenções preventivas solicitadas pelo titular.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  3. Não Compartilhamento com Terceiros
                </h5>
                <p>
                  A Rocknet <strong>não comercializa, não aluga e não compartilha</strong> informações pessoais de seus clientes com terceiros para fins publicitários ou de marketing. Os dados podem ser compartilhados unicamente com autoridades judiciais ou regulatórias (como a Anatel) mediante obrigação legal.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  4. Direitos do Titular dos Dados
                </h5>
                <p>
                  Conforme o Artigo 18 da LGPD, você possui o direito de solicitar a qualquer momento: confirmação da existência de tratamento, acesso aos seus dados cadastrais, correção de dados incompletos ou inexatos, e revogação do consentimento após o encerramento do contrato.
                </p>
                <p className="text-neutral-400">
                  Para exercer seus direitos, basta entrar em contato direto com o nosso canal de suporte pelo WhatsApp: <strong>{ROCKNET_INFO.phoneDisplay}</strong>.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-emerald-200">
                <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Condições Gerais de Prestação de Serviços de Internet Fibra Óptica
                  </h4>
                  <p>
                    Termo simplificado regulador do Serviço de Comunicação Multimídia (SCM) prestado pela Rocknet Telecom no município de Camilos - CE.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  1. Objeto do Serviço & Tecnologia
                </h5>
                <p>
                  A Rocknet fornece conexão de internet banda larga 100% fibra óptica com tecnologia FTTH (Fiber To The Home), entregando a velocidade contratada com baixa latência e estabilidade até o roteador do assinante.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  2. Equipamentos em Comodato
                </h5>
                <p>
                  Os equipamentos necessários para a conexão (ONU / Roteador Wi-Fi Gigabit de Alta Performance) são cedidos em regime de <strong>comodato gratuito</strong> durante a vigência do contrato. O assinante compromete-se a zelar pelo equipamento e devolvê-lo em perfeito estado em caso de cancelamento.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3. Instalação & Ativação
                </h5>
                <p>
                  A instalação é realizada por técnicos credenciados em horário previamente combinado com o cliente. O prazo padrão para ativação em áreas urbanas com viabilidade disponível é de 24h a 48h úteis após a confirmação do pedido.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  4. Pagamentos & Mensalidades
                </h5>
                <p>
                  As faturas mensais possuem vencimento no dia selecionado (05, 10, 15, 20 ou 25) e podem ser pagas instantaneamente via <strong>Chave PIX ou Boleto Bancário</strong>. A 2ª via pode ser solicitada a qualquer instante pelo canal oficial de WhatsApp.
                </p>
              </section>

              <section className="space-y-2">
                <h5 className="font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  5. Suporte Técnico Local Humanizado
                </h5>
                <p>
                  O suporte da Rocknet atua de forma local e humanizada diretamente pelo WhatsApp ({ROCKNET_INFO.phoneDisplay}), de Segunda a Sábado das 07:30 às 18:00 com plantão técnico estendido até as 21:00.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Documento oficial de conformidade Rocknet Telecom</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Entendido e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
