import React, { useState, useRef, useEffect } from 'react';
import { usePCA } from '@/contexts/PCAContext';
import { useDesign } from '@/contexts/DesignContext';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PCASidePanel() {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    createConversation,
    deleteConversation,
    renameConversation,
    setActiveConversationId,
    getActiveConversation,
    sendMessage,
  } = usePCA();
  const { variant } = useDesign();
  const activeConversation = getActiveConversation();
  const isInConversation = !!(activeConversation && activeConversation.messages.length > 0);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const handleNewConversation = () => {
    createConversation();
  };

  const handleStartRename = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleFinishRename = () => {
    if (editingId && editingTitle.trim()) {
      renameConversation(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    deleteConversation(id);
  };

  if (!sidebarOpen) {
    return (
      <div
        className="flex flex-col items-center h-full"
        style={{ paddingTop: 44, paddingLeft: 32, paddingRight: 32, gap: 8 }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#eae5ff', border: '1px solid transparent' }}
          title="Open sidebar"
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5d36ff'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
        >
          <PanelLeftOpen size={16} color="#5d36ff" />
        </button>
        {isInConversation && (
          <button
            onClick={handleNewConversation}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#eae5ff', border: '1px solid transparent' }}
            title="New Conversation"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5d36ff'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
          >
            <Plus size={16} color="#5d36ff" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ padding: '16px 16px' }}
    >
      <div
        className="flex flex-col flex-1 min-h-0"
        style={
          variant === 2
            ? { backgroundColor: 'rgba(93, 54, 255, 0.08)', gap: 20, padding: '20px 20px 24px' }
            : { backgroundColor: 'rgba(93, 54, 255, 0.08)', gap: 20, borderRadius: 24, padding: '20px 20px 24px' }
        }
      >
        {/* Header row */}
        <div className="flex items-center justify-between shrink-0">
          <span
            className="font-bold text-sm whitespace-nowrap"
            style={{ color: '#131e29', fontFamily: "'72', sans-serif" }}
          >
            Process Consulting Agent
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#eae5ff', border: '1px solid transparent' }}
            title="Collapse Sidebar"
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
            onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5d36ff'; }}
            onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
          >
            <PanelLeftClose size={16} color="#5d36ff" />
          </button>
        </div>

        {/* New Conversation button + Search input */}
        <div className="flex flex-col shrink-0" style={{ gap: 8 }}>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-full text-sm font-bold text-white transition-colors hover:opacity-90 w-full justify-center h-9"
            style={{ backgroundColor: '#5d36ff', fontFamily: "'72', sans-serif" }}
          >
            <Plus size={16} />
            New Conversation
          </button>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full outline-none bg-white rounded-full h-9"
              style={{
                fontFamily: "'72', sans-serif",
                fontSize: 14,
                color: '#131e29',
                border: '1px solid #5d36ff',
                padding: '0 28px 0 10px',
              }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)' }}
              >
                <X size={14} color="#556b82" />
              </button>
            ) : (
              <Search
                size={14}
                color="#556b82"
                style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            )}
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex flex-col overflow-y-auto flex-1 min-h-0 pt-1">
          <div className="pr-4 py-2">
            <span
              className="text-xs font-semibold"
              style={{ color: '#556b82', fontFamily: "'72', sans-serif" }}
            >
              Your Conversations
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {conversations
              .filter((c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isHovered = hoveredId === conv.id;
                const isMenuOpen = openMenuId === conv.id;
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={cn(
                      'group flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors relative',
                      isActive
                        ? 'bg-[#ddd5ff]'
                        : isHovered
                        ? 'bg-[rgba(93,54,255,0.08)]'
                        : 'bg-transparent'
                    )}
                    onClick={() => {
                      if (!isEditing) {
                        setActiveConversationId(conv.id);
                        if (conv.messages.length === 0) {
                          sendMessage(conv.title, conv.id);
                        }
                      }
                    }}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {isEditing ? (
                      <input
                        ref={editRef}
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-0 text-sm bg-transparent border-b border-[#5d36ff] outline-none"
                        style={{ color: '#131e29', fontFamily: "'72', sans-serif" }}
                      />
                    ) : (
                      <span
                        className="flex-1 min-w-0 text-sm truncate font-normal"
                        title={conv.title}
                        style={{ color: '#131e29', fontFamily: "'72', sans-serif" }}
                      >
                        {conv.title}
                      </span>
                    )}

                    {(isHovered || isMenuOpen) && !isEditing && (
                      <div className="relative" ref={isMenuOpen ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId((prev) => (prev === conv.id ? null : conv.id));
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-[rgba(93,54,255,0.15)] transition-colors flex-shrink-0"
                        >
                          <MoreHorizontal size={13} color="#556b82" />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="absolute right-0 top-6 z-50 bg-white rounded-xl shadow-lg border border-[#e5e5e5] py-1 min-w-[140px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-[rgba(93,54,255,0.06)] transition-colors"
                              style={{ color: '#131e29', fontFamily: "'72', sans-serif" }}
                              onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                            >
                              <Pencil size={13} />
                              Rename
                            </button>
                            <button
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-red-50 transition-colors"
                              style={{ color: '#bb0000', fontFamily: "'72', sans-serif" }}
                              onClick={(e) => handleDelete(conv.id, e)}
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
