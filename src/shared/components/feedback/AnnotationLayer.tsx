import React, { useState } from 'react'
import { Button } from '@ui5/webcomponents-react'

export interface Annotation {
  id: number
  /** Percentage from left of the container (0–100) */
  x: number
  /** Percentage from top of the container (0–100) */
  y: number
  /** Short label shown in the legend header */
  label: string
  /** Full description shown in the legend body */
  description: string
}

interface AnnotationLayerProps {
  annotations: Annotation[]
  children: React.ReactNode
}

export default function AnnotationLayer({ annotations, children }: AnnotationLayerProps) {
  const [visible, setVisible] = useState(true)
  const [legendOpen, setLegendOpen] = useState(true)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}

      {/* Toggle button — fixed top-right */}
      <div style={{ position: 'fixed', top: 56, right: legendOpen && visible ? 332 : 16, zIndex: 1100, transition: 'right 0.2s ease' }}>
        <Button
          design={visible ? 'Emphasized' : 'Default'}
          icon={visible ? 'hide' : 'show'}
          onClick={() => setVisible(v => !v)}
          tooltip={visible ? 'Hide annotations' : 'Show annotations'}
        >
          {visible ? 'Annotations on' : 'Annotations off'}
        </Button>
      </div>

      {visible && (
        <>
          {/* Numbered markers */}
          {annotations.map(a => (
            <div
              key={a.id}
              title={a.label}
              style={{
                position: 'absolute',
                left: `${a.x}%`,
                top: `${a.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 1050,
                pointerEvents: 'none',
              }}
            >
              {/* Pulse ring */}
              <div style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                background: 'rgba(27, 144, 255, 0.18)',
                animation: 'hotspot-pulse-outer 2.4s ease-in-out infinite',
              }} />
              {/* Badge */}
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: '#1b90ff', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'72', Arial, sans-serif",
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
              }}>
                {a.id}
              </div>
            </div>
          ))}

          {/* Legend panel */}
          {legendOpen && (
            <div style={{
              position: 'fixed', top: 48, right: 0, bottom: 0, width: 320,
              background: 'var(--sapBaseColor, #fff)',
              borderLeft: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
              zIndex: 1040, overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Panel header */}
              <div style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 8,
                borderBottom: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
                fontFamily: "'72', Arial, sans-serif", fontWeight: 700, fontSize: 15,
                color: 'var(--sapTextColor, #1d2d3e)',
                flexShrink: 0,
              }}>
                Annotations
                <Button design="Transparent" icon="decline" onClick={() => setLegendOpen(false)} tooltip="Close" />
              </div>

              {/* Annotation entries */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {annotations.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
                      background: '#1b90ff', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'72', Arial, sans-serif", fontSize: 13, fontWeight: 700,
                      marginTop: 1,
                    }}>
                      {a.id}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'72', Arial, sans-serif", fontWeight: 700, fontSize: 13,
                        color: 'var(--sapTextColor, #1d2d3e)', marginBottom: 4,
                      }}>
                        {a.label}
                      </div>
                      <div style={{
                        fontFamily: "'72', Arial, sans-serif", fontSize: 13,
                        color: 'var(--sapContent_LabelColor, #556b82)', lineHeight: '1.4',
                      }}>
                        {a.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reopen legend button when closed */}
          {!legendOpen && (
            <div style={{ position: 'fixed', top: 96, right: 16, zIndex: 1100 }}>
              <Button design="Default" icon="list" onClick={() => setLegendOpen(true)} tooltip="Show annotation legend" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
