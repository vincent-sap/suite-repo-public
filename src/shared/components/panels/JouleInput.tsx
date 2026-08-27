import { useState, useRef, useEffect } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import css from './JouleInput.module.css'

const SUGGESTIONS = [
  'Complement process model',
  'Add approval gateway after task',
  'Summarize this process',
  'Identify process bottlenecks',
]

type Props = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onFocus?: () => void
  placeholder?: string
  embedded?: boolean
  hideSuggestions?: boolean
}

export default function JouleInput({ value, onChange, onSend, onFocus: onFocusProp, placeholder = 'Message Modeling AI Assistant', embedded = false, hideSuggestions = false }: Props) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [value])

  const showSuggestions = focused && !value.trim() && !hideSuggestions

  return (
    <div className={css.root}>
      {showSuggestions && (
        <ul className={css.suggestions}>
          {SUGGESTIONS.map((suggestion, i) => (
            <li key={i}>
              <button
                className={css.suggestionItem}
                onMouseDown={e => { e.preventDefault(); onChange(suggestion) }}
              >
                <ArrowRight size={14} className={css.suggestionArrow} />
                <span>{suggestion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={embedded ? css.pillEmbedded : css.pill}>
        <button
          className={css.plusBtn}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Add file"
          tabIndex={0}
        >
          <Plus size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={() => {}}
        />
        <textarea
          ref={textareaRef}
          className={css.textarea}
          placeholder={placeholder}
          value={value}
          rows={1}
          onChange={e => onChange(e.target.value)}
          onFocus={() => { setFocused(true); onFocusProp?.() }}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend()
              textareaRef.current?.blur()
            }
          }}
        />
        <button
          className={css.sendBtn}
          onClick={() => { onSend(); textareaRef.current?.blur() }}
          aria-label="Send"
        >
          <ArrowRight size={18} color="white" />
        </button>
      </div>
    </div>
  )
}
