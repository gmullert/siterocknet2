import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { ROCKNET_INFO } from '../data/content';
import { addLeadOrder } from '../services/storage';
import { X, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft, Send, Copy, Check, Clock, User, MapPin, Calendar } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  initialPlan?: Plan | null;
  availablePlans: Plan[];
  dueDates?: string[];
  onClose: () => void;
  onOrderCreated?: () => void;
  onOpenLegal?: (tab?: 'privacy' | 'terms') => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  initialPlan,
  availablePlans,
  dueDates = ['05', '10', '15', '20', '25'],
  onClose,
  onOrderCreated,
  onOpenLegal,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState<string>('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('Centro de Camilos');
  const [reference, setReference] = useState('');
  const [preferredPeriod, setPreferredPeriod] = useState<'manha' | 'tarde' | 'qualquer'>('manha');
  const [dueDate, setDueDate] = useState<string>(dueDates[0] || '10');
  const [notes, setNotes] = useState('');

  // Error validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (dueDates && dueDates.length > 0 && !dueDates.includes(dueDate)) {
      setDueDate(dueDates[0]);
    }
  }, [dueDates]);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlanId(initialPlan.id);
    } else if (availablePlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(availablePlans[1]?.id || availablePlans[0].id);
    }
  }, [initialPlan, availablePlans]);

  if (!isOpen) return null;

  const currentPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const formatCPF = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim()) errs.fullName = 'Informe seu nome completo';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      errs.phone = 'Informe seu WhatsApp com DDD';
    }
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cpf.trim()) {
      errs.cpf = 'Informe o CPF do titular (obrigatório)';
    } else if (cleanCpf.length < 11) {
      errs.cpf = 'Informe um CPF válido com 11 dígitos';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: { [key: string]: string } = {};
    if (!street.trim()) errs.street = 'Informe a rua ou avenida';
    if (!number.trim()) errs.number = 'Informe o número ou S/N';
    if (!neighborhood.trim()) errs.neighborhood = 'Informe o bairro';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    } else if (step === 3) {
      if (validateStep3()) setStep(4);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const planPriceFull = `R$ ${currentPlan.price}${currentPlan.cents}/mês`;
    const routerText = currentPlan.routerCount ? `${currentPlan.routerCount} Roteador${currentPlan.routerCount > 1 ? 'es' : ''}` : 'Roteador Incluso';
    
    // Save to storage
    const createdLead = addLeadOrder({
      planId: currentPlan.id,
      planName: `${currentPlan.name} (${currentPlan.speed} ${currentPlan.speedUnit} - ${routerText})`,
      planPrice: planPriceFull,
      fullName,
      phone,
      cpf,
      street,
      number,
      neighborhood,
      reference,
      preferredPeriod,
      dueDate,
      notes,
    });

    setGeneratedProtocol(createdLead.protocol);
    if (onOrderCreated) onOrderCreated();

    // Prepare WhatsApp text
    const waText = `🚀 *NOVA CONTRATAÇÃO ONLINE - ROCKNET FIBRA*
----------------------------------------
📋 *Protocolo:* ${createdLead.protocol}
📶 *Plano:* ${currentPlan.name} - ${currentPlan.speed} ${currentPlan.speedUnit} (${planPriceFull})
📡 *Equipamento:* ${currentPlan.equipment || `${routerText} em comodato`}

👤 *Dados do Titular:*
• *Nome:* ${fullName}
• *WhatsApp:* ${phone}
${cpf ? `• *CPF:* ${cpf}` : ''}

📍 *Endereço de Instalação (Camilos):*
• *Rua/Av:* ${street}, Nº ${number}
• *Bairro:* ${neighborhood}
${reference ? `• *Ponto de Ref:* ${reference}` : ''}

📅 *Preferências:*
• *Turno de Instalação:* ${preferredPeriod === 'manha' ? 'Manhã' : preferredPeriod === 'tarde' ? 'Tarde' : 'Qualquer horário'}
• *Melhor Dia de Vencimento:* Dia ${dueDate}
${notes ? `• *Observações:* ${notes}` : ''}
----------------------------------------
_Gostaria de confirmar o agendamento da instalação pelo site da Rocknet!_`;

    const encoded = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${ROCKNET_INFO.phoneRaw}?text=${encoded}`;

    // Open WhatsApp in a new tab
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Move to success step 5
    setStep(5);
  };

  const copyProtocol = () => {
    if (generatedProtocol) {
      navigator.clipboard.writeText(generatedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Contratação Online Express · Rocknet
              </h3>
              <p className="text-xs text-neutral-400">
                100% Segura · Conectada diretamente ao WhatsApp ({ROCKNET_INFO.phoneDisplay})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress indicators */}
        {step < 5 && (
          <div className="px-6 pt-4 pb-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 1 ? 'bg-cyan-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
              }`}>1</span>
              <span className={step === 1 ? 'font-bold text-white' : 'text-neutral-500'}>Plano</span>
            </div>
            <div className="w-8 h-px bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 2 ? 'bg-cyan-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
              }`}>2</span>
              <span className={step === 2 ? 'font-bold text-white' : 'text-neutral-500'}>Titular</span>
            </div>
            <div className="w-8 h-px bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 3 ? 'bg-cyan-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
              }`}>3</span>
              <span className={step === 3 ? 'font-bold text-white' : 'text-neutral-500'}>Endereço</span>
            </div>
            <div className="w-8 h-px bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                step >= 4 ? 'bg-cyan-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
              }`}>4</span>
              <span className={step === 4 ? 'font-bold text-white' : 'text-neutral-500'}>Revisão</span>
            </div>
          </div>
        )}

        {/* Body Form */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: Select/Confirm Plan */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-300 font-medium">
                Confirme ou altere o plano de fibra que deseja assinar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedPlanId === plan.id
                        ? 'bg-neutral-800/90 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-neutral-400">{plan.name}</span>
                        <div className="text-2xl font-black font-mono text-white">
                          {plan.speed} <span className="text-xs text-cyan-400">{plan.speedUnit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono">
                          R$ {plan.price}{plan.cents}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">/mês</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-2 line-clamp-1">{plan.equipment}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <p className="font-semibold text-white">Benefícios inclusos no pedido:</p>
                <p>✓ Roteador em comodato grátis instalado pela equipe Rocknet</p>
                <p>✓ Conexão 100% fibra óptica sem franquia de consumo</p>
                <p>✓ Suporte local em Camilos pelo WhatsApp oficial</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continuar com {currentPlan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-cyan-400 font-semibold mb-2">
                <User className="w-4 h-4" />
                <span>Dados do Titular da Assinatura</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: João Ferreira da Silva"
                  className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
                    errors.fullName ? 'border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                  }`}
                />
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Número do seu WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 88 9 9999-9999"
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                    }`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    CPF do Titular <span className="text-red-400 font-bold">* (Obrigatório)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value));
                      if (errors.cpf) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.cpf;
                          return next;
                        });
                      }
                    }}
                    placeholder="000.000.000-00 (Obrigatório)"
                    maxLength={14}
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors font-mono ${
                      errors.cpf ? 'border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                    }`}
                  />
                  {errors.cpf ? (
                    <p className="text-red-400 text-xs mt-1 font-medium">{errors.cpf}</p>
                  ) : (
                    <span className="text-[11px] text-neutral-500 mt-1 block">
                      Obrigatório para emissão do contrato e fatura
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Avançar para Endereço</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Address in Camilos */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-cyan-400 font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                <span>Endereço de Instalação em Camilos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Rua / Avenida / Travessa *
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua Central"
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
                      errors.street ? 'border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                    }`}
                  />
                  {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 120 ou S/N"
                    className={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors ${
                      errors.number ? 'border-red-500' : 'border-neutral-800 focus:border-cyan-400'
                    }`}
                  />
                  {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Bairro ou Região *
                  </label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Ex: Centro, Alto Bonito, Vila Nova"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Próximo ao mercado, casa amarela"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Revisar e Finalizar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Schedule, Due Date & WhatsApp Confirmation */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-cyan-400 font-semibold mb-2">
                <Calendar className="w-4 h-4" />
                <span>Preferência de Instalação e Pagamento</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    Melhor turno para a equipe técnica ir até sua casa:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredPeriod('manha')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        preferredPeriod === 'manha'
                          ? 'bg-cyan-400 text-neutral-950 border-cyan-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      Manhã
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredPeriod('tarde')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        preferredPeriod === 'tarde'
                          ? 'bg-cyan-400 text-neutral-950 border-cyan-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      Tarde
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredPeriod('qualquer')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        preferredPeriod === 'qualquer'
                          ? 'bg-cyan-400 text-neutral-950 border-cyan-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      Qualquer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">
                    Melhor dia de vencimento mensal:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dueDates.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDueDate(day)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                          dueDate === day
                            ? 'bg-cyan-400 text-neutral-950 border-cyan-400 shadow-sm shadow-cyan-400/20'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        Dia {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Plano Selecionado:</span>
                  <span className="font-bold text-white">{currentPlan.name} ({currentPlan.speed} {currentPlan.speedUnit})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Valor Mensal:</span>
                  <span className="font-bold text-cyan-400 font-mono">R$ {currentPlan.price}{currentPlan.cents}/mês</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Titular & Contato:</span>
                  <span className="text-white">{fullName} · {phone}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">CPF do Titular:</span>
                  <span className="text-cyan-400 font-mono font-semibold">{cpf}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Endereço:</span>
                  <span className="text-white">{street}, {number} - {neighborhood}</span>
                </div>
              </div>

              {/* LGPD & Terms compliance note */}
              <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Seus dados serão tratados com segurança e sigilo conforme a{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.('privacy')}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                  >
                    Política de Privacidade (LGPD)
                  </button>{' '}
                  e os{' '}
                  <button
                    type="button"
                    onClick={() => onOpenLegal?.('terms')}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                  >
                    Termos de Adesão
                  </button>.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido pelo WhatsApp</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success & Direct Actions */}
          {step === 5 && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Pedido Registrado com Sucesso!
                </span>
                <h3 className="text-2xl font-black text-white font-display">
                  Bem-vindo à Rocknet Fibra Óptica
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2">
                  Seu cadastro foi salvo em nosso sistema e a mensagem pré-formatada foi aberta no seu WhatsApp oficial.
                </p>
              </div>

              {/* Protocol box */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-sm mx-auto flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-500 block">Protocolo de Instalação</span>
                  <span className="font-mono text-base font-bold text-cyan-400">{generatedProtocol}</span>
                </div>
                <button
                  onClick={copyProtocol}
                  className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Copiar Protocolo"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${ROCKNET_INFO.phoneRaw}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir WhatsApp ({ROCKNET_INFO.phoneDisplay})</span>
                </a>
                
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs"
                >
                  Concluir e Fechar
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
