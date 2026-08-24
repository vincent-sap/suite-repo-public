import React, { useState } from 'react'
import {
  ObjectPage,
  ObjectPageTitle,
  ObjectPageSection,
  Title,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarSpacer,
  Button,
  Breadcrumbs,
  BreadcrumbsItem,
  Menu,
  MenuItem,
} from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'
import { type FileItem, ASSET_DETAILS } from '../../repository/Repository/data'
import DiagramTab from './DiagramTab'
import FactSheetTab from './FactSheetTab'

interface Props {
  onBack?: () => void
  asset?: FileItem | null
  folderPath?: { id: string; name: string }[] | null
  onNavigateToFolder?: (path: { id: string; name: string }[] | null) => void
}

export default function ModelDetailPage({ asset, folderPath, onNavigateToFolder }: Props) {
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false)
  const overflowBtnRef = React.useRef<any>(null)

  const details = asset ? ASSET_DETAILS[asset.id] : undefined

  const title = asset?.name ?? '4.MFS-110-10-40 Payments Processing _Cash Desk'
  const level = details?.level ?? 'Level 1'
  const revision = details ? `Revision ${details.revision}` : 'Revision 1'
  const lastPublished = details?.lastPublished ?? '—'
  const lastAuthor = details?.lastAuthor ?? '—'

  const path = folderPath ?? []

  const handleBreadcrumbClick = (e: CustomEvent) => {
    if (!onNavigateToFolder) return
    const key = (e.detail.item as HTMLElement).dataset.id
    if (key === 'root') {
      onNavigateToFolder(null)
    } else {
      const idx = path.findIndex(seg => seg.id === key)
      if (idx !== -1) onNavigateToFolder(path.slice(0, idx + 1))
    }
  }

  return (
    <ObjectPage
      mode="IconTabBar"
      hidePinButton
      style={{ height: '100%' }}
      titleArea={
        <ObjectPageTitle
          breadcrumbs={
            <Breadcrumbs onItemClick={handleBreadcrumbClick}>
              <BreadcrumbsItem data-id="root">Modeling Files</BreadcrumbsItem>
              {path.map((seg) => (
                <BreadcrumbsItem key={seg.id} data-id={seg.id}>
                  {seg.name}
                </BreadcrumbsItem>
              ))}
              {/* Last item = asset name = current location (non-link), pushes all folder items into clickable position */}
              <BreadcrumbsItem>{title}</BreadcrumbsItem>
            </Breadcrumbs>
          }
          header={<Title level="H2">{title}</Title>}
          expandedContent={
            <Toolbar design="Transparent" style={{ padding: 0, gap: '0.5rem' }}>
              <SigChipV2 value={level} leadingIcon="org-chart" />
              <SigChipV2 value={revision} leadingIcon="history" trailingIcon="slim-arrow-down" />
              <ToolbarSeparator />
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
                Last Published
              </Text>
              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{lastPublished}</Text>
              <ToolbarSeparator />
              <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>
                Last Author
              </Text>
              <Text style={{ fontSize: 'var(--sapFontSize)' }}>{lastAuthor}</Text>
              <ToolbarSpacer />
              <Button design="Default">Rate This Process</Button>
            </Toolbar>
          }
          actionsBar={
            <Toolbar design="Transparent">
              <ToolbarButton icon="print" tooltip="Print" design="Transparent" />
              <ToolbarButton icon="favorite" tooltip="Add to Favorites" design="Transparent" />
              <ToolbarButton icon="share-2" tooltip="Share" design="Transparent" />
              <ToolbarButton icon="comment" tooltip="Comments" design="Transparent" />
              <ToolbarButton
                ref={overflowBtnRef as React.Ref<any>}
                icon="overflow"
                tooltip="More Options"
                design="Transparent"
                onClick={() => setOverflowMenuOpen(v => !v)}
              />
              <Menu
                opener={overflowBtnRef.current ?? undefined}
                open={overflowMenuOpen}
                onClose={() => setOverflowMenuOpen(false)}
              >
                <MenuItem text="Open in Editor" icon="edit" />
                <MenuItem text="Download" icon="download" />
                <MenuItem text="Embed" icon="html" />
                <MenuItem text="Export as SGX" icon="export" />
              </Menu>
            </Toolbar>
          }
        />
      }
    >
      <ObjectPageSection id="diagram" titleText="Diagram">
        <DiagramTab />
      </ObjectPageSection>
      <ObjectPageSection id="factsheet" titleText="Fact Sheet">
        <FactSheetTab />
      </ObjectPageSection>
    </ObjectPage>
  )
}
