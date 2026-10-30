import './App.css'
import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ReleaseProvider } from './contexts/ReleaseContext'
import { DirtyStateProvider } from './contexts/DirtyStateContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PCAProvider } from './contexts/PCAContext'
import Shell from './shared/components/Shell'
import { LoginPage, RegisterPage, WorkspaceSelectionPage } from './domains/auth'
import { HomeDashboard, RiskDashboard, SemanticViews } from './domains/home'
import HomePage from './domains/home/HomePage'
import { Repository, SearchResults, AllResources, Recent, Favorites, Newsfeed, SmartFolder, TrashPage } from './domains/repository'
import FactSheet from './domains/repository/FactSheet'
import ProcessInsights from './domains/repository/ProcessInsights'
import Reporting from './domains/reporting/Reporting'
import { default as ProcessLandscape } from './domains/process-landscape'
import { ModelerLobby, ModelerLayout, ProcessConsultingAgent } from './domains/modeler'
import { ValueAcceleratorLibrary } from './domains/value-accelerator/ValueAcceleratorLibrary'
import {
  ObjectivesReleasePage, ObjectiveDetailPage, InitiativesPage, InitiativeDetailPage,
  StrategyExecution, InsightsPage, DiscoverPage, RecommendationsPage, RecommendationDetailPage,
  ImprovementOpportunitiesPage, ImprovementOpportunityDetailPage,
  CloudTransformationPage, CloudTransformationFlowsPage, CloudTransformationCorrectionsPage,
  BenchmarkingAnalyticsPage, BenchmarkingDetailPage,
} from './domains/tvm'
import {
  ConventionsStandalone,
  Audience, Users, Groups, ContentAccess, FeatureAccess,
  WorkspaceDetails, ProcessLandscapeSettings, Theme, Navigation, Collaboration, HelpResources,
  DiagramPage,
  AssetTypes, AssetTypeDetail, DictionaryCategories, DictionaryCategoryDetail, AttributeDefinitions,
  ModelingPreferences, ModelingLanguages, ModelingLanguageAppearance, ModelingConventions, AttributeVisualization, ApprovalWorkflows, ProcessRating,
  DataSharingIndustry, DataCollectionConfig, AccessConfiguration, DataPrivacyManagement,
  CloudALM, WalkMe, Authentication, NetworkPrivacy, VariantManagement,
} from './domains/settings'
import {
  TemplatesShell, TemplatesIndex,
  TemplateSettingsPage, TemplateSettingsPageWide,
  TemplateTableSettingsPage, TemplateTableSettingsPageWide,
  TemplateTabbedPage, TemplateTwoColumnPage, TemplateTwoColumnPagePanel,
  TemplateSideNavPage, TemplateSideNavPageWide,
} from './templates'

function AuthGate() {
  const { isLoggedIn, workspaceSelected } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (!isLoggedIn) {
    if (showRegister) return <RegisterPage onBackToLogin={() => setShowRegister(false)} />
    return <LoginPage onRegister={() => setShowRegister(true)} />
  }
  if (!workspaceSelected) return <WorkspaceSelectionPage />
  return (
    <Routes>
      <Route path="conventions-standalone" element={<ConventionsStandalone />} />
      <Route path="templates" element={<TemplatesShell />}>
        <Route index element={<TemplatesIndex />} />
        <Route path="settings" element={<TemplateSettingsPage />} />
        <Route path="settings-wide" element={<TemplateSettingsPageWide />} />
        <Route path="table-settings" element={<TemplateTableSettingsPage />} />
        <Route path="table-settings-wide" element={<TemplateTableSettingsPageWide />} />
        <Route path="tabbed" element={<TemplateTabbedPage />} />
        <Route path="two-column" element={<TemplateTwoColumnPage />} />
        <Route path="two-column-panel" element={<TemplateTwoColumnPagePanel />} />
        <Route path="side-nav" element={<TemplateSideNavPage />} />
        <Route path="side-nav-wide" element={<TemplateSideNavPageWide />} />
      </Route>
      <Route path="/" element={<PCAProvider><Shell /></PCAProvider>}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="settings">
          <Route path="audience" element={<Audience />} />
          <Route path="users" element={<Users />} />
          <Route path="groups" element={<Groups />} />
          <Route path="resource-access" element={<ContentAccess />} />
          <Route path="feature-access" element={<FeatureAccess />} />
          <Route path="home-page" element={<HomePage />} />
          <Route path="general-settings" element={<WorkspaceDetails />} />
          <Route path="process-landscape-settings" element={<ProcessLandscapeSettings />} />
          <Route path="navigation" element={<Navigation />} />
          <Route path="theme" element={<Theme />} />
          <Route path="diagram-page" element={<DiagramPage />} />
          <Route path="fact-sheet" element={<FactSheet />} />
          <Route path="help-resources" element={<HelpResources />} />
          <Route path="attribute-visualization" element={<AttributeVisualization />} />
          <Route path="collaboration" element={<Collaboration />} />
          <Route path="journey-model-approval" element={<ApprovalWorkflows />} />
          <Route path="process-rating" element={<ProcessRating />} />
          <Route path="walkme" element={<WalkMe />} />
          <Route path="access-configuration" element={<AccessConfiguration />} />
          <Route path="data-sharing-industry" element={<DataSharingIndustry />} />
          <Route path="data-collection-config" element={<DataCollectionConfig />} />
          <Route path="data-privacy-management" element={<DataPrivacyManagement />} />
          <Route path="process-insights" element={<ProcessInsights />} />
          <Route path="cloud-alm" element={<CloudALM />} />
          <Route path="modeling-preferences" element={<ModelingPreferences />} />
          <Route path="modeling-languages" element={<ModelingLanguages />} />
          <Route path="modeling-languages/:langId" element={<ModelingLanguageAppearance />} />
          <Route path="authentication" element={<Authentication />} />
          <Route path="network-privacy" element={<NetworkPrivacy />} />
          <Route path="asset-types" element={<AssetTypes />} />
          <Route path="asset-types/:id" element={<AssetTypeDetail />} />
          <Route path="dictionary-categories" element={<DictionaryCategories />} />
          <Route path="dictionary-categories/:id" element={<DictionaryCategoryDetail />} />
          <Route path="attribute-definitions" element={<AttributeDefinitions />} />
          <Route path="variant-management" element={<VariantManagement />} />
          <Route path="modeling-conventions" element={<ModelingConventions />} />
        </Route>
        <Route path="repository" element={<Repository />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="reporting" element={<Reporting />} />
        <Route path="home" element={<HomeDashboard />} />
        <Route path="risk-dashboard" element={<RiskDashboard />} />
        <Route path="semantic-views" element={<SemanticViews />} />
        <Route path="all-resources" element={<AllResources />} />
        <Route path="recent" element={<Recent />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="newsfeed" element={<Newsfeed />} />
        <Route path="smart-folder" element={<SmartFolder />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="process-consulting-agent" element={<ProcessConsultingAgent />} />
        <Route path="process-landscape" element={<ProcessLandscape />} />
        <Route path="objectives" element={<ObjectivesReleasePage />} />
        <Route path="objectives/:id" element={<ObjectiveDetailPage />} />
        <Route path="initiatives" element={<InitiativesPage />} />
        <Route path="initiatives/:id" element={<InitiativeDetailPage />} />
        <Route path="strategy-execution" element={<StrategyExecution />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="recommendations/:id" element={<RecommendationDetailPage />} />
        <Route path="improvement-opportunities" element={<ImprovementOpportunitiesPage />} />
        <Route path="improvement-opportunities/:id" element={<ImprovementOpportunityDetailPage />} />
        <Route path="cloud-transformation" element={<CloudTransformationPage />} />
        <Route path="cloud-transformation/flows" element={<CloudTransformationFlowsPage />} />
        <Route path="cloud-transformation/corrections" element={<CloudTransformationCorrectionsPage />} />
        <Route path="benchmarking-analytics" element={<BenchmarkingAnalyticsPage />} />
        <Route path="benchmarking-analytics/:process" element={<BenchmarkingDetailPage />} />
        <Route path="modeler" element={<ModelerLobby />} />
        <Route path="modeler/:assetId" element={<ModelerLayout />} />
        <Route path="value-accelerator" element={<ValueAcceleratorLibrary />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
    <ReleaseProvider>
    <DirtyStateProvider>
    <WorkspaceProvider>
      <HashRouter>
        <AuthGate />
      </HashRouter>
    </WorkspaceProvider>
    </DirtyStateProvider>
    </ReleaseProvider>
    </AuthProvider>
  )
}
