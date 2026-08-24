import { useState, useRef } from 'react'
import {
  Dialog, Bar, Button, Text, RadioButton, Label, Select, Option,
  BusyIndicator, FileUploader, Icon, MessageView, MessageItem,
  type MessageViewDomRef,
} from '@ui5/webcomponents-react'

type Step = 'upload' | 'loading' | 'mapping' | 'results'
type ImportModel = 'update-only' | 'create-only' | 'update-and-create'

interface ResultEntry {
  status: 'ignored' | 'failed' | 'created' | 'updated'
  count: number
}const MOCK_RESULTS: ResultEntry[] = [
  { status: 'ignored', count: 12 },
  { status: 'failed', count: 12 },
  { status: 'created', count: 1 },
  { status: 'updated', count: 1 },
]

const MOCK_COLUMNS = ['Column A', 'Column B', 'Column C']
const MOCK_SHEETS = ['Sheet1', 'Sheet2']
const MOCK_DICT_CATEGORIES = ['Finance', 'HR', 'IT', 'Operations']
const MOCK_DICT_IDENTIFIERS = ['Name', 'ID', 'Code']


export default function ImportExcelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [importModel, setImportModel] = useState<ImportModel>('update-only')
  const [isOnDetailsPage, setIsOnDetailsPage] = useState(false)
  const messageViewRef = useRef<MessageViewDomRef>(null)

  const [excelSheet, setExcelSheet] = useState('')
  const [dictCategory, setDictCategory] = useState('')
  const [identifierColumn, setIdentifierColumn] = useState('')
  const [matchingIdentifier, setMatchingIdentifier] = useState('')

  const isMappingValid = excelSheet !== '' && dictCategory !== '' &&
    (importModel === 'create-only' || (identifierColumn !== '' && matchingIdentifier !== ''))

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('upload')
      setFileName('')
      setImportModel('update-only')
      setIsOnDetailsPage(false)
      setExcelSheet('')
      setDictCategory('')
      setIdentifierColumn('')
      setMatchingIdentifier('')
      messageViewRef.current?.navigateBack()
    }, 300)
  }

  const handleNext = () => {
    setStep('loading')
    setTimeout(() => setStep('mapping'), 1500)
  }

  const handleImport = () => {
    setStep('loading')
    setTimeout(() => {
      setStep('results')
      setIsOnDetailsPage(false)
    }, 1500)
  }


  return (
    <Dialog
      open={open}
      headerText={step === 'results' ? 'Import Summary' : 'Import Excel'}
      style={{ width: '500px', maxWidth: '98vw' }}
      onClose={() => {
        if (step === 'results') messageViewRef.current?.navigateBack()
      }}
      header={step === 'results' && isOnDetailsPage ? (
        <Bar startContent={
          <Button
            icon="slim-arrow-left"
            design="Transparent"
            onClick={() => {
              setIsOnDetailsPage(false)
              messageViewRef.current?.navigateBack()
            }}
          />
        } />
      ) : undefined}
      footer={
        <Bar design="Footer"
          startContent={step === 'results' ? (
            <Button design="Transparent" onClick={handleClose}>Download Import Report</Button>
          ) : undefined}
          endContent={
          <>
            {step === 'upload' && (
              <>
                <Button design="Emphasized" disabled={!fileName} onClick={handleNext}>Next</Button>
                <Button design="Transparent" onClick={handleClose}>Cancel</Button>
              </>
            )}
            {step === 'loading' && (
              <Button design="Transparent" onClick={handleClose}>Cancel</Button>
            )}
            {step === 'mapping' && (
              <>
                <Button design="Emphasized" disabled={!isMappingValid} onClick={handleImport}>Import</Button>
                <Button design="Transparent" onClick={handleClose}>Cancel</Button>
              </>
            )}
            {step === 'results' && (
              <Button design="Emphasized" onClick={handleClose}>OK</Button>
            )}
          </>
        } />
      }
    >
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
            Choose a file to import. The file must be an Excel Workbook (.xls or .xlsx). The tool will detect a header row and import all remaining rows into the dictionary according to a mapping to be defined in the next step.
          </Text>
          <FileUploader
            accept=".xls,.xlsx"
            placeholder="Browse or drop a file"
            value={fileName}
            onChange={(e: any) => {
              const file = e.detail?.files?.[0]
              if (file) setFileName(file.name)
            }}
            style={{ width: '100%' }}
          >
            <Icon slot="icon" name="upload" />
          </FileUploader>
        </div>
      )}

      {/* Step 2: Loading */}
      {step === 'loading' && (
        <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <BusyIndicator active delay={0} size="M" />
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
            Importing file...
          </Text>
        </div>
      )}

      {/* Step 3: Mapping */}
      {step === 'mapping' && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
            Select the worksheet in the Excel file and the category where all the dictionary entries will be imported. Afterwards you are able to define a direct mapping between columns in the Excel sheet and the attributes for the dictionary entry.
          </Text>

          <div>
            <Label style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
              Choose model of import:
            </Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <RadioButton
                name="import-model"
                text="Update existing entries only, ignore other rows"
                checked={importModel === 'update-only'}
                onChange={() => setImportModel('update-only')}
                style={{ marginLeft: '-0.5rem' }}
              />
              <RadioButton
                name="import-model"
                text="Create new entries for all rows"
                checked={importModel === 'create-only'}
                onChange={() => setImportModel('create-only')}
                style={{ marginLeft: '-0.5rem' }}
              />
              <RadioButton
                name="import-model"
                text="Update existing entries and create new ones"
                checked={importModel === 'update-and-create'}
                onChange={() => setImportModel('update-and-create')}
                style={{ marginLeft: '-0.5rem' }}
              />
            </div>
          </div>

          <div>
            <Label style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
              Select which Excel sheet to import into which Dictionary category:
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div>
                <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Excel Sheet</Label>
                <Select style={{ width: '100%' }} onChange={(e: any) => setExcelSheet(e.detail.selectedOption?.value ?? '')}>
                  <Option value="">Select</Option>
                  {MOCK_SHEETS.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
              </div>
              <div>
                <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Dictionary Category</Label>
                <Select style={{ width: '100%' }} onChange={(e: any) => setDictCategory(e.detail.selectedOption?.value ?? '')}>
                  <Option value="">Select</Option>
                  {MOCK_DICT_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </div>
            </div>
          </div>

          {importModel !== 'create-only' && (
            <div>
              <Label style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
                Select by which Excel column and which Dictionary identifier should be used to match existing entries (not relevant for create-only imports):
              </Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Identifier Column in Excel</Label>
                  <Select style={{ width: '100%' }} onChange={(e: any) => setIdentifierColumn(e.detail.selectedOption?.value ?? '')}>
                    <Option value="">Select</Option>
                    {MOCK_COLUMNS.map(c => <Option key={c} value={c}>{c}</Option>)}
                  </Select>
                </div>
                <div>
                  <Label required style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapContent_LabelColor)' }}>Matching Identifier in Dictionary</Label>
                  <Select style={{ width: '100%' }} onChange={(e: any) => setMatchingIdentifier(e.detail.selectedOption?.value ?? '')}>
                    <Option value="">Select</Option>
                    {MOCK_DICT_IDENTIFIERS.map(i => <Option key={i} value={i}>{i}</Option>)}
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label style={{ fontSize: 'var(--sapFontSize)', fontWeight: '600', color: 'var(--sapTextColor)', lineHeight: '1.5' }}>
              Attribute Mappings:
            </Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              {MOCK_COLUMNS.map(col => (
                <div key={col} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <Text style={{ fontSize: 'var(--sapFontSize)', color: 'var(--sapTextColor)', padding: '0.25rem 0' }}>{col}</Text>
                  <Select style={{ width: '100%' }}>
                    <Option value="">Select</Option>
                    {MOCK_DICT_IDENTIFIERS.map(i => <Option key={i} value={i}>{i}</Option>)}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'results' && (
        <MessageView
          ref={messageViewRef}
          showDetailsPageHeader={false}
          onItemSelect={() => setIsOnDetailsPage(true)}
        >
          {MOCK_RESULTS.filter(r => r.status === 'ignored' || r.status === 'failed').map(r => (
            <MessageItem
              key={r.status}
              type="Negative"
              titleText={`${r.count} ${r.status} entries`}
            />
          ))}
          {MOCK_RESULTS.filter(r => r.status === 'created' || r.status === 'updated').map(r => (
            <MessageItem
              key={r.status}
              type="Positive"
              titleText={`${r.count} ${r.status} entries`}
            />
          ))}
        </MessageView>
      )}
    </Dialog>
  )
}
