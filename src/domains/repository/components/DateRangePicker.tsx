import { useCallback } from 'react'
import { Calendar } from '@ui5/webcomponents-react'
import { useControl } from '@signavio/sap-signavio-uixtension'

const fmt = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })

function toISO(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtISO(iso: string): string {
  try { return fmt.format(new Date(`${iso}T00:00:00`)) } catch { return iso }
}

export default function DateRangePicker() {
  const resolveDisplayText = useCallback(async (value: any) => {
    if (!value) return ''
    if (value.mode === 'range') {
      if (value.startDate && value.endDate) return `${fmtISO(value.startDate)} – ${fmtISO(value.endDate)}`
      if (value.startDate) return `From ${fmtISO(value.startDate)}`
      if (value.endDate) return `Until ${fmtISO(value.endDate)}`
    }
    return ''
  }, [])

  const { setState } = useControl('DateRangePicker', { resolveDisplayText }) as any

  const handleSelect = useCallback((e: any) => {
    const vals: string[] = e.detail?.selectedValues ?? []
    if (!vals.length) { setState(undefined); return }
    const sorted = vals.map(toISO).sort()
    setState({ mode: 'range', startDate: sorted[0], endDate: sorted[sorted.length - 1] })
  }, [setState])

  return (
    <Calendar
      selectionMode="Range"
      onSelectionChange={handleSelect}
    />
  )
}
