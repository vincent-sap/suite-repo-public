import React, { useState } from 'react'
import { Avatar, Button, Input, TextArea } from '@ui5/webcomponents-react'
import { SigChipV2 } from '@signavio/sap-signavio-uixtension'

interface Reply {
  id: string
  author: string
  initials: string
  date: string
  text: React.ReactNode
}

interface Comment {
  id: string
  author: string
  initials: string
  date: string
  text: React.ReactNode
  chips?: { value: string; design?: string; leadingIcon?: string }[]
  replies?: Reply[]
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    author: 'Claire Westfield',
    initials: 'CW',
    date: 'Aug 19, 2023 · 13:19',
    text: (
      <>
        Hi <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>@Judith Berthers</span>, have you had a chance to look at the latest sales numbers? I'm worried about the dip in Q3.
      </>
    ),
    chips: [
      { value: 'Resolved', design: 'positive', leadingIcon: 'accept' },
      { value: 'Activity: Overall Purchase Volume' },
    ],
  },
  {
    id: 'c2',
    author: 'Claire Westfield',
    initials: 'CW',
    date: 'Aug 14, 2023 · 13:20',
    text: (
      <>
        Hi <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>@Judith Berthers</span>, have you had a chance to look at the latest sales numbers? I'm worried about the dip in Q3.
      </>
    ),
    replies: [],
  },
  {
    id: 'c3',
    author: 'Claire Westfield',
    initials: 'CW',
    date: 'Aug 12, 2023 · 10:02',
    text: (
      <>
        Hi <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>@Judith Berthers</span>, have you had a chance to look at the latest sales numbers? I'm worried about the dip in Q3.
      </>
    ),
    replies: [
      {
        id: 'r1',
        author: 'Judith Berthers',
        initials: 'JB',
        date: 'Aug 19, 2023 · 13:19',
        text: (
          <>
            Hi <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>@Claire Westfield</span>, I will clear this up. Thank you for the headsup.
          </>
        ),
      },
      {
        id: 'r2',
        author: 'Claire Westfield',
        initials: 'CW',
        date: 'Aug 19, 2023 · 13:19',
        text: (
          <>
            Hi <span style={{ color: 'var(--sapLinkColor, #0064d9)' }}>@Claire Westfield</span>, I will clear this up. Thank you for the headsup.
          </>
        ),
      },
    ],
  },
]

type FilterType = 'Open' | 'Resolved' | 'Rejected'

function CommentHeader({ initials, author, date }: { initials: string; author: string; date: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <Avatar initials={initials} size="XS" colorScheme="Accent6" shape="Circle" style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--sapTextColor, #1d2d3e)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", whiteSpace: 'nowrap' }}>
            {author}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--sapContent_LabelColor, #556b82)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", whiteSpace: 'nowrap' }}>
            {date}
          </span>
        </div>
      </div>
      <Button icon="overflow" design="Transparent" style={{ flexShrink: 0 }} />
    </div>
  )
}

function CommentText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: '14px', lineHeight: '21px', color: 'var(--sapTextColor, #1d2d3e)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", wordBreak: 'break-word' }}>
      {children}
    </p>
  )
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div style={{ background: 'var(--sapBaseColor, #fff)', border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)', borderRadius: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <CommentHeader initials={comment.initials} author={comment.author} date={comment.date} />
        <CommentText>{comment.text}</CommentText>
        {comment.chips && comment.chips.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {comment.chips.map((chip, i) => (
              // Read-only chips: no onClick → ReadOnlyState, value is required
              <SigChipV2
                key={i}
                value={chip.value}
                design={chip.design as never}
                leadingIcon={chip.leadingIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <div style={{ background: 'var(--sapBaseColor, #fff)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <Avatar initials={reply.initials} size="XS" colorScheme="Accent6" shape="Circle" style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--sapTextColor, #1d2d3e)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", whiteSpace: 'nowrap' }}>
              {reply.author}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--sapContent_LabelColor, #556b82)', fontFamily: "var(--sapFontFamily,'72',sans-serif)", whiteSpace: 'nowrap' }}>
              {reply.date}
            </span>
          </div>
        </div>
        <Button icon="overflow" design="Transparent" style={{ flexShrink: 0 }} />
      </div>
      <CommentText>{reply.text}</CommentText>
    </div>
  )
}

function CommentThread({ comment }: { comment: Comment }) {
  const [repliesOpen, setRepliesOpen] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0
  const replyCount = comment.replies?.length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', width: '100%' }}>
      <CommentCard comment={comment} />

      {hasReplies && !repliesOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '52px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {comment.replies!.slice(0, 3).map((r, i) => (
              <div key={r.id} style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 3 - i }}>
                <Avatar initials={r.initials} size="XS" colorScheme="Accent6" shape="Circle" />
              </div>
            ))}
            {replyCount > 3 && (
              <div style={{
                marginLeft: '-8px', width: '2rem', height: '2rem', borderRadius: '50%',
                background: 'var(--sapNeutralBackground, #f0f0f0)', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontFamily: "var(--sapFontFamily,'72',sans-serif)",
                color: 'var(--sapTextColor)', zIndex: 0,
              }}>
                +{replyCount - 3}
              </div>
            )}
          </div>
          <Button
            design="Transparent"
            onClick={() => setRepliesOpen(true)}
            style={{
              flex: 1, height: '32px',
              background: 'var(--sapBaseColor, #fff)',
              border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
              borderRadius: '16px',
              fontSize: 'var(--sapFontSize)',
              fontWeight: '600',
              '--ui5-button-text-color': 'var(--sapLinkColor)',
            } as React.CSSProperties}
          >
            Show {replyCount} {replyCount === 1 ? 'Answer' : 'Answers'}
          </Button>
        </div>
      )}

      {hasReplies && repliesOpen && (
        <div style={{ paddingLeft: '52px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ background: 'var(--sapBaseColor, #fff)', border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)', borderRadius: '16px', overflow: 'hidden' }}>
            <Button
              design="Transparent"
              onClick={() => setRepliesOpen(false)}
              style={{
                width: '100%', height: '32px',
                background: 'var(--sapBaseColor, #fff)',
                borderBottom: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)',
                borderRadius: 0,
                fontSize: 'var(--sapFontSize)',
                fontWeight: '600',
                '--ui5-button-text-color': 'var(--sapLinkColor)',
              } as React.CSSProperties}
            >
              Hide {replyCount} {replyCount === 1 ? 'Answer' : 'Answers'}
            </Button>
            {comment.replies!.map((reply, i) => (
              <React.Fragment key={reply.id}>
                {i > 0 && <div style={{ height: '1px', background: 'var(--sapGroup_ContentBorderColor, #d9d9d9)' }} />}
                <ReplyCard reply={reply} />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// First comment shown in edit state (per Figma design)
function EditingComment({ comment }: { comment: Comment }) {
  return (
    <div style={{ background: 'var(--sapBaseColor, #fff)', border: '1px solid var(--sapGroup_ContentBorderColor, #d9d9d9)', borderRadius: '16px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <CommentHeader initials={comment.initials} author={comment.author} date={comment.date} />
        <TextArea
          value="Hi @Judith Berthers, have you had a chance to look at the latest sales numbers? I'm worried about the dip in Q3."
          rows={4}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button icon="arobase" design="Transparent" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button design="Emphasized">Save</Button>
            <Button design="Transparent">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CommentsTab() {
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set(['Open', 'Resolved']))
  const [newComment, setNewComment] = useState('')

  const toggleFilter = (f: FilterType) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filters: FilterType[] = ['Open', 'Resolved', 'Rejected']
  const firstComment = INITIAL_COMMENTS[0]
  const otherComments = INITIAL_COMMENTS.slice(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '12px' }}>
        {filters.map(f => (
          // SelectableState: onClick required, value required, no children
          <SigChipV2
            key={f}
            value={f}
            selected={activeFilters.has(f)}
            onClick={() => toggleFilter(f)}
          />
        ))}
        {/* Interactive chip with label+value — InteractiveAndRemovableState */}
        <SigChipV2
          value="Any"
          label="Filter by"
          trailingIcon="slim-arrow-down"
          onClick={() => {}}
        />
      </div>

      {/* New comment input row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', paddingBottom: '16px' }}>
        <Input
          placeholder="New Comment, @ to mention"
          value={newComment}
          onInput={e => setNewComment(((e.target as unknown) as HTMLInputElement).value)}
          style={{ flex: 1 }}
        />
        <Button icon="paper-plane" design="Emphasized" disabled={!newComment.trim()} />
      </div>

      {/* Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <EditingComment comment={firstComment} />
        {otherComments.map(comment => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
