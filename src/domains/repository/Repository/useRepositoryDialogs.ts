import { useState } from 'react'
import type { FileItem } from './data'

export type DialogsState = {
  customizeColumnsOpen: boolean
  setCustomizeColumnsOpen: (v: boolean) => void
  exportDialogOpen: boolean
  setExportDialogOpen: (v: boolean) => void
  exportTranslationsOpen: boolean
  setExportTranslationsOpen: (v: boolean) => void
  importTranslationsOpen: boolean
  setImportTranslationsOpen: (v: boolean) => void
  approvalWorkflowsOpen: boolean
  setApprovalWorkflowsOpen: (v: boolean) => void
  embedFile: FileItem | null
  setEmbedFile: (f: FileItem | null) => void
  shareFile: FileItem | null
  setShareFile: (f: FileItem | null) => void
  shareView: 'share' | 'manage'
  setShareView: (v: 'share' | 'manage') => void
  manageFromShare: boolean
  setManageFromShare: (v: boolean) => void
}

export function useRepositoryDialogs(): DialogsState {
  const [customizeColumnsOpen, setCustomizeColumnsOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportTranslationsOpen, setExportTranslationsOpen] = useState(false)
  const [importTranslationsOpen, setImportTranslationsOpen] = useState(false)
  const [approvalWorkflowsOpen, setApprovalWorkflowsOpen] = useState(false)
  const [embedFile, setEmbedFile] = useState<FileItem | null>(null)
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [shareView, setShareView] = useState<'share' | 'manage'>('share')
  const [manageFromShare, setManageFromShare] = useState(false)

  return {
    customizeColumnsOpen, setCustomizeColumnsOpen,
    exportDialogOpen, setExportDialogOpen,
    exportTranslationsOpen, setExportTranslationsOpen,
    importTranslationsOpen, setImportTranslationsOpen,
    approvalWorkflowsOpen, setApprovalWorkflowsOpen,
    embedFile, setEmbedFile,
    shareFile, setShareFile,
    shareView, setShareView,
    manageFromShare, setManageFromShare,
  }
}
