import { useState, useEffect, useRef } from 'react'
import { Button, Text } from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import JouleInput from '../JouleInput'
import s from './JouleChatPanel.module.css'

type Message = {
  role: 'user' | 'assistant'
  text: string
  impactSummary?: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'user',
    text: 'Adjust the trainings to fit my new budget guidance of 2.000 EUR.',
  },
  {
    role: 'assistant',
    text: "I've adjusted the trainings to fit your new budget guidance of 2.000 EUR.",
    impactSummary: 'The External Training "Understanding Your BATNA" was added.',
  },
]

type Props = {
  onClose: () => void
  pendingMessage?: string | null
  onPendingConsumed?: () => void
}

export default function JouleChatPanel({ onClose, pendingMessage, onPendingConsumed }: Props) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const consumedRef = useRef<string | null>(null)

  useEffect(() => {
    if (pendingMessage && pendingMessage !== consumedRef.current) {
      consumedRef.current = pendingMessage
      setMessages(prev => [
        ...prev,
        { role: 'user', text: pendingMessage },
        { role: 'assistant', text: "I've processed your request and updated the process accordingly." },
      ])
      onPendingConsumed?.()
    }
  }, [pendingMessage, onPendingConsumed])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input.trim() },
      { role: 'assistant', text: "I've processed your request and updated the process accordingly." },
    ])
    setInput('')
  }

  return (
    <SigRightSidePanel
      headerTitle="Modeling AI Assistant"
      isOpen
      toggleRightSidePanel={onClose}
      contentActionsSlot={[]}
      footerArea={
        <div className={s.footer}>
          <JouleInput value={input} onChange={setInput} onSend={handleSend} />
        </div>
      }
      style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
    >
      <div className={s.messageThread}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? s.userMessage : s.assistantMessage}>
            <Text className={s.messageText}>{msg.text}</Text>
            {msg.impactSummary && (
              <Text className={s.impactSummary}>
                <strong>Impact Summary:</strong> {msg.impactSummary}
              </Text>
            )}
            {msg.role === 'assistant' && (
              <div className={s.messageActions}>
                <Button icon="copy" design="Transparent" tooltip="Copy" style={{ width: '2rem', height: '2rem', padding: 0 }} />
                <Button icon="share" design="Transparent" tooltip="Share" style={{ width: '2rem', height: '2rem', padding: 0 }} />
                <Button icon="thumb-up" design="Transparent" tooltip="Good response" style={{ width: '2rem', height: '2rem', padding: 0 }} />
                <Button icon="thumb-down" design="Transparent" tooltip="Bad response" style={{ width: '2rem', height: '2rem', padding: 0 }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </SigRightSidePanel>
  )
}
