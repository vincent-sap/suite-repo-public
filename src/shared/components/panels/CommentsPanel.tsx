import { useState } from 'react'
import { Text, Icon, Button, TextArea, Avatar } from '@ui5/webcomponents-react'
import { SigRightSidePanel } from '@signavio/sap-signavio-uixtension'
import s from './CommentsPanel.module.css'

type Comment = {
  id: string
  author: string
  initials: string
  avatarColor: string
  timestamp: string
  body: string
  replies?: Comment[]
  resolved?: boolean
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'Sarah Kim',
    initials: 'SK',
    avatarColor: 'Accent2',
    timestamp: '2 hours ago',
    body: 'The branch for candidate rejection should also include a step for sending an automated rejection email. Currently it just ends without any communication.',
    replies: [
      {
        id: 'c1r1',
        author: 'Sebastian Kaim',
        initials: 'SK',
        avatarColor: 'Accent7',
        timestamp: '1 hour ago',
        body: "Good point — I'll add a \"Send Rejection Notification\" task before the end event. Will tag you once updated.",
      }
    ]
  },
  {
    id: 'c2',
    author: 'Tim Green',
    initials: 'TG',
    avatarColor: 'Accent4',
    timestamp: 'yesterday',
    body: 'Should we link the GDPR data retention rule here? The 6-month anonymization period seems very specific to German law.',
    resolved: false,
  },
  {
    id: 'c3',
    author: 'Lina Davis',
    initials: 'LD',
    avatarColor: 'Accent6',
    timestamp: 'May 10, 2026',
    body: 'Looks good overall. The validity period and target KPIs are now aligned with what we agreed in the Q1 planning session.',
    resolved: true,
  },
]

function CommentBubble({ comment, nested = false }: { comment: Comment; nested?: boolean }) {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  return (
    <div className={`${s.commentBubble} ${nested ? s.commentBubbleNested : ''} ${comment.resolved ? s.commentBubbleResolved : ''}`}>
      <div className={s.commentHeader}>
        <Avatar
          colorScheme={comment.avatarColor as any}
          initials={comment.initials}
          size="XS"
          style={{ flexShrink: 0 }}
        />
        <div className={s.commentMeta}>
          <Text style={{ fontWeight: '600', fontSize: 'var(--sapFontSmallSize)' }}>{comment.author}</Text>
          <Text style={{ fontSize: 'var(--sapFontSmallSize)', color: 'var(--sapContent_LabelColor)' }}>{comment.timestamp}</Text>
        </div>
        <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto', flexShrink: 0 }}>
          {!nested && (
            <Button
              icon={comment.resolved ? 'status-inactive' : 'accept'}
              design="Transparent"
              style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
              tooltip={comment.resolved ? 'Unresolve' : 'Resolve'}
            />
          )}
          <Button
            icon="overflow"
            design="Transparent"
            style={{ height: '1.5rem', width: '1.5rem', padding: 0 }}
            tooltip="More"
          />
        </div>
      </div>

      <Text style={{ fontSize: 'var(--sapFontSize)', color: comment.resolved ? 'var(--sapContent_LabelColor)' : 'var(--sapTextColor)', lineHeight: '1.5', marginLeft: '2rem' }}>
        {comment.body}
      </Text>

      {!nested && !comment.resolved && (
        <div style={{ marginLeft: '2rem', marginTop: '4px' }}>
          {showReply ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <TextArea
                value={replyText}
                onInput={(e: any) => setReplyText(e.target?.value ?? '')}
                placeholder="Write a reply"
                rows={2}
                style={{ width: '100%', fontSize: 'var(--sapFontSmallSize)' }}
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <Button design="Default" style={{ height: '1.75rem', fontSize: 'var(--sapFontSmallSize)' }} onClick={() => { setShowReply(false); setReplyText('') }}>Cancel</Button>
                <Button design="Emphasized" style={{ height: '1.75rem', fontSize: 'var(--sapFontSmallSize)' }} disabled={!replyText.trim()}>Reply</Button>
              </div>
            </div>
          ) : (
            <Button
              design="Transparent"
              style={{ height: '1.5rem', fontSize: 'var(--sapFontSmallSize)', padding: '0 4px' }}
              onClick={() => setShowReply(true)}
            >
              Reply
            </Button>
          )}
        </div>
      )}

      {comment.replies?.map(r => (
        <CommentBubble key={r.id} comment={r} nested />
      ))}
    </div>
  )
}

type Props = {
  assetId?: string
  onClose: () => void
}

export default function CommentsPanel({ assetId: _assetId, onClose }: Props) {
  const [newComment, setNewComment] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  const displayed = MOCK_COMMENTS.filter(c => {
    if (filter === 'open') return !c.resolved
    if (filter === 'resolved') return c.resolved
    return true
  })

  const openCount = MOCK_COMMENTS.filter(c => !c.resolved).length

  return (
    <SigRightSidePanel
      headerTitle="Comments"
      isOpen
      toggleRightSidePanel={onClose}
      style={{ width: '100%', height: '100%', maxWidth: 'none', background: 'var(--sapList_Background)' }}
      contentActionsSlot={[]}
      subHeaderSlot={
        <div style={{ display: 'flex', gap: '6px', padding: '0 0 8px' }}>
          {(['all', 'open', 'resolved'] as const).map(f => (
            <Button
              key={f}
              design={filter === f ? 'Emphasized' : 'Default'}
              style={{ height: '1.75rem', fontSize: 'var(--sapFontSmallSize)', textTransform: 'capitalize' }}
              onClick={() => setFilter(f)}
            >
              {f === 'open' ? `Open (${openCount})` : f === 'all' ? 'All' : 'Resolved'}
            </Button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* New comment input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '16px', borderBottom: '1px solid var(--sapList_BorderColor)', marginBottom: '12px' }}>
          <TextArea
            value={newComment}
            onInput={(e: any) => setNewComment(e.target?.value ?? '')}
            placeholder="Add a comment"
            rows={2}
            style={{ width: '100%', fontSize: 'var(--sapFontSmallSize)' }}
          />
          {newComment.trim() && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <Button design="Default" style={{ height: '1.75rem', fontSize: 'var(--sapFontSmallSize)' }} onClick={() => setNewComment('')}>Cancel</Button>
              <Button design="Emphasized" style={{ height: '1.75rem', fontSize: 'var(--sapFontSmallSize)' }}>Comment</Button>
            </div>
          )}
        </div>

        {/* Comment list */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <Icon name="comment" style={{ width: '2rem', height: '2rem', color: 'var(--sapContent_LabelColor)', marginBottom: '8px' }} />
            <Text style={{ display: 'block', color: 'var(--sapContent_LabelColor)', fontSize: 'var(--sapFontSmallSize)' }}>
              No {filter !== 'all' ? filter : ''} comments
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayed.map(c => <CommentBubble key={c.id} comment={c} />)}
          </div>
        )}
      </div>
    </SigRightSidePanel>
  )
}
