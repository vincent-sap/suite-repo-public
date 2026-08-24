import { Card, CardHeader } from '@ui5/webcomponents-react'

interface EntryDiagramCardProps {
  title: string
  modelSrc?: string
  onDiagramClick?: () => void
}

export function EntryDiagramCard({ title, modelSrc, onDiagramClick }: EntryDiagramCardProps) {
  return (
    <Card header={<CardHeader titleText={title} />}>
      {modelSrc && (
        <div
          style={{ padding: '0 1rem 1rem', cursor: onDiagramClick ? 'pointer' : undefined }}
          onClick={onDiagramClick}
        >
          <img src={modelSrc} alt={title} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      )}
    </Card>
  )
}
