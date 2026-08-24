import React, { useCallback } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Measure = {
  accessor: string
  label?: string
  color?: string
  width?: number
  showDot?: boolean
  hideDataLabel?: boolean
  formatter?: (v: any) => string
  lineConfig?: Record<string, any>
  DataLabel?: React.ComponentType<any>
}

type LineChartProps = {
  dataset: Record<string, any>[]
  dimensions: Array<{ accessor: string }>
  measures: Measure[]
  chartConfig?: {
    yAxisVisible?: boolean
    xAxisVisible?: boolean
    yAxisLabelsVisible?: boolean
    gridHorizontal?: boolean
    gridVertical?: boolean
    legendConfig?: any
    margin?: { top?: number; right?: number; bottom?: number; left?: number }
    xAxisConfig?: Record<string, any>
    yAxisConfig?: Record<string, any>
  }
  tooltipConfig?: { content?: (() => null) | React.ComponentType<any> }
  onClick?: (event: any) => void
  noAnimation?: boolean
  style?: React.CSSProperties
}

export function LineChart({ dataset, dimensions, measures, chartConfig, tooltipConfig, onClick, noAnimation, style }: LineChartProps) {
  const xKey = dimensions[0]?.accessor ?? 'x'
  const cfg = chartConfig ?? {}
  const height = style?.height ?? '100%'
  const { height: _h, ...restStyle } = style ?? {}

  const handleClick = useCallback((data: any, event: React.MouseEvent) => {
    if (!onClick || !data?.activePayload) return
    const syntheticEvent = Object.assign(Object.create(event), {
      detail: {
        activePayloads: data.activePayload.map((p: any) => ({
          name: p.name,
          value: p.value,
          color: p.color ?? p.stroke,
        })),
        payload: data.activePayload[0]?.payload ?? {},
      },
    })
    onClick(syntheticEvent)
  }, [onClick])

  return (
    <div style={restStyle}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={dataset}
          margin={cfg.margin}
          onClick={onClick ? handleClick : undefined}
        >
          <CartesianGrid
            horizontal={cfg.gridHorizontal ?? false}
            vertical={cfg.gridVertical ?? false}
            stroke="var(--sapList_BorderColor)"
          />
          <XAxis
            dataKey={xKey}
            hide={cfg.xAxisVisible === false}
            {...(cfg.xAxisConfig ?? {})}
          />
          <YAxis
            hide={cfg.yAxisVisible === false}
            tickLine={false}
            axisLine={false}
            {...(cfg.yAxisConfig ?? {})}
          />
          <Tooltip content={tooltipConfig?.content as any} />
          {measures.map(({ accessor, label, color, width, lineConfig, DataLabel, hideDataLabel }) => {
            const { dot, activeDot, ...restLineConfig } = lineConfig ?? {}
            return (
              <Line
                key={accessor}
                type="monotone"
                dataKey={accessor}
                name={label}
                stroke={color}
                strokeWidth={width}
                dot={dot !== undefined ? dot : false}
                activeDot={activeDot !== undefined ? activeDot : { r: 4 }}
                isAnimationActive={!noAnimation}
                connectNulls={false}
                label={!hideDataLabel && DataLabel ? (props: any) => <DataLabel {...props} /> : undefined}
                {...restLineConfig}
              />
            )
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
