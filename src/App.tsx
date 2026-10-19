import React, { useState, useEffect } from 'react';
import { Plan, CoverageArea, SiteTool, FrontendContent } from './types';
import {
  getStoredPlans,
  getStoredCoverage,
  getStoredLeads,
  getStoredTools,
  getStoredDueDates,
  getStoredSettings,
  getStoredFrontendContent,
  isAdminAuthenticated,
  LeadOrder,
  SiteSettings,
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

  // Modals state
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [selectedPlanForContract, setSelectedPlanForContract] = useState<Plan | null>(null);
  
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');

  // Initialize data on mount
  useEffect(() => {
    setPlans(getStoredPlans());
    setTools(getStoredTools());
    setCoverage(getStoredCoverage());
    setLeads(getStoredLeads());
    setDueDates(getStoredDueDates());
    const initialSettings = getStoredSettings();
    setSettings(initialSettings);
    applyFavicon(initialSettings.faviconUrl);
    setFrontendContent(getStoredFrontendContent());
  }, []);

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
            onClose={() => setIsContractOpen(false)}
            onOrderCreated={() => setLeads(getStoredLeads())}
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
            onUpdatePlans={(updated) => setPlans(updated)}
            tools={tools}
            onUpdateTools={(updated) => setTools(updated)}
            dueDates={dueDates}
            onUpdateDueDates={(updated) => setDueDates(updated)}
            coverage={coverage}
            onUpdateCoverage={(updated) => setCoverage(updated)}
            leads={leads}
            onUpdateLeads={(updated) => setLeads(updated)}
            settings={settings}
            onUpdateSettings={(updated) => setSettings(updated)}
            frontendContent={frontendContent}
            onUpdateFrontendContent={(updated) => setFrontendContent(updated)}
          />
        </React.Suspense>
      )}

    </div>
  );
}
