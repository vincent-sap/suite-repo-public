import { useRef, useState } from 'react'
import { Button, Text, Menu, MenuItem, MenuSeparator, IllustratedMessage } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/NoEntries.js'
import { createPortal } from 'react-dom'
import { SigChipV2, SigDomainObject, SigInlineEdit } from '@signavio/sap-signavio-uixtension'
import { useNavigate } from 'react-router-dom'
import DictionaryPanel from '../../shared/components/panels/DictionaryPanel'
import JouleInput from '../../shared/components/panels/JouleInput'
import s from './ModelerApp.module.css'

type Props = {
  assetId?: string
  onOpenJouleChat?: () => void
  joulePanelOpen?: boolean
  onPadSend?: (message: string) => void
}

// ─── BPMN canvas ─────────────────────────────────────────────────────────────
function BpmnCanvas({
  assetName,
  onClose,
  dictOpen,
  onToggleDict,
  onOpenJouleChat: _onOpenJouleChat,
  joulePanelOpen,
  isEmpty,
  onEmptyStateStart,
  onPadSend,
}: {
  assetName: string
  onClose: () => void
  dictOpen: boolean
  onToggleDict: () => void
  onOpenJouleChat?: () => void
  joulePanelOpen?: boolean
  isEmpty?: boolean
  onEmptyStateStart?: () => void
  onPadSend?: (message: string) => void
}) {
  const [title, setTitle] = useState(assetName)
  const [lang, setLang] = useState('ENG')
  const [mode, setMode] = useState('Edit')
  const [aiMessage, setAiMessage] = useState('')
  const [emptyMessage, setEmptyMessage] = useState('')

  const overflowBtnId = 'modeler-asset-overflow'
  const langBtnId     = 'modeler-lang-btn'
  const modeBtnId     = 'modeler-mode-btn'
  const overflowMenuRef = useRef<any>(null)
  const langMenuRef     = useRef<any>(null)
  const modeMenuRef     = useRef<any>(null)

  const openMenu = (ref: React.MutableRefObject<any>, opener: string) => {
    if (ref.current) {
      ref.current.opener = opener
      ref.current.open   = true
    }
  }

  const handleJouleSend = () => {
    if (!aiMessage.trim()) return
    onPadSend?.(aiMessage.trim())
    setAiMessage('')
  }

  const handleEmptySend = () => {
    if (!emptyMessage.trim()) return
    onEmptyStateStart?.()
    setAiMessage('')
    setEmptyMessage('')
  }

  const EMPTY_STARTERS = [
    'Create a simple approval workflow',
    'Help me map a customer journey',
    'Build an onboarding process',
    'Draft an incident response flow',
  ]

  return (
    <div className={s.canvasPlaceholder}>
      <div className={s.canvasGrid} />

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {isEmpty && (
        <div className={s.emptyState}>
          <div className={s.emptyCard}>
            <IllustratedMessage
              name="NoEntries"
              design="Medium"
              titleText="What process would you like to model?"
              subtitleText="Describe your process in plain language and the Modeling AI Assistant will create a first draft for you."
            />
            <div className={s.emptyInputArea}>
              <JouleInput
                value={emptyMessage}
                onChange={setEmptyMessage}
                onSend={handleEmptySend}
                placeholder="Describe your process or upload a file to get started"
                hideSuggestions
              />
            </div>
            <div className={s.emptyStarters}>
              {EMPTY_STARTERS.map((s2) => (
                <button
                  key={s2}
                  className={s.emptyStarterChip}
                  onMouseDown={e => { e.preventDefault(); setEmptyMessage(s2) }}
                >
                  {s2}
                </button>
              ))}
            </div>
            <Text className={s.emptyFootnote}>
              Or start with a blank canvas — just close this card and begin drawing.
            </Text>
          </div>
        </div>
      )}

      {/* ── Top-left title bar ────────────────────────────────────────────── */}
      <div className={s.floatingTopLeft}>
        <Button icon="nav-back" design="Transparent" onClick={onClose} tooltip="Back to Modeler" />
        <SigDomainObject object="Process Model" size="XS" />
        <SigInlineEdit
          text={title}
          size="H6"
          wrappingType="Truncate"
          onFinalValueChange={(v: string) => setTitle(v)}
          className={s.inlineEdit}
        />
        <Button
          id={overflowBtnId}
          icon="slim-arrow-down"
          design="Transparent"
          tooltip="More Options"
          className={s.overflowBtn}
          onClick={() => openMenu(overflowMenuRef, overflowBtnId)}
        />
        <div className={s.vDivider} />
        <SigChipV2 value="Draft" design="none" condensed />
        <div className={s.vDivider} />
        <Button design="Transparent" icon="undo" tooltip="Undo" disabled />
        <Button design="Transparent" icon="redo" tooltip="Redo" disabled />
      </div>

      {/* ── Top-right toolbar ────────────────────────────────────────────── */}
      <div className={s.floatingTopRight}>
        <Button
          id={langBtnId}
          design="Transparent"
          icon="translate"
          endIcon="slim-arrow-down"
          className={s.menuBtn}
          onClick={() => openMenu(langMenuRef, langBtnId)}
        >
          {lang}
        </Button>
        <div className={s.vDivider} />
        <Button
          id={modeBtnId}
          design="Transparent"
          endIcon="slim-arrow-down"
          className={s.menuBtn}
          onClick={() => openMenu(modeMenuRef, modeBtnId)}
        >
          {mode}
        </Button>
      </div>

      {/* ── BPMN SVG canvas ──────────────────────────────────────────────── */}
      {!isEmpty && (
      <svg
        className={s.bpmnSvg}
        viewBox="-80 80 1720 470"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arr"
            markerWidth="8.5"
            markerHeight="14.7"
            refX="8.2"
            refY="7.4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M0.4 0.3C0.8-.1 1.4-.1 1.8.3L8.2 6.7C8.6 7.0 8.6 7.7 8.2 8.1L1.8 14.4C1.4 14.8.8 14.8.4 14.4 0 14.0 0 13.4.4 13.0L5.6 7.9a.6.6 0 000-.8L.4 1.7C0 1.3 0 .7.4.3Z"
              fill="#131E29"
            />
          </marker>
        </defs>

        {/* ── Start event ──────────────────────────────────────────────── */}
        <g>
          <svg x="87" y="157" width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="18" fill="#EBF5CB" />
            <path d="M18 30.4C24.8 30.4 30.4 24.8 30.4 18S24.8 5.6 18 5.6 5.6 11.2 5.6 18s5.6 12.4 12.4 12.4Z" stroke="#256F3A" />
          </svg>
        </g>

        {/* ── Label pill: Application received ─────────────────────────── */}
        <g>
          <rect x="57" y="197" width="96" height="36" rx="8" fill="#f5f6f7" />
          <text x="105" y="213" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Application</text>
          <text x="105" y="227" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">received</text>
        </g>

        {/* ── Flow: start → evaluate ────────────────────────────────────── */}
        <line x1="130" y1="175" x2="210" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── Task: Evaluate CV ─────────────────────────────────────────── */}
        <g>
          <rect x="210" y="135" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="260" y="179" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Evaluate CV</text>
        </g>

        {/* ── Flow: evaluate → gateway1 ─────────────────────────────────── */}
        <line x1="310" y1="175" x2="390" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── Gateway 1: Proceed with interview? ───────────────────────── */}
        <g>
          <svg x="390" y="155" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4.5 24.7C2 22.4 2 18.5 4.4 16.1l11.8-11.8C18.5 2 22.4 2 24.7 4.5L36 16.3C38.2 18.6 38.2 22.3 35.9 24.6L24.6 35.9C22.3 38.2 18.6 38.2 16.3 36L4.5 24.7Z" fill="#fff" stroke="#131E29" />
            <path d="M14.1 14.1l12.8 12.8M26.9 14.1 14.1 26.9" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>
        {/* Label pill */}
        <g>
          <rect x="356" y="204" width="108" height="36" rx="8" fill="#f5f6f7" />
          <text x="410" y="220" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Proceed with</text>
          <text x="410" y="234" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">interview?</text>
        </g>

        {/* ── Flow: gateway1 → plan (Yes) ───────────────────────────────── */}
        <line x1="430" y1="175" x2="530" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="461" y="164" width="30" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="476" y="179" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Yes</text>
        </g>

        {/* ── Flow: gateway1 → reject1 (No, down) ──────────────────────── */}
        <line x1="410" y1="195" x2="410" y2="350" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="396" y="268" width="27" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="410" y="283" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">No</text>
        </g>

        {/* ── Task: Send rejection (1) ──────────────────────────────────── */}
        <g>
          <rect x="360" y="350" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="410" y="394" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Send rejection</text>
        </g>

        {/* ── Flow: reject1 → end1 ─────────────────────────────────────── */}
        <line x1="460" y1="390" x2="540" y2="390" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── End event 1: Application rejected ────────────────────────── */}
        <g>
          <svg x="541" y="371" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37" height="37" rx="18.5" fill="#FFDBE7" />
            <path d="M18.5 4.6C26.2 4.6 32.4 10.8 32.4 18.5S26.2 32.4 18.5 32.4 4.6 26.2 4.6 18.5 10.8 4.6 18.5 4.6Z" stroke="#AA0808" strokeWidth="2.3" />
          </svg>
        </g>
        <g>
          <rect x="512" y="413" width="96" height="36" rx="8" fill="#f5f6f7" />
          <text x="560" y="429" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Application</text>
          <text x="560" y="443" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">rejected</text>
        </g>

        {/* ── Task: Plan interview ──────────────────────────────────────── */}
        <g>
          <rect x="530" y="135" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="580" y="179" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Plan interview</text>
          {/* Dictionary badge — visual only */}
          <rect x="534" y="190" width="20" height="20" rx="5" fill="#0064d9" />
          <text x="544" y="204" fontSize="9" fill="#fff" textAnchor="middle" fontFamily="'72',Arial,sans-serif">D</text>
        </g>

        {/* ── Flow: plan → interview ────────────────────────────────────── */}
        <line x1="630" y1="175" x2="720" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── Task: Interview candidate ─────────────────────────────────── */}
        <g>
          <rect x="720" y="135" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="770" y="172" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Interview</text>
          <text x="770" y="186" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">candidate</text>
        </g>

        {/* ── IT System: ATS System ─────────────────────────────────────── */}
        <g>
          <rect x="739" y="258" width="62" height="57" rx="8" fill="#d1efff" stroke="none" />
          <text x="770" y="321" fontSize="11" fill="#0057D2" textAnchor="middle" fontFamily="'72',Arial,sans-serif">ATS System</text>
          {/* Dictionary badge */}
          <rect x="742" y="291" width="20" height="20" rx="5" fill="#0064d9" />
          <text x="752" y="305" fontSize="9" fill="#fff" textAnchor="middle" fontFamily="'72',Arial,sans-serif">D</text>
        </g>
        {/* Dashed association */}
        <line x1="770" y1="258" x2="770" y2="215" stroke="#bcc3ca" strokeWidth="1" strokeDasharray="4 3" fill="none" />

        {/* ── Flow: interview → gateway2 ────────────────────────────────── */}
        <line x1="820" y1="175" x2="900" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── Gateway 2: Hire candidate? ────────────────────────────────── */}
        <g>
          <svg x="900" y="155" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4.5 24.7C2 22.4 2 18.5 4.4 16.1l11.8-11.8C18.5 2 22.4 2 24.7 4.5L36 16.3C38.2 18.6 38.2 22.3 35.9 24.6L24.6 35.9C22.3 38.2 18.6 38.2 16.3 36L4.5 24.7Z" fill="#fff" stroke="#131E29" />
            <path d="M14.1 14.1l12.8 12.8M26.9 14.1 14.1 26.9" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>
        <g>
          <rect x="876" y="204" width="88" height="36" rx="8" fill="#f5f6f7" />
          <text x="920" y="220" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Hire</text>
          <text x="920" y="234" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">candidate?</text>
        </g>

        {/* ── Flow: gateway2 → offer (Yes) ─────────────────────────────── */}
        <line x1="940" y1="175" x2="1040" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="971" y="164" width="30" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="986" y="179" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Yes</text>
        </g>

        {/* ── Flow: gateway2 → reject2 (No) ────────────────────────────── */}
        <line x1="920" y1="195" x2="920" y2="350" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="906" y="268" width="27" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="920" y="283" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">No</text>
        </g>

        {/* ── Task: Send rejection (2) ──────────────────────────────────── */}
        <g>
          <rect x="870" y="350" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="920" y="394" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Send rejection</text>
        </g>

        {/* ── Flow: reject2 → end2 ─────────────────────────────────────── */}
        <line x1="970" y1="390" x2="1048" y2="390" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── End event 2: Application rejected ────────────────────────── */}
        <g>
          <svg x="1049" y="371" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37" height="37" rx="18.5" fill="#FFDBE7" />
            <path d="M18.5 4.6C26.2 4.6 32.4 10.8 32.4 18.5S26.2 32.4 18.5 32.4 4.6 26.2 4.6 18.5 10.8 4.6 18.5 4.6Z" stroke="#AA0808" strokeWidth="2.3" />
          </svg>
        </g>
        <g>
          <rect x="1020" y="413" width="96" height="36" rx="8" fill="#f5f6f7" />
          <text x="1068" y="429" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Application</text>
          <text x="1068" y="443" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">rejected</text>
        </g>

        {/* ── Task: Make offer ─────────────────────────────────────────── */}
        <g>
          <rect x="1040" y="135" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="1090" y="179" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Make offer</text>
          {/* Dictionary badge */}
          <rect x="1044" y="190" width="20" height="20" rx="5" fill="#0064d9" />
          <text x="1054" y="204" fontSize="9" fill="#fff" textAnchor="middle" fontFamily="'72',Arial,sans-serif">D</text>
        </g>

        {/* ── Flow: offer → gateway3 ────────────────────────────────────── */}
        <line x1="1140" y1="175" x2="1220" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── Gateway 3: Offer accepted? ────────────────────────────────── */}
        <g>
          <svg x="1220" y="155" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4.5 24.7C2 22.4 2 18.5 4.4 16.1l11.8-11.8C18.5 2 22.4 2 24.7 4.5L36 16.3C38.2 18.6 38.2 22.3 35.9 24.6L24.6 35.9C22.3 38.2 18.6 38.2 16.3 36L4.5 24.7Z" fill="#fff" stroke="#131E29" />
            <path d="M14.1 14.1l12.8 12.8M26.9 14.1 14.1 26.9" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>
        <g>
          <rect x="1196" y="204" width="88" height="36" rx="8" fill="#f5f6f7" />
          <text x="1240" y="220" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Offer</text>
          <text x="1240" y="234" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">accepted?</text>
        </g>

        {/* ── Flow: gateway3 → onboard (Yes) ───────────────────────────── */}
        <line x1="1260" y1="175" x2="1360" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="1291" y="164" width="30" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="1306" y="179" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Yes</text>
        </g>

        {/* ── Flow: gateway3 → end3 (No) ───────────────────────────────── */}
        <line x1="1240" y1="195" x2="1240" y2="355" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />
        <g>
          <rect x="1226" y="268" width="27" height="20" rx="7" fill="#fff" stroke="#758ca4" strokeWidth="1" />
          <text x="1240" y="283" fill="#556b82" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">No</text>
        </g>

        {/* ── End event 3: Candidate is rejected ───────────────────────── */}
        <g>
          <svg x="1221" y="356" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37" height="37" rx="18.5" fill="#FFDBE7" />
            <path d="M18.5 4.6C26.2 4.6 32.4 10.8 32.4 18.5S26.2 32.4 18.5 32.4 4.6 26.2 4.6 18.5 10.8 4.6 18.5 4.6Z" stroke="#AA0808" strokeWidth="2.3" />
          </svg>
        </g>
        <g>
          <rect x="1184" y="398" width="112" height="36" rx="8" fill="#f5f6f7" />
          <text x="1240" y="414" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Candidate is</text>
          <text x="1240" y="428" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">rejected</text>
        </g>

        {/* ── Task: Onboard candidate ───────────────────────────────────── */}
        <g>
          <rect x="1360" y="135" width="100" height="80" rx="12" fill="#fff" stroke="#131E29" strokeWidth="1" />
          <text x="1410" y="172" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">Onboard</text>
          <text x="1410" y="186" fontSize="12" fill="#131e29" textAnchor="middle" fontFamily="'72',Arial,sans-serif" fontWeight="500">candidate</text>
          {/* Dictionary badge */}
          <rect x="1364" y="190" width="20" height="20" rx="5" fill="#0064d9" />
          <text x="1374" y="204" fontSize="9" fill="#fff" textAnchor="middle" fontFamily="'72',Arial,sans-serif">D</text>
        </g>

        {/* ── Flow: onboard → end4 ─────────────────────────────────────── */}
        <line x1="1460" y1="175" x2="1535" y2="175" stroke="#131E29" strokeWidth="1.5" markerEnd="url(#arr)" fill="none" />

        {/* ── End event 4: Candidate hired ──────────────────────────────── */}
        <g>
          <svg x="1536" y="156" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37" height="37" rx="18.5" fill="#FFDBE7" />
            <path d="M18.5 4.6C26.2 4.6 32.4 10.8 32.4 18.5S26.2 32.4 18.5 32.4 4.6 26.2 4.6 18.5 10.8 4.6 18.5 4.6Z" stroke="#AA0808" strokeWidth="2.3" />
          </svg>
        </g>
        <g>
          <rect x="1512" y="198" width="88" height="36" rx="8" fill="#f5f6f7" />
          <text x="1556" y="214" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">Candidate</text>
          <text x="1556" y="228" fill="#131e29" fontSize="11" textAnchor="middle" fontFamily="'72',Arial,sans-serif">hired</text>
        </g>
      </svg>
      )}

      {/* ── Left action panel ─────────────────────────────────────────────── */}
      <div className={s.leftToolbar}>
        <Button
          design="Transparent"
          icon="SAP-icons-v4/graph-unspecified"
          tooltip="Shapes"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
        />
        <Button
          design="Transparent"
          icon="course-book"
          tooltip="Dictionary"
          className={dictOpen ? s.toolbarBtnActive : undefined}
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
          onClick={onToggleDict}
        />
        <Button
          design="Transparent"
          icon="SAP-icons-v4/source-data"
          tooltip="Data"
          style={{ width: '2.25rem', height: '2.25rem', padding: 0 }}
        />
      </div>

      {/* ── Zoom controls ────────────────────────────────────────────────── */}
      <div className={s.zoomControls}>
        <Button icon="full-screen" design="Transparent" tooltip="Full Screen" />
        <Button icon="locate-me" design="Transparent" tooltip="Fit to Screen" />
        <Button icon="zoom-out" design="Transparent" tooltip="Zoom Out" />
        <Text className={s.zoomPercent}>70%</Text>
        <Button icon="zoom-in" design="Transparent" tooltip="Zoom In" />
      </div>

      {/* ── Dictionary panel (floating, inside canvas) ────────────────────── */}
      {dictOpen && <DictionaryPanel onClose={onToggleDict} />}

      {/* ── Joule floating input (hidden when AI panel is open) ──────────────────── */}
      {!isEmpty && !joulePanelOpen && (
        <div className={s.jouleContainer}>
          <div className={s.jouleInputWrapper}>
            <JouleInput
              value={aiMessage}
              onChange={setAiMessage}
              onSend={handleJouleSend}
            />
          </div>
        </div>
      )}

      {/* ── Portalled menus ──────────────────────────────────────────────── */}
      {createPortal(
        <Menu ref={overflowMenuRef}>
          <MenuItem text="Open Latest Draft" />
          <MenuSeparator />
          <MenuItem text="Open in QuickModel" />
          <MenuSeparator />
          <MenuItem text="Share" />
          <MenuItem text="Add to Favorites" />
          <MenuItem text="Copy To" />
          <MenuSeparator />
          <MenuItem text="Rename" />
          <MenuItem text="Move" />
          <MenuItem text="Delete" />
        </Menu>,
        document.body
      )}
      {createPortal(
        <Menu ref={langMenuRef} onItemClick={(e: any) => setLang(e.detail?.text ?? lang)}>
          <MenuItem text="ENG" />
          <MenuItem text="DEU" />
          <MenuItem text="FRA" />
        </Menu>,
        document.body
      )}
      {createPortal(
        <Menu ref={modeMenuRef} onItemClick={(e: any) => setMode(e.detail?.text ?? mode)}>
          <MenuItem text="Edit" />
          <MenuItem text="View" />
        </Menu>,
        document.body
      )}
    </div>
  )
}

// ── ModelerApp ────────────────────────────────────────────────────────────────
export default function ModelerApp({ assetId, onOpenJouleChat, joulePanelOpen, onPadSend }: Props) {
  const navigate  = useNavigate()
  const [dictOpen, setDictOpen] = useState(false)
  const [isEmpty, setIsEmpty] = useState(assetId === 'new' || assetId === 'new-journey' || assetId === 'new-dmn')

  const assetName =
    assetId === 'a1' ? 'HR Hiring Process GER'
    : assetId === 'a2' ? 'Incident Management'
    : assetId === 'a3' ? 'Order-to-Cash Value Chain'
    : assetId ? `Asset ${assetId}`
    : 'Untitled'

  return (
    <div className={s.root}>
      <BpmnCanvas
        assetName={assetName}
        onClose={() => navigate('/modeler')}
        dictOpen={dictOpen}
        onToggleDict={() => setDictOpen(v => !v)}
        onOpenJouleChat={onOpenJouleChat}
        joulePanelOpen={joulePanelOpen}
        isEmpty={isEmpty}
        onEmptyStateStart={() => setIsEmpty(false)}
        onPadSend={onPadSend}
      />
    </div>
  )
}
