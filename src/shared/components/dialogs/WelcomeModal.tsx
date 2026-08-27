import { useState } from 'react'
import { Button } from '@ui5/webcomponents-react'

// Illustration URLs from Figma design (expire after 7 days — replace with static assets if needed)
const IMG_SLIDE_TOP = 'https://www.figma.com/api/mcp/asset/a994f3b1-c757-47f4-b6df-7c162bc1d154'
const IMG_SLIDE_BOTTOM = 'https://www.figma.com/api/mcp/asset/11ec0794-9795-43c9-80ff-69d1fa7d9a31'

interface Slide {
  title: string
  body: string
}

const SLIDES: Slide[] = [
  {
    title: 'Welcome to SAP Signavio',
    body: "We're unifying Process Manager and Repository into a single, integrated experience — everything you need to model, manage, and transform your processes in one place.",
  },
  {
    title: 'One Place for All Your Processes',
    body: 'Model, manage, and publish from a unified workspace. Create BPMN diagrams, manage process hierarchies, assign attributes, and govern approvals without switching between tools.',
  },
  {
    title: 'Get Started',
    body: 'Explore the new unified process hub at your own pace. Use the navigation on the left to jump to any area, or start by opening a process from Repository.',
  },
]

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = SLIDES[currentSlide]
  const isLast = currentSlide === SLIDES.length - 1
  const isFirst = currentSlide === 0

  const handleNext = () => {
    if (isLast) {
      onClose()
    } else {
      setCurrentSlide(i => i + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) setCurrentSlide(i => i - 1)
  }

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
      {/* Two-column layout: left = gradient illustration, right = dark content panel */}
      <div
        style={{
          display: 'flex',
          width: '834px',
          height: '480px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow:
            '0px 20px 80px rgba(34,53,72,0.25), 0px 0px 0px rgba(34,53,72,0.48)',
        }}
      >
        {/* ── Left panel: blue gradient + stacked screenshot cards ── */}
        <div
          style={{
            width: '494px',
            flexShrink: 0,
            background: 'linear-gradient(45.82deg, #88d0ff 0%, #1b91ff 100%)',
            borderRadius: '8px 0 0 8px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Card stack — three panels offset to create depth */}
          <div
            style={{
              position: 'absolute',
              top: '48px',
              left: '32px',
              width: '430px',
            }}
          >
            {/* Back card (widest, lowest) */}
            <div
              style={{
                position: 'absolute',
                top: '96px',
                left: '0',
                width: '430px',
                height: '288px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0px 1px 30px rgba(34,53,72,0.25)',
                background: 'var(--sapBaseColor)',
              }}
            >
              <img
                src={IMG_SLIDE_BOTTOM}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Middle card */}
            <div
              style={{
                position: 'absolute',
                top: '48px',
                left: '16px',
                width: '398px',
                height: '266px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0px 1px 30px rgba(34,53,72,0.25)',
                background: 'var(--sapBaseColor)',
              }}
            >
              <img
                src={IMG_SLIDE_TOP}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Front card (narrowest, topmost) */}
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '32px',
                width: '366px',
                height: '245px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0px 1px 30px rgba(34,53,72,0.25)',
                background: 'var(--sapBaseColor)',
              }}
            >
              <img
                src={IMG_SLIDE_TOP}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Right panel: dark content ── */}
        <div
          style={{
            width: '340px',
            flexShrink: 0,
            background: 'var(--sapShellColor)',
            borderRadius: '0 8px 8px 0',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '16px',
            paddingBottom: '24px',
          }}
        >
          {/* Close button row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: '16px',
              flexShrink: 0,
            }}
          >
            <Button
              design="Transparent"
              icon="decline"
              onClick={onClose}
              tooltip="Close"
              style={
                {
                  color: 'var(--sapShell_TextColor)',
                  '--ui5-button-base-background': 'transparent',
                  '--ui5-button-base-border-color': 'transparent',
                  '--ui5-button-hover-background': 'rgba(255,255,255,0.1)',
                  '--ui5-button-hover-border-color': 'transparent',
                  '--ui5-button-active-background': 'rgba(255,255,255,0.15)',
                  '--ui5-button-text-color': 'var(--sapShell_TextColor)',
                  '--ui5_button_base_icon_only_border_radius': '50%',
                  width: '28px',
                  height: '28px',
                  minWidth: 'unset',
                  padding: '0',
                } as React.CSSProperties
              }
            />
          </div>

          {/* Content area — grows to fill space */}
          <div
            style={{
              flex: '1 0 0',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 24px 0',
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Title */}
              <p
                style={{
                  margin: 0,
                  color: 'var(--sapShell_TextColor)',
                  fontFamily: "'72', '72full', Arial, Helvetica, sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {slide.title}
              </p>

              {/* Body */}
              <p
                style={{
                  margin: 0,
                  color: 'var(--sapShell_TextColor)',
                  fontFamily: "'72', '72full', Arial, Helvetica, sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '21px',
                  wordBreak: 'break-word',
                }}
              >
                {slide.body}
              </p>
            </div>
          </div>

          {/* Footer: nav arrows + dots + CTA button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '36px',
              paddingRight: '24px',
              flexShrink: 0,
            }}
          >
            {/* Left side: arrows + dots */}
            <div
              style={{
                flex: '1 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '16px',
                minWidth: 0,
              }}
            >
              {/* Prev arrow */}
              <Button
                design="Transparent"
                icon="slim-arrow-left"
                disabled={isFirst}
                onClick={handlePrev}
                tooltip="Previous"
                style={
                  {
                    color: 'var(--sapShell_TextColor)',
                    opacity: isFirst ? 0.35 : 1,
                    '--ui5-button-base-background': 'transparent',
                    '--ui5-button-base-border-color': 'transparent',
                    '--ui5-button-hover-background': 'rgba(255,255,255,0.1)',
                    '--ui5-button-hover-border-color': 'transparent',
                    '--ui5-button-text-color': 'var(--sapShell_TextColor)',
                    width: '28px',
                    height: '28px',
                    minWidth: 'unset',
                    padding: '0',
                  } as React.CSSProperties
                }
              />

              {/* Dot indicators */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
                role="tablist"
                aria-label="Slide indicators"
              >
                {SLIDES.map((_, i) => {
                  const isActive = i === currentSlide
                  return (
                    <Button
                      key={i}
                      design="Transparent"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => setCurrentSlide(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        '--ui5-button-base-background': 'transparent',
                        '--ui5-button-base-border-color': 'transparent',
                        '--ui5-button-hover-background': 'transparent',
                        '--ui5-button-hover-border-color': 'transparent',
                        minWidth: 'unset',
                        padding: '2px',
                      } as React.CSSProperties}
                    >
                      <span
                        style={{
                          display: 'block',
                          width: isActive ? '8px' : '4px',
                          height: isActive ? '8px' : '4px',
                          borderRadius: '1000px',
                          background: isActive
                            ? 'var(--sapShell_TextColor, #ffffff)'
                            : 'rgba(255,255,255,0.45)',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </Button>
                  )
                })}
              </div>

              {/* Next arrow */}
              <Button
                design="Transparent"
                icon="slim-arrow-right"
                disabled={isLast}
                onClick={handleNext}
                tooltip="Next"
                style={
                  {
                    color: 'var(--sapShell_TextColor)',
                    opacity: isLast ? 0.35 : 1,
                    '--ui5-button-base-background': 'transparent',
                    '--ui5-button-base-border-color': 'transparent',
                    '--ui5-button-hover-background': 'rgba(255,255,255,0.1)',
                    '--ui5-button-hover-border-color': 'transparent',
                    '--ui5-button-text-color': 'var(--sapShell_TextColor)',
                    width: '28px',
                    height: '28px',
                    minWidth: 'unset',
                    padding: '0',
                  } as React.CSSProperties
                }
              />
            </div>

            {/* CTA button */}
            <Button design="Emphasized" onClick={handleNext}>
              {isLast ? 'Get Started' : 'Show Me'}
            </Button>
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  )
}
