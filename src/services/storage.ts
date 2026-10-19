import { Plan, CoverageArea, ContractFormData, SiteTool, FrontendContent, AdminUser } from '../types';
import { PLANS, COVERAGE_AREAS, ROCKNET_INFO, SITE_TOOLS, DEFAULT_FRONTEND_CONTENT } from '../data/content';
import { saveMediaAsset } from './imageStorage';

export interface LeadOrder {
  id: string;
  protocol: string;
  date: string;
  timestamp: number;
  planName: string;
  planPrice: string;
  fullName: string;
  phone: string;
  cpf?: string;
  street: string;
  number: string;
  neighborhood: string;
  reference?: string;
  preferredPeriod: string;
  dueDate: string;
  notes?: string;
  status: 'novo' | 'em_atendimento' | 'agendado' | 'instalado' | 'cancelado';
}

export interface SiteSettings {
  name: string;
  tagline: string;
  phoneDisplay: string;
  phoneRaw: string;
  instagramUrl: string;
  instagramHandle: string;
  city: string;
  workHours: string;
  supportHours: string;
  logoUrl?: string; // base64 data URL or external URL
  logoHeight?: number; // default: 36 - 44px
  logoMode?: 'image' | 'both' | 'icon'; // display mode
  logoTextPrimary?: string; // e.g. 'Rock'
  logoTextAccent?: string; // e.g. 'net'
  faviconUrl?: string; // base64 data URL, server path, or external URL
}

export const applyFavicon = (faviconUrl?: string) => {
  if (typeof document === 'undefined') return;
  const href = faviconUrl && faviconUrl.trim() ? faviconUrl.trim() : '/favicon.svg';

  let iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!iconLink) {
    iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    document.head.appendChild(iconLink);
  }
  iconLink.href = href;

  if (href.endsWith('.svg') || href.startsWith('data:image/svg+xml')) {
    iconLink.type = 'image/svg+xml';
  } else if (href.endsWith('.png') || href.startsWith('data:image/png')) {
    iconLink.type = 'image/png';
  } else if (href.endsWith('.ico') || href.startsWith('data:image/x-icon')) {
    iconLink.type = 'image/x-icon';
  }

  let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
  if (!appleLink) {
    appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    document.head.appendChild(appleLink);
  }
  appleLink.href = href;
};

const STORAGE_KEYS = {
  PLANS: 'rocknet_plans_v2',
  COVERAGE: 'rocknet_coverage_v1',
  LEADS: 'rocknet_leads_v1',
  TOOLS: 'rocknet_tools_v1',
  DUE_DATES: 'rocknet_due_dates_v1',
  SETTINGS: 'rocknet_settings_v1',
  FRONTEND_CONTENT: 'rocknet_frontend_content_v1',
  AUTH: 'rocknet_admin_auth_v1',
  ADMIN_USERS: 'rocknet_admin_users_v2',
  CURRENT_ADMIN_USER: 'rocknet_current_admin_user_v2',
};

// Default initial leads so the admin sees a working, populated dashboard immediately
const INITIAL_LEADS: LeadOrder[] = [
  {
    id: 'lead-1',
    protocol: '#RCK-9267-8821',
    date: 'Hoje, 08:45',
    timestamp: Date.now() - 1000 * 60 * 45,
    planName: '400 Mega (2 Roteadores)',
    planPrice: 'R$ 100,00/mês',
    fullName: 'Francisco José de Sousa',
    phone: '88998412345',
    cpf: '123.456.789-00',
    street: 'Rua Principal',
    number: '142',
    neighborhood: 'Centro de Camilos',
    reference: 'Próximo à padaria central',
    preferredPeriod: 'manhã',
    dueDate: '10',
    status: 'agendado',
    notes: 'Cliente solicitou agendamento para instalação na quinta-feira de manhã. 2 Roteadores para cobrir a casa toda.',
  },
  {
    id: 'lead-2',
    protocol: '#RCK-9267-9104',
    date: 'Ontem, 16:20',
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
    planName: '600 Mega (3 Roteadores)',
    planPrice: 'R$ 120,00/mês',
    fullName: 'Maria Aparecida Ribeiro',
    phone: '88996521487',
    cpf: '987.654.321-11',
    street: 'Travessa das Flores',
    number: '55',
    neighborhood: 'Bairro Alto Bonito',
    reference: 'Casa com portão verde',
    preferredPeriod: 'tarde',
    dueDate: '15',
    status: 'novo',
    notes: 'Precisa de boa velocidade para sobrado grande com 3 roteadores.',
  },
];

export const getStoredPlans = (): Plan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored plans', e);
  }
  return PLANS;
};

export const saveStoredPlans = (plans: Plan[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (err) {
    console.warn('Error saving plans:', err);
  }
};

export const getStoredTools = (): SiteTool[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOOLS);
    if (raw) {
      const parsed: SiteTool[] = JSON.parse(raw);
      return parsed.filter((t) => t.id !== 'tool-speed' && t.actionTarget !== '#velocidade');
    }
  } catch (e) {
    console.error('Error reading stored tools', e);
  }
  return SITE_TOOLS;
};

export const saveStoredTools = (tools: SiteTool[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools));
  } catch (err) {
    console.warn('Error saving tools:', err);
  }
};

export const getStoredDueDates = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DUE_DATES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored due dates', e);
  }
  return ['05', '10', '15', '20', '25'];
};

export const saveStoredDueDates = (dates: string[]) => {
  try {
    // Sort numerically
    const sorted = [...dates].sort((a, b) => Number(a) - Number(b));
    localStorage.setItem(STORAGE_KEYS.DUE_DATES, JSON.stringify(sorted));
  } catch (err) {
    console.warn('Error saving due dates:', err);
  }
};

export const getStoredCoverage = (): CoverageArea[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COVERAGE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored coverage', e);
  }
  return COVERAGE_AREAS;
};

export const saveStoredCoverage = (areas: CoverageArea[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.COVERAGE, JSON.stringify(areas));
  } catch (err) {
    console.warn('Error saving coverage:', err);
  }
};

export const getStoredLeads = (): LeadOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored leads', e);
  }
  return INITIAL_LEADS;
};

export const saveStoredLeads = (leads: LeadOrder[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  } catch (err) {
    console.warn('Error saving leads:', err);
  }
};

export const addLeadOrder = (formData: ContractFormData): LeadOrder => {
  const currentLeads = getStoredLeads();
  const protocol = `#RCK-9267-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const timeFormatted = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const newLead: LeadOrder = {
    id: `lead-${Date.now()}`,
    protocol,
    date: timeFormatted,
    timestamp: Date.now(),
    planName: formData.planName,
    planPrice: formData.planPrice,
    fullName: formData.fullName,
    phone: formData.phone,
    cpf: formData.cpf,
    street: formData.street,
    number: formData.number,
    neighborhood: formData.neighborhood,
    reference: formData.reference,
    preferredPeriod: formData.preferredPeriod,
    dueDate: formData.dueDate,
    notes: formData.notes,
    status: 'novo',
  };

  const updated = [newLead, ...currentLeads];
  saveStoredLeads(updated);
  return newLead;
};

export const getStoredSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading settings', e);
  }
  return {
    name: ROCKNET_INFO.name,
    tagline: ROCKNET_INFO.tagline,
    phoneDisplay: ROCKNET_INFO.phoneDisplay,
    phoneRaw: ROCKNET_INFO.phoneRaw,
    instagramUrl: ROCKNET_INFO.instagramUrl,
    instagramHandle: ROCKNET_INFO.instagramHandle,
    city: ROCKNET_INFO.city,
    workHours: ROCKNET_INFO.workHours,
    supportHours: ROCKNET_INFO.supportHours,
    logoUrl: '',
    logoHeight: 38,
    logoMode: 'both',
    logoTextPrimary: 'Rock',
    logoTextAccent: 'net',
    faviconUrl: '',
  };
};

export const saveStoredSettings = (settings: SiteSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    applyFavicon(settings.faviconUrl);
  } catch (err) {
    console.warn('Error saving settings to localStorage:', err);
  }
};

export const getStoredFrontendContent = (): FrontendContent => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRONTEND_CONTENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with default to guarantee all sections and nested fields exist
      return {
        ...DEFAULT_FRONTEND_CONTENT,
        ...parsed,
        navbar: { ...DEFAULT_FRONTEND_CONTENT.navbar, ...(parsed.navbar || {}) },
        aboutSection: { ...DEFAULT_FRONTEND_CONTENT.aboutSection, ...(parsed.aboutSection || {}) },
        hero: { ...DEFAULT_FRONTEND_CONTENT.hero, ...(parsed.hero || {}) },
        plansSection: { ...DEFAULT_FRONTEND_CONTENT.plansSection, ...(parsed.plansSection || {}) },
        toolsSection: { ...DEFAULT_FRONTEND_CONTENT.toolsSection, ...(parsed.toolsSection || {}) },
        coverageSection: { ...DEFAULT_FRONTEND_CONTENT.coverageSection, ...(parsed.coverageSection || {}) },
        supportSection: { ...DEFAULT_FRONTEND_CONTENT.supportSection, ...(parsed.supportSection || {}) },
        instagramSection: { ...DEFAULT_FRONTEND_CONTENT.instagramSection, ...(parsed.instagramSection || {}) },
        faq: { ...DEFAULT_FRONTEND_CONTENT.faq, ...(parsed.faq || {}) },
        footer: { ...DEFAULT_FRONTEND_CONTENT.footer, ...(parsed.footer || {}) },
        faqs: Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : DEFAULT_FRONTEND_CONTENT.faqs,
        instagramPosts: Array.isArray(parsed.instagramPosts) && parsed.instagramPosts.length > 0 ? parsed.instagramPosts : DEFAULT_FRONTEND_CONTENT.instagramPosts,
      };
    }
  } catch (e) {
    console.error('Error reading frontend content', e);
  }
  return DEFAULT_FRONTEND_CONTENT;
};

export const saveStoredFrontendContent = (content: FrontendContent) => {
  try {
    let contentToSave = content;
    // If supportSection.imageUrl is a large data URL, save it to IndexedDB and keep reference in localStorage
    if (content?.supportSection?.imageUrl && content.supportSection.imageUrl.startsWith('data:')) {
      const dataUrl = content.supportSection.imageUrl;
      // Save full high-res data URL in IndexedDB
      saveMediaAsset('rocknet_custom_tecnico_img', dataUrl).catch(() => {});
      // In localStorage, store idb reference or relative URL if too large
      if (dataUrl.length > 50000) {
        contentToSave = {
          ...content,
          supportSection: {
            ...content.supportSection,
            imageUrl: 'idb:rocknet_custom_tecnico_img',
          },
        };
      }
    }
    localStorage.setItem(STORAGE_KEYS.FRONTEND_CONTENT, JSON.stringify(contentToSave));
  } catch (err) {
    console.warn('Error saving frontend content to localStorage (quota or disabled):', err);
  }
};

export const isAdminAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (val: boolean) => {
  try {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN_USER);
    }
  } catch (err) {
    console.warn('Error setting admin authentication in localStorage:', err);
  }
};

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'user-master-1',
    name: 'Diretor / Usuário Mestre',
    username: 'master',
    password: 'rocknet2026',
    role: 'master',
    createdAt: '01/01/2026',
    lastLogin: 'Hoje',
  },
  {
    id: 'user-admin-1',
    name: 'Administrador Camilos',
    username: 'admin',
    password: 'rocknet2026',
    role: 'admin',
    createdAt: '01/01/2026',
    lastLogin: 'Ontem',
  },
];

export const getStoredAdminUsers = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading admin users', e);
  }
  // Initialize with defaults if none exists
  saveStoredAdminUsers(DEFAULT_ADMIN_USERS);
  return DEFAULT_ADMIN_USERS;
};

export const saveStoredAdminUsers = (users: AdminUser[]) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
};

export const getCurrentAdminUser = (): AdminUser => {
  const users = getStoredAdminUsers();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      const found = users.find(
        (u) => u.id === parsed.id || u.username.toLowerCase() === (parsed.username || '').toLowerCase()
      );
      if (found) return found;
    }
  } catch (e) {
    console.error('Error reading current admin user', e);
  }
  // Fallback to first master user or first user in list
  const master = users.find((u) => u.role === 'master') || users[0] || DEFAULT_ADMIN_USERS[0];
  return master;
};

export const setCurrentAdminUser = (user: AdminUser | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN_USER);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rocknet_admin_user_changed', { detail: user }));
    }
  } catch (err) {
    console.warn('Error setting current admin user:', err);
  }
};

export const authenticateAdmin = (
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AdminUser; error?: string } => {
  const cleanUsername = (usernameInput || '').trim().toLowerCase();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanUsername) {
    return { success: false, error: 'Por favor, informe o nome de usuário cadastrado.' };
  }

  if (!cleanPassword) {
    return { success: false, error: 'Por favor, digite a sua senha de acesso.' };
  }

  const users = getStoredAdminUsers();

  // Find user by exact username (case-insensitive)
  const targetUser = users.find(
    (u) => u.username.toLowerCase() === cleanUsername
  );

  if (!targetUser) {
    return { success: false, error: 'Usuário não encontrado. Verifique o usuário cadastrado.' };
  }

  // Strictly verify that the password matches THIS specific user's registered password
  if (targetUser.password !== cleanPassword) {
    return { success: false, error: 'Senha incorreta para o usuário informado.' };
  }

  // Update lastLogin for this specific user
  const nowStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const updatedUsers = users.map((u) => (u.id === targetUser.id ? { ...u, lastLogin: nowStr } : u));
  saveStoredAdminUsers(updatedUsers);
  const updatedUser = { ...targetUser, lastLogin: nowStr };

  setAdminAuthenticated(true);
  setCurrentAdminUser(updatedUser);
  return { success: true, user: updatedUser };
};

export const updateAdminPassword = (
  userId: string,
  currentPass: string,
  newPass: string
): { success: boolean; error?: string } => {
  const users = getStoredAdminUsers();
  const target = users.find((u) => u.id === userId);

  if (!target) {
    return { success: false, error: 'Usuário não encontrado.' };
  }

  if (target.password !== currentPass) {
    return { success: false, error: 'A senha atual informada está incorreta.' };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }

  const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: newPass.trim() } : u));
  saveStoredAdminUsers(updatedUsers);

  // Update current user session if it's the current user
  const current = getCurrentAdminUser();
  if (current.id === userId) {
    setCurrentAdminUser({ ...current, password: newPass.trim() });
  }

  return { success: true };
};

export const createAdminUser = (
  creatorId: string,
  newUser: { name: string; username: string; password: string; role: 'master' | 'admin' }
): { success: boolean; error?: string; user?: AdminUser } => {
  const users = getStoredAdminUsers();
  const creator = users.find((u) => u.id === creatorId);

  // Only master user can create accounts
  if (!creator || creator.role !== 'master') {
    return { success: false, error: 'Apenas usuários com perfil Mestre podem cadastrar novas contas.' };
  }

  const cleanUsername = newUser.username.trim().toLowerCase().replace(/\s+/g, '');
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário deve ter pelo menos 3 caracteres sem espaços.' };
  }

  if (!newUser.name.trim()) {
    return { success: false, error: 'Informe o nome completo do administrador.' };
  }

  if (!newUser.password || newUser.password.trim().length < 4) {
    return { success: false, error: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  // Check unique username
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return { success: false, error: `O nome de usuário "${cleanUsername}" já está em uso por outro administrador.` };
  }

  const created: AdminUser = {
    id: `usr-${Date.now()}`,
    name: newUser.name.trim(),
    username: cleanUsername,
    password: newUser.password.trim(),
    role: newUser.role || 'admin',
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };

  const updatedUsers = [...users, created];
  saveStoredAdminUsers(updatedUsers);

  return { success: true, user: created };
};

export const deleteAdminUser = (
  deleterId: string,
  targetUserId: string
): { success: boolean; error?: string } => {
  const users = getStoredAdminUsers();
  const current = getCurrentAdminUser();
  const deleter = users.find((u) => u.id === deleterId || u.username === deleterId) || current;

  // Check if deleter is master or if current logged in is master
  const isMaster = deleter?.role === 'master' || current?.role === 'master';
  if (!isMaster) {
    return { success: false, error: 'Apenas usuários com perfil Mestre podem remover contas de administradores.' };
  }

  if (targetUserId === deleter?.id || targetUserId === current?.id || targetUserId === deleterId) {
    return { success: false, error: 'Você não pode remover a sua própria conta logada.' };
  }

  const target = users.find((u) => u.id === targetUserId);
  if (!target) {
    return { success: false, error: 'Conta de usuário não encontrada.' };
  }

  // Don't allow deleting if it would leave 0 master users
  if (target.role === 'master') {
    const masterCount = users.filter((u) => u.role === 'master').length;
    if (masterCount <= 1) {
      return { success: false, error: 'Não é possível remover o único Usuário Mestre do sistema.' };
    }
  }

  const updatedUsers = users.filter((u) => u.id !== targetUserId);
  saveStoredAdminUsers(updatedUsers);

  return { success: true };
};

export const updateAdminUser = (
  editorUserId: string,
  editorPasswordInput: string,
  targetUserId: string,
  data: {
    name?: string;
    username?: string;
    role?: 'master' | 'admin';
    newPassword?: string;
  }
): { success: boolean; error?: string; user?: AdminUser } => {
  const users = getStoredAdminUsers();
  const current = getCurrentAdminUser();
  const cleanEditorId = (editorUserId || '').trim().toLowerCase();
  const editor =
    users.find(
      (u) =>
        u.id === editorUserId ||
        u.username.toLowerCase() === cleanEditorId ||
        u.id === current.id ||
        u.username.toLowerCase() === current.username.toLowerCase()
    ) || current;

  // 1. Must have Master role
  if (!editor || editor.role !== 'master') {
    return { success: false, error: 'Apenas usuários com perfil Mestre têm permissão para editar outras contas.' };
  }

  // 2. Validate editor password (the master user performing the edit)
  const cleanEditorPass = (editorPasswordInput || '').trim();
  if (!cleanEditorPass) {
    return { success: false, error: 'Por favor, digite a sua senha de Mestre para autorizar a alteração.' };
  }
  if (editor.password !== cleanEditorPass) {
    return { 
      success: false, 
      error: `Senha incorreta do Usuário Mestre (@${editor.username}) que está editando. Nenhuma alteração foi salva.` 
    };
  }

  // 3. Find target user
  const target = users.find((u) => u.id === targetUserId || u.username.toLowerCase() === (targetUserId || '').toLowerCase());
  if (!target) {
    return { success: false, error: 'Conta de usuário não encontrada.' };
  }

  // 4. Validate name
  const cleanName = data.name !== undefined ? data.name.trim() : target.name;
  if (!cleanName) {
    return { success: false, error: 'O nome do administrador não pode ficar em branco.' };
  }

  // 5. Validate username
  const cleanUsername = data.username !== undefined 
    ? data.username.trim().toLowerCase().replace(/\s+/g, '') 
    : target.username;

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'O nome de usuário deve conter no mínimo 3 caracteres sem espaços.' };
  }

  // Check username uniqueness if changed
  if (cleanUsername !== target.username.toLowerCase()) {
    const exists = users.some(
      (u) => u.id !== targetUserId && u.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      return { success: false, error: `O nome de usuário "@${cleanUsername}" já está em uso por outro administrador.` };
    }
  }

  // 6. Role check (ensure not leaving 0 masters)
  const newRole = data.role || target.role;
  if (target.role === 'master' && newRole !== 'master') {
    const masterCount = users.filter((u) => u.role === 'master').length;
    if (masterCount <= 1) {
      return { success: false, error: 'Não é possível remover o perfil do único Usuário Mestre do sistema.' };
    }
  }

  // 7. Password update if provided
  let newPassword = target.password;
  if (data.newPassword && data.newPassword.trim().length > 0) {
    if (data.newPassword.trim().length < 4) {
      return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
    }
    newPassword = data.newPassword.trim();
  }

  const updatedTarget: AdminUser = {
    ...target,
    name: cleanName,
    username: cleanUsername,
    role: newRole,
    password: newPassword,
  };

  const updatedUsers = users.map((u) => (u.id === targetUserId ? updatedTarget : u));
  saveStoredAdminUsers(updatedUsers);

  // If the edited user is the current session, refresh session
  if (current.id === targetUserId) {
    setCurrentAdminUser(updatedTarget);
  }

  return { success: true, user: updatedTarget };
};


