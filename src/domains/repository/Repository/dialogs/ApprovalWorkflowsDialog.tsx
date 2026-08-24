import React, { useState } from 'react'
import { Dialog, Button, Bar, CheckBox, Link, Text } from '@ui5/webcomponents-react'
import { APPROVAL_WORKFLOWS } from '../data'

interface ApprovalWorkflowsDialogProps {
  open: boolean
  onClose: () => void
}

export default function ApprovalWorkflowsDialog({ open, onClose }: ApprovalWorkflowsDialogProps) {
  const [showCompleted, setShowCompleted] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setSelected(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  if (!open) return null

  return (
    <Dialog
      open
      headerText="Show Started Approval Workflows"
      onClose={onClose}
      footer={
        <Bar design="Footer" endContent={<Button design="Emphasized" onClick={onClose}>OK</Button>} />
      }
    >
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Text>Started approval workflows for diagrams in directory "Shared documents"</Text>
        <CheckBox checked={showCompleted} onChange={() => setShowCompleted(v => !v)} text="Show completed approval workflows" />
        <div style={{ border: '1px solid var(--sapList_BorderColor)', borderRadius: 'var(--sapElement_BorderCornerRadius)', background: 'var(--sapList_Background)', maxHeight: '360px', overflowY: 'auto' }}>
          <div style={{ padding: '0.375rem 0.75rem', borderBottom: '1px solid var(--sapList_BorderColor)', background: 'var(--sapList_GroupHeaderBackground)' }}>
            <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)', fontWeight: '600' }}>Approval workflows</Text>
          </div>
          {APPROVAL_WORKFLOWS.map((wf, idx) => (
            <div
              key={wf.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', borderBottom: idx < APPROVAL_WORKFLOWS.length - 1 ? '1px solid var(--sapList_BorderColor)' : 'none', background: selected.has(wf.id) ? 'var(--sapList_SelectionBackgroundColor)' : 'transparent', cursor: 'pointer' }}
              onClick={() => toggle(wf.id)}
            >
              <CheckBox
                checked={selected.has(wf.id)}
                onChange={() => toggle(wf.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ flexShrink: 0, marginTop: '2px' } as React.CSSProperties}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link style={{ display: 'block', fontSize: 'var(--sapFontSize)', fontWeight: '600', wordBreak: 'break-word' } as React.CSSProperties}>
                  Approval: {wf.name} (revision {wf.revision}) {wf.date}
                </Link>
                <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>
                  started {wf.startedAgo} by {wf.startedBy}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}
