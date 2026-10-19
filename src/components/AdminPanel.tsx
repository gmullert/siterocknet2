import React, { useState, useEffect, useRef } from 'react';
import { Plan, CoverageArea, SiteTool, FrontendContent, FaqItem, InstagramPost, AdminUser } from '../types';
import { 
  LeadOrder, 
  SiteSettings, 
  saveStoredPlans, 
  saveStoredCoverage, 
  saveStoredLeads, 
  saveStoredTools,
  saveStoredDueDates,
  saveStoredSettings, 
  saveStoredFrontendContent,
  getStoredFrontendContent,
  setAdminAuthenticated,
  getStoredAdminUsers,
  saveStoredAdminUsers,
  getCurrentAdminUser,
  setCurrentAdminUser,
  updateAdminPassword,
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
  applyFavicon
} from '../services/storage';
import { saveMediaAsset } from '../services/imageStorage';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Users, 
  Wifi, 
  MapPin, 
  Settings, 
  Wrench, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Calendar,
  X, 
  Save, 
  Phone,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Check,
  Image,
  Upload,
  HelpCircle,
  Camera,
  FileText,
  Sparkles,
  Zap,
  Headphones,
  RotateCcw,
  UserCheck,
  UserPlus,
  KeyRound,
  ShieldAlert,
  User,
  Lock,
  LogOut,
  Globe,
  Building2,
  Target,
  Quote
} from 'lucide-react';
import { DEFAULT_ABOUT_CONTENT } from '../data/content';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  onUpdatePlans: (plans: Plan[]) => void;
  tools: SiteTool[];
  onUpdateTools: (tools: SiteTool[]) => void;
  dueDates?: string[];
  onUpdateDueDates?: (dates: string[]) => void;
  coverage: CoverageArea[];
  onUpdateCoverage: (coverage: CoverageArea[]) => void;
  leads: LeadOrder[];
  onUpdateLeads: (leads: LeadOrder[]) => void;
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  frontendContent?: FrontendContent;
  onUpdateFrontendContent?: (content: FrontendContent) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  plans,
  onUpdatePlans,
  tools,
  onUpdateTools,
  dueDates = ['05', '10', '15', '20', '25'],
  onUpdateDueDates,
  coverage,
  onUpdateCoverage,
  leads,
  onUpdateLeads,
  settings,
  onUpdateSettings,
  frontendContent,
  onUpdateFrontendContent,
}) => {
  const [activeTab, setActiveTab] = useState<
    'branding' | 'hero' | 'about' | 'plans' | 'tools' | 'coverage' | 'support' | 'faq' | 'social' | 'footer' | 'leads' | 'vencimentos' | 'settings' | 'users'
  >('branding');
  const [newDueDayInput, setNewDueDayInput] = useState('');

  // User Management & Access Control State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => getStoredAdminUsers());
  const [currentUser, setCurrentUser] = useState<AdminUser>(() => getCurrentAdminUser());
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'admin' as 'master' | 'admin',
  });
  const [passwordChangeForm, setPasswordChangeForm] = useState({
    currentPass: '',
    newPass: '',
    confirmPass: '',
  });
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);

  // Switch account with password confirmation modal state
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [switchTargetUser, setSwitchTargetUser] = useState<AdminUser | null>(null);
  const [switchPasswordInput, setSwitchPasswordInput] = useState('');
  const [switchPasswordError, setSwitchPasswordError] = useState<string | null>(null);

  // Edit user account state (for Master user)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTargetUser, setEditingTargetUser] = useState<AdminUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    username: '',
    role: 'admin' as 'master' | 'admin',
    newPassword: '',
  });
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Master confirmation password modal state for editing account
  const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);
  const [editMasterPasswordInput, setEditMasterPasswordInput] = useState('');
  const [editMasterPasswordError, setEditMasterPasswordError] = useState<string | null>(null);

  // Support image dropzone state
  const supportFileInputRef = useRef<HTMLInputElement>(null);
  const [isSupportDragging, setIsSupportDragging] = useState(false);
  const [supportPreviewUrl, setSupportPreviewUrl] = useState<string>('');
  const [isSavingSupport, setIsSavingSupport] = useState(false);

  // Leads Filter & State
  const [leadFilter, setLeadFilter] = useState<string>('todos');
  const [selectedLead, setSelectedLead] = useState<LeadOrder | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [manualLeadForm, setManualLeadForm] = useState({
    fullName: '',
    phone: '',
    cpf: '',
    planName: '400 Mega (2 Roteadores)',
    planPrice: 'R$ 100,00/mês',
    street: '',
    number: '',
    neighborhood: 'Centro de Camilos',
    preferredPeriod: 'manhã',
    dueDate: '10',
    notes: '',
  });

  // Plan Edit / Create state
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState<Partial<Plan>>({
    name: '300 Mega',
    speed: 300,
    speedUnit: 'MEGA',
    price: '70',
    cents: ',00',
    routerCount: 1,
    category: 'residencial',
    description: 'Conexão ultraestável 100% fibra óptica com 1 roteador incluso.',
    equipment: '1 Roteador Wi-Fi Gigabit incluso (Comodato gratuito)',
    idealFor: '1 a 4 pessoas conectadas',
    features: ['100% Fibra Óptica FTTH', '1 Roteador Gigabit incluso', 'Sem franquia', 'Suporte local em Camilos'],
    featured: false,
    tag: '1 ROTEADOR INCLUSO',
  });

  // Tools Edit / Create state
  const [editingTool, setEditingTool] = useState<SiteTool | null>(null);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [newToolForm, setNewToolForm] = useState<Partial<SiteTool>>({
    title: '',
    description: '',
    category: 'ferramenta',
    badge: 'Novo Recurso',
    price: 'Grátis',
    active: true,
    actionType: 'whatsapp',
    actionTarget: 'Olá! Gostaria de mais informações sobre este serviço.',
    iconName: 'wifi',
  });

  // Coverage Edit / Create state
  const [isAddingCoverage, setIsAddingCoverage] = useState(false);
  const [newCoverageForm, setNewCoverageForm] = useState<Partial<CoverageArea>>({
    name: '',
    zone: 'Urbana',
    status: 'disponivel',
    statusLabel: 'Fibra Ativa Imediata',
    installationTime: 'Até 24h úteis',
    fiberType: 'FTTH Gigabit',
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({ ...settings });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Frontend Content Form
  const [frontendContentForm, setFrontendContentForm] = useState<FrontendContent>(() => {
    return frontendContent || getStoredFrontendContent();
  });

  // Keep state in sync with props
  useEffect(() => {
    if (frontendContent) {
      setFrontendContentForm(frontendContent);
    }
  }, [frontendContent]);

  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Synchronize current user and user list whenever the panel opens or user session changes
  useEffect(() => {
    if (isOpen) {
      const active = getCurrentAdminUser();
      setCurrentUser(active);
      setAdminUsers(getStoredAdminUsers());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUserChanged = () => {
      const active = getCurrentAdminUser();
      setCurrentUser(active);
      setAdminUsers(getStoredAdminUsers());
    };
    window.addEventListener('rocknet_admin_user_changed', handleUserChanged);
    return () => window.removeEventListener('rocknet_admin_user_changed', handleUserChanged);
  }, []);

  // Auto-scroll content area to top whenever active tab changes
  const contentScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // FAQ CRUD state
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState<{ question: string; answer: string }>({
    question: '',
    answer: '',
  });

  // Instagram Post CRUD state
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Partial<InstagramPost>>({
    title: '',
    category: 'Novidades',
    caption: '',
    likes: 150,
    date: 'Recentemente',
  });

  // Deletion confirmation states (avoids blocked window.confirm in iframe)
  const [confirmDeletePlanId, setConfirmDeletePlanId] = useState<string | null>(null);
  const [confirmDeleteToolId, setConfirmDeleteToolId] = useState<string | null>(null);
  const [confirmDeleteLeadId, setConfirmDeleteLeadId] = useState<string | null>(null);
  const [confirmDeleteCoverageId, setConfirmDeleteCoverageId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Logo file upload handler
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updatedSettings: SiteSettings = {
          ...settingsForm,
          logoUrl: result,
        };
        setSettingsForm(updatedSettings);
        onUpdateSettings(updatedSettings);
        saveStoredSettings(updatedSettings);
        showToast('Logomarca carregada e aplicada com sucesso no topo do site!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const updatedSettings: SiteSettings = {
      ...settingsForm,
      logoUrl: '',
    };
    setSettingsForm(updatedSettings);
    onUpdateSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    showToast('Logomarca personalizada removida. Restaurado ícone padrão!');
  };

  // Favicon Upload & Management Handlers
  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico') && !file.name.endsWith('.svg')) {
      showToast('Por favor, selecione um arquivo de ícone ou imagem válido (PNG, SVG, ICO, WebP, JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        let finalUrl = result;

        try {
          const res = await fetch('/api/upload-favicon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: result }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.url) {
              finalUrl = json.url;
            }
          }
        } catch (err) {
          console.warn('Server favicon upload error, using local fallback:', err);
        }

        const updatedSettings: SiteSettings = {
          ...settingsForm,
          faviconUrl: finalUrl,
        };
        setSettingsForm(updatedSettings);
        onUpdateSettings(updatedSettings);
        saveStoredSettings(updatedSettings);
        applyFavicon(finalUrl);
        showToast('Favicon atualizado com sucesso! A aba do navegador já foi atualizada.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFavicon = () => {
    const updatedSettings: SiteSettings = {
      ...settingsForm,
      faviconUrl: '',
    };
    setSettingsForm(updatedSettings);
    onUpdateSettings(updatedSettings);
    saveStoredSettings(updatedSettings);
    applyFavicon('/favicon.svg');
    showToast('Favicon personalizado removido. Restaurado o ícone original da Rocknet!');
  };

  const handleSaveFavicon = () => {
    onUpdateSettings(settingsForm);
    saveStoredSettings(settingsForm);
    applyFavicon(settingsForm.faviconUrl);
    showToast('Favicon salvo com sucesso! Aba do navegador atualizada.');
  };

  const handleSaveBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSettings(settingsForm);
    saveStoredSettings(settingsForm);
    if (onUpdateFrontendContent) {
      onUpdateFrontendContent(frontendContentForm);
    }
    saveStoredFrontendContent(frontendContentForm);
    showToast('Logomarca e Identidade Visual salvas com sucesso!');
  };

  const handleSaveFrontendSection = async (msg: string = 'Alterações salvas com sucesso!') => {
    let formToSave = frontendContentForm;
    const currentImg = supportPreviewUrl || frontendContentForm.supportSection.imageUrl;
    if (currentImg && currentImg.startsWith('data:')) {
      try {
        await saveMediaAsset('rocknet_custom_tecnico_img', currentImg);
      } catch {}

      try {
        const res = await fetch('/api/upload-support-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: currentImg }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            formToSave = {
              ...formToSave,
              supportSection: { ...formToSave.supportSection, imageUrl: json.url },
            };
            setSupportPreviewUrl(json.url);
            setFrontendContentForm(formToSave);
          }
        }
      } catch (err) {
        console.warn('Server upload error during save:', err);
      }
    }

    if (onUpdateFrontendContent) {
      onUpdateFrontendContent(formToSave);
    }
    saveStoredFrontendContent(formToSave);
    showToast(msg);
  };

  // Hero image file upload handler
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFrontendContentForm((prev) => ({
          ...prev,
          hero: { ...prev.hero, imageUrl: result },
        }));
        showToast('Imagem do Hero carregada! Clique em "Salvar Hero" para confirmar.');
      }
    };
    reader.readAsDataURL(file);
  };

  // About company image file upload handler
  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (result) {
        try {
          const res = await fetch('/api/upload-support-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl: result }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              const currentAbout = frontendContentForm.aboutSection || DEFAULT_ABOUT_CONTENT;
              const updated = {
                ...frontendContentForm,
                aboutSection: {
                  ...currentAbout,
                  imageUrl: data.url,
                },
              };
              setFrontendContentForm(updated);
              if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
              saveStoredFrontendContent(updated);
              showToast('Foto da empresa enviada e salva com sucesso!');
              return;
            }
          }
        } catch {}

        const currentAbout = frontendContentForm.aboutSection || DEFAULT_ABOUT_CONTENT;
        const updated = {
          ...frontendContentForm,
          aboutSection: {
            ...currentAbout,
            imageUrl: result,
          },
        };
        setFrontendContentForm(updated);
        if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
        saveStoredFrontendContent(updated);
        showToast('Foto da empresa carregada com sucesso! Clique em "Salvar A Empresa" para confirmar.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCarouselSlideUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFrontendContentForm((prev) => {
          const currentSlides = [...(prev.hero.carouselImages || [
            { url: '', title: '100% Fibra Óptica Pura em Camilos', tag: 'FTTH Pura' },
            { url: '', title: 'Ping Ultrabaixo para Jogos Competitivos', tag: 'Zero Lag' },
            { url: '', title: 'Wi-Fi Dual Band de Alta Cobertura', tag: 'Sem Pontos Cegos' },
            { url: '', title: 'Streaming 4K e Conexões Simultâneas', tag: 'Família Conectada' },
            { url: '', title: 'Instalação Ágil e Suporte Local', tag: 'Atendimento Humanizado' },
          ])];

          while (currentSlides.length <= index) {
            currentSlides.push({ url: '', title: '', tag: '' });
          }

          currentSlides[index] = {
            ...currentSlides[index],
            url: result,
          };

          return {
            ...prev,
            hero: {
              ...prev.hero,
              imageUrl: index === 0 ? result : prev.hero.imageUrl,
              carouselImages: currentSlides.slice(0, 5),
            },
          };
        });
        showToast(`Slide ${index + 1} do Carrossel carregado com sucesso!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Support image upload handler with instant preview and live synchronization
  const processSupportFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      // 1. Instantly update preview in dashboard and state so the user sees it immediately!
      setSupportPreviewUrl(result);
      setFrontendContentForm((prev) => {
        const updated = {
          ...prev,
          supportSection: { ...prev.supportSection, imageUrl: result },
        };
        if (onUpdateFrontendContent) {
          onUpdateFrontendContent(updated);
        }
        return updated;
      });

      // 2. Save in IndexedDB (handles any file size without 5MB quota limits)
      try {
        await saveMediaAsset('rocknet_custom_tecnico_img', result);
      } catch (err) {
        console.warn('IndexedDB warning:', err);
      }

      // 3. Persist to server static directory
      try {
        const res = await fetch('/api/upload-support-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: result }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setSupportPreviewUrl(data.url);
            setFrontendContentForm((prev) => {
              const updated = {
                ...prev,
                supportSection: { ...prev.supportSection, imageUrl: data.url },
              };
              if (onUpdateFrontendContent) {
                onUpdateFrontendContent(updated);
              }
              saveStoredFrontendContent(updated);
              return updated;
            });
            showToast('Imagem carregada e aplicada com sucesso!');
            return;
          }
        }
      } catch (err) {
        console.warn('Upload error:', err);
      }

      showToast('Imagem carregada no painel! Clique em "Salvar Imagem" para fixar.');
    };
    reader.readAsDataURL(file);
  };

  const handleSupportImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSupportFile(file);
    e.target.value = '';
  };

  const handleSupportFileDrop = (file: File) => {
    processSupportFile(file);
  };

  const handleSaveSupportImage = async () => {
    const currentImg = supportPreviewUrl || frontendContentForm.supportSection.imageUrl;
    if (!currentImg) {
      showToast('Nenhuma imagem selecionada para salvar.');
      return;
    }

    showToast('Salvando imagem...');
    let finalUrl = currentImg;

    // If it's a raw base64 data URL, upload to server
    if (currentImg.startsWith('data:')) {
      try {
        await saveMediaAsset('rocknet_custom_tecnico_img', currentImg);
      } catch {}

      try {
        const res = await fetch('/api/upload-support-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: currentImg }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url) finalUrl = json.url;
        }
      } catch (err) {
        console.warn('Server upload error during save:', err);
      }
    }

    setSupportPreviewUrl(finalUrl);
    setFrontendContentForm((prev) => {
      const updated = {
        ...prev,
        supportSection: { ...prev.supportSection, imageUrl: finalUrl },
      };
      if (onUpdateFrontendContent) {
        onUpdateFrontendContent(updated);
      }
      saveStoredFrontendContent(updated);
      return updated;
    });

    showToast('Imagem do Suporte Técnico salva e aplicada no site com sucesso!');
  };

  // FAQ Handlers
  const handleSaveFaqItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showToast('Preencha a pergunta e a resposta.');
      return;
    }
    if (editingFaqId) {
      const updatedFaqs = frontendContentForm.faqs.map((f) =>
        f.id === editingFaqId ? { ...f, question: faqForm.question.trim(), answer: faqForm.answer.trim() } : f
      );
      const updated = { ...frontendContentForm, faqs: updatedFaqs };
      setFrontendContentForm(updated);
      if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
      saveStoredFrontendContent(updated);
      setEditingFaqId(null);
      setFaqForm({ question: '', answer: '' });
      showToast('Pergunta atualizada com sucesso!');
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
      };
      const updated = { ...frontendContentForm, faqs: [...frontendContentForm.faqs, newFaq] };
      setFrontendContentForm(updated);
      if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
      saveStoredFrontendContent(updated);
      setIsAddingFaq(false);
      setFaqForm({ question: '', answer: '' });
      showToast('Nova pergunta adicionada ao FAQ do site!');
    }
  };

  const handleDeleteFaqItem = (faqId: string) => {
    const updatedFaqs = frontendContentForm.faqs.filter((f) => f.id !== faqId);
    const updated = { ...frontendContentForm, faqs: updatedFaqs };
    setFrontendContentForm(updated);
    if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
    saveStoredFrontendContent(updated);
    showToast('Pergunta removida do FAQ!');
  };

  // Instagram Post Handlers
  const handleSaveInstagramPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title?.trim() || !postForm.caption?.trim()) {
      showToast('Preencha o título e a legenda do post.');
      return;
    }
    if (editingPostId) {
      const updatedPosts = frontendContentForm.instagramPosts.map((p) =>
        p.id === editingPostId
          ? {
              ...p,
              title: postForm.title || '',
              category: postForm.category || 'Novidades',
              caption: postForm.caption || '',
              likes: Number(postForm.likes) || 100,
              date: postForm.date || 'Recentemente',
            }
          : p
      );
      const updated = { ...frontendContentForm, instagramPosts: updatedPosts };
      setFrontendContentForm(updated);
      if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
      saveStoredFrontendContent(updated);
      setEditingPostId(null);
      setPostForm({ title: '', category: 'Novidades', caption: '', likes: 150, date: 'Recentemente' });
      showToast('Post do Instagram atualizado!');
    } else {
      const newPost: InstagramPost = {
        id: `post-${Date.now()}`,
        title: postForm.title || 'Novo Destaque',
        category: postForm.category || 'Novidades',
        caption: postForm.caption || '',
        likes: Number(postForm.likes) || 100,
        date: postForm.date || 'Hoje',
      };
      const updated = { ...frontendContentForm, instagramPosts: [...frontendContentForm.instagramPosts, newPost] };
      setFrontendContentForm(updated);
      if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
      saveStoredFrontendContent(updated);
      setIsAddingPost(false);
      setPostForm({ title: '', category: 'Novidades', caption: '', likes: 150, date: 'Recentemente' });
      showToast('Novo post adicionado ao feed!');
    }
  };

  const handleDeleteInstagramPost = (postId: string) => {
    const updatedPosts = frontendContentForm.instagramPosts.filter((p) => p.id !== postId);
    const updated = { ...frontendContentForm, instagramPosts: updatedPosts };
    setFrontendContentForm(updated);
    if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
    saveStoredFrontendContent(updated);
    showToast('Post removido do feed!');
  };

  if (!isOpen) return null;

  // Plan Handlers
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      const cleanFeatures = (editingPlan.features || [])
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
      const planToSave: Plan = {
        ...editingPlan,
        features: cleanFeatures.length > 0 ? cleanFeatures : ['100% Fibra Óptica Real Simétrica'],
      };
      const updated = plans.map((p) => (p.id === planToSave.id ? planToSave : p));
      onUpdatePlans(updated);
      saveStoredPlans(updated);
      setEditingPlan(null);
      showToast('Plano atualizado com sucesso!');
    } else {
      if (!newPlanForm.name) {
        showToast('Por favor, informe o nome do plano.');
        return;
      }
      const cleanFeatures = (newPlanForm.features || [])
        .map((f) => f.trim())
        .filter((f) => f.length > 0);
      const newPlan: Plan = {
        id: `plano-${Date.now()}`,
        name: newPlanForm.name || 'Novo Plano',
        speed: Number(newPlanForm.speed) || 300,
        speedUnit: newPlanForm.speedUnit || 'MEGA',
        price: newPlanForm.price || '70',
        cents: newPlanForm.cents || ',00',
        routerCount: Number(newPlanForm.routerCount) || 1,
        category: newPlanForm.category || 'residencial',
        description: newPlanForm.description || '',
        equipment: newPlanForm.equipment || `${newPlanForm.routerCount || 1} Roteador(es) Wi-Fi incluso(s)`,
        idealFor: newPlanForm.idealFor || 'Uso residencial',
        features: cleanFeatures.length > 0 ? cleanFeatures : [
          'Velocidade Real Simétrica',
          '100% Fibra Óptica Pura (FTTH)',
          'Instalação Gratuita com Agendamento',
          'Sem Franquia de Consumo',
          'Suporte Técnico Local em Camilos'
        ],
        featured: !!newPlanForm.featured,
        tag: newPlanForm.tag || (newPlanForm.routerCount ? `${newPlanForm.routerCount} ROTEADOR${newPlanForm.routerCount > 1 ? 'ES' : ''} INCLUSO${newPlanForm.routerCount > 1 ? 'S' : ''}` : undefined),
        period: '/mês',
      };
      const updated = [...plans, newPlan];
      onUpdatePlans(updated);
      saveStoredPlans(updated);
      setIsAddingPlan(false);
      showToast('Novo plano cadastrado no site!');
    }
  };

  const handleDeletePlan = (planId: string) => {
    const target = plans.find((p) => p.id === planId);
    const updated = plans.filter((p) => p.id !== planId);
    onUpdatePlans(updated);
    saveStoredPlans(updated);
    setConfirmDeletePlanId(null);
    showToast(`Plano ${target ? `"${target.name}"` : ''} apagado com sucesso!`);
  };

  // Due Dates Handlers
  const handleAddDueDate = (dayStr?: string) => {
    const val = dayStr || newDueDayInput.trim();
    if (!val) {
      showToast('Por favor, informe o dia do mês para o vencimento.');
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 31) {
      showToast('Informe um dia válido entre 01 e 31.');
      return;
    }
    const formatted = num < 10 ? `0${num}` : `${num}`;
    if (dueDates.includes(formatted)) {
      showToast(`O vencimento Dia ${formatted} já está cadastrado no site.`);
      return;
    }
    const updated = [...dueDates, formatted].sort((a, b) => Number(a) - Number(b));
    if (onUpdateDueDates) onUpdateDueDates(updated);
    saveStoredDueDates(updated);
    setNewDueDayInput('');
    showToast(`Data de vencimento (Dia ${formatted}) cadastrada com sucesso!`);
  };

  const handleRemoveDueDate = (day: string) => {
    if (dueDates.length <= 1) {
      showToast('Atenção: O site precisa de pelo menos 1 data de vencimento disponível.');
      return;
    }
    const updated = dueDates.filter((d) => d !== day);
    if (onUpdateDueDates) onUpdateDueDates(updated);
    saveStoredDueDates(updated);
    showToast(`Data de vencimento (Dia ${day}) removida do site com sucesso!`);
  };

  // Tool Handlers
  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTool) {
      const updated = tools.map((t) => (t.id === editingTool.id ? editingTool : t));
      onUpdateTools(updated);
      saveStoredTools(updated);
      setEditingTool(null);
      showToast('Ferramenta atualizada!');
    } else {
      if (!newToolForm.title) {
        showToast('Informe o título da ferramenta.');
        return;
      }
      const newTool: SiteTool = {
        id: `tool-${Date.now()}`,
        title: newToolForm.title || 'Nova Ferramenta',
        description: newToolForm.description || '',
        category: newToolForm.category || 'ferramenta',
        badge: newToolForm.badge || undefined,
        price: newToolForm.price || 'Grátis',
        active: newToolForm.active !== undefined ? newToolForm.active : true,
        actionType: newToolForm.actionType || 'whatsapp',
        actionTarget: newToolForm.actionTarget || '',
        iconName: newToolForm.iconName || 'wifi',
      };
      const updated = [...tools, newTool];
      onUpdateTools(updated);
      saveStoredTools(updated);
      setIsAddingTool(false);
      showToast('Nova ferramenta cadastrada no site!');
      setNewToolForm({
        title: '',
        description: '',
        category: 'ferramenta',
        badge: 'Novo Recurso',
        price: 'Grátis',
        active: true,
        actionType: 'whatsapp',
        actionTarget: 'Olá! Gostaria de mais informações sobre este serviço.',
        iconName: 'wifi',
      });
    }
  };

  const handleToggleToolActive = (toolId: string) => {
    const updated = tools.map((t) => (t.id === toolId ? { ...t, active: !t.active } : t));
    onUpdateTools(updated);
    saveStoredTools(updated);
  };

  const handleDeleteTool = (toolId: string) => {
    const updated = tools.filter((t) => t.id !== toolId);
    onUpdateTools(updated);
    saveStoredTools(updated);
    setConfirmDeleteToolId(null);
    showToast('Ferramenta removida do site!');
  };

  // Lead Handlers
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadOrder['status']) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    onUpdateLeads(updated);
    saveStoredLeads(updated);
  };

  const handleDeleteLead = (leadId: string) => {
    const updated = leads.filter((l) => l.id !== leadId);
    onUpdateLeads(updated);
    saveStoredLeads(updated);
    setConfirmDeleteLeadId(null);
    showToast('Cadastro excluído com sucesso!');
  };

  const handleCreateManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLeadForm.fullName.trim() || !manualLeadForm.phone.trim()) {
      showToast('Preencha Nome e WhatsApp do cliente.');
      return;
    }
    const cleanCpf = manualLeadForm.cpf.replace(/\D/g, '');
    if (!manualLeadForm.cpf.trim() || cleanCpf.length < 11) {
      showToast('O CPF do titular é obrigatório e deve ter 11 dígitos.');
      return;
    }

    const newLead: LeadOrder = {
      id: `lead-${Date.now()}`,
      protocol: `#RCK-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Cadastrado no Painel',
      timestamp: Date.now(),
      planName: manualLeadForm.planName,
      planPrice: manualLeadForm.planPrice,
      fullName: manualLeadForm.fullName.trim(),
      phone: manualLeadForm.phone.trim(),
      cpf: manualLeadForm.cpf.trim(),
      street: manualLeadForm.street,
      number: manualLeadForm.number,
      neighborhood: manualLeadForm.neighborhood,
      preferredPeriod: manualLeadForm.preferredPeriod,
      dueDate: manualLeadForm.dueDate,
      notes: manualLeadForm.notes,
      status: 'novo',
    };

    const updated = [newLead, ...leads];
    onUpdateLeads(updated);
    saveStoredLeads(updated);
    setIsAddingLead(false);
    setManualLeadForm({
      fullName: '',
      phone: '',
      cpf: '',
      planName: plans[0] ? `${plans[0].name} (${plans[0].routerCount || 1} Roteador${(plans[0].routerCount || 1) > 1 ? 'es' : ''})` : '400 Mega',
      planPrice: plans[0] ? `R$ ${plans[0].price}${plans[0].cents}/mês` : 'R$ 100,00/mês',
      street: '',
      number: '',
      neighborhood: 'Centro de Camilos',
      preferredPeriod: 'manhã',
      dueDate: dueDates[0] || '10',
      notes: '',
    });
    showToast('Cliente cadastrado com sucesso!');
  };

  const handleOpenClientWhatsApp = (lead: LeadOrder) => {
    const phoneClean = lead.phone.replace(/\D/g, '');
    const cleanNumber = phoneClean.startsWith('55') ? phoneClean : `55${phoneClean}`;
    const text = `Olá ${lead.fullName}! Aqui é da equipe Rocknet Telecom sobre o seu pedido de fibra óptica (${lead.protocol} - Plano ${lead.planName}). Podemos confirmar o seu agendamento?`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  // Coverage Handlers
  const handleSaveCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoverageForm.name) {
      showToast('Informe o nome do bairro ou região.');
      return;
    }
    const newArea: CoverageArea = {
      id: `cov-${Date.now()}`,
      name: newCoverageForm.name || '',
      zone: newCoverageForm.zone || 'Urbana',
      status: newCoverageForm.status || 'disponivel',
      statusLabel: newCoverageForm.statusLabel || 'Fibra Ativa Imediata',
      installationTime: newCoverageForm.installationTime || 'Até 24h úteis',
      fiberType: newCoverageForm.fiberType || 'FTTH Gigabit',
      popularPlans: ['400 Mega', '600 Mega'],
    };
    const updated = [...coverage, newArea];
    onUpdateCoverage(updated);
    saveStoredCoverage(updated);
    setIsAddingCoverage(false);
    showToast('Novo bairro cadastrado com sucesso!');
  };

  const handleDeleteCoverage = (areaId: string) => {
    const updated = coverage.filter((c) => c.id !== areaId);
    onUpdateCoverage(updated);
    saveStoredCoverage(updated);
    setConfirmDeleteCoverageId(null);
    showToast('Bairro removido do mapa de cobertura!');
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    saveStoredSettings(settingsForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 2500);
  };

  // User Management Handlers
  const handleCreateAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    setUserActionSuccess(null);

    const res = createAdminUser(currentUser.id, newUserForm);
    if (!res.success) {
      setUserActionError(res.error || 'Erro ao cadastrar usuário.');
      return;
    }

    const updated = getStoredAdminUsers();
    setAdminUsers(updated);
    setIsAddingUser(false);
    setNewUserForm({
      name: '',
      username: '',
      password: '',
      role: 'admin',
    });
    setUserActionSuccess(`Novo administrador @${res.user?.username} cadastrado com sucesso!`);
    showToast(`Administrador @${res.user?.username} cadastrado!`);
  };

  const handleDeleteAdminUser = (targetId: string, targetName: string) => {
    setUserActionError(null);
    setUserActionSuccess(null);

    const activeUser = getCurrentAdminUser();
    const res = deleteAdminUser(currentUser?.id || activeUser.id, targetId);
    if (!res.success) {
      setUserActionError(res.error || 'Erro ao remover usuário.');
      showToast(res.error || 'Erro ao remover.');
      return;
    }

    const updated = getStoredAdminUsers();
    setAdminUsers(updated);
    setUserActionSuccess(`Conta "${targetName}" removida do sistema com sucesso.`);
    showToast(`Conta "${targetName}" removida com sucesso!`);
  };

  const handleChangeMyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    setUserActionSuccess(null);

    if (passwordChangeForm.newPass !== passwordChangeForm.confirmPass) {
      setUserActionError('A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    if (!passwordChangeForm.newPass || passwordChangeForm.newPass.trim().length < 4) {
      setUserActionError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    const res = updateAdminPassword(currentUser.id, passwordChangeForm.currentPass, passwordChangeForm.newPass);
    if (!res.success) {
      setUserActionError(res.error || 'Erro ao alterar a senha.');
      return;
    }

    const updatedCurrent = getCurrentAdminUser();
    setCurrentUser(updatedCurrent);
    setPasswordChangeForm({
      currentPass: '',
      newPass: '',
      confirmPass: '',
    });
    setUserActionSuccess('Sua senha foi alterada com sucesso!');
    showToast('Senha alterada com sucesso!');
  };

  const handleInitiateSwitchUser = (user: AdminUser) => {
    if (currentUser.id === user.id || currentUser.username.toLowerCase() === user.username.toLowerCase()) {
      showToast(`Você já está conectado como @${user.username}.`);
      return;
    }
    setSwitchTargetUser(user);
    setSwitchPasswordInput('');
    setSwitchPasswordError(null);
    setIsSwitchModalOpen(true);
  };

  const handleConfirmSwitchUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchTargetUser) return;

    const cleanPass = switchPasswordInput.trim();
    if (!cleanPass) {
      setSwitchPasswordError('Por favor, digite a senha da conta.');
      return;
    }

    // Strictly verify password against this target user's registered password
    if (switchTargetUser.password !== cleanPass) {
      setSwitchPasswordError(`Senha incorreta para a conta @${switchTargetUser.username}. Permanece na conta atual.`);
      return;
    }

    // Password matches! Switch session to this user
    setCurrentAdminUser(switchTargetUser);
    setCurrentUser(switchTargetUser);
    setIsSwitchModalOpen(false);
    setSwitchTargetUser(null);
    setSwitchPasswordInput('');
    setSwitchPasswordError(null);
    setUserActionError(null);
    setUserActionSuccess(`Sessão alterada com sucesso para @${switchTargetUser.username} (${switchTargetUser.role === 'master' ? 'Usuário Mestre' : 'Administrador'}).`);
    showToast(`Agora logado como @${switchTargetUser.username}!`);
  };

  const handleCancelSwitchUser = () => {
    setIsSwitchModalOpen(false);
    setSwitchTargetUser(null);
    setSwitchPasswordInput('');
    setSwitchPasswordError(null);
  };

  // User Editing Handlers (for Master role)
  const handleOpenEditUser = (user: AdminUser) => {
    setEditingTargetUser(user);
    setEditUserForm({
      name: user.name,
      username: user.username,
      role: user.role,
      newPassword: '',
    });
    setEditFormError(null);
    setIsEditModalOpen(true);
  };

  const handleCancelEditUser = () => {
    setIsEditModalOpen(false);
    setEditingTargetUser(null);
    setEditFormError(null);
    setEditUserForm({
      name: '',
      username: '',
      role: 'admin',
      newPassword: '',
    });
  };

  const handleRequestConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetUser) return;

    if (!editUserForm.name.trim()) {
      setEditFormError('O nome do administrador é obrigatório.');
      return;
    }

    const cleanUsername = editUserForm.username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setEditFormError('O nome de usuário deve ter pelo menos 3 caracteres sem espaços.');
      return;
    }

    if (editUserForm.newPassword && editUserForm.newPassword.trim().length > 0 && editUserForm.newPassword.trim().length < 4) {
      setEditFormError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    // Check unique username if username was changed
    if (cleanUsername !== editingTargetUser.username.toLowerCase()) {
      const exists = adminUsers.some(
        (u) => u.id !== editingTargetUser.id && u.username.toLowerCase() === cleanUsername
      );
      if (exists) {
        setEditFormError(`O nome de usuário "@${cleanUsername}" já está em uso por outra conta.`);
        return;
      }
    }

    setEditFormError(null);
    setEditMasterPasswordInput('');
    setEditMasterPasswordError(null);
    setIsEditConfirmModalOpen(true);
  };

  const handleExecuteEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetUser) return;

    const res = updateAdminUser(
      currentUser.id,
      editMasterPasswordInput,
      editingTargetUser.id,
      {
        name: editUserForm.name,
        username: editUserForm.username,
        role: editUserForm.role,
        newPassword: editUserForm.newPassword,
      }
    );

    if (!res.success) {
      setEditMasterPasswordError(res.error || 'Senha incorreta. Não foi possível autorizar a alteração.');
      return;
    }

    // Success! Update local lists
    const updatedUsers = getStoredAdminUsers();
    setAdminUsers(updatedUsers);

    // Refresh current user session from storage
    const activeUser = getCurrentAdminUser();
    setCurrentUser(activeUser);

    setIsEditConfirmModalOpen(false);
    setIsEditModalOpen(false);
    setEditingTargetUser(null);
    setEditMasterPasswordInput('');
    setEditMasterPasswordError(null);
    setUserActionSuccess(`Conta @${res.user?.username} (${res.user?.name}) atualizada com sucesso pelo Mestre!`);
    showToast(`Conta @${res.user?.username} atualizada com sucesso!`);
  };

  const handleCancelConfirmEdit = () => {
    setIsEditConfirmModalOpen(false);
    setEditMasterPasswordInput('');
    setEditMasterPasswordError(null);
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setCurrentAdminUser(null);
    showToast('Você foi desconectado com sucesso.');
    onClose();
  };

  const filteredLeads = leads.filter((l) => {
    if (leadFilter === 'todos') return true;
    return l.status === leadFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-6xl h-[92vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Navbar */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                Painel Administrativo Rocknet
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2.5 py-0.5 rounded-full font-mono">
                  Gestão Camilos
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre planos, valores, número de roteadores, ferramentas e pedidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Active Connected User Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px] hidden sm:inline">Conectado:</span>
                <span className="font-mono font-bold text-white text-xs">@{currentUser?.username || 'admin'}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                  currentUser?.role === 'master' 
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                }`}>
                  {currentUser?.role === 'master' ? 'Mestre' : 'Admin'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/60 hover:border-red-600 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Desconectar da conta logada"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desconectar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div 
          className="px-6 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between overflow-x-auto shrink-0 gap-3 scrollbar-thin select-none"
          role="tablist"
          aria-label="Abas do Painel Administrativo"
        >
          <div className="flex items-center gap-1.5 flex-nowrap">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'branding'}
              onClick={() => setActiveTab('branding')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'branding'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Logomarca & Favicon</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'hero'}
              onClick={() => setActiveTab('hero')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'hero'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Início (Hero)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'about'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>A Empresa (Sobre)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'plans'}
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'plans'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Planos ({plans.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'tools'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Ferramentas ({tools.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'coverage'}
              onClick={() => setActiveTab('coverage')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'coverage'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Cobertura ({coverage.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'support'}
              onClick={() => setActiveTab('support')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'support'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Suporte & Imagem</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'faq'}
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'faq'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ ({frontendContentForm.faqs.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'social'}
              onClick={() => setActiveTab('social')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'social'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'footer'}
              onClick={() => setActiveTab('footer')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'footer'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Rodapé</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'leads'}
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'leads'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pedidos ({leads.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'vencimentos'}
              onClick={() => setActiveTab('vencimentos')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'vencimentos'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Vencimentos ({dueDates.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'settings'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Contatos</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                activeTab === 'users'
                  ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Usuários & Senhas ({adminUsers.length})</span>
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-mono hidden lg:inline shrink-0">
            WhatsApp: {settingsForm.phoneDisplay}
          </span>
        </div>

        {/* Tab Contents */}
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-6 bg-neutral-950/60 relative">
          
          {/* Action notification toast */}
          {toastMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-emerald-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* TAB: BRANDING & NAVBAR */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* TOP CARD: CAMPO PARA ADICIONAR A LOGOMARCA QUE FICA NO COMEÇO DO SITE */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/40 border border-cyan-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-400/20">
                  <Image className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Logomarca Oficial do Site (Começo do Site / Topo)
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-700/60 px-2 py-0.5 rounded-full font-mono">
                      Identidade Visual
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Insira a imagem ou link da logomarca da Rocknet. Ela atualizará instantaneamente o topo do site e o rodapé.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {settingsForm.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 rounded-xl transition-colors cursor-pointer"
                  >
                    Remover Logo (Restaurar Padrão)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveBranding()}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-400/20 transition-all cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Logomarca</span>
                </button>
              </div>
            </div>

            {/* Field Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 space-y-3">
                {/* 1. File Upload */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    1. Fazer upload do arquivo de imagem do computador ou celular:
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-neutral-950 border border-dashed border-neutral-700 hover:border-cyan-400 rounded-xl cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="text-xs">
                      <span className="text-white font-medium block">Clique aqui para selecionar arquivo de imagem</span>
                      <span className="text-neutral-500 text-[11px]">Formatos aceitos: PNG (com fundo transparente), SVG, JPG, WebP</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. URL Input */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1">
                    2. Ou cole um link direto (URL) da imagem da logomarca:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.logoUrl || ''}
                    onChange={(e) => {
                      const updated = { ...settingsForm, logoUrl: e.target.value };
                      setSettingsForm(updated);
                      onUpdateSettings(updated);
                      saveStoredSettings(updated);
                    }}
                    placeholder="https://exemplo.com.br/minha-logomarca.png ou data:image/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Sizing & Mode Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Altura da Logomarca: <span className="text-cyan-400 font-bold">{settingsForm.logoHeight || 38}px</span>
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="68"
                      value={settingsForm.logoHeight || 38}
                      onChange={(e) => {
                        const updated = { ...settingsForm, logoHeight: Number(e.target.value) };
                        setSettingsForm(updated);
                        onUpdateSettings(updated);
                        saveStoredSettings(updated);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Modo de Exibição no Topo:
                    </label>
                    <select
                      value={settingsForm.logoMode || 'both'}
                      onChange={(e) => {
                        const updated = { ...settingsForm, logoMode: e.target.value as any };
                        setSettingsForm(updated);
                        onUpdateSettings(updated);
                        saveStoredSettings(updated);
                      }}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="both">Imagem da Logo + Nome da Empresa</option>
                      <option value="image">Somente a Imagem da Logomarca</option>
                      <option value="icon">Ícone Padrão + Nome da Empresa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="lg:col-span-5 bg-neutral-950 rounded-xl p-4 border border-neutral-800/80">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Pré-visualização no Cabeçalho do Site:
                </span>
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {settingsForm.logoUrl ? (
                      <img
                        src={settingsForm.logoUrl}
                        alt="Preview da Logomarca"
                        style={{ height: `${settingsForm.logoHeight || 38}px` }}
                        className="max-w-[150px] object-contain rounded"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Wifi className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium">
                    <span className="hidden sm:inline">Planos</span>
                    <span className="px-2 py-1 bg-cyan-400 text-neutral-950 font-bold rounded">
                      {frontendContentForm.navbar.ctaText || 'Assinar'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 block mt-2">
                  ✓ Qualquer alteração reflete imediatamente no site ao salvar.
                </span>
              </div>
            </div>
          </div>

          {/* CARD DE GESTÃO DO FAVICON (ÍCONE DA ABA DO NAVEGADOR) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-blue-950/40 border border-blue-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                  <Globe className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Favicon da Aba do Navegador (Ícone da Aba)
                    <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-700/60 px-2 py-0.5 rounded-full font-mono">
                      Aba do Navegador
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Cadastre e altere o ícone que aparece na aba do navegador, no favoritos e no atalho móvel dos clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {settingsForm.faviconUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveFavicon}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 rounded-xl transition-colors cursor-pointer"
                    title="Restaurar o favicon SVG padrão da Rocknet"
                  >
                    Restaurar Padrão
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveFavicon}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-400/20 transition-all cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Favicon</span>
                </button>
              </div>
            </div>

            {/* Field Inputs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 space-y-3.5">
                {/* 1. File Upload */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1.5">
                    1. Fazer upload do arquivo de Favicon (computador ou celular):
                  </label>
                  <label className="flex items-center gap-3 p-3.5 bg-neutral-950 border border-dashed border-neutral-700 hover:border-blue-400 rounded-xl cursor-pointer transition-colors group">
                    <Upload className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="text-xs">
                      <span className="text-white font-medium block">
                        Clique aqui para selecionar arquivo de Favicon
                      </span>
                      <span className="text-neutral-500 text-[11px]">
                        Formatos aceitos: PNG (com fundo transparente), SVG, ICO, WebP ou JPG.
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp,image/jpeg"
                      onChange={handleFaviconFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 2. URL Input */}
                <div>
                  <label className="text-xs font-semibold text-neutral-200 block mb-1">
                    2. Ou digite/cole o link direto (URL) do ícone:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.faviconUrl || ''}
                    onChange={(e) => {
                      const updated = { ...settingsForm, faviconUrl: e.target.value };
                      setSettingsForm(updated);
                      onUpdateSettings(updated);
                      saveStoredSettings(updated);
                      applyFavicon(e.target.value);
                    }}
                    placeholder="https://exemplo.com.br/meu-favicon.png ou /favicon.svg"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-[11px] text-neutral-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dicas para o melhor Favicon:</span>
                  </div>
                  <p className="leading-relaxed">
                    • <strong>Formato ideal:</strong> Quadrado (proporção 1:1, ex: 64x64, 128x128 ou 512x512 pixels).
                  </p>
                  <p className="leading-relaxed">
                    • <strong>Fundo transparente:</strong> Imagens PNG ou SVG com fundo transparente garantem ótima legibilidade em abas claras ou escuras.
                  </p>
                </div>
              </div>

              {/* Right: Realistic Browser Window & Tab Simulation */}
              <div className="lg:col-span-5 bg-neutral-950 rounded-2xl p-4 border border-neutral-800/80 space-y-3">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                  Simulação Real na Aba do Navegador:
                </span>

                {/* Browser Window Mockup */}
                <div className="rounded-xl bg-[#1e1e1e] border border-neutral-700/80 shadow-2xl overflow-hidden text-left">
                  {/* Browser Top Bar with 3 dots */}
                  <div className="bg-[#121212] px-3 py-2 flex items-center justify-between border-b border-neutral-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">Navegador</span>
                    <div className="w-8"></div>
                  </div>

                  {/* Browser Tab Header */}
                  <div className="bg-[#181818] px-2 pt-2 flex items-center gap-1 border-b border-neutral-800">
                    {/* Active Tab */}
                    <div className="bg-[#242424] text-white px-3 py-1.5 rounded-t-lg flex items-center gap-2 border-t border-x border-neutral-700 max-w-[210px] shadow-sm">
                      <img
                        src={settingsForm.faviconUrl || '/favicon.svg'}
                        alt="Favicon da Aba"
                        className="w-4 h-4 object-contain rounded-sm shrink-0 bg-neutral-900/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/favicon.svg';
                        }}
                      />
                      <span className="text-[11px] font-medium truncate">
                        Rocknet Telecom - Fibra
                      </span>
                      <X className="w-3 h-3 text-neutral-400 shrink-0 ml-auto hover:text-white" />
                    </div>

                    <div className="text-neutral-500 px-2 text-xs select-none">+</div>
                  </div>

                  {/* Address Bar */}
                  <div className="p-2.5 bg-[#202020] border-b border-neutral-800 flex items-center gap-2">
                    <div className="flex-1 bg-[#141414] rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 flex items-center gap-1.5 font-mono border border-neutral-800">
                      <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-semibold">https://</span>
                      <span className="truncate">rocknet.com.br</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-neutral-400">Status atual:</span>
                  {settingsForm.faviconUrl ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Favicon Personalizado Ativo
                    </span>
                  ) : (
                    <span className="text-cyan-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Favicon Padrão Rocknet (SVG)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção Identidade Visual & Cabeçalho */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-base font-bold text-white">Identidade Visual & Cabeçalho do Site</h3>
              <p className="text-xs text-neutral-400">
                Edite a logomarca, nome do provedor e links de navegação do menu superior.
              </p>
            </div>
              <button
                type="button"
                onClick={() => handleSaveBranding()}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Topo</span>
              </button>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Nome da Marca</h4>
                  <div>
                    <label className="text-neutral-400 block mb-1">Nome Principal (ex: Rock)</label>
                    <input
                      type="text"
                      value={settingsForm.logoTextPrimary || 'Rock'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoTextPrimary: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Destaque em Ciano (ex: net)</label>
                    <input
                      type="text"
                      value={settingsForm.logoTextAccent || 'net'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoTextAccent: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Razão Social / Nome Completo</label>
                    <input
                      type="text"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                  <h4 className="font-bold text-white text-sm">Links do Menu Superior</h4>
                  <div>
                    <label className="text-neutral-400 block mb-1">Texto do Botão de Ação (CTA)</label>
                    <input
                      type="text"
                      value={frontendContentForm.navbar.ctaText}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          navbar: { ...frontendContentForm.navbar, ctaText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-bold text-cyan-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Link A Rocknet (Empresa)</label>
                      <input
                        type="text"
                        value={frontendContentForm.aboutSection?.navLinkText || frontendContentForm.navbar.aboutLinkText || 'A Rocknet'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFrontendContentForm({
                            ...frontendContentForm,
                            navbar: { ...frontendContentForm.navbar, aboutLinkText: val },
                            aboutSection: {
                              ...(frontendContentForm.aboutSection || DEFAULT_ABOUT_CONTENT),
                              navLinkText: val,
                            },
                          });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-cyan-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Link Planos</label>
                      <input
                        type="text"
                        value={frontendContentForm.navbar.plansLinkText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            navbar: { ...frontendContentForm.navbar, plansLinkText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Link Ferramentas</label>
                      <input
                        type="text"
                        value={frontendContentForm.navbar.toolsLinkText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            navbar: { ...frontendContentForm.navbar, toolsLinkText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Link Cobertura</label>
                      <input
                        type="text"
                        value={frontendContentForm.navbar.coverageLinkText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            navbar: { ...frontendContentForm.navbar, coverageLinkText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Link Suporte</label>
                      <input
                        type="text"
                        value={frontendContentForm.navbar.supportLinkText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            navbar: { ...frontendContentForm.navbar, supportLinkText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HERO SECTION */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Início do Site (Hero Section)</h3>
                  <p className="text-xs text-neutral-400">
                    Edite o título principal, subtítulo, botões de ação e imagem em destaque da página inicial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveFrontendSection('Seção Inicial (Hero) salva com sucesso!')}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Hero</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <h4 className="font-bold text-white text-sm">Textos Principais</h4>
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge Superior</label>
                    <input
                      type="text"
                      value={frontendContentForm.hero.topBadge}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          hero: { ...frontendContentForm.hero, topBadge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Título Principal (H1)</label>
                    <textarea
                      rows={2}
                      value={frontendContentForm.hero.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          hero: { ...frontendContentForm.hero, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Subtítulo / Descrição Explicativa</label>
                    <textarea
                      rows={3}
                      value={frontendContentForm.hero.subtitle}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          hero: { ...frontendContentForm.hero, subtitle: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Texto Botão Primário</label>
                      <input
                        type="text"
                        value={frontendContentForm.hero.ctaPrimaryText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            hero: { ...frontendContentForm.hero, ctaPrimaryText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Texto Botão Secundário</label>
                      <input
                        type="text"
                        value={frontendContentForm.hero.ctaSecondaryText}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            hero: { ...frontendContentForm.hero, ctaSecondaryText: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Carrossel de Imagens do Hero (Até 5 Imagens)</h4>
                      <p className="text-[11px] text-neutral-400">O carrossel possui transição automática de imagens no site com pausa ao passar o mouse.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[10px] font-semibold">
                      Até 5 Slides
                    </span>
                  </div>

                  {/* 5 Carousel Slides */}
                  <div className="space-y-3 pt-1">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const slideData = frontendContentForm.hero.carouselImages?.[index] || {
                        url: index === 0 ? (frontendContentForm.hero.imageUrl || '') : '',
                        title: [
                          'Ultravelocidade 100% Fibra Pura em Camilos',
                          'Zero Lag e Ping Estável para Gamers',
                          'Roteadores Wi-Fi Dual Band Sem Pontos Cegos',
                          'Streaming 4K e Conexões Simultâneas',
                          'Suporte Técnico e Instalação Ágil em Camilos'
                        ][index] || '',
                        tag: [
                          '100% Fibra Pura',
                          'Modo Gamer',
                          'Super Cobertura',
                          'Streaming 4K',
                          'Suporte Local'
                        ][index] || ''
                      };

                      const currentUrl = typeof slideData === 'string' ? slideData : slideData?.url || '';
                      const currentTag = typeof slideData === 'object' ? slideData?.tag || '' : '';
                      const currentTitle = typeof slideData === 'object' ? slideData?.title || '' : '';

                      return (
                        <div key={index} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono">
                                {index + 1}
                              </span>
                              Slide {index + 1} {currentTag ? `· ${currentTag}` : ''}
                            </span>
                            {currentUrl && (
                              <span className="text-[10px] text-emerald-400 font-medium">Imagem personalizada</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-neutral-400 block text-[10px] mb-1">Upload de Imagem</label>
                              <label className="flex items-center justify-center gap-1.5 p-1.5 bg-neutral-900 border border-dashed border-neutral-700 hover:border-cyan-400 rounded-lg cursor-pointer text-[11px] text-neutral-300">
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Escolher arquivo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCarouselSlideUpload(index, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div>
                              <label className="text-neutral-400 block text-[10px] mb-1">Ou Link da Imagem</label>
                              <input
                                type="text"
                                value={currentUrl}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const currentSlides = [...(frontendContentForm.hero.carouselImages || [
                                    { url: '', title: 'Ultravelocidade 100% Fibra Pura em Camilos', tag: '100% Fibra Pura' },
                                    { url: '', title: 'Zero Lag e Ping Estável para Gamers', tag: 'Modo Gamer' },
                                    { url: '', title: 'Roteadores Wi-Fi Dual Band Sem Pontos Cegos', tag: 'Super Cobertura' },
                                    { url: '', title: 'Streaming 4K e Conexões Simultâneas', tag: 'Streaming 4K' },
                                    { url: '', title: 'Suporte Técnico e Instalação Ágil em Camilos', tag: 'Suporte Local' },
                                  ])];
                                  while (currentSlides.length <= index) {
                                    currentSlides.push({ url: '', title: '', tag: '' });
                                  }
                                  currentSlides[index] = {
                                    ...currentSlides[index],
                                    url: val,
                                  };
                                  setFrontendContentForm({
                                    ...frontendContentForm,
                                    hero: {
                                      ...frontendContentForm.hero,
                                      imageUrl: index === 0 ? val : frontendContentForm.hero.imageUrl,
                                      carouselImages: currentSlides.slice(0, 5),
                                    },
                                  });
                                }}
                                placeholder="Link externo ou vazio para imagem padrão"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white font-mono text-[10px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-neutral-400 block text-[10px] mb-0.5">Etiqueta (Tag)</label>
                              <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const currentSlides = [...(frontendContentForm.hero.carouselImages || [
                                    { url: '', title: 'Ultravelocidade 100% Fibra Pura em Camilos', tag: '100% Fibra Pura' },
                                    { url: '', title: 'Zero Lag e Ping Estável para Gamers', tag: 'Modo Gamer' },
                                    { url: '', title: 'Roteadores Wi-Fi Dual Band Sem Pontos Cegos', tag: 'Super Cobertura' },
                                    { url: '', title: 'Streaming 4K e Conexões Simultâneas', tag: 'Streaming 4K' },
                                    { url: '', title: 'Suporte Técnico e Instalação Ágil em Camilos', tag: 'Suporte Local' },
                                  ])];
                                  while (currentSlides.length <= index) {
                                    currentSlides.push({ url: '', title: '', tag: '' });
                                  }
                                  currentSlides[index] = {
                                    ...currentSlides[index],
                                    tag: val,
                                  };
                                  setFrontendContentForm({
                                    ...frontendContentForm,
                                    hero: {
                                      ...frontendContentForm.hero,
                                      carouselImages: currentSlides.slice(0, 5),
                                    },
                                  });
                                }}
                                placeholder="Ex: Modo Gamer"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-white text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="text-neutral-400 block text-[10px] mb-0.5">Título / Legenda</label>
                              <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const currentSlides = [...(frontendContentForm.hero.carouselImages || [
                                    { url: '', title: 'Ultravelocidade 100% Fibra Pura em Camilos', tag: '100% Fibra Pura' },
                                    { url: '', title: 'Zero Lag e Ping Estável para Gamers', tag: 'Modo Gamer' },
                                    { url: '', title: 'Roteadores Wi-Fi Dual Band Sem Pontos Cegos', tag: 'Super Cobertura' },
                                    { url: '', title: 'Streaming 4K e Conexões Simultâneas', tag: 'Streaming 4K' },
                                    { url: '', title: 'Suporte Técnico e Instalação Ágil em Camilos', tag: 'Suporte Local' },
                                  ])];
                                  while (currentSlides.length <= index) {
                                    currentSlides.push({ url: '', title: '', tag: '' });
                                  }
                                  currentSlides[index] = {
                                    ...currentSlides[index],
                                    title: val,
                                  };
                                  setFrontendContentForm({
                                    ...frontendContentForm,
                                    hero: {
                                      ...frontendContentForm.hero,
                                      carouselImages: currentSlides.slice(0, 5),
                                    },
                                  });
                                }}
                                placeholder="Legenda do slide"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-white text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-neutral-400 block mb-1">Latência Indicada</label>
                      <input
                        type="text"
                        value={frontendContentForm.hero.statLatency}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            hero: { ...frontendContentForm.hero, statLatency: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Tecnologia Indicada</label>
                      <input
                        type="text"
                        value={frontendContentForm.hero.statUptime}
                        onChange={(e) =>
                          setFrontendContentForm({
                            ...frontendContentForm,
                            hero: { ...frontendContentForm.hero, statUptime: e.target.value },
                          })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ABOUT COMPANY (A EMPRESA - MODELO ZAAZ TELECOM) */}
          {activeTab === 'about' && (() => {
            const about = frontendContentForm.aboutSection || DEFAULT_ABOUT_CONTENT;
            
            const updateAbout = (patch: Partial<typeof about>) => {
              const updatedAbout = { ...about, ...patch };
              const updatedContent: FrontendContent = {
                ...frontendContentForm,
                navbar: {
                  ...frontendContentForm.navbar,
                  aboutLinkText: patch.navLinkText !== undefined ? patch.navLinkText : frontendContentForm.navbar.aboutLinkText,
                },
                aboutSection: updatedAbout,
              };
              setFrontendContentForm(updatedContent);
            };

            return (
              <div className="space-y-6">
                {/* Header with Save and Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>A Empresa / Sobre Nós</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Modelo Zaaz Telecom
                        </span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Edite todos os textos da empresa, história, diferenciais e fotos institucionais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => updateAbout({ enabled: about.enabled === false ? true : false })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                        about.enabled !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {about.enabled !== false ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-neutral-500" />}
                      <span>{about.enabled !== false ? 'Seção Ativa' : 'Seção Oculta'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveFrontendSection('Dados institucionais de "A Empresa" salvos com sucesso!')}
                      className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar A Empresa</span>
                    </button>
                  </div>
                </div>

                {/* Grid 1: Identidade no Topo & Títulos */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Identidade no Menu Superior & Títulos da Seção</span>
                  </h4>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Texto do Link no Cabeçalho (Menu Superior)
                    </label>
                    <input
                      type="text"
                      value={about.navLinkText || 'A Rocknet'}
                      onChange={(e) => updateAbout({ navLinkText: e.target.value })}
                      placeholder="Ex: A Rocknet ou A Empresa"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-semibold text-cyan-300"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Este é o link que aparece na barra do topo do site.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-neutral-400 block mb-1">
                        Título Principal da Seção
                      </label>
                      <input
                        type="text"
                        value={about.title || ''}
                        onChange={(e) => updateAbout({ title: e.target.value })}
                        placeholder="Ex: A Rocknet Telecom"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">
                        Subtítulo / Slogan Institucional
                      </label>
                      <textarea
                        rows={2}
                        value={about.subtitle || ''}
                        onChange={(e) => updateAbout({ subtitle: e.target.value })}
                        placeholder="Frase inspiradora sobre conectar famílias e empresas com fibra óptica..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid 2: História & Quem Somos (3 Parágrafos) */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Nossa História & Quem Somos (Storytelling da Empresa)</span>
                  </h4>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Parágrafo 1 (Origem, Fundação e Propósito)
                    </label>
                    <textarea
                      rows={3}
                      value={about.historyParagraph1 || ''}
                      onChange={(e) => updateAbout({ historyParagraph1: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Parágrafo 2 (Tecnologia 100% Fibra Óptica FTTH e Estabilidade)
                    </label>
                    <textarea
                      rows={3}
                      value={about.historyParagraph2 || ''}
                      onChange={(e) => updateAbout({ historyParagraph2: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">
                      Parágrafo 3 (Presença na Cidade, Suporte Técnico Local e Futuro)
                    </label>
                    <textarea
                      rows={3}
                      value={about.historyParagraph3 || ''}
                      onChange={(e) => updateAbout({ historyParagraph3: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="md:col-span-2">
                      <label className="text-neutral-400 block mb-1">
                        Frase de Efeito em Destaque (Citação / Lema)
                      </label>
                      <input
                        type="text"
                        value={about.quoteText || ''}
                        onChange={(e) => updateAbout({ quoteText: e.target.value })}
                        placeholder="Ex: Conectar pessoas é encurtar distâncias e abrir portas para o mundo..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">
                        Autor / Assinatura da Frase
                      </label>
                      <input
                        type="text"
                        value={about.quoteAuthor || ''}
                        onChange={(e) => updateAbout({ quoteAuthor: e.target.value })}
                        placeholder="Ex: Equipe Rocknet Telecom"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid 4: 4 Diferenciais Competitivos */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>4 Diferenciais da Empresa (Por que escolher a Rocknet?)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(about.differentials || DEFAULT_ABOUT_CONTENT.differentials).map((diff, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          Diferencial #{idx + 1}
                        </div>
                        <div>
                          <label className="text-neutral-400 block text-[10px] mb-0.5">Título</label>
                          <input
                            type="text"
                            value={diff.title}
                            onChange={(e) => {
                              const newDiffs = [...(about.differentials || DEFAULT_ABOUT_CONTENT.differentials)];
                              newDiffs[idx] = { ...newDiffs[idx], title: e.target.value };
                              updateAbout({ differentials: newDiffs });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-neutral-400 block text-[10px] mb-0.5">Descrição</label>
                          <textarea
                            rows={3}
                            value={diff.desc}
                            onChange={(e) => {
                              const newDiffs = [...(about.differentials || DEFAULT_ABOUT_CONTENT.differentials)];
                              newDiffs[idx] = { ...newDiffs[idx], desc: e.target.value };
                              updateAbout({ differentials: newDiffs });
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-white text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grid 5: Foto Institucional & CTA Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  
                  {/* Foto Institucional */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Image className="w-4 h-4 text-cyan-400" />
                      <span>Foto Institucional da Empresa / Equipe</span>
                    </h4>

                    <div className="flex items-center gap-3">
                      <div className="w-24 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
                        <img
                          src={about.imageUrl || DEFAULT_ABOUT_CONTENT.imageUrl}
                          alt="Foto da empresa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                      </div>

                      <div className="space-y-2 flex-1">
                        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg cursor-pointer font-medium text-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Enviar Foto da Empresa</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAboutImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-neutral-500 block">
                          Envie foto da sede, frota de veículos ou técnicos.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Ou Link Direto da Imagem (URL)</label>
                      <input
                        type="text"
                        value={about.imageUrl || ''}
                        onChange={(e) => updateAbout({ imageUrl: e.target.value })}
                        placeholder="https://exemplo.com.br/foto-empresa.jpg"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Legenda da Imagem</label>
                      <input
                        type="text"
                        value={about.imageCaption || ''}
                        onChange={(e) => updateAbout({ imageCaption: e.target.value })}
                        placeholder="Ex: Infraestrutura com tecnologia de última geração..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Chamada para Ação (CTA) */}
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Chamada para Ação (Banner Final da Seção)</span>
                    </h4>

                    <div>
                      <label className="text-neutral-400 block mb-1">Título do Banner</label>
                      <input
                        type="text"
                        value={about.ctaTitle || ''}
                        onChange={(e) => updateAbout({ ctaTitle: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Subtítulo do Banner</label>
                      <textarea
                        rows={2}
                        value={about.ctaSubtitle || ''}
                        onChange={(e) => updateAbout({ ctaSubtitle: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Texto do Botão Principal</label>
                      <input
                        type="text"
                        value={about.ctaButtonText || 'Conhecer Nossos Planos'}
                        onChange={(e) => updateAbout({ ctaButtonText: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white text-cyan-300 font-bold"
                      />
                    </div>
                  </div>

                </div>

                {/* Bottom Save Action Bar */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/90 border border-cyan-500/30">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Todas as alterações em "A Empresa" são refletidas imediatamente na página do site e no menu superior.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Dados de "A Empresa" salvos com sucesso!')}
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* TAB 1: PLANS & PRICING MANAGEMENT */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Section Header Editor */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Títulos e Cabeçalho da Seção de Planos no Site</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Cabeçalho da Seção de Planos atualizado!')}
                    className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-[11px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Títulos</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Título Principal (H2)</label>
                    <input
                      type="text"
                      value={frontendContentForm.plansSection.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          plansSection: { ...frontendContentForm.plansSection, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Subtítulo / Descrição</label>
                    <input
                      type="text"
                      value={frontendContentForm.plansSection.subtitle}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          plansSection: { ...frontendContentForm.plansSection, subtitle: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Pills dos Planos Cadastrados - Clique para abrir e editar os campos correspondentes imediatamente */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-cyan-500/30 shadow-lg flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-neutral-300 mr-1 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Planos Cadastrados ({plans.length}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPlan(true);
                    setEditingPlan(null);
                    setNewPlanForm({
                      name: '',
                      speed: 500,
                      speedUnit: 'MEGA',
                      price: '90',
                      cents: ',00',
                      routerCount: 2,
                      category: 'residencial',
                      description: 'Conexão 100% fibra óptica com ultraestabilidade.',
                      equipment: '2 Roteadores Wi-Fi inclusos (Comodato gratuito)',
                      idealFor: 'Toda a família',
                      features: [
                        'Velocidade Real Simétrica',
                        '2 Roteadores Wi-Fi Inclusos',
                        '100% Fibra Óptica Pura (FTTH)',
                        'Instalação Gratuita com Agendamento',
                        'Sem Franquia de Consumo',
                        'Suporte Técnico Local em Camilos',
                      ],
                      tag: '2 ROTEADORES INCLUSOS',
                    });
                    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isAddingPlan
                      ? 'bg-cyan-400 text-neutral-950 shadow-md'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Plano</span>
                </button>
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setEditingPlan({ ...p });
                      setIsAddingPlan(false);
                      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      editingPlan?.id === p.id
                        ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                        : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-80 font-mono">R$ {p.price}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Campos do Plano Selecionado</h3>
                  <p className="text-xs text-neutral-400">
                    Cadastre novos planos ou altere valores e quantidade de roteadores para refletir instantaneamente no site.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingPlan(true);
                    setEditingPlan(null);
                    setNewPlanForm({
                      name: '',
                      speed: 500,
                      speedUnit: 'MEGA',
                      price: '90',
                      cents: ',00',
                      routerCount: 2,
                      category: 'residencial',
                      description: 'Conexão 100% fibra óptica com ultraestabilidade.',
                      equipment: '2 Roteadores Wi-Fi inclusos (Comodato gratuito)',
                      idealFor: 'Toda a família',
                      features: [
                        'Velocidade Real Simétrica',
                        '2 Roteadores Wi-Fi Inclusos',
                        '100% Fibra Óptica Pura (FTTH)',
                        'Instalação Gratuita com Agendamento',
                        'Sem Franquia de Consumo',
                        'Suporte Técnico Local em Camilos',
                      ],
                      tag: '2 ROTEADORES INCLUSOS',
                    });
                    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Plano</span>
                </button>
              </div>

              {/* Form for Creating or Editing Plan */}
              {(isAddingPlan || editingPlan) && (
                <div className="p-6 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h4 className="font-bold text-white text-sm">
                      {editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Cadastrar Novo Plano de Fibra'}
                    </h4>
                    <button
                      onClick={() => {
                        setIsAddingPlan(false);
                        setEditingPlan(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">Nome do Plano *</label>
                      <input
                        type="text"
                        required
                        value={editingPlan ? editingPlan.name : newPlanForm.name}
                        onChange={(e) =>
                          editingPlan
                            ? setEditingPlan({ ...editingPlan, name: e.target.value })
                            : setNewPlanForm({ ...newPlanForm, name: e.target.value })
                        }
                        placeholder="Ex: 300 Mega"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Velocidade *</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          value={editingPlan ? editingPlan.speed : newPlanForm.speed}
                          onChange={(e) =>
                            editingPlan
                              ? setEditingPlan({ ...editingPlan, speed: Number(e.target.value) })
                              : setNewPlanForm({ ...newPlanForm, speed: Number(e.target.value) })
                          }
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                          placeholder="300"
                        />
                        <select
                          value={editingPlan ? editingPlan.speedUnit : newPlanForm.speedUnit}
                          onChange={(e) =>
                            editingPlan
                              ? setEditingPlan({ ...editingPlan, speedUnit: e.target.value as 'MEGA' | 'GIGA' })
                              : setNewPlanForm({ ...newPlanForm, speedUnit: e.target.value as 'MEGA' | 'GIGA' })
                          }
                          className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                        >
                          <option value="MEGA">MEGA</option>
                          <option value="GIGA">GIGA</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Valor Mensal (Ex: 70, 100, 120) *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editingPlan ? editingPlan.price : newPlanForm.price}
                          onChange={(e) =>
                            editingPlan
                              ? setEditingPlan({ ...editingPlan, price: e.target.value })
                              : setNewPlanForm({ ...newPlanForm, price: e.target.value })
                          }
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                          placeholder="70"
                        />
                        <input
                          type="text"
                          required
                          value={editingPlan ? editingPlan.cents : newPlanForm.cents}
                          onChange={(e) =>
                            editingPlan
                              ? setEditingPlan({ ...editingPlan, cents: e.target.value })
                              : setNewPlanForm({ ...newPlanForm, cents: e.target.value })
                          }
                          className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono"
                          placeholder=",00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Quantidade de Roteadores Inclusos *</label>
                      <select
                        value={editingPlan ? (editingPlan.routerCount || 1) : (newPlanForm.routerCount || 1)}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          const equipText = `${count} Roteador${count > 1 ? 'es' : ''} Wi-Fi incluso${count > 1 ? 's' : ''} (Comodato gratuito)`;
                          const tagText = `${count} ROTEADOR${count > 1 ? 'ES' : ''} INCLUSO${count > 1 ? 'S' : ''}`;
                          if (editingPlan) {
                            setEditingPlan({ ...editingPlan, routerCount: count, equipment: equipText, tag: tagText });
                          } else {
                            setNewPlanForm({ ...newPlanForm, routerCount: count, equipment: equipText, tag: tagText });
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value={1}>1 Roteador incluso</option>
                        <option value={2}>2 Roteadores inclusos</option>
                        <option value={3}>3 Roteadores inclusos</option>
                        <option value={4}>4 Roteadores inclusos</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Categoria do Plano</label>
                      <select
                        value={editingPlan ? editingPlan.category : newPlanForm.category}
                        onChange={(e) =>
                          editingPlan
                            ? setEditingPlan({ ...editingPlan, category: e.target.value as any })
                            : setNewPlanForm({ ...newPlanForm, category: e.target.value as any })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="residencial">Residencial</option>
                        <option value="gamer">Gamer / Alta Performance</option>
                        <option value="empresarial">Empresarial</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Selo / Tag de Destaque no Card</label>
                      <input
                        type="text"
                        value={editingPlan ? (editingPlan.tag || '') : (newPlanForm.tag || '')}
                        onChange={(e) =>
                          editingPlan
                            ? setEditingPlan({ ...editingPlan, tag: e.target.value })
                            : setNewPlanForm({ ...newPlanForm, tag: e.target.value })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                        placeholder="Ex: 2 ROTEADORES INCLUSOS"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-neutral-400 block mb-1">Descrição do Equipamento Incluso</label>
                      <input
                        type="text"
                        value={editingPlan ? editingPlan.equipment : newPlanForm.equipment}
                        onChange={(e) =>
                          editingPlan
                            ? setEditingPlan({ ...editingPlan, equipment: e.target.value })
                            : setNewPlanForm({ ...newPlanForm, equipment: e.target.value })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                        placeholder="Ex: 2 Roteadores Wi-Fi inclusos (Super Cobertura em Toda a Casa)"
                      />
                    </div>

                    {/* Features / Informações sobre o Plano (Exibidas com ícone de check nos cards) */}
                    <div className="sm:col-span-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                        <div>
                          <label className="text-white font-bold text-xs flex items-center gap-2">
                            <Check className="w-4 h-4 text-cyan-400" />
                            <span>Informações & Benefícios do Plano (Itens com Check nos Cards do Site)</span>
                          </label>
                          <p className="text-[11px] text-neutral-400 mt-0.5">
                            Adicione, edite ou remova os tópicos e diferenciais que aparecem na lista deste plano no site.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPlan) {
                              const curr = editingPlan.features || [];
                              setEditingPlan({ ...editingPlan, features: [...curr, ''] });
                            } else {
                              const curr = newPlanForm.features || [];
                              setNewPlanForm({ ...newPlanForm, features: [...curr, ''] });
                            }
                          }}
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Informação</span>
                        </button>
                      </div>

                      {/* Dynamic items list */}
                      <div className="space-y-2">
                        {((editingPlan ? editingPlan.features : newPlanForm.features) || []).map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-mono">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (editingPlan) {
                                  const updated = [...(editingPlan.features || [])];
                                  updated[fIdx] = val;
                                  setEditingPlan({ ...editingPlan, features: updated });
                                } else {
                                  const updated = [...(newPlanForm.features || [])];
                                  updated[fIdx] = val;
                                  setNewPlanForm({ ...newPlanForm, features: updated });
                                }
                              }}
                              placeholder={`Ex: ${
                                fIdx === 0
                                  ? '100% Fibra Óptica até o Roteador (FTTH)'
                                  : fIdx === 1
                                  ? 'Instalação Gratuita com Agendamento'
                                  : 'Sem Franquia de Dados - Consumo Ilimitado'
                              }`}
                              className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 text-white text-xs placeholder-neutral-500 focus:border-cyan-400 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingPlan) {
                                  const updated = (editingPlan.features || []).filter((_, i) => i !== fIdx);
                                  setEditingPlan({ ...editingPlan, features: updated });
                                } else {
                                  const updated = (newPlanForm.features || []).filter((_, i) => i !== fIdx);
                                  setNewPlanForm({ ...newPlanForm, features: updated });
                                }
                              }}
                              className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Remover esta informação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {((editingPlan ? editingPlan.features : newPlanForm.features) || []).length === 0 && (
                          <div className="p-4 rounded-lg border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                            Nenhuma informação adicionada ainda. Clique em "Adicionar Informação" para inserir os pontos do plano.
                          </div>
                        )}
                      </div>

                      {/* Quick Bulk Restore / Actions */}
                      <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500">
                        <span>Cada informação adicionada terá um ícone de verificado (check) no card do plano.</span>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultFeatures = [
                              'Velocidade Real Simétrica',
                              '100% Fibra Óptica Pura (FTTH)',
                              'Instalação Gratuita com Agendamento',
                              'Sem Franquia de Consumo Mensal',
                              'Suporte Técnico Humanizado em Camilos',
                            ];
                            if (editingPlan) {
                              setEditingPlan({ ...editingPlan, features: defaultFeatures });
                            } else {
                              setNewPlanForm({ ...newPlanForm, features: defaultFeatures });
                            }
                          }}
                          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer font-medium self-start sm:self-auto"
                        >
                          Restaurar lista de exemplo
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-3 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingPlan(false);
                          setEditingPlan(null);
                        }}
                        className="px-4 py-2 bg-neutral-800 rounded-xl text-neutral-300 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-400 text-neutral-950 font-bold rounded-xl cursor-pointer"
                      >
                        Salvar Plano no Site
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Plans List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-lg">{p.name}</span>
                        {p.tag && (
                          <span className="text-[10px] bg-cyan-400 text-neutral-950 font-extrabold px-2 py-0.5 rounded">
                            {p.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-cyan-400 font-bold text-2xl">
                          R$ {p.price}{p.cents}
                        </span>
                        <span className="text-xs text-neutral-400">/mês</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-neutral-950 text-xs text-neutral-300 border border-neutral-800/80">
                        <span className="text-cyan-400 font-semibold block text-[11px]">Roteadores Inclusos:</span>
                        <span className="font-bold text-white">{p.routerCount || 1} Roteador(es)</span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{p.equipment}</p>
                      </div>

                      {p.features && p.features.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider flex items-center justify-between">
                            <span>Informações ({p.features.length})</span>
                            <span className="text-neutral-500 font-normal">Check no card</span>
                          </span>
                          <div className="space-y-1">
                            {p.features.slice(0, 3).map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-300 truncate">
                                <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span className="truncate">{f}</span>
                              </div>
                            ))}
                            {p.features.length > 3 && (
                              <span className="text-[10px] text-neutral-500 font-mono pl-4 block">
                                + {p.features.length - 3} itens a mais...
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-800/80">
                      <button
                        onClick={() => {
                          setEditingPlan({ ...p });
                          setIsAddingPlan(false);
                        }}
                        className="px-3 py-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(p.id);
                        }}
                        className="px-2.5 py-1.5 text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/50 hover:border-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                        title={`Apagar o plano ${p.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Apagar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DATAS DE VENCIMENTO DE FATURA */}
          {activeTab === 'vencimentos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span>Gestão das Datas de Vencimento de Fatura</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cadastre novas datas de vencimento ou remova datas existentes. As opções cadastradas aqui são exibidas imediatamente para contratação online no site e no cadastro de clientes.
                  </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>{dueDates.length} {dueDates.length === 1 ? 'data ativa' : 'datas ativas'} no site</span>
                </div>
              </div>

              {/* Cadastrar Nova Data de Vencimento */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">Cadastrar Nova Data de Vencimento</h4>
                    <p className="text-xs text-neutral-400">Informe o dia do mês (de 01 a 31) que os clientes poderão escolher para pagar a fatura</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddDueDate();
                  }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 text-xs"
                >
                  <div className="w-full sm:w-64">
                    <label className="text-neutral-300 block mb-1 font-semibold">
                      Dia do Vencimento (01 a 31) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        required
                        value={newDueDayInput}
                        onChange={(e) => setNewDueDayInput(e.target.value)}
                        placeholder="Ex: 05, 10, 15, 20, 25, 28"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-neutral-500 text-xs font-mono">de cada mês</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-400/20 active:scale-95 transition-all text-xs uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Data de Vencimento</span>
                  </button>
                </form>

                {/* Sugestões rápidas de dias populares */}
                <div className="pt-2">
                  <span className="text-[11px] text-neutral-500 font-medium block mb-2">Sugestões de dias populares para adicionar com 1 clique:</span>
                  <div className="flex flex-wrap gap-2">
                    {['01', '05', '10', '15', '20', '25', '28', '30'].map((sug) => {
                      const alreadyExists = dueDates.includes(sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => handleAddDueDate(sug)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                            alreadyExists
                              ? 'bg-neutral-950/40 text-neutral-600 border border-neutral-900 cursor-not-allowed'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-cyan-500 cursor-pointer'
                          }`}
                          title={alreadyExists ? 'Já cadastrado no site' : `Adicionar Dia ${sug}`}
                        >
                          + Dia {sug} {alreadyExists ? '(Ativo)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Datas de Vencimento Atualmente Cadastradas no Site */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    Datas de Vencimento Ativas no Site ({dueDates.length})
                  </h4>
                  <span className="text-xs text-neutral-500">
                    Clique no botão "Apagar" para remover a data do site imediatamente
                  </span>
                </div>

                {dueDates.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 rounded-2xl border border-neutral-800">
                    Nenhuma data cadastrada. Adicione uma data acima.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {dueDates.map((day) => (
                      <div
                        key={day}
                        className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold">
                            Ativo no Site
                          </span>
                        </div>

                        <div>
                          <span className="text-2xl font-black font-mono text-white">
                            Dia {day}
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-0.5">
                            Vencimento todo dia {day}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-neutral-800/80 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveDueDate(day)}
                            className="w-full px-2.5 py-1.5 text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/50 hover:border-red-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                            title={`Remover data Dia ${day} do site`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Apagar Data</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS & SERVICES MANAGEMENT */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              {/* Section Header Editor */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Títulos e Cabeçalho da Seção de Ferramentas & Serviços</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Cabeçalho da Seção de Ferramentas atualizado!')}
                    className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-[11px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Títulos</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge Superior</label>
                    <input
                      type="text"
                      value={frontendContentForm.toolsSection.badge}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          toolsSection: { ...frontendContentForm.toolsSection, badge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Título Principal (H2)</label>
                    <input
                      type="text"
                      value={frontendContentForm.toolsSection.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          toolsSection: { ...frontendContentForm.toolsSection, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Subtítulo / Descrição</label>
                    <input
                      type="text"
                      value={frontendContentForm.toolsSection.subtitle}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          toolsSection: { ...frontendContentForm.toolsSection, subtitle: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">Cadastro de Ferramentas & Serviços do Site</h3>
                  <p className="text-xs text-neutral-400">
                    Cadastre novas utilidades, testes ou serviços extras para os visitantes do site da Rocknet
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingTool(true);
                    setEditingTool(null);
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Nova Ferramenta</span>
                </button>
              </div>

              {/* Form for Tool */}
              {(isAddingTool || editingTool) && (
                <div className="p-6 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h4 className="font-bold text-white text-sm">
                      {editingTool ? `Editar Ferramenta: ${editingTool.title}` : 'Cadastrar Nova Ferramenta ou Serviço'}
                    </h4>
                    <button
                      onClick={() => {
                        setIsAddingTool(false);
                        setEditingTool(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTool} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">Título da Ferramenta / Serviço *</label>
                      <input
                        type="text"
                        required
                        value={editingTool ? editingTool.title : newToolForm.title}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, title: e.target.value })
                            : setNewToolForm({ ...newToolForm, title: e.target.value })
                        }
                        placeholder="Ex: Câmeras Wi-Fi de Segurança"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Categoria</label>
                      <select
                        value={editingTool ? editingTool.category : newToolForm.category}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, category: e.target.value as any })
                            : setNewToolForm({ ...newToolForm, category: e.target.value as any })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="ferramenta">Ferramenta Interativa</option>
                        <option value="servico_adicional">Serviço Adicional</option>
                        <option value="utilitario">Utilitário de Atendimento</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Preço ou Condição</label>
                      <input
                        type="text"
                        value={editingTool ? (editingTool.price || '') : (newToolForm.price || '')}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, price: e.target.value })
                            : setNewToolForm({ ...newToolForm, price: e.target.value })
                        }
                        placeholder="Ex: Grátis ou R$ 25,00/mês"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Ícone</label>
                      <select
                        value={editingTool ? editingTool.iconName : newToolForm.iconName}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, iconName: e.target.value as any })
                            : setNewToolForm({ ...newToolForm, iconName: e.target.value as any })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="speed">Velocidade (Tacômetro)</option>
                        <option value="wifi">Wi-Fi / Roteador</option>
                        <option value="map">Mapa / Cobertura</option>
                        <option value="bill">Fatura / Boleto</option>
                        <option value="shield">Segurança / IP Fixo</option>
                        <option value="camera">Câmera de Monitoramento</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Ação ao Clicar</label>
                      <select
                        value={editingTool ? editingTool.actionType : newToolForm.actionType}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, actionType: e.target.value as any })
                            : setNewToolForm({ ...newToolForm, actionType: e.target.value as any })
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="whatsapp">Abrir WhatsApp com Mensagem</option>
                        <option value="scroll">Rolar para Seção do Site (ex: #cobertura)</option>
                        <option value="modal">Abrir Modal de Contratação</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Tag / Selo</label>
                      <input
                        type="text"
                        value={editingTool ? (editingTool.badge || '') : (newToolForm.badge || '')}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, badge: e.target.value })
                            : setNewToolForm({ ...newToolForm, badge: e.target.value })
                        }
                        placeholder="Ex: Novo, Exclusivo, Grátis"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-neutral-400 block mb-1">Descrição</label>
                      <input
                        type="text"
                        value={editingTool ? editingTool.description : newToolForm.description}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, description: e.target.value })
                            : setNewToolForm({ ...newToolForm, description: e.target.value })
                        }
                        placeholder="Explique o que essa ferramenta ou serviço faz..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Destino da Ação (ou mensagem)</label>
                      <input
                        type="text"
                        value={editingTool ? editingTool.actionTarget : newToolForm.actionTarget}
                        onChange={(e) =>
                          editingTool
                            ? setEditingTool({ ...editingTool, actionTarget: e.target.value })
                            : setNewToolForm({ ...newToolForm, actionTarget: e.target.value })
                        }
                        placeholder="Mensagem do WhatsApp ou ID (#cobertura)"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-2 pt-3 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTool(false);
                          setEditingTool(null);
                        }}
                        className="px-4 py-2 bg-neutral-800 rounded-xl text-neutral-300 font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-400 text-neutral-950 font-bold rounded-xl cursor-pointer"
                      >
                        Salvar Ferramenta no Site
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tools List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      t.active ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-900/40 border-neutral-800/50 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          {t.category}
                        </span>
                        <button
                          onClick={() => handleToggleToolActive(t.id)}
                          className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                            t.active ? 'text-emerald-400' : 'text-neutral-500'
                          }`}
                          title={t.active ? 'Desativar do site' : 'Ativar no site'}
                        >
                          {t.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          <span>{t.active ? 'Ativa' : 'Oculta'}</span>
                        </button>
                      </div>

                      <h4 className="font-bold text-white text-base mb-1">{t.title}</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">{t.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-300">{t.price || 'Grátis'}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTool({ ...t });
                            setIsAddingTool(false);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTool(t.id);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Apagar esta ferramenta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADS & CLIENT CADASTROS */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Filtrar por Status:</span>
                  <select
                    value={leadFilter}
                    onChange={(e) => setLeadFilter(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="todos">Todos ({leads.length})</option>
                    <option value="novo">Novos Pedidos</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="agendado">Instalação Agendada</option>
                    <option value="instalado">Concluídos / Instalados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsAddingLead(true)}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Cadastro Manual</span>
                </button>
              </div>

              {/* Modal for adding manual lead */}
              {isAddingLead && (
                <div className="p-5 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-sm">Cadastrar Novo Cliente / Assinatura</h3>
                    <button onClick={() => setIsAddingLead(false)} className="text-neutral-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateManualLead} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        value={manualLeadForm.fullName}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, fullName: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">WhatsApp / Telefone *</label>
                      <input
                        type="text"
                        required
                        value={manualLeadForm.phone}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, phone: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        placeholder="88 9 9999-9999"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">
                        CPF do Titular <span className="text-red-400 font-bold">* (Obrigatório)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={manualLeadForm.cpf}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, cpf: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                        placeholder="000.000.000-00 (Obrigatório)"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Data de Vencimento Mensal *</label>
                      <select
                        value={manualLeadForm.dueDate}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, dueDate: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                      >
                        {dueDates.map((d) => (
                          <option key={d} value={d}>
                            Dia {d} de cada mês
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Plano Escolhido</label>
                      <select
                        value={manualLeadForm.planName}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, planName: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      >
                        {plans.map((p) => (
                          <option key={p.id} value={`${p.name} (${p.routerCount || 1} Roteador${(p.routerCount || 1) > 1 ? 'es' : ''})`}>
                            {p.name} - R$ {p.price}{p.cents}/mês ({p.routerCount || 1} rot.)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Rua e Número</label>
                      <input
                        type="text"
                        value={manualLeadForm.street}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, street: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        placeholder="Rua das Flores, 100"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Bairro em Camilos</label>
                      <input
                        type="text"
                        value={manualLeadForm.neighborhood}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, neighborhood: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        placeholder="Centro"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Observações do Atendimento</label>
                      <input
                        type="text"
                        value={manualLeadForm.notes}
                        onChange={(e) => setManualLeadForm({ ...manualLeadForm, notes: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                        placeholder="Instalar roteador na sala..."
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingLead(false)}
                        className="px-3 py-1.5 bg-neutral-800 rounded-lg text-neutral-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-cyan-400 text-neutral-950 font-bold rounded-lg cursor-pointer"
                      >
                        Salvar Cadastro
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Leads Table */}
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center text-neutral-500 rounded-2xl border border-neutral-800">
                  Nenhum cadastro encontrado para este filtro.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredLeads.map((lead) => {
                    const statusColors = {
                      novo: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
                      em_atendimento: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60',
                      agendado: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
                      instalado: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
                      cancelado: 'text-neutral-400 bg-neutral-900 border-neutral-800',
                    };

                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              {lead.protocol}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[lead.status]}`}>
                              {lead.status === 'novo' ? 'Novo Pedido' : lead.status === 'em_atendimento' ? 'Em Atendimento' : lead.status === 'agendado' ? 'Agendado' : lead.status === 'instalado' ? 'Instalado' : 'Cancelado'}
                            </span>
                            <span className="text-[11px] text-neutral-500">{lead.date}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-white">
                            <span>{lead.fullName}</span>
                            <span className="text-xs text-neutral-400 font-mono">{lead.phone}</span>
                            <span className="text-xs text-cyan-400">{lead.planName}</span>
                            {lead.cpf && (
                              <span className="text-xs bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-neutral-300 font-mono">
                                CPF: {lead.cpf}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-neutral-400">
                            {lead.street}, {lead.number} · {lead.neighborhood}
                            {lead.reference && ` (${lead.reference})`} · Vencimento: Dia {lead.dueDate}
                          </div>
                          {lead.notes && (
                            <p className="text-[11px] text-neutral-400 italic">Obs: {lead.notes}</p>
                          )}
                        </div>

                        {/* Status changing dropdown & WhatsApp trigger */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-neutral-800">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as LeadOrder['status'])}
                            className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200"
                          >
                            <option value="novo">Novo</option>
                            <option value="em_atendimento">Em Atendimento</option>
                            <option value="agendado">Agendado</option>
                            <option value="instalado">Instalado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>

                          <button
                            onClick={() => handleOpenClientWhatsApp(lead)}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                            title="Abrir WhatsApp com este cliente"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Apagar este cadastro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COVERAGE AREAS MANAGEMENT */}
          {activeTab === 'coverage' && (
            <div className="space-y-6">
              {/* Section Header Editor */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Títulos e Cabeçalho da Seção de Cobertura no Site</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Cabeçalho da Seção de Cobertura atualizado!')}
                    className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-[11px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Títulos</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge Superior</label>
                    <input
                      type="text"
                      value={frontendContentForm.coverageSection.badge}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          coverageSection: { ...frontendContentForm.coverageSection, badge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Título Principal (H2)</label>
                    <input
                      type="text"
                      value={frontendContentForm.coverageSection.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          coverageSection: { ...frontendContentForm.coverageSection, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Subtítulo / Descrição</label>
                    <input
                      type="text"
                      value={frontendContentForm.coverageSection.subtitle}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          coverageSection: { ...frontendContentForm.coverageSection, subtitle: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-neutral-400 block mb-1">Texto de Dica da Busca (Placeholder)</label>
                    <input
                      type="text"
                      value={frontendContentForm.coverageSection.searchPlaceholder}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          coverageSection: { ...frontendContentForm.coverageSection, searchPlaceholder: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Texto do Botão de WhatsApp para Consulta</label>
                    <input
                      type="text"
                      value={frontendContentForm.coverageSection.ctaButtonText}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          coverageSection: { ...frontendContentForm.coverageSection, ctaButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Bairros e Regiões Atendidas em Camilos</h3>
                  <p className="text-xs text-neutral-400">Cadastre novas ruas ou altere o status de viabilidade da fibra</p>
                </div>
                <button
                  onClick={() => setIsAddingCoverage(true)}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Bairro</span>
                </button>
              </div>

              {isAddingCoverage && (
                <div className="p-5 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl space-y-4">
                  <h4 className="font-bold text-white text-sm">Adicionar Área de Cobertura</h4>
                  <form onSubmit={handleSaveCoverage} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-neutral-400 block mb-1">Nome do Bairro / Região *</label>
                      <input
                        type="text"
                        required
                        value={newCoverageForm.name}
                        onChange={(e) => setNewCoverageForm({ ...newCoverageForm, name: e.target.value })}
                        placeholder="Ex: Novo Bairro Camilos"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Zona</label>
                      <select
                        value={newCoverageForm.zone}
                        onChange={(e) => setNewCoverageForm({ ...newCoverageForm, zone: e.target.value as any })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="Urbana">Urbana</option>
                        <option value="Rural">Rural</option>
                        <option value="Distrito">Distrito</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Status de Viabilidade</label>
                      <select
                        value={newCoverageForm.status}
                        onChange={(e) => {
                          const status = e.target.value as any;
                          const label = status === 'disponivel' ? 'Fibra Ativa Imediata' : status === 'alta_demanda' ? 'Alta Demanda' : 'Em Expansão';
                          setNewCoverageForm({ ...newCoverageForm, status, statusLabel: label });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      >
                        <option value="disponivel">Disponível (Fibra Ativa Imediata)</option>
                        <option value="alta_demanda">Alta Demanda (Portas Disponíveis)</option>
                        <option value="em_expansao">Em Expansão</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingCoverage(false)}
                        className="px-3 py-1.5 bg-neutral-800 rounded-lg text-neutral-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-cyan-400 text-neutral-950 font-bold rounded-lg cursor-pointer"
                      >
                        Cadastrar Bairro
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {coverage.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase">{c.zone}</span>
                      <h5 className="font-bold text-white text-sm">{c.name}</h5>
                      <span className="text-xs text-emerald-400 block mt-0.5">{c.statusLabel}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCoverage(c.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-red-600 rounded-lg cursor-pointer transition-colors"
                      title="Apagar este bairro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUPPORT SECTION */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-cyan-400" />
                    <span>Edição do Suporte Técnico Humanizado</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Altere os textos explicativos, diferenciais de atendimento e a foto da equipe técnica do provedor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveFrontendSection('Seção de Suporte Técnico salva com sucesso!')}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Suporte</span>
                </button>
              </div>

              {/* Support Header Texts */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm">Cabeçalho e Apresentação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge Superior</label>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.badge}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, badge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-neutral-400 block mb-1">Título Principal (H2)</label>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Subtítulo / Descrição Completa</label>
                  <textarea
                    rows={2}
                    value={frontendContentForm.supportSection.subtitle}
                    onChange={(e) =>
                      setFrontendContentForm({
                        ...frontendContentForm,
                        supportSection: { ...frontendContentForm.supportSection, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-neutral-400 block mb-1">Texto do Botão de Chamada para o WhatsApp</label>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.ctaButtonText}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, ctaButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-semibold text-cyan-300"
                    />
                  </div>
                </div>
              </div>

              {/* CAMPO DESTACADO NO DASHBOARD: IMAGEM DO TÉCNICO / MASCOTE NA DIV DA SEÇÃO DE SUPORTE */}
              <div className="p-6 rounded-2xl bg-neutral-900 border-2 border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0">
                      <Image className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base flex items-center gap-2">
                        <span>Imagem do Técnico / Mascote do Suporte</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-neutral-950 uppercase tracking-wide">
                          Coluna Direita do Site
                        </span>
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Adicione ou altere a imagem exibida na div de suporte técnico do site (ao lado dos 4 diferenciais).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSavingSupport}
                    onClick={handleSaveSupportImage}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSupport ? 'Salvando...' : 'Salvar Imagem'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Área Interativa de Upload e Campo de URL */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Grande Área de Drag and Drop para carregar arquivo */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsSupportDragging(true);
                      }}
                      onDragLeave={() => setIsSupportDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsSupportDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleSupportFileDrop(file);
                      }}
                      onClick={() => supportFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                        isSupportDragging
                          ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/30'
                          : 'border-neutral-700/80 hover:border-cyan-400/70 bg-neutral-950/70 hover:bg-neutral-950'
                      }`}
                    >
                      <input
                        ref={supportFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSupportImageUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-cyan-400 flex items-center justify-center shadow-md">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Clique aqui para selecionar a imagem no seu computador
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Ou arraste o arquivo aqui (ex: <strong>tecnico rock-net2.png</strong>, JPG ou WebP)
                        </p>
                      </div>
                      <span className="mt-1 px-4 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 text-xs font-semibold border border-cyan-400/30 transition-all">
                        Carregar Imagem do Computador
                      </span>
                    </div>

                    {/* URL direta ou caminho do arquivo */}
                    <div>
                      <label className="text-neutral-300 text-xs block mb-1.5 font-semibold">
                        Ou informe a URL / Caminho da Imagem:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={frontendContentForm.supportSection.imageUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSupportPreviewUrl(val);
                            setFrontendContentForm((prev) => {
                              const updated = {
                                ...prev,
                                supportSection: { ...prev.supportSection, imageUrl: val },
                              };
                              if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
                              saveStoredFrontendContent(updated);
                              return updated;
                            });
                          }}
                          placeholder="/tecnico-rock-net2.png ou https://..."
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono text-xs focus:border-cyan-400 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSupportPreviewUrl('/tecnico-rock-net2.png');
                            const updated = {
                              ...frontendContentForm,
                              supportSection: { ...frontendContentForm.supportSection, imageUrl: '/tecnico-rock-net2.png' },
                            };
                            setFrontendContentForm(updated);
                            if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
                            saveStoredFrontendContent(updated);
                            showToast('Restaurado mascote técnico padrão (/tecnico-rock-net2.png)!');
                          }}
                          className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                          title="Restaurar imagem padrão"
                        >
                          Usar Padrão
                        </button>
                        {frontendContentForm.supportSection.imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSupportPreviewUrl('');
                              const updated = {
                                ...frontendContentForm,
                                supportSection: { ...frontendContentForm.supportSection, imageUrl: '' },
                              };
                              setFrontendContentForm(updated);
                              if (onUpdateFrontendContent) onUpdateFrontendContent(updated);
                              saveStoredFrontendContent(updated);
                              showToast('Imagem removida.');
                            }}
                            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            title="Limpar imagem"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Dica: As alterações feitas aqui são sincronizadas instantaneamente com o site ao vivo.
                      </p>
                    </div>
                  </div>

                  {/* Right: Pré-visualização da imagem na div */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                      <span>Pré-visualização da Div no Site:</span>
                    </span>
                    <div className="w-full h-64 rounded-2xl bg-neutral-950 border border-neutral-800 p-4 flex items-center justify-center relative overflow-hidden group shadow-inner">
                      {(supportPreviewUrl || frontendContentForm.supportSection.imageUrl) ? (
                        <img
                          key={supportPreviewUrl || frontendContentForm.supportSection.imageUrl}
                          src={supportPreviewUrl || frontendContentForm.supportSection.imageUrl}
                          alt="Pré-visualização do Técnico no Suporte"
                          className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
                          onError={(e) => {
                            if (supportPreviewUrl && supportPreviewUrl.startsWith('data:')) return;
                            (e.target as HTMLImageElement).src = '/tecnico-rock-net2.png';
                          }}
                        />
                      ) : (
                        <div className="text-center text-neutral-500 text-xs flex flex-col items-center gap-2">
                          <Headphones className="w-10 h-10 text-neutral-700" />
                          <span className="font-semibold text-neutral-400">Nenhuma imagem personalizada</span>
                          <span className="text-[11px] text-neutral-600">O site utilizará o mascote padrão</span>
                        </div>
                      )}
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-neutral-700/80 text-[10px] text-neutral-300 font-mono backdrop-blur-sm shadow-sm">
                        Proporção mantida (object-contain)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Support Cards */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                <h4 className="font-bold text-white text-sm">4 Cartões de Diferenciais do Suporte</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Cartão 1</span>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.card1Title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card1Title: e.target.value },
                        })
                      }
                      placeholder="Título do Cartão 1"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={frontendContentForm.supportSection.card1Desc}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card1Desc: e.target.value },
                        })
                      }
                      placeholder="Descrição do Cartão 1"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-300"
                    />
                  </div>

                  {/* Card 2 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Cartão 2</span>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.card2Title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card2Title: e.target.value },
                        })
                      }
                      placeholder="Título do Cartão 2"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={frontendContentForm.supportSection.card2Desc}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card2Desc: e.target.value },
                        })
                      }
                      placeholder="Descrição do Cartão 2"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-300"
                    />
                  </div>

                  {/* Card 3 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Cartão 3</span>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.card3Title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card3Title: e.target.value },
                        })
                      }
                      placeholder="Título do Cartão 3"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={frontendContentForm.supportSection.card3Desc}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card3Desc: e.target.value },
                        })
                      }
                      placeholder="Descrição do Cartão 3"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-300"
                    />
                  </div>

                  {/* Card 4 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Cartão 4</span>
                    <input
                      type="text"
                      value={frontendContentForm.supportSection.card4Title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card4Title: e.target.value },
                        })
                      }
                      placeholder="Título do Cartão 4"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                    <textarea
                      rows={2}
                      value={frontendContentForm.supportSection.card4Desc}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          supportSection: { ...frontendContentForm.supportSection, card4Desc: e.target.value },
                        })
                      }
                      placeholder="Descrição do Cartão 4"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAQ SECTION */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    <span>Perguntas Frequentes (FAQ)</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Cadastre, edite ou apague dúvidas comuns dos clientes para exibir no accordion do site.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingFaq(true);
                      setEditingFaqId(null);
                      setFaqForm({ question: '', answer: '' });
                    }}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Pergunta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Cabeçalho do FAQ salvo com sucesso!')}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Cabeçalho</span>
                  </button>
                </div>
              </div>

              {/* FAQ Section Header Texts */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Títulos da Seção de FAQ no Site</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={frontendContentForm.faq?.badge || 'Tire Suas Dúvidas'}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          faq: {
                            badge: e.target.value,
                            title: frontendContentForm.faq?.title || 'Perguntas Frequentes sobre a Rocknet',
                            subtitle: frontendContentForm.faq?.subtitle || '',
                          },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Título Principal</label>
                    <input
                      type="text"
                      value={frontendContentForm.faq?.title || 'Perguntas Frequentes sobre a Rocknet'}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          faq: {
                            badge: frontendContentForm.faq?.badge || 'Tire Suas Dúvidas',
                            title: e.target.value,
                            subtitle: frontendContentForm.faq?.subtitle || '',
                          },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={frontendContentForm.faq?.subtitle || 'Tudo o que você precisa saber...'}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          faq: {
                            badge: frontendContentForm.faq?.badge || 'Tire Suas Dúvidas',
                            title: frontendContentForm.faq?.title || 'Perguntas Frequentes',
                            subtitle: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Add / Edit Form */}
              {(isAddingFaq || editingFaqId) && (
                <div className="p-5 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h4 className="font-bold text-white text-sm">
                      {editingFaqId ? 'Editar Pergunta' : 'Cadastrar Nova Pergunta no FAQ'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingFaq(false);
                        setEditingFaqId(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveFaqItem} className="space-y-3">
                    <div>
                      <label className="text-neutral-400 block mb-1">Pergunta do Cliente *</label>
                      <input
                        type="text"
                        required
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        placeholder="Ex: Como funciona a instalação em dias de chuva?"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Resposta Detalhada *</label>
                      <textarea
                        rows={3}
                        required
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        placeholder="Escreva a resposta clara e objetiva para o cliente..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingFaq(false);
                          setEditingFaqId(null);
                        }}
                        className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-400 text-neutral-950 font-bold rounded-lg cursor-pointer"
                      >
                        Salvar Pergunta
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* FAQ Questions List */}
              <div className="space-y-3">
                {frontendContentForm.faqs.map((faq, idx) => (
                  <div
                    key={faq.id || idx}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                        Pergunta #{idx + 1}
                      </span>
                      <h5 className="font-bold text-white text-sm">{faq.question}</h5>
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFaqId(faq.id);
                          setIsAddingFaq(false);
                          setFaqForm({ question: faq.question, answer: faq.answer });
                        }}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaqItem(faq.id)}
                        className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded-lg cursor-pointer transition-colors"
                        title="Apagar esta pergunta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INSTAGRAM & SOCIAL PROOF */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" />
                    <span>Instagram Oficial & Destaques de Rede</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Edite os títulos da seção social e adicione postagens de novidades da fibra que aparecem no feed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPost(true);
                      setEditingPostId(null);
                      setPostForm({ title: '', category: 'Novidades', caption: '', likes: 180, date: 'Recentemente' });
                    }}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Post</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveFrontendSection('Seção do Instagram salva com sucesso!')}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Instagram</span>
                  </button>
                </div>
              </div>

              {/* Instagram Section Header Texts */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">Cabeçalho da Seção Social</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-neutral-400 block mb-1">Badge</label>
                    <input
                      type="text"
                      value={frontendContentForm.instagramSection.badge}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          instagramSection: { ...frontendContentForm.instagramSection, badge: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-neutral-400 block mb-1">Título Principal (H2)</label>
                    <input
                      type="text"
                      value={frontendContentForm.instagramSection.title}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          instagramSection: { ...frontendContentForm.instagramSection, title: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 block mb-1">Texto do Botão Seguir</label>
                    <input
                      type="text"
                      value={frontendContentForm.instagramSection.followButtonText}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          instagramSection: { ...frontendContentForm.instagramSection, followButtonText: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold text-cyan-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Subtítulo Explicativo</label>
                  <input
                    type="text"
                    value={frontendContentForm.instagramSection.subtitle}
                    onChange={(e) =>
                      setFrontendContentForm({
                        ...frontendContentForm,
                        instagramSection: { ...frontendContentForm.instagramSection, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Add / Edit Form */}
              {(isAddingPost || editingPostId) && (
                <div className="p-5 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-xl space-y-4 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                    <h4 className="font-bold text-white text-sm">
                      {editingPostId ? 'Editar Post do Instagram' : 'Adicionar Novo Post em Destaque'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPost(false);
                        setEditingPostId(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveInstagramPost} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-neutral-400 block mb-1">Título do Post *</label>
                      <input
                        type="text"
                        required
                        value={postForm.title || ''}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        placeholder="Ex: Nova expansão de fibra óptica em Camilos"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Categoria</label>
                      <input
                        type="text"
                        value={postForm.category || 'Novidades'}
                        onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                        placeholder="Ex: Novidades na Rede, Dica Técnica"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Número de Curtidas</label>
                      <input
                        type="number"
                        value={postForm.likes || 150}
                        onChange={(e) => setPostForm({ ...postForm, likes: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Data / Status</label>
                      <input
                        type="text"
                        value={postForm.date || 'Recentemente'}
                        onChange={(e) => setPostForm({ ...postForm, date: e.target.value })}
                        placeholder="Ex: Recentemente, Em Alta"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-neutral-400 block mb-1">Legenda do Post *</label>
                      <textarea
                        rows={2}
                        required
                        value={postForm.caption || ''}
                        onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
                        placeholder="Texto da postagem..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingPost(false);
                          setEditingPostId(null);
                        }}
                        className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-cyan-400 text-neutral-950 font-bold rounded-lg cursor-pointer"
                      >
                        Salvar Post
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Instagram Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {frontendContentForm.instagramPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-neutral-500">{post.date}</span>
                      </div>
                      <h5 className="font-bold text-white text-sm">{post.title}</h5>
                      <p className="text-neutral-400 text-xs leading-relaxed">{post.caption}</p>
                    </div>
                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-neutral-400 font-mono text-[11px]">♥ {post.likes} curtidas</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPostId(post.id);
                            setIsAddingPost(false);
                            setPostForm({ ...post });
                          }}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInstagramPost(post.id)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Apagar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FOOTER SECTION */}
          {activeTab === 'footer' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Edição do Rodapé (Footer)</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Atualize a descrição institucional, informações de contato e termos legais do rodapé.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveFrontendSection('Rodapé atualizado com sucesso!')}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Rodapé</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold">
                    Descrição Institucional da Empresa (Bio do Rodapé)
                  </label>
                  <textarea
                    rows={3}
                    value={frontendContentForm.footer.bio}
                    onChange={(e) =>
                      setFrontendContentForm({
                        ...frontendContentForm,
                        footer: { ...frontendContentForm.footer, bio: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">
                      Endereço / Cidade Exibida
                    </label>
                    <input
                      type="text"
                      value={frontendContentForm.footer.address}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          footer: { ...frontendContentForm.footer, address: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white"
                      placeholder="Camilos - CE"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-300 block mb-1 font-semibold">
                      E-mail Oficial de Atendimento
                    </label>
                    <input
                      type="text"
                      value={frontendContentForm.footer.email}
                      onChange={(e) =>
                        setFrontendContentForm({
                          ...frontendContentForm,
                          footer: { ...frontendContentForm.footer, email: e.target.value },
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono"
                      placeholder="contato@rocknetfibra.com.br"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1 font-semibold">
                    Texto de Direitos Autorais (Copyright)
                  </label>
                  <input
                    type="text"
                    value={frontendContentForm.footer.copyrightText}
                    onChange={(e) =>
                      setFrontendContentForm({
                        ...frontendContentForm,
                        footer: { ...frontendContentForm.footer, copyrightText: e.target.value },
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Configurações Gerais do Provedor</h3>
                <p className="text-xs text-neutral-400">
                  Atualize os contatos oficiais vinculados ao site da Rocknet
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Configurações salvas e aplicadas no site imediatamente!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-300 block mb-1">WhatsApp Oficial para Atendimento e Pedidos *</label>
                  <input
                    type="text"
                    value={settingsForm.phoneDisplay}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneDisplay: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono"
                    placeholder="(88) 99267-5749"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Formato exibido aos clientes no topo, botões e rodapé.
                  </span>
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1">Número do WhatsApp Limpo (apenas dígitos para wa.me) *</label>
                  <input
                    type="text"
                    value={settingsForm.phoneRaw}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phoneRaw: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono"
                    placeholder="5588992675749"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1">Link do Instagram Oficial *</label>
                  <input
                    type="text"
                    value={settingsForm.instagramUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white"
                    placeholder="https://www.instagram.com/rocknet_camilos"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 block mb-1">Horário de Atendimento e Suporte</label>
                  <input
                    type="text"
                    value={settingsForm.workHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, workHours: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white"
                    placeholder="Segunda a Sábado das 07:30 às 18:00"
                  />
                </div>

                {/* Quick overview of due dates */}
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>Datas de Vencimento de Fatura ({dueDates.length} ativas)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vencimentos')}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-xs underline cursor-pointer"
                    >
                      Gerenciar / Cadastrar Vencimentos
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dueDates.map((day) => (
                      <span key={day} className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-cyan-300 font-bold">
                        Dia {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Configurações</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: USERS & PASSWORDS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header & Current User Status */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-cyan-950/40 border border-cyan-500/30 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-400/20 shrink-0">
                    <UserCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Gestão de Usuários e Acessos ao Dashboard
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-700/60 px-2.5 py-0.5 rounded-full font-mono">
                        Acesso Restrito
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Cadastre novos administradores, altere sua própria senha e gerencie permissões de acesso ao painel do site.
                    </p>
                  </div>
                </div>

                {/* Current Logged In Profile Badge & Logout Action */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs shadow-inner">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-neutral-400">Logado como:</span>
                        <span className="text-white font-bold font-mono text-xs">@{currentUser?.username || 'admin'}</span>
                        {currentUser?.name && (
                          <span className="text-neutral-300 font-medium text-[11px]">({currentUser.name})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          currentUser?.role === 'master' 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                        }`}>
                          {currentUser?.role === 'master' ? 'Usuário Mestre' : 'Administrador'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">● Conectado agora</span>
                      </div>
                    </div>
                  </div>

                  {/* Disconnect / Logout Option */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-600 border border-red-900/60 hover:border-red-600 text-red-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                    title="Desconectar da conta logada e sair do painel"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Desconectar da Conta</span>
                  </button>
                </div>
              </div>

              {/* Feedback messages */}
              {userActionError && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between">
                  <span>{userActionError}</span>
                  <button 
                    type="button" 
                    onClick={() => setUserActionError(null)}
                    className="text-red-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {userActionSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{userActionSuccess}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setUserActionSuccess(null)}
                    className="text-emerald-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Grid: Alterar Senha (Todos os Usuários) & Cadastrar Usuário (Apenas Mestre) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. CARD: ALTERAR MINHA PRÓPRIA SENHA */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="pb-3 border-b border-neutral-800">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      <span>Alterar Minha Própria Senha</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Cada usuário pode atualizar a sua credencial pessoal a qualquer momento.
                    </p>
                  </div>

                  <form onSubmit={handleChangeMyPassword} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-neutral-300 font-medium block mb-1">
                        Senha Atual *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordChangeForm.currentPass}
                        onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, currentPass: e.target.value })}
                        placeholder="Digite sua senha atual"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-300 font-medium block mb-1">
                        Nova Senha (Mínimo 4 caracteres) *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordChangeForm.newPass}
                        onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, newPass: e.target.value })}
                        placeholder="Digite sua nova senha"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-300 font-medium block mb-1">
                        Confirmar Nova Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordChangeForm.confirmPass}
                        onChange={(e) => setPasswordChangeForm({ ...passwordChangeForm, confirmPass: e.target.value })}
                        placeholder="Repita a nova senha para confirmação"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                      <span className="font-semibold text-cyan-400 block mb-0.5">Dica de segurança:</span>
                      Crie uma combinação forte com letras e números. Evite utilizar datas pessoais ou senhas compartilhadas.
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-400/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Minha Nova Senha</span>
                    </button>
                  </form>
                </div>

                {/* 2. CARD: CADASTRO DE NOVO USUÁRIO ADMINISTRADOR (EXCLUSIVO MESTRE) */}
                <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-cyan-400" />
                        <span>Cadastrar Novo Administrador</span>
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Acesso restrito: somente o Usuário Mestre pode criar novos acessos para o site.
                      </p>
                    </div>

                    {currentUser.role === 'master' ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                        Autorizado (Mestre)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-mono">
                        Sem Permissão
                      </span>
                    )}
                  </div>

                  {currentUser.role === 'master' ? (
                    <form onSubmit={handleCreateAdminUser} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-neutral-300 font-medium block mb-1">
                            Nome Completo do Administrador *
                          </label>
                          <input
                            type="text"
                            required
                            value={newUserForm.name}
                            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                            placeholder="Ex: Carlos Oliveira"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-neutral-300 font-medium block mb-1">
                            Nome de Usuário (Login de Acesso) *
                          </label>
                          <input
                            type="text"
                            required
                            value={newUserForm.username}
                            onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                            placeholder="Ex: carlos.admin"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-neutral-300 font-medium block mb-1">
                            Senha Inicial de Acesso *
                          </label>
                          <input
                            type="password"
                            required
                            value={newUserForm.password}
                            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                            placeholder="Digite uma senha inicial"
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                          />
                        </div>

                        <div>
                          <label className="text-neutral-300 font-medium block mb-1">
                            Perfil de Acesso / Permissão *
                          </label>
                          <select
                            value={newUserForm.role}
                            onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as 'master' | 'admin' })}
                            className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-400 rounded-xl p-2.5 text-white"
                          >
                            <option value="admin">Administrador (Gerencia planos, ferramentas, pedidos)</option>
                            <option value="master">Usuário Mestre (Permissão Total + Criar/Excluir Contas)</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                        <span className="font-semibold text-cyan-400 block mb-0.5">Dica para criação de acesso:</span>
                        O novo administrador poderá alterar a sua própria senha imediatamente após realizar o login no painel.
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="py-2.5 px-5 bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-400/20 cursor-pointer active:scale-95 flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Cadastrar Novo Administrador</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-white text-sm">Recurso Exclusivo do Usuário Mestre</h5>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                        Sua conta atual possui perfil de <span className="text-white font-semibold">Administrador</span>. A criação de novos usuários e a exclusão de contas antigas é permitida apenas para o <span className="text-amber-300 font-semibold">Usuário Mestre</span>. Você pode alterar a sua própria senha no formulário ao lado.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* 3. CARD: LISTA DE CONTAS CADASTRADAS NO SISTEMA */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Contas de Administradores Cadastradas ({adminUsers.length})</span>
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Relação de todos os técnicos e diretores autorizados a acessar o painel da Rocknet.
                    </p>
                  </div>

                  {/* Switch account selector - requires corresponding account password */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-400 hidden sm:inline">Alternar conta:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {adminUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleInitiateSwitchUser(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                            currentUser.id === u.id
                              ? 'bg-cyan-400 text-neutral-950 shadow-sm'
                              : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:border-cyan-500/50'
                          }`}
                          title={`Trocar para @${u.username} (solicita senha)`}
                        >
                          @{u.username}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminUsers.map((user) => {
                    const isSelf = currentUser.id === user.id || currentUser.username === user.username;
                    const canDelete = (currentUser.role === 'master' || getCurrentAdminUser().role === 'master') && !isSelf;

                    return (
                      <div 
                        key={user.id} 
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isSelf 
                            ? 'bg-neutral-950 border-cyan-500/50 shadow-md shadow-cyan-500/10' 
                            : 'bg-neutral-950/80 border-neutral-800'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                user.role === 'master'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                              }`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-cyan-400 text-neutral-950 font-bold px-1.5 py-0.2 rounded">
                                      Você
                                    </span>
                                  )}
                                </h5>
                                <span className="font-mono text-cyan-400 text-xs font-semibold">
                                  @{user.username}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                              user.role === 'master'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                : 'bg-neutral-800 text-neutral-300 border border-neutral-700/80'
                            }`}>
                              {user.role === 'master' ? 'Mestre' : 'Admin'}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Data de Criação:</span>
                              <span className="text-neutral-200 font-mono">{user.createdAt || '01/01/2026'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Último Acesso:</span>
                              <span className="text-neutral-200 font-mono">{user.lastLogin || 'Hoje'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-neutral-800/60 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] text-neutral-500">
                            {isSelf ? 'Sua conta conectada' : user.role === 'master' ? 'Acesso Mestre Total' : 'Acesso de Gestão'}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Master user can edit other accounts */}
                            {(currentUser.role === 'master' || getCurrentAdminUser().role === 'master') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditUser(user);
                                }}
                                className="px-2.5 py-1 text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-600 border border-cyan-800/60 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                                title={`Editar dados e permissões da conta @${user.username}`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                            )}

                            {canDelete ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAdminUser(user.id, user.name);
                                }}
                                className="px-2.5 py-1 text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                                title="Remover esta conta de acesso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>
                            ) : isSelf ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-cyan-400 font-medium">Ativo agora</span>
                                <button
                                  type="button"
                                  onClick={handleLogout}
                                  className="px-2 py-0.5 text-[11px] text-red-400 hover:text-white bg-red-950/40 hover:bg-red-600 border border-red-900/60 rounded flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                                  title="Desconectar desta conta"
                                >
                                  <LogOut className="w-3 h-3" />
                                  <span>Sair</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-neutral-600 font-medium">Protegido</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MODAL EXCLUSIVO DE CONFIRMAÇÃO DE SENHA PARA TROCA DE CONTA */}
      {isSwitchModalOpen && switchTargetUser && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancelSwitchUser}
        >
          <div 
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancelSwitchUser}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Confirmar Troca de Conta
                </h4>
                <p className="text-xs text-neutral-400">
                  Digite a senha da conta selecionada para autorizar a troca
                </p>
              </div>
            </div>

            {/* Target Account Info */}
            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-400 text-neutral-950 flex items-center justify-center font-bold text-xs">
                  {switchTargetUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {switchTargetUser.name}
                  </p>
                  <p className="font-mono text-cyan-400 text-[11px]">
                    @{switchTargetUser.username}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                switchTargetUser.role === 'master' 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/80' 
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
              }`}>
                {switchTargetUser.role === 'master' ? 'Mestre' : 'Admin'}
              </span>
            </div>

            {/* Form with single password field */}
            <form onSubmit={handleConfirmSwitchUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Senha da conta @{switchTargetUser.username}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={switchPasswordInput}
                    onChange={(e) => {
                      setSwitchPasswordInput(e.target.value);
                      setSwitchPasswordError(null);
                    }}
                    placeholder={`Digite a senha de @${switchTargetUser.username}`}
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {switchPasswordError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{switchPasswordError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelSwitchUser}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cyan-400/20 active:scale-95 cursor-pointer"
                >
                  Trocar de Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: FORMULÁRIO DE EDIÇÃO DE CONTA (EXCLUSIVO MESTRE) */}
      {isEditModalOpen && editingTargetUser && (
        <div 
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleCancelEditUser}
        >
          <div 
            className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancelEditUser}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Editar Conta de Administrador
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-mono">
                    Permissão Mestre
                  </span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Alterando dados de @{editingTargetUser.username}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleRequestConfirmEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    placeholder="Nome completo do usuário"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nome de Usuário (@login)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="nome_usuario"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nível de Acesso (Cargo)
                </label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as 'master' | 'admin' })}
                  className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="admin">Administrador (Gerencia planos, leads e ferramentas)</option>
                  <option value="master">Usuário Mestre (Permissão Total + Criar/Editar/Excluir Contas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Redefinir Senha da Conta (Opcional)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    value={editUserForm.newPassword}
                    onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Se você preencher este campo, a senha de @{editingTargetUser.username} será atualizada para o novo valor.
                </p>
              </div>

              {editFormError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{editFormError}</span>
                </div>
              )}

              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 leading-relaxed">
                <span className="text-cyan-400 font-semibold block mb-0.5">Autorização de Segurança:</span>
                Ao clicar em <strong>Concluir</strong>, abrirá um modal solicitando a senha do usuário que está editando (@{currentUser.username}) para validar as alterações.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelEditUser}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cyan-400/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Concluir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO DE SENHA DO MESTRE (AUTORIZAÇÃO) */}
      {isEditConfirmModalOpen && editingTargetUser && (
        <div 
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCancelConfirmEdit}
        >
          <div 
            className="relative w-full max-w-md bg-neutral-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCancelConfirmEdit}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Autorização do Usuário Mestre
                </h4>
                <p className="text-xs text-neutral-400">
                  Digite a senha do usuário que está editando para concluir
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500">Conta sendo editada:</span>
                <span className="font-mono font-bold text-cyan-400">@{editingTargetUser.username} ({editingTargetUser.name})</span>
              </div>
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500">Usuário que está editando:</span>
                <span className="font-mono font-bold text-white">@{currentUser.username} ({currentUser.name})</span>
              </div>
            </div>

            {/* Password verification form */}
            <form onSubmit={handleExecuteEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Senha do usuário que está editando (@{currentUser.username}) *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    autoFocus
                    value={editMasterPasswordInput}
                    onChange={(e) => {
                      setEditMasterPasswordInput(e.target.value);
                      setEditMasterPasswordError(null);
                    }}
                    placeholder={`Digite a senha de @${currentUser.username}`}
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {editMasterPasswordError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{editMasterPasswordError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelConfirmEdit}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-cyan-400/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Concluir e Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
