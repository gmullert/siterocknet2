import React, { useState, useEffect, useRef } from 'react';
import { Plan, CoverageArea, SiteTool, FrontendContent } from './types';
import {
  getStoredPlans,
  saveStoredPlans,
  getStoredCoverage,
  saveStoredCoverage,
  getStoredLeads,
  saveStoredLeads,
  getStoredTools,
  saveStoredTools,
  getStoredDueDates,
  saveStoredDueDates,
  getStoredSettings,
  saveStoredSettings,
  getStoredFrontendContent,
  saveStoredFrontendContent,
  getStoredAdminUsers,
  saveStoredAdminUsers,
  isAdminAuthenticated,
  LeadOrder,
  SiteSettings,
  ConsolidatedSiteData,
  fetchServerSiteData,
  saveServerSiteData,
  applyFavicon,
} from './services/storage';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { PlansSection } from './components/PlansSection';
import { SiteToolsSection } from './components/SiteToolsSection';
import { CoverageSection } from './components/CoverageSection';
import { SupportSection } from './components/SupportSection';
import { InstagramFeed } from './components/InstagramFeed';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
// Code-split modals and AdminPanel for lightning-fast client page load
const ContractModal = React.lazy(() =>
  import('./components/ContractModal').then((m) => ({ default: m.ContractModal }))
);
const LegalModal = React.lazy(() =>
  import('./components/LegalModal').then((m) => ({ default: m.LegalModal }))
);
const AdminLoginModal = React.lazy(() =>
  import('./components/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal }))
);
const AdminPanel = React.lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

export default function App() {
  // App state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tools, setTools] = useState<SiteTool[]>([]);
  const [coverage, setCoverage] = useState<CoverageArea[]>([]);
  const [leads, setLeads] = useState<LeadOrder[]>([]);
  const [dueDates, setDueDates] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings());
  const [frontendContent, setFrontendContent] = useState<FrontendContent>(getStoredFrontendContent());

  // Ref to hold latest state for syncServer
  const stateRef = useRef({ plans, tools, coverage, leads, dueDates, settings, frontendContent });
  useEffect(() => {
    stateRef.current = { plans, tools, coverage, leads, dueDates, settings, frontendContent };
  }, [plans, tools, coverage, leads, dueDates, settings, frontendContent]);

  // Modals state
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [selectedPlanForContract, setSelectedPlanForContract] = useState<Plan | null>(null);
  
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');

  // Initialize data on mount: First from localStorage, then synchronize from server /api/site-data
  useEffect(() => {
    // 1. Initial fast local load
    setPlans(getStoredPlans());
    setTools(getStoredTools());
    setCoverage(getStoredCoverage());
    setLeads(getStoredLeads());
    setDueDates(getStoredDueDates());
    const initialSettings = getStoredSettings();
    setSettings(initialSettings);
    applyFavicon(initialSettings.faviconUrl);
    setFrontendContent(getStoredFrontendContent());

    // 2. Fetch authoritative state from server db.json
    fetchServerSiteData().then((serverData) => {
      if (serverData) {
        if (Array.isArray(serverData.plans) && serverData.plans.length > 0) {
          setPlans(serverData.plans);
          saveStoredPlans(serverData.plans);
        }
        if (Array.isArray(serverData.coverage) && serverData.coverage.length > 0) {
          setCoverage(serverData.coverage);
          saveStoredCoverage(serverData.coverage);
        }
        if (Array.isArray(serverData.tools) && serverData.tools.length > 0) {
          setTools(serverData.tools);
          saveStoredTools(serverData.tools);
        }
        if (Array.isArray(serverData.leads)) {
          setLeads(serverData.leads);
          saveStoredLeads(serverData.leads);
        }
        if (Array.isArray(serverData.dueDates) && serverData.dueDates.length > 0) {
          setDueDates(serverData.dueDates);
          saveStoredDueDates(serverData.dueDates);
        }
        if (serverData.settings) {
          setSettings(serverData.settings);
          saveStoredSettings(serverData.settings);
          applyFavicon(serverData.settings.faviconUrl);
        }
        if (serverData.frontendContent) {
          setFrontendContent(serverData.frontendContent);
          saveStoredFrontendContent(serverData.frontendContent);
        }
        if (serverData.adminUsers && Array.isArray(serverData.adminUsers) && serverData.adminUsers.length > 0) {
          saveStoredAdminUsers(serverData.adminUsers);
        }
      } else {
        // If server data file does not exist yet, push initial baseline data to create data/db.json
        const initialPayload: ConsolidatedSiteData = {
          plans: getStoredPlans(),
          coverage: getStoredCoverage(),
          tools: getStoredTools(),
          settings: getStoredSettings(),
          frontendContent: getStoredFrontendContent(),
          leads: getStoredLeads(),
          dueDates: getStoredDueDates(),
          adminUsers: getStoredAdminUsers(),
        };
        saveServerSiteData(initialPayload);
      }
    });
  }, []);

  // Helper to persist updates to server
  const syncServer = (overrides?: Partial<ConsolidatedSiteData>) => {
    const cur = stateRef.current;
    const payload: ConsolidatedSiteData = {
      plans: overrides?.plans ?? cur.plans,
      coverage: overrides?.coverage ?? cur.coverage,
      tools: overrides?.tools ?? cur.tools,
      settings: overrides?.settings ?? cur.settings,
      frontendContent: overrides?.frontendContent ?? cur.frontendContent,
      leads: overrides?.leads ?? cur.leads,
      dueDates: overrides?.dueDates ?? cur.dueDates,
      adminUsers: overrides?.adminUsers ?? getStoredAdminUsers(),
    };
    saveServerSiteData(payload);
  };

  // Sync favicon whenever settings change
  useEffect(() => {
    applyFavicon(settings.faviconUrl);
  }, [settings.faviconUrl]);

  const handleOpenContract = (plan?: Plan | null) => {
    setSelectedPlanForContract(plan || null);
    setIsContractOpen(true);
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated()) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
  };

  const handleOpenLegal = (tab: 'privacy' | 'terms' = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-neutral-950">
      
      {/* Top Navigation Bar with Custom Logo and Editable Texts */}
      <Navbar
        settings={settings}
        content={frontendContent}
        onOpenContract={() => handleOpenContract()}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero 
          content={frontendContent.hero}
          settings={settings}
          onOpenContract={() => handleOpenContract()} 
        />

        {/* About Company Section (Model: Zaaz Telecom institutional) */}
        {frontendContent.aboutSection?.enabled !== false && (
          <AboutSection
            content={frontendContent.aboutSection}
            settings={settings}
            onOpenContract={() => handleOpenContract()}
          />
        )}

        {/* Plans of Fiber Optics */}
        <PlansSection
          plans={plans}
          content={frontendContent.plansSection}
          onSelectPlan={(plan) => handleOpenContract(plan)}
        />

        {/* Site Tools & Value Added Services */}
        <SiteToolsSection
          tools={tools}
          content={frontendContent.toolsSection}
          onOpenContract={() => handleOpenContract()}
          phoneRaw={settings.phoneRaw}
        />

        {/* Coverage Area Checker in Camilos */}
        <CoverageSection 
          coverageAreas={coverage}
          content={frontendContent.coverageSection}
          phoneRaw={settings.phoneRaw}
          settings={settings}
          city={settings.city}
        />

        {/* Technical Support Local */}
        <SupportSection 
          content={frontendContent.supportSection}
          settings={settings}
        />

        {/* Instagram Social Proof */}
        <InstagramFeed
          instagramUrl={settings.instagramUrl}
          instagramHandle={settings.instagramHandle}
          content={frontendContent.instagramSection}
          posts={frontendContent.instagramPosts}
        />

        {/* Frequently Asked Questions */}
        <FaqSection 
          faqs={frontendContent.faqs}
          content={frontendContent.faq}
          phoneDisplay={settings.phoneDisplay}
          phoneRaw={settings.phoneRaw}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        content={frontendContent.footer}
        onOpenAdmin={handleOpenAdmin}
        onOpenContract={() => handleOpenContract()}
        onOpenLegal={handleOpenLegal}
      />

      {/* Direct Floating WhatsApp Chat Button */}
      <FloatingWhatsApp settings={settings} />

      {/* Online Express Contract Modal */}
      {isContractOpen && (
        <React.Suspense fallback={null}>
          <ContractModal
            isOpen={isContractOpen}
            initialPlan={selectedPlanForContract}
            availablePlans={plans}
            dueDates={dueDates}
            settings={settings}
            onClose={() => setIsContractOpen(false)}
            onOrderCreated={() => {
              const currentLeads = getStoredLeads();
              setLeads(currentLeads);
              syncServer({ leads: currentLeads });
            }}
            onOpenLegal={handleOpenLegal}
          />
        </React.Suspense>
      )}

      {/* Transparency & Legal Modal (LGPD & SCM Terms) */}
      {isLegalModalOpen && (
        <React.Suspense fallback={null}>
          <LegalModal
            isOpen={isLegalModalOpen}
            initialTab={legalModalTab}
            onClose={() => setIsLegalModalOpen(false)}
          />
        </React.Suspense>
      )}

      {/* Admin Login Modal */}
      {isAdminLoginOpen && (
        <React.Suspense fallback={null}>
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        </React.Suspense>
      )}

      {/* Admin Management Panel */}
      {isAdminPanelOpen && (
        <React.Suspense fallback={null}>
          <AdminPanel
            key="admin-open"
            isOpen={isAdminPanelOpen}
            onClose={() => setIsAdminPanelOpen(false)}
            plans={plans}
            onUpdatePlans={(updated) => {
              setPlans(updated);
              syncServer({ plans: updated });
            }}
            tools={tools}
            onUpdateTools={(updated) => {
              setTools(updated);
              syncServer({ tools: updated });
            }}
            dueDates={dueDates}
            onUpdateDueDates={(updated) => {
              setDueDates(updated);
              syncServer({ dueDates: updated });
            }}
            coverage={coverage}
            onUpdateCoverage={(updated) => {
              setCoverage(updated);
              syncServer({ coverage: updated });
            }}
            leads={leads}
            onUpdateLeads={(updated) => {
              setLeads(updated);
              syncServer({ leads: updated });
            }}
            settings={settings}
            onUpdateSettings={(updated) => {
              setSettings(updated);
              syncServer({ settings: updated });
            }}
            frontendContent={frontendContent}
            onUpdateFrontendContent={(updated) => {
              setFrontendContent(updated);
              syncServer({ frontendContent: updated });
            }}
          />
        </React.Suspense>
      )}

    </div>
  );
}
