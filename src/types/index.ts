export interface Plan {
  id: string;
  name: string;
  speed: number; // in Mega
  speedUnit: 'MEGA' | 'GIGA';
  price: string;
  cents: string;
  originalPrice?: string;
  period: string;
  featured?: boolean;
  category: 'residencial' | 'gamer' | 'empresarial';
  tag?: string;
  description: string;
  features: string[];
  equipment: string;
  idealFor: string;
  routerCount?: number; // 1, 2, 3 roteadores
}

export interface SiteTool {
  id: string;
  title: string;
  description: string;
  category: 'ferramenta' | 'servico_adicional' | 'utilitario';
  badge?: string;
  price?: string; // Ex: 'Grátis' ou 'R$ 20,00/mês'
  active: boolean;
  actionType: 'whatsapp' | 'modal' | 'scroll' | 'external';
  actionTarget: string; // Ex: '#cobertura', '#planos', ou mensagem do WhatsApp
  iconName: 'wifi' | 'speed' | 'map' | 'shield' | 'camera' | 'bill' | 'clock';
}

export interface CoverageArea {
  id: string;
  name: string;
  zone: 'Urbana' | 'Rural' | 'Comercial' | 'Distrito';
  status: 'disponivel' | 'alta_demanda' | 'em_expansao';
  statusLabel: string;
  installationTime: string;
  fiberType: string;
  popularPlans: string[];
}

export interface ContractFormData {
  planId: string;
  planName: string;
  planPrice: string;
  fullName: string;
  phone: string;
  cpf: string;
  street: string;
  number: string;
  neighborhood: string;
  reference: string;
  preferredPeriod: 'manha' | 'tarde' | 'qualquer';
  dueDate: string;
  notes?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'master' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface InstagramPost {
  id: string;
  title: string;
  category: string;
  date: string;
  likes: number;
  caption: string;
}

export interface FrontendContent {
  navbar: {
    ctaText: string;
    plansLinkText: string;
    aboutLinkText?: string;
    toolsLinkText: string;
    coverageLinkText: string;
    supportLinkText: string;
    instagramLinkText: string;
  };
  aboutSection?: AboutCompanyContent;
  hero: {
    topBadge: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    imageUrl?: string;
    carouselImages?: Array<{ url: string; title?: string; tag?: string }>;
    badge1Title: string;
    badge1Subtitle: string;
    badge2Title: string;
    badge2Subtitle: string;
    badge3Title: string;
    badge3Subtitle: string;
    statLatency: string;
    statUptime: string;
  };
  plansSection: {
    badge?: string;
    title: string;
    subtitle: string;
  };
  toolsSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  coverageSection: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    ctaButtonText: string;
  };
  supportSection: {
    badge: string;
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
    imageUrl?: string;
    ctaButtonText: string;
  };
  instagramSection: {
    badge: string;
    title: string;
    subtitle: string;
    followButtonText: string;
  };
  faq: {
    badge: string;
    title: string;
    subtitle: string;
  };
  faqs: FaqItem[];
  instagramPosts: InstagramPost[];
  footer: {
    bio: string;
    address: string;
    email: string;
    copyrightText: string;
  };
}

export interface CompanyStat {
  value: string;
  label: string;
  sublabel?: string;
}

export interface CompanyDifferential {
  title: string;
  desc: string;
}

export interface AboutCompanyContent {
  enabled: boolean;
  navLinkText: string;
  badge: string;
  title: string;
  subtitle: string;
  historyParagraph1: string;
  historyParagraph2: string;
  historyParagraph3: string;
  quoteText?: string;
  quoteAuthor?: string;
  missionTitle: string;
  missionDesc: string;
  visionTitle: string;
  visionDesc: string;
  valuesTitle: string;
  valuesDesc: string;
  stats: CompanyStat[];
  differentials: CompanyDifferential[];
  imageUrl?: string;
  imageCaption?: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
}
