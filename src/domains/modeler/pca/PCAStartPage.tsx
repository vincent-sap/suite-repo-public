import { useState, useRef, useEffect } from 'react';
import { usePCA } from '@/contexts/PCAContext';
import { PCAInputField } from './PCAInputField';

const SUBTITLES = [
  'Explore your process performance, in plain language.',
  'Understand your process bottlenecks, without the complexity.',
  'Turn process data into clear insights, instantly.',
  'Benchmark, analyze, and improve – just by asking.',
  'Your processes, explained in plain language.',
  'Ask anything about your operations. Get answers that matter.',
  'From raw process data to actionable insights, in seconds.',
];

const SUGGESTED_PROMPTS = [
  'What can you help me with?',
  'Help me find relevant analyses for my processes',
  'I want to benchmark my processes',
  "What's impacting my process performance?",
  'Where should I focus to improve?',
  'How can MCP apps be embedded in the UI?',
];

function AiSparkleIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 8C32 8 30 24 24 30C18 36 8 38 8 38C8 38 18 40 24 46C30 52 32 60 32 60C32 60 34 52 40 46C46 40 56 38 56 38C56 38 46 36 40 30C34 24 32 8 32 8Z"
        fill="#5d36ff"
      />
      <path
        d="M50 4C50 4 49 12 46 15C43 18 38 19 38 19C38 19 43 20 46 23C49 26 50 32 50 32C50 32 51 26 54 23C57 20 62 19 62 19C62 19 57 18 54 15C51 12 50 4 50 4Z"
        fill="#5d36ff"
      />
    </svg>
  );
}

export function PCAStartPage() {
  const { sendMessage } = usePCA();
  const [subtitle] = useState(() => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full items-center justify-center overflow-auto relative"
      style={{ backgroundColor: 'white' }}
    >
      <div
        className="flex flex-col items-center"
        style={{ gap: 48, width: '100%', maxWidth: 960, padding: '0 24px 32px' }}
      >
        <AiSparkleIcon size={64} />

        <div className="flex flex-col items-center" style={{ gap: 8, maxWidth: 840, width: '100%' }}>
          <h1
            className="text-center leading-tight"
            style={{
              fontSize: 32,
              fontFamily: "'72', sans-serif",
              fontWeight: 700,
              color: '#1d2d3e',
              margin: 0,
            }}
          >
            Process Consulting Agent
          </h1>
          <p
            className="text-center"
            style={{
              fontSize: 32,
              fontFamily: "'72', sans-serif",
              fontWeight: 400,
              color: '#1d2d3e',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        </div>

        <PCAInputField ref={textareaRef} onSend={sendMessage} />

        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: 10, width: '100%' }}
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="px-4 py-2 rounded-2xl text-sm transition-all"
              style={{
                backgroundColor: '#eae5ff',
                color: '#5d36ff',
                fontFamily: "'72', sans-serif",
                fontSize: 14,
                whiteSpace: 'nowrap',
                border: '1px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5d36ff'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
