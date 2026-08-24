import './App.css'
import { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ReleaseProvider } from './contexts/ReleaseContext'
import { DirtyStateProvider } from './contexts/DirtyStateContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PCAProvider } from './contexts/PCAContext'
import Shell from './shared/components/Shell'
import LoginPage from './domains/auth/LoginPage'
import RegisterPage from './domains/auth/RegisterPage'
import WorkspaceSelectionPage from './domains/auth/WorkspaceSelectionPage'
import Audience from './domains/settings/Audience'
import Users from './domains/settings/Users'
import Groups from './domains/settings/Groups'
import ContentAccess from './domains/settings/ContentAccess'
import FeatureAccess from './domains/settings/FeatureAccess'
import HomePage from './domains/home/HomePage'
import Navigation from './domains/settings/Navigation'
import Theme from './domains/settings/Theme'
import DiagramPage from './domains/settings/DiagramPage'
import FactSheet from './domains/repository/FactSheet'
import HelpResources from './domains/settings/HelpResources'
import AttributeVisualization from './domains/settings/AttributeVisualization'
import Collaboration from './domains/settings/Collaboration'
import ApprovalWorkflows from './domains/settings/ApprovalWorkflows'
import ProcessRating from './domains/settings/ProcessRating'
import ProcessInsights from './domains/repository/ProcessInsights'
import CloudALM from './domains/settings/CloudALM'
import WalkMe from './domains/settings/WalkMe'
import AccessConfiguration from './domains/settings/AccessConfiguration'
import DataSharingIndustry from './domains/settings/DataSharingIndustry'
import DataCollectionConfig from './domains/settings/DataCollectionConfig'
import DataPrivacyManagement from './domains/settings/DataPrivacyManagement'
import WorkspaceDetails from './domains/settings/WorkspaceDetails'
import ProcessLandscapeSettings from './domains/settings/ProcessLandscapeSettings'
import ModelingPreferences from './domains/settings/ModelingPreferences'
import ModelingLanguages from './domains/settings/ModelingLanguages'
import ModelingLanguageAppearance from './domains/settings/ModelingLanguageAppearance'
import Authentication from './domains/settings/Authentication'
import NetworkPrivacy from './domains/settings/NetworkPrivacy'
import AssetTypes from './domains/settings/AssetTypes'
import AssetTypeDetail from './domains/settings/AssetTypeDetail'
import DictionaryCategories from './domains/settings/DictionaryCategories'
import DictionaryCategoryDetail from './domains/settings/DictionaryCategoryDetail'
import AttributeDefinitions from './domains/settings/AttributeDefinitions'
import Repository from './domains/repository/Repository'
import SearchResults from './domains/repository/SearchResults'
import Reporting from './domains/reporting/Reporting'
import HomeDashboard from './domains/home/HomeDashboard'
import AllResources from './domains/repository/AllResources'
import Recent from './domains/repository/Recent'
import Favorites from './domains/repository/Favorites'
import Newsfeed from './domains/repository/Newsfeed'
import SmartFolder from './domains/repository/SmartFolder'
import TrashPage from './domains/repository/TrashPage'
import VariantManagement from './domains/settings/VariantManagement'
import ModelingConventions from './domains/settings/ModelingConventions'
import ProcessConsultingAgent from './domains/modeler/ProcessConsultingAgent'
import ProcessLandscape from './domains/process-landscape'
import ObjectivesReleasePage from './domains/tvm/Objectives'
import ObjectiveDetailPage from './domains/tvm/ObjectiveDetail'
import InitiativesPage from './domains/tvm/Initiatives'
import InitiativeDetailPage from './domains/tvm/InitiativeDetail'
import StrategyExecution from './domains/tvm/StrategyExecution'
import InsightsPage from './domains/tvm/Insights'
import CloudTransformationCorrectionsPage from './domains/tvm/CloudTransformationCorrections'
import DiscoverPage from './domains/tvm/Discover'
import RecommendationsPage from './domains/tvm/Recommendations'
import RecommendationDetailPage from './domains/tvm/RecommendationDetail'
import ImprovementOpportunitiesPage from './domains/tvm/ImprovementOpportunities'
import ImprovementOpportunityDetailPage from './domains/tvm/ImprovementOpportunityDetail'
import CloudTransformationPage from './domains/tvm/CloudTransformation'
import CloudTransformationFlowsPage from './domains/tvm/CloudTransformationFlows'
import BenchmarkingAnalyticsPage from './domains/tvm/BenchmarkingAnalytics'
import BenchmarkingDetailPage from './domains/tvm/BenchmarkingDetail'
import ConventionsStandalone from './domains/settings/ConventionsStandalone'
import ModelerLobby from './domains/modeler/ModelerLobby'
import ModelerLayout from './domains/modeler/ModelerLayout'
import { ValueAcceleratorLibrary } from './domains/value-accelerator/ValueAcceleratorLibrary'
import TemplatesShell from './templates/TemplatesShell'
import TemplatesIndex from './templates/TemplatesIndex'
import TemplateSettingsPage from './templates/pages/TemplateSettingsPage'
import TemplateSettingsPageWide from './templates/pages/TemplateSettingsPageWide'
import TemplateTableSettingsPage from './templates/pages/TemplateTableSettingsPage'
import TemplateTableSettingsPageWide from './templates/pages/TemplateTableSettingsPageWide'
import TemplateTabbedPage from './templates/pages/TemplateTabbedPage'
import TemplateTwoColumnPage from './templates/pages/TemplateTwoColumnPage'
import TemplateTwoColumnPagePanel from './templates/pages/TemplateTwoColumnPagePanel'
import TemplateSideNavPage from './templates/pages/TemplateSideNavPage'
import TemplateSideNavPageWide from './templates/pages/TemplateSideNavPageWide'

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
          <Route path="repository" element={<Repository />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="reporting" element={<Reporting />} />
          <Route path="asset-types" element={<AssetTypes />} />
          <Route path="asset-types/:id" element={<AssetTypeDetail />} />
          <Route path="dictionary-categories" element={<DictionaryCategories />} />
          <Route path="dictionary-categories/:id" element={<DictionaryCategoryDetail />} />
          <Route path="attribute-definitions" element={<AttributeDefinitions />} />
          <Route path="home" element={<HomeDashboard />} />
          <Route path="all-resources" element={<AllResources />} />
          <Route path="recent" element={<Recent />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="newsfeed" element={<Newsfeed />} />
          <Route path="smart-folder" element={<SmartFolder />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="variant-management" element={<VariantManagement />} />
          <Route path="modeling-conventions" element={<ModelingConventions />} />
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
