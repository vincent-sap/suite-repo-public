import { useState } from 'react'
import {
  ObjectPage, ObjectPageSection, ObjectPageTitle,
  IllustratedMessage, Text, Button, FlexBox,
  Table, TableHeaderRow, TableHeaderCell, TableRow, TableCell,
} from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import { ValueAcceleratorGallery } from './ValueAcceleratorGallery'
import { CREATED_PACKAGES, type CreatedPackage } from './mockData'
import s from './ValueAcceleratorLibrary.module.css'

export function ValueAcceleratorLibrary() {
  const [selectedPackage, setSelectedPackage] = useState<CreatedPackage | null>(null)

  return (
    <div className={s.layout}>
      <ObjectPage
        mode="IconTabBar"
        hidePinButton
        className={s.page}
        titleArea={
          <ObjectPageTitle
            header="Value Accelerator Library"
            subHeader="Ready-to-use accelerators that support your business process transformation and continuous improvement journey."
          />
        }
      >
        <ObjectPageSection id="library" titleText="Library" hideTitleText>
          <ValueAcceleratorGallery embedded />
        </ObjectPageSection>

        <ObjectPageSection id="installation-log" titleText="Installation Log" hideTitleText>
          <IllustratedMessage name="AddColumn" titleText="Coming soon" />
        </ObjectPageSection>

        <ObjectPageSection id="created" titleText="Created Accelerators" hideTitleText>
          <div className={s.createdSection}>
            <div className={s.createdToolbar}>
              <Button icon="add" design="Emphasized">Create Accelerator</Button>
            </div>
            <Table
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell width="120px">Version</TableHeaderCell>
                  <TableHeaderCell width="120px">Status</TableHeaderCell>
                  <TableHeaderCell width="140px">Created</TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {CREATED_PACKAGES.map(pkg => (
                <TableRow
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={s.tableRow}
                  style={{ background: selectedPackage?.id === pkg.id ? 'var(--sapList_SelectionBackgroundColor)' : undefined }}
                >
                  <TableCell><Text style={{ fontWeight: '600' }}>{pkg.name}</Text></TableCell>
                  <TableCell><Text>{pkg.version}</Text></TableCell>
                  <TableCell>
                    <Text style={{ color: pkg.status === 'SUCCESS' ? 'var(--sapPositiveColor)' : pkg.status === 'FAILED' ? 'var(--sapNegativeColor)' : 'var(--sapNeutralColor)' }}>
                      {pkg.status}
                    </Text>
                  </TableCell>
                  <TableCell><Text>{pkg.createdDate}</Text></TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </ObjectPageSection>
      </ObjectPage>

      {selectedPackage && (
        <SigRightSidePanel
          headerTitle={selectedPackage.name}
          isOpen
          toggleRightSidePanel={() => setSelectedPackage(null)}
          className={s.sidePanel}
        >
          <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
            <div className={s.panelSection}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)' }}>Details</Text>
              <div className={s.panelGrid}>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Name</Text>
                <Text>{selectedPackage.name}</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Version</Text>
                <Text>{selectedPackage.version}</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Status</Text>
                <Text>{selectedPackage.status}</Text>
                <Text style={{ color: 'var(--sapContent_LabelColor)' }}>Created</Text>
                <Text>{selectedPackage.createdDate}</Text>
              </div>
            </div>
            <div className={s.panelSection}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)' }}>Description</Text>
              <Text>{selectedPackage.description}</Text>
            </div>
            <div className={s.panelSection}>
              <Text style={{ fontWeight: '700', fontSize: 'var(--sapFontHeader6Size)' }}>Actions</Text>
              <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
                <Button icon="upload">Publish to Library</Button>
                <Button icon="journey-arrive">Transfer to Workspace</Button>
              </FlexBox>
            </div>
          </FlexBox>
        </SigRightSidePanel>
      )}
    </div>
  )
}
