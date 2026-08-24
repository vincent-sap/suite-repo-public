import React, { useRef, useEffect, useState } from 'react';
import { usePCA } from '@/contexts/PCAContext';
import type { ChatMessage, TableData, BpmnListItem, BarWidgetData, ScatterWidgetData, WidgetData, PanelListItem } from '@/contexts/PCAContext';
import { Copy, ThumbsUp, ThumbsDown, ChevronRight, PanelLeftOpen, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PCAInputField } from './PCAInputField';
import { MessageStrip, Button as UI5Button, List, Tab, ListItemGroup, Input, SegmentedButton, SegmentedButtonItem, Dialog, Bar as UI5Bar, TextArea } from '@ui5/webcomponents-react';
import { ToolbarItem } from '@ui5/webcomponents-react/dist/webComponents/ToolbarItem/index.js';
import { Icon as UI5Icon } from '@ui5/webcomponents-react/dist/webComponents/Icon/index.js';
import { PCAGraphView } from './PCAGraphView';
import { PCACrossGraph } from './PCACrossGraph';
import { BpmnTreeList } from './BpmnTreeList';
import { InitiativeTable } from './InitiativeTable';
import { Avatar } from '@ui5/webcomponents-react/dist/webComponents/Avatar/index.js';
import { Switch } from '@ui5/webcomponents-react/dist/webComponents/Switch/index.js';
import { Label as UI5Label } from '@ui5/webcomponents-react/dist/webComponents/Label/index.js';
import { ListItemCustom } from '@ui5/webcomponents-react/dist/webComponents/ListItemCustom/index.js';
import { SigDomainObject, SigBreadcrumbs, SigBreadcrumbItem, SigRatingIndicator, SigRightSidePanel, SigTableWrapper } from '@signavio/sap-signavio-uixtension';
import { SigChipV2 } from '@signavio/sap-signavio-uixtension';
import '@signavio/icons/dist/published.js';
import '@signavio/icons/dist/published-changed.js';
import '@signavio/icons/dist/link.js';
import '@signavio/icons/dist/computer.js';
import '@signavio/icons/dist/group.js';
import '@signavio/icons/dist/risk.js';
import '@signavio/icons/dist/organization.js';
const publishedIcon = 'SAP-icons-v4/published';
const publishedChangedIcon = 'SAP-icons-v4/published-changed';
const linkIcon = 'SAP-icons-v4/link';
const computerIcon = 'SAP-icons-v4/computer';
const groupIcon = 'SAP-icons-v4/group';
const riskIcon = 'SAP-icons-v4/risk';
const organizationIcon = 'SAP-icons-v4/organization';
// @ts-expect-error no type declarations
import processManagerIcon from '@signavio/icons/dist/process-manager';
// @ts-expect-error no type declarations
import keyMeasureIcon from '@signavio/icons/dist/key-measure';
// @ts-expect-error no type declarations
import metricIcon from '@signavio/icons/dist/metric';
import '@ui5/webcomponents-icons/dist/write-new-document.js';
import '@ui5/webcomponents-icons/dist/search.js';
import '@ui5/webcomponents-icons/dist/share-2.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import '@ui5/webcomponents-icons/dist/email.js';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import '@ui5/webcomponents-icons/dist/overflow.js';
import '@ui5/webcomponents-icons/dist/trend-up.js';
import '@ui5/webcomponents-icons/dist/warning.js';
import '@ui5/webcomponents-icons/dist/status-in-process.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/flag.js';
import '@ui5/webcomponents-icons/dist/overview-chart.js';
import '@ui5/webcomponents-icons/dist/bbyd-dashboard.js';
import '@ui5/webcomponents-icons/dist/in-progress.js';
import '@ui5/webcomponents-icons/dist/business-objects-mobile.js';
import '@ui5/webcomponents-icons/dist/document-text.js';
import '@ui5/webcomponents-icons/dist/document.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import processDiagramImage from '@/assets/hero.png';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  ScatterChart, Scatter, Label,
} from 'recharts';

// --- Markdown renderer for AI messages ---
function MarkdownMessage({ content }: { content: string }) {
  return (
    <div
      className="pca-markdown"
      style={{
        fontFamily: "'72', sans-serif",
        fontSize: 14,
        color: '#1d2d3e',
        lineHeight: '21px',
      }}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1d2d3e', marginBottom: 12, marginTop: 28, lineHeight: '36px' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d2d3e', marginBottom: 10, marginTop: 24, lineHeight: '30px' }}>{children}</h2>,
          h3: ({ children }) => <p style={{ fontWeight: 700, marginBottom: 4, marginTop: 12, lineHeight: '22px' }}>{children}</p>,
          h4: ({ children }) => <p style={{ fontWeight: 700, marginBottom: 4, marginTop: 8, lineHeight: '22px' }}>{children}</p>,
          h5: ({ children }) => <p style={{ fontWeight: 700, marginBottom: 4, marginTop: 8, lineHeight: '22px' }}>{children}</p>,
          h6: ({ children }) => <p style={{ fontWeight: 700, marginBottom: 4, marginTop: 8, lineHeight: '22px' }}>{children}</p>,
          p: ({ children }) => <p style={{ marginBottom: 10, lineHeight: '22px' }}>{children}</p>,
          strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8, listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: '21px' }}>{children}</li>,
          a: ({ children, href }) => (
            <a href={href} style={{ color: '#0064d9', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
              onClick={e => e.preventDefault()}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', marginBottom: 12, marginTop: 8 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ backgroundColor: '#f5f6f7' }}>{children}</thead>,
          th: ({ children }) => (
            <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '1px solid #a8b3bd', whiteSpace: 'nowrap', color: '#131e29' }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ padding: '6px 12px', borderBottom: '1px solid #e5e5e5', color: '#131e29' }}>
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #5d36ff', paddingLeft: 12, color: '#556b82', marginBottom: 8 }}>{children}</blockquote>
          ),
          code: ({ children }) => (
            <code style={{ backgroundColor: '#f5f6f7', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// --- Structured table component --- breaks out of max-width on wide screens
function StructuredTable({ data, breakoutMargin }: { data: TableData; breakoutMargin: number }) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <p style={{ fontFamily: "'72', sans-serif", fontSize: 20, fontWeight: 700, color: '#1d2d3e' }}>
        {data.title}
      </p>
      <div
        style={{
          marginLeft: breakoutMargin > 0 ? -breakoutMargin : 0,
          marginRight: breakoutMargin > 0 ? -breakoutMargin : 0,
        }}
      >
        <div
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: "'72', sans-serif" }}>
            <thead>
              <tr>
                {data.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: '#131e29',
                      borderBottom: '1px solid #a8b3bd',
                      backgroundColor: 'white',
                      whiteSpace: 'nowrap',
                      fontSize: 14,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        padding: '8px 16px',
                        borderBottom: ri < data.rows.length - 1 ? '1px solid #e5e5e5' : 'none',
                        color: '#131e29',
                        fontSize: 14,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Widget components ---
const WIDGET_FONT = "'72', sans-serif";
const WIDGET_TICK_STYLE = { fontFamily: WIDGET_FONT, fontSize: 11, fill: '#556b82' };

function WidgetCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: 16,
        overflow: 'hidden',
        height: 280,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '14px 16px 6px',
          fontFamily: WIDGET_FONT,
          fontSize: 13,
          fontWeight: 700,
          color: '#1d2d3e',
          flexShrink: 0,
          lineHeight: '20px',
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: '0 8px 12px' }}>
        {children}
      </div>
    </div>
  );
}

function BarWidget({ widget }: { widget: BarWidgetData }) {
  return (
    <WidgetCard title={widget.title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={widget.data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dee2e5" vertical={false} />
          <XAxis dataKey="label" tick={WIDGET_TICK_STYLE} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={WIDGET_TICK_STYLE} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontFamily: WIDGET_FONT, fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5', boxShadow: 'none' }}
            cursor={{ fill: 'rgba(93,54,255,0.04)' }}
          />
          {widget.benchmarkValue != null && (
            <ReferenceLine
              y={widget.benchmarkValue}
              stroke="#df1278"
              strokeDasharray="4 4"
              label={{
                value: widget.benchmarkLabel ?? 'Benchmark',
                position: 'insideTopRight',
                fill: '#df1278',
                fontSize: 10,
                fontFamily: WIDGET_FONT,
              }}
            />
          )}
          <Bar dataKey="value" fill={widget.color ?? '#3c8cdd'} radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

function ScatterWidget({ widget }: { widget: ScatterWidgetData }) {
  return (
    <WidgetCard title={widget.title}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, bottom: widget.xLabel ? 28 : 8, left: widget.yLabel ? 16 : -8 }}>
          <CartesianGrid stroke="#dee2e5" strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" tick={WIDGET_TICK_STYLE} tickLine={false} axisLine={false}>
            {widget.xLabel && (
              <Label value={widget.xLabel} position="insideBottom" offset={-16} style={{ fontFamily: WIDGET_FONT, fontSize: 11, fill: '#556b82' }} />
            )}
          </XAxis>
          <YAxis dataKey="y" type="number" tick={WIDGET_TICK_STYLE} tickLine={false} axisLine={false}>
            {widget.yLabel && (
              <Label value={widget.yLabel} angle={-90} position="insideLeft" offset={16} style={{ fontFamily: WIDGET_FONT, fontSize: 11, fill: '#556b82' }} />
            )}
          </YAxis>
          <Tooltip
            contentStyle={{ fontFamily: WIDGET_FONT, fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5', boxShadow: 'none' }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter data={widget.data} fill="#3c8cdd" opacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}

function WidgetGrid({ widgets, breakoutMargin }: { widgets: WidgetData[]; breakoutMargin: number }) {
  return (
    // Outer block-level div: negative margins expand its computed width (same pattern as StructuredTable)
    <div
      style={{
        marginLeft: breakoutMargin > 0 ? -breakoutMargin : 0,
        marginRight: breakoutMargin > 0 ? -breakoutMargin : 0,
      }}
    >
      {/* Inner flex container: fills the expanded width, wraps when widgets would be < 280px */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {widgets.map((w, i) => (
          <div key={i} style={{ flex: '1 0 0', minWidth: 280 }}>
            {w.type === 'bar' ? <BarWidget widget={w} /> : <ScatterWidget widget={w} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Thinking toggle ---
function ThinkingToggle({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        style={{
          fontFamily: "'72', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: '#556b82',
          background: 'none',
          border: 'none',
          padding: '5px 0',
          cursor: 'pointer',
        }}
      >
        Show Activity
        <ChevronRight
          size={12}
          style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
        />
      </button>
      {open && (
        <div style={{ marginTop: 4 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 4,
                paddingBottom: 4,
                fontFamily: "'72', sans-serif",
                fontSize: 12,
                color: '#556b82',
                lineHeight: '18px',
              }}
            >
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- BPMN detail panel ---
const LABEL_STYLE: React.CSSProperties = { fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapContent_LabelColor, #556b82)', width: 130, flexShrink: 0 };
const VALUE_STYLE: React.CSSProperties = { fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapShell_TextColor, #1d2d3e)' };
const SECTION_TITLE_STYLE: React.CSSProperties = { fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--sapPageHeader_TextColor, #1d2d3e)' };

function DetailsTab({ item }: { item: BpmnListItem }) {
  const assetType = item.assetType ?? 'BPMN';
  const isBpmn = assetType === 'BPMN';
  const isDashboard = assetType === 'Dashboard';
  const isInitiative = assetType === 'Initiative';
  const isObjective = assetType === 'Objective';

  // Type-specific metadata rows
  const metaRows = () => {
    if (isBpmn) return [
      { label: 'Type:', value: 'BPMN', chip: null },
      { label: 'Latest Version:', value: item.version, chip: <SigChipV2 value={item.status} design={item.status === 'Published' ? 'indication5' : item.status === 'Modified' ? 'indication7' : 'indication10'} leadingIcon={item.status === 'Published' ? publishedIcon : item.status === 'Modified' ? publishedChangedIcon : 'write-new-document'} condensed /> },
      { label: 'Published Version:', value: item.version, chip: <SigChipV2 value="Published" design="indication5" leadingIcon={publishedIcon} condensed /> },
      { label: 'Created:', value: `${item.createdAt} by Claire Westfield`, chip: null },
      { label: 'Changed:', value: `${item.changedAt} by Claire Westfield`, chip: null },
    ];
    if (isDashboard) return [
      { label: 'Type:', value: 'Dashboard', chip: null },
      { label: 'Created:', value: item.createdAt, chip: null },
      { label: 'Changed:', value: item.changedAt, chip: null },
    ];
    if (isInitiative) return [
      { label: 'Type:', value: 'Initiative', chip: null },
      { label: 'Created:', value: item.createdAt, chip: null },
      { label: 'Changed:', value: item.changedAt, chip: null },
    ];
    if (isObjective) return [
      { label: 'Type:', value: 'Objective', chip: null },
      { label: 'Created:', value: item.createdAt, chip: null },
      { label: 'Changed:', value: item.changedAt, chip: null },
    ];
    return [];
  };

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Preview image — only for BPMN */}
      {isBpmn && (
        <div style={{ padding: '12px 0' }}>
          <div style={{ border: '1px solid #d9d9d9', borderRadius: 16, overflow: 'hidden', height: 237, backgroundColor: '#fff' }}>
            <img src={processDiagramImage} alt="BPMN diagram preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      )}

      {/* Metadata rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
        {metaRows().map(({ label, value, chip }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 26 }}>
            <span style={LABEL_STYLE}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={VALUE_STYLE}>{value}</span>
              {chip}
            </div>
          </div>
        ))}
        {isBpmn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 26 }}>
            <span style={LABEL_STYLE}>Location:</span>
            <SigBreadcrumbs>
              <SigBreadcrumbItem href="#">Repository</SigBreadcrumbItem>
              <SigBreadcrumbItem href="#">{item.folder}</SigBreadcrumbItem>
              <SigBreadcrumbItem>{item.name}</SigBreadcrumbItem>
            </SigBreadcrumbs>
          </div>
        )}
      </div>

      {/* Latest Comment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 26 }}>
          <span style={SECTION_TITLE_STYLE}>Latest Comment</span>
          <UI5Button design="Default">Show All</UI5Button>
        </div>
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 16, padding: 16, backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Avatar initials="CW" colorScheme="Accent6" size="XS" shape="Circle" />
            <span style={{ fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 700, color: '#1d2d3e' }}>Claire Westfield</span>
            <span style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isDashboard ? 'on "Finance KPIs"' : isInitiative ? 'on "Milestone 2"' : isObjective ? 'on "Q2 Review"' : 'on "Overall Purchase Volume"'} · Dec 19, 16:19
            </span>
          </div>
          <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e', margin: 0, paddingLeft: 40, lineHeight: '21px' }}>
            {isDashboard ? 'Can we add a drill-down by legal entity?' : isInitiative ? 'The automation vendor has confirmed the go-live date.' : isObjective ? 'On track for Q3 – great progress!' : 'Great insights here! Could we also analyze regional trends?'}
          </p>
        </div>
      </div>

      {/* Access */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
        <span style={SECTION_TITLE_STYLE}>Access</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ display: 'flex' }}>
              <Avatar initials="JK" colorScheme="Accent10" size="XS" shape="Circle" style={{ marginRight: -8 }} />
              <Avatar initials="PG" colorScheme="Accent8" size="XS" shape="Circle" style={{ marginRight: -8 }} />
              <Avatar initials="LG" colorScheme="Accent4" size="XS" shape="Circle" />
            </div>
            <span style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e' }}>4 user groups and 11 users</span>
          </div>
          <UI5Button design="Default">Manage Access</UI5Button>
        </div>
      </div>
    </div>
  );
}

function AttributesTab({ item }: { item: BpmnListItem }) {
  const assetType = item.assetType ?? 'BPMN';
  const isBpmn = assetType === 'BPMN';
  const isDashboard = assetType === 'Dashboard';
  const isInitiative = assetType === 'Initiative';
  const isObjective = assetType === 'Objective';

  const itemNameStyle: React.CSSProperties = { fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 700, color: '#1d2d3e', margin: 0 };
  const itemSubStyle: React.CSSProperties = { fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82', margin: 0 };
  const listStyle = { '--_ui5-listitemcustom-padding-inline': '0px' } as React.CSSProperties;
  const btnStyle = { width: 'fit-content' };

  const personItem = (initials: string, name: string, email: string) => (
    <ListItemCustom key={initials} type="Active" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <Avatar initials={initials} colorScheme="Accent1" size="XS" shape="Circle" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={itemNameStyle}>{name}</p>
          <p style={itemSubStyle}>{email}</p>
        </div>
        <UI5Button icon="email" design="Transparent" />
        <UI5Button icon="decline" design="Transparent" />
      </div>
    </ListItemCustom>
  );

  const assetItem = (object: 'Process Model' | 'Initiative', name: string, type: string) => (
    <ListItemCustom key={name} type="Active" style={{ padding: '8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <SigDomainObject object={object} size="XS" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={itemNameStyle}>{name}</p>
          <p style={itemSubStyle}>{type}</p>
        </div>
        <UI5Button icon={linkIcon} design="Transparent" />
        <UI5Button icon="decline" design="Transparent" />
      </div>
    </ListItemCustom>
  );

  const riskItem = (object: 'Risk' | 'Control', name: string, type: string, indent: boolean, idx: number) => (
    <ListItemCustom key={idx} type="Active" style={{ padding: `8px 0 8px ${indent ? 16 : 0}px` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <SigDomainObject object={object} size="XS" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={itemNameStyle}>{name}</p>
          <p style={itemSubStyle}>{type}</p>
        </div>
        <UI5Button icon={linkIcon} design="Transparent" />
      </div>
    </ListItemCustom>
  );

  // Section header label varies by type
  const sectionLabel = 'Main Attributes';
  // Owner label varies by type
  const ownerLabel = isDashboard ? 'Dashboard Owner' : isInitiative ? 'Initiative Owner' : isObjective ? 'Objective Owner' : 'Process Owner';
  const ownerName = isDashboard ? 'Maria Hoffmann' : isInitiative ? 'Laura Chen' : isObjective ? 'Jan Holt' : 'Laure Chen';
  const ownerInitials = isDashboard ? 'MH' : isInitiative ? 'LC' : isObjective ? 'JH' : 'LC';
  const ownerEmail = isDashboard ? 'maria.hoffmann@globalcorp.com' : isInitiative ? 'laura.chen@globalcorp.com' : isObjective ? 'jan.holt@globalcorp.com' : 'laure.chen@example.com';

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
        <UI5Button icon="slim-arrow-down" design="Transparent" />
        <span style={SECTION_TITLE_STYLE}>{sectionLabel}</span>
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
        <UI5Label>Description:</UI5Label>
        <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#131e29', margin: 0, lineHeight: '21px' }}>
          {item.description}
          <span style={{ color: '#0064d9', marginLeft: 4, cursor: 'pointer' }}>More</span>
        </p>
        <UI5Button icon="edit" design="Default" style={btnStyle} />
      </div>

      {/* Owner — all types */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
        <UI5Label>{ownerLabel}</UI5Label>
        <List separators="None" style={listStyle}>
          {personItem(ownerInitials, ownerName, ownerEmail)}
        </List>
      </div>

      {/* BPMN-specific fields */}
      {isBpmn && <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Audit Relevance:</UI5Label>
          <Switch checked design="Textual" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Area of Application:</UI5Label>
          <SigChipV2 value="Europe" trailingIcon="slim-arrow-down" onClick={() => {}} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Maturity:</UI5Label>
          <SigRatingIndicator max={5} filled={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Process Responsible:</UI5Label>
          <List separators="None" style={listStyle}>
            {personItem('HS', 'Hanna Smith', 'hanna@smith.com')}
            {personItem('JR', 'Julia Roger', 'julia@roger.com')}
          </List>
          <UI5Button icon="add" design="Default" style={btnStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Linked Assets:</UI5Label>
          <List separators="None" style={listStyle}>
            {assetItem('Process Model', 'Support End-to-End', 'BPMN')}
            {assetItem('Initiative', 'Enhance Support Process', 'Initiative')}
          </List>
          <UI5Button icon="add" design="Default" style={btnStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Risks:</UI5Label>
          <List separators="None" style={listStyle}>
            {riskItem('Risk', 'Compliance Risk', 'Risk', false, 0)}
            {riskItem('Control', '[Control Name]', 'Control', true, 1)}
            {riskItem('Risk', '[Risk Name]', 'Risk', false, 2)}
            {riskItem('Control', '[Control Name]', 'Control', true, 3)}
          </List>
          <UI5Button icon="edit" design="Default" style={btnStyle} />
        </div>
      </>}

      {/* Dashboard-specific fields */}
      {isDashboard && <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Linked Processes:</UI5Label>
          <List separators="None" style={listStyle}>
            {assetItem('Process Model', item.folder.split('/').pop()?.trim() ?? 'Process', 'BPMN')}
          </List>
          <UI5Button icon="add" design="Default" style={btnStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Maturity:</UI5Label>
          <SigRatingIndicator max={5} filled={4} />
        </div>
      </>}

      {/* Initiative-specific fields */}
      {isInitiative && <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Status:</UI5Label>
          {(() => { const s = item.customChips?.find(c => c.label === 'Status:'); return s ? <SigChipV2 value={s.value} design={s.design as any} leadingIcon={s.leadingIcon} trailingIcon="slim-arrow-down" onClick={() => {}} /> : null; })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Linked Objectives:</UI5Label>
          <List separators="None" style={listStyle}>
            {assetItem('Process Model', 'Reduce Finance Operating Cost by 20%', 'Objective')}
          </List>
          <UI5Button icon="add" design="Default" style={btnStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Responsible:</UI5Label>
          <List separators="None" style={listStyle}>
            {personItem('MH', 'Marcus Holt', 'marcus.holt@globalcorp.com')}
          </List>
        </div>
      </>}

      {/* Objective-specific fields */}
      {isObjective && <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Status:</UI5Label>
          {(() => { const s = item.customChips?.find(c => c.label === 'Status:'); return s ? <SigChipV2 value={s.value} design={s.design as any} leadingIcon={s.leadingIcon} trailingIcon="slim-arrow-down" onClick={() => {}} /> : null; })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Progress:</UI5Label>
          <SigRatingIndicator max={5} filled={Math.round((parseInt(item.customChips?.find(c => c.label === 'Progress:')?.value ?? '0') / 100) * 5)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Due Date:</UI5Label>
          <span style={VALUE_STYLE}>{item.customChips?.find(c => c.label === 'Due:')?.value ?? '—'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Linked Initiatives:</UI5Label>
          <List separators="None" style={listStyle}>
            {assetItem('Initiative', 'AP Automation Rollout', 'Initiative')}
            {assetItem('Initiative', 'Close Cycle Reduction', 'Initiative')}
          </List>
          <UI5Button icon="add" design="Default" style={btnStyle} />
        </div>
      </>}

      {/* Project — shown for all types when set */}
      {item.project && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Project:</UI5Label>
          <SigChipV2 value={item.project} trailingIcon="slim-arrow-down" onClick={() => {}} />
        </div>
      )}

      {/* Department & Region — shown for all types when set */}
      {item.department && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Department:</UI5Label>
          <SigChipV2 value={item.department} trailingIcon="slim-arrow-down" onClick={() => {}} />
        </div>
      )}
      {item.region && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
          <UI5Label>Region:</UI5Label>
          <SigChipV2 value={item.region} trailingIcon="slim-arrow-down" onClick={() => {}} />
        </div>
      )}
    </div>
  );
}

function BpmnDetailPanel({ item, onClose }: { item: BpmnListItem; onClose: () => void }) {
  const domainObj = (item.domainObjectType as any) ?? 'Process Model';
  const typeLabel = item.displayAssetType ?? item.assetType ?? 'BPMN';
  const NavIcon = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {item.avatarColorScheme ? (
        item.avatarIcon ? (
          <div style={{
            width: 26, height: 26, flexShrink: 0,
            borderRadius: item.avatarShape === 'Square' ? 8 : '50%',
            backgroundColor: `var(--sapAvatar_${item.avatarColorScheme.replace('Accent', '')}_Background, #d1efff)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UI5Icon name={AVATAR_ICON_MAP[item.avatarIcon] ?? item.avatarIcon} style={{ width: 14, height: 14, color: `var(--sapAvatar_${item.avatarColorScheme.replace('Accent', '')}_TextColor, #0057d2)` }} />
          </div>
        ) : (
          <Avatar colorScheme={item.avatarColorScheme as any} size="XS" shape={item.avatarShape ?? 'Circle'} initials={item.name.slice(0, 2).toUpperCase()} />
        )
      ) : (
        <SigDomainObject object={domainObj} size="XXS" />
      )}
      <span style={{ fontFamily: "'72', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--sapPageHeader_TextColor, #1d2d3e)' }}>{typeLabel}</span>
    </div>
  );
  NavIcon.displayName = 'NavIcon';

  const OpenBtn = () => <UI5Button design="Emphasized">Open</UI5Button>;
  OpenBtn.displayName = 'OpenBtn';

  const ShareBtn = () => <UI5Button design="Default">Share</UI5Button>;
  ShareBtn.displayName = 'ShareBtn';

  const OverflowBtn = () => <UI5Button icon="overflow" design="Transparent" />;
  OverflowBtn.displayName = 'OverflowBtn';

  return (
    <SigRightSidePanel
      headerTitle={item.name}
      isOpen={true}
      toggleRightSidePanel={onClose}
      navigationSlot={[NavIcon]}
      contentActionsSlot={[OpenBtn, ShareBtn, OverflowBtn]}
      tabSlot={[
        <Tab key="Attributes" text="Attributes"><AttributesTab item={item} /></Tab>,
        <Tab key="Details" text="Details"><DetailsTab item={item} /></Tab>,
        <Tab key="Relations" text="Relations">
          <div style={{ padding: 24, fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82' }}>This tab is not yet available in the prototype.</div>
        </Tab>,
        <Tab key="Activity" text="Activity">
          <div style={{ padding: 24, fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82' }}>This tab is not yet available in the prototype.</div>
        </Tab>,
      ]}
      style={{ width: 480, flexShrink: 0, height: '100%', borderLeft: '1px solid var(--sapList_BorderColor, #e5e5e5)' }}
    >{null}</SigRightSidePanel>
  );
}

// --- BPMN model list ---
const SHOW_MORE_THRESHOLD = 3;

// Map avatarIcon key → registered icon string
const AVATAR_ICON_MAP: Record<string, string> = {
  computer: computerIcon,
  group: groupIcon,
  risk: riskIcon,
  organization: organizationIcon,
  'document-text': 'document-text',
  document: 'document',
  employee: 'employee',
  'key-measure': keyMeasureIcon,
  'metric': metricIcon,
};

function BpmnModelList({ items, selectedItem, onSelect }: { items: BpmnListItem[]; selectedItem: BpmnListItem | null; onSelect: (item: BpmnListItem) => void }) {
  type Group = { label: string | undefined; items: { item: BpmnListItem; idx: number }[] };
  const groups: Group[] = [];
  items.forEach((item, idx) => {
    if (item.groupLabel || groups.length === 0) {
      groups.push({ label: item.groupLabel, items: [] });
    }
    groups[groups.length - 1].items.push({ item, idx });
  });

  const [expandedGroups, setExpandedGroups] = React.useState<Set<number>>(new Set());
  const toggleGroup = (gi: number) => setExpandedGroups(prev => {
    const next = new Set(prev);
    next.has(gi) ? next.delete(gi) : next.add(gi);
    return next;
  });

  const renderItem = (item: BpmnListItem, idx: number) => {
    const isSelected = selectedItem?.name === item.name;
    const domainObj = (item.domainObjectType as any) ?? 'Process Model';
    const assetType = item.displayAssetType ?? item.assetType ?? 'BPMN';
    return (
      <ListItemCustom
        key={idx}
        selected={isSelected}
        type="Active"
        data-idx={idx}
        style={{
          padding: '8px 0',
          '--_ui5-listitemcustom-padding-inline': '0px',
          borderBottom: isSelected
            ? '1px solid var(--sapList_SelectionBorderColor, #0064d9)'
            : '1px solid var(--sapList_BorderColor, #e5e5e5)',
        } as React.CSSProperties}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
      {item.avatarColorScheme ? (
        item.avatarIcon ? (
          <div style={{
            width: 26, height: 26, flexShrink: 0,
            borderRadius: item.avatarShape === 'Square' ? 8 : '50%',
            backgroundColor: `var(--sapAvatar_${item.avatarColorScheme.replace('Accent', '')}_Background, #d1efff)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <UI5Icon name={AVATAR_ICON_MAP[item.avatarIcon!] ?? item.avatarIcon} style={{ width: 14, height: 14, color: `var(--sapAvatar_${item.avatarColorScheme.replace('Accent', '')}_TextColor, #0057d2)` }} />
          </div>
        ) : (
          <Avatar
            colorScheme={item.avatarColorScheme as any}
            size="XS"
            shape={item.avatarShape ?? 'Circle'}
            initials={item.name.slice(0, 2).toUpperCase()}
          />
        )
      ) : (
        <SigDomainObject object={domainObj} size="XXS" />
      )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--sapList_TextColor, #1d2d3e)', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {item.customChips ? (
                  item.customChips.length > 0 ? item.customChips.map(chip => (
                    <SigChipV2
                      key={chip.label}
                      label={chip.label}
                      value={chip.value}
                      condensed
                      {...(chip.design ? { design: chip.design as any } : {})}
                      {...(chip.avatarInitial ? { avatarInitial: chip.avatarInitial } : {})}
                      {...(chip.leadingIcon ? { leadingIcon: chip.leadingIcon === '$published' ? publishedIcon : chip.leadingIcon === '$publishedChanged' ? publishedChangedIcon : chip.leadingIcon === '$processManager' ? processManagerIcon : chip.leadingIcon } : {})}
                    />
                  )) : null
                ) : (
                  <>
                    <SigChipV2 label="Latest Version:" value={item.version} condensed />
                    <SigChipV2
                      label="Status:"
                      value={item.status}
                      design={item.status === 'Published' ? 'indication5' : item.status === 'Modified' ? 'indication7' : 'indication10'}
                      leadingIcon={item.status === 'Published' ? publishedIcon : item.status === 'Modified' ? publishedChangedIcon : 'write-new-document'}
                      condensed
                    />
                    <SigChipV2 label="Process ID:" value={item.processId} condensed />
                  </>
                )}
              </div>
              {item.flagIcon && (
                <UI5Icon name="flag" style={{ color: '#e9730c', width: 14, height: 14, flexShrink: 0 }} title="Changed since last quarter" />
              )}
            </div>
            <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapList_TextColor, #1d2d3e)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.description}
            </p>
            <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: 'var(--sapContent_LabelColor, #556b82)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {domainObj === 'Process Model'
                ? `${assetType} · Created ${item.createdAt} · `
                : `${assetType} · Created ${item.createdAt} · `}
              {item.changedHighlight ? (
                <span style={{ color: 'var(--sapCriticalColor, #e9730c)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <UI5Icon name="flag" style={{ width: 12, height: 12, color: 'var(--sapCriticalColor, #e9730c)', flexShrink: 0 }} />
                  {`Changed ${item.changedAt}`}
                </span>
              ) : `Changed ${item.changedAt}`}
              {domainObj === 'Process Model' && <span>{` · In `}<span style={{ textDecoration: 'underline' }}>{item.folder}</span></span>}
            </p>
          </div>
          <UI5Icon name="slim-arrow-right" style={{ color: 'var(--sapContent_NonInteractiveIconColor, #556b82)', flexShrink: 0, width: 16, height: 16, alignSelf: 'center' }} />
        </div>
      </ListItemCustom>
    );
  };

  const HOP_LABEL_MAP: Record<string, string> = { '1 Hop': '1 Hop', '2 Hops': '2 Hops', '3 Hops': '3 Hops' };

  const renderGroup = (group: Group, gi: number) => {
    const hasLabel = !!group.label;
    const isHopLabel = /^\d+ Hops?$/.test(group.label ?? '');
    const isExpanded = expandedGroups.has(gi);
    const visible = (hasLabel && !isExpanded && !isHopLabel) ? group.items.slice(0, SHOW_MORE_THRESHOLD) : (isHopLabel && !isExpanded) ? group.items.slice(0, 6) : group.items;
    const hidden = group.items.length - (isHopLabel ? 6 : SHOW_MORE_THRESHOLD);
    const content = (
      <>
        {visible.map(({ item, idx }) => renderItem(item, idx))}
        {hasLabel && hidden > 0 && (
          <ListItemCustom type="Inactive" style={{ padding: '8px 16px', '--_ui5-listitemcustom-padding-inline': '0px' } as React.CSSProperties}>
            <UI5Button
              design="Transparent"
             
              onClick={() => toggleGroup(gi)}
            >
              {isExpanded ? 'Show Less' : `Show ${hidden} More`}
            </UI5Button>
          </ListItemCustom>
        )}
      </>
    );
    return hasLabel && !isHopLabel ? (
      <ListItemGroup key={gi} headerText={HOP_LABEL_MAP[group.label!] ?? group.label}>{content}</ListItemGroup>
    ) : (
      <React.Fragment key={gi}>{content}</React.Fragment>
    );
  };

  return (
    <List
      selectionMode="Single"
      separators="None"
      onSelectionChange={(e) => {
        const selected = (e.detail as any).selectedItems?.[0];
        if (selected) {
          const idx = parseInt(selected.dataset.idx, 10);
          if (!isNaN(idx)) onSelect(items[idx]);
        }
      }}
      style={{ width: '100%', maxWidth: 1040, overflow: 'hidden' }}
    >
      {groups.map((group, gi) => renderGroup(group, gi))}
    </List>
  );
}

// --- Quick reply chips shown after assistant messages ---
function QuickReplies({ prompts, onSelect }: { prompts: string[]; onSelect: (p: string) => void }) {

  return (
    <div className="flex flex-wrap" style={{ gap: 8, maxWidth: 720 }}>
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => onSelect(p)}
          className="px-4 py-2 rounded-2xl text-sm transition-all"
          style={{
            backgroundColor: '#eae5ff',
            color: '#5d36ff',
            fontFamily: "'72', sans-serif",
            fontSize: 14,
            whiteSpace: 'nowrap',
            border: '1px solid transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5d36ff'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'; }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// --- Message action buttons ---
function MessageActions({ visible }: { visible: boolean }) {
  return (
    <div
      className="flex items-center"
      style={{ gap: 2, paddingTop: 4, opacity: visible ? 1 : 0, transition: 'opacity 0.15s' }}
    >
      {[
        { icon: <Copy size={14} />, title: 'Copy' },
        { icon: <ThumbsUp size={14} />, title: 'Good response' },
        { icon: <ThumbsDown size={14} />, title: 'Bad response' },
      ].map(({ icon, title }) => (
        <button
          key={title}
          title={title}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(93,54,255,0.08)]"
          style={{ color: '#758ca4' }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

// --- Typing indicator ---
function TypingIndicator() {
  return (
    <div className="flex items-center" style={{ gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            backgroundColor: '#5d36ff',
            animation: `pcaBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pcaBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// --- Single message bubble ---
function MessageBubble({ msg, isLast, breakoutMargin, onQuickReply, selectedBpmnItem, onSelectBpmnItem, canvasOpen, onOpenCanvas, selectedPanelItem, onSelectPanelItem, panelOpen }: { msg: ChatMessage; isLast: boolean; breakoutMargin: number; onQuickReply: (p: string) => void; selectedBpmnItem: BpmnListItem | null; onSelectBpmnItem: (item: BpmnListItem) => void; canvasOpen?: boolean; onOpenCanvas?: () => void; selectedPanelItem?: PanelListItem | null; onSelectPanelItem?: (item: PanelListItem) => void; panelOpen?: boolean }) {
  const [listView, setListView] = useState<'list' | 'graph'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');
  const [saveViewDesc, setSaveViewDesc] = useState('');
  const [hovered, setHovered] = useState(false);

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end" style={{ maxWidth: 720, width: '100%', paddingLeft: 80 }}>
        <div
          style={{
            backgroundColor: '#eae5ff',
            borderRadius: '16px 4px 16px 16px',
            padding: '8px 16px',
            maxWidth: '100%',
          }}
        >
          <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e', lineHeight: '21px', margin: 0 }}>
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant
  return (
    <div
      className="flex flex-col"
      style={{ maxWidth: 1040, width: '100%', gap: 12 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {msg.thinking && msg.thinking.length > 0 && (
        <div style={{ marginBottom: -12, maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <ThinkingToggle steps={msg.thinking} />
        </div>
      )}
      {msg.tableData ? (
        <>
          {msg.content && (
            <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
              <MarkdownMessage content={msg.content} />
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <StructuredTable data={msg.tableData} breakoutMargin={breakoutMargin} />
          </div>
        </>
      ) : (
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <MarkdownMessage content={msg.content} />
        </div>
      )}
      {msg.widgets && msg.widgets.length > 0 && (
        <WidgetGrid widgets={msg.widgets} breakoutMargin={breakoutMargin} />
      )}
      {msg.mcpDisplayMode === 'widget' && (
        <div style={{ maxWidth: 1040, width: '100%', margin: '0 auto' }}>
          <p style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#556b82', marginBottom: 8 }}>
            Widget · 3 embedded data cards
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: '1 1 200px', height: 200, backgroundColor: '#d9d9d9', borderRadius: 16 }} />
            ))}
          </div>
        </div>
      )}
      {msg.mcpDisplayMode === 'applet' && (
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <p style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#556b82', marginBottom: 8 }}>
            Applet · embedded mini-application
          </p>
          <div style={{ height: 360, backgroundColor: '#d9d9d9', borderRadius: 16 }} />
        </div>
      )}
      {msg.mcpDisplayMode === 'canvas' && (
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 12,
              border: canvasOpen ? '2px solid #5d36ff' : '2px solid #e5e5e5',
              backgroundColor: canvasOpen ? '#f3f0ff' : '#fafafa',
              transition: 'border-color 0.15s, background-color 0.15s',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#d9d9d9', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 600, color: '#1d2d3e', margin: 0, lineHeight: '20px' }}>
                  Canvas
                </p>
                <p style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#556b82', margin: 0, lineHeight: '18px' }}>
                  {canvasOpen ? 'Open in canvas view' : 'Canvas view · closed'}
                </p>
              </div>
            </div>
            {!canvasOpen && (
              <button
                onClick={onOpenCanvas}
                style={{
                  flexShrink: 0,
                  padding: '5px 14px',
                  borderRadius: 8,
                  border: '1px solid #5d36ff',
                  backgroundColor: 'white',
                  color: '#5d36ff',
                  fontFamily: "'72', sans-serif",
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'background-color 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f3f0ff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white' }}
              >
                Open
              </button>
            )}
          </div>
        </div>
      )}
      {msg.mcpDisplayMode === 'panel' && msg.panelItems && msg.panelItems.length > 0 && (
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {msg.panelItems.map((item) => {
            const isSelected = selectedPanelItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectPanelItem?.(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: isSelected ? '2px solid #5d36ff' : '2px solid #e5e5e5',
                  backgroundColor: isSelected ? '#f3f0ff' : '#fafafa',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  gap: 12,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#c4b5fd'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e5e5'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: isSelected ? '#c4b5fd' : '#d9d9d9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UI5Icon name="document-text" style={{ fontSize: 18, color: isSelected ? '#5d36ff' : '#556b82' } as React.CSSProperties} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, fontWeight: 600, color: '#1d2d3e', margin: 0, lineHeight: '20px' }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#556b82', margin: 0, lineHeight: '18px' }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {isSelected && panelOpen && (
                    <span style={{ fontFamily: "'72', sans-serif", fontSize: 12, color: '#5d36ff' }}>Open in panel</span>
                  )}
                  {(!isSelected || !panelOpen) && (
                    <UI5Icon name="slim-arrow-right" style={{ fontSize: 14, color: isSelected ? '#5d36ff' : '#8696a9' } as React.CSSProperties} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {msg.crossGraphEnabled && msg.bpmnList && msg.bpmnList.length > 0 && (() => {
        const DIRECTION_LABEL: Record<string, string> = {
          top: 'Parent Processes',
          bottom: 'Sub-Processes',
          left: 'Predecessor Processes',
          right: 'Successor Processes',
        };
        const DIRECTION_ORDER = ['top', 'bottom', 'left', 'right'];
        const q = searchQuery.trim().toLowerCase();
        const crossItems = DIRECTION_ORDER.flatMap(dir =>
          msg.bpmnList!
            .filter(i => i.direction === dir)
            .filter(i => !q || i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q))
            .map((i, idx) => ({ ...i, groupLabel: idx === 0 ? DIRECTION_LABEL[dir] : undefined }))
        );
        return (
          <>
          <div style={listView === 'list' ? { border: '1px solid var(--sapList_BorderColor, #e5e5e5)', borderRadius: 16, overflow: 'hidden' } : undefined}>
          <SigTableWrapper
            activeView={listView === 'graph' ? 'card' : 'table'}
            searchSlot={
              <ToolbarItem>
                <Input placeholder="Search" icon={<UI5Icon name="search" />} value={searchQuery} onInput={(e) => setSearchQuery((e.target as unknown as HTMLInputElement).value)} style={{ width: 200 } as React.CSSProperties} />
              </ToolbarItem>
            }
            businessActionsSlot={
              <ToolbarItem>
                <UI5Button design="Default" onClick={() => { setSaveViewName(msg.graphCenterNodeName === 'Purchase Order Creation' ? 'PO Creation Overlap' : ''); setSaveDialogOpen(true); }}>Save View</UI5Button>
              </ToolbarItem>
            }
            exportActionsSlot={
              <ToolbarItem>
                <SegmentedButton onSelectionChange={(e) => {
                  const text = (e.detail as any).selectedItems?.[0]?.textContent?.trim();
                  if (text === 'List') setListView('list');
                  else if (text === 'Graph') setListView('graph');
                }}>
                  <SegmentedButtonItem selected={listView === 'list'}>List</SegmentedButtonItem>
                  <SegmentedButtonItem selected={listView === 'graph'}>Graph</SegmentedButtonItem>
                </SegmentedButton>
              </ToolbarItem>
            }
          >
            {listView === 'list' ? (
              <BpmnModelList items={crossItems} selectedItem={selectedBpmnItem} onSelect={onSelectBpmnItem} />
            ) : (
              <PCACrossGraph items={crossItems} centerNodeName={msg.graphCenterNodeName ?? 'Employee Onboarding'} onSelectNode={(item) => item && onSelectBpmnItem(item)} />
            )}
          </SigTableWrapper>
          </div>
          <Dialog open={saveDialogOpen} headerText="Save View" onClose={() => setSaveDialogOpen(false)}
            footer={<UI5Bar className="save-view-footer-bar" endContent={<><UI5Button design="Emphasized" disabled={!saveViewName.trim()} onClick={() => setSaveDialogOpen(false)}>Save</UI5Button><UI5Button design="Transparent" onClick={() => setSaveDialogOpen(false)}>Cancel</UI5Button></>} />}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 400 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <UI5Label required style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e' } as React.CSSProperties}>Name</UI5Label>
                <Input placeholder="Enter view name" value={saveViewName} onInput={(e) => setSaveViewName((e.target as unknown as HTMLInputElement).value)} style={{ width: '100%' } as React.CSSProperties} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <UI5Label style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e' } as React.CSSProperties}>Description</UI5Label>
                <TextArea placeholder="Enter a description (optional)" value={saveViewDesc} onInput={(e) => setSaveViewDesc((e.target as unknown as HTMLTextAreaElement).value)} rows={3} style={{ width: '100%' } as React.CSSProperties} />
              </div>
              <MessageStrip design="Information" hideCloseButton>
                You can find saved views in the <strong>Repository</strong> side navigation under "Pinned Views"
              </MessageStrip>
            </div>
          </Dialog>
          </>
        );
      })()}
      {!msg.crossGraphEnabled && msg.bpmnList && msg.bpmnList.length > 0 && (() => {
        const q = searchQuery.trim().toLowerCase();
        const filteredList = q
          ? msg.bpmnList.filter(i => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q))
          : msg.bpmnList;
        const graphSource = msg.graphBpmnList ?? msg.bpmnList;
        const filteredGraph = q
          ? graphSource.filter(i => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q))
          : graphSource;
        return (
        <>
        <div style={listView !== 'graph' ? { border: '1px solid var(--sapList_BorderColor, #e5e5e5)', borderRadius: 16, overflow: 'hidden' } : undefined}>
        <SigTableWrapper
          activeView={msg.graphEnabled && listView === 'graph' ? 'card' : 'table'}
          searchSlot={
            <ToolbarItem>
              <Input
                placeholder="Search"
                icon={<UI5Icon name="search" />}
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as unknown as HTMLInputElement).value)}
                style={{ width: 200 } as React.CSSProperties}
              />
            </ToolbarItem>
          }
          businessActionsSlot={
            <ToolbarItem>
              <UI5Button design="Default" onClick={() => setSaveDialogOpen(true)}>Save View</UI5Button>
            </ToolbarItem>
          }
          exportActionsSlot={msg.graphEnabled ? (
            <ToolbarItem>
              <SegmentedButton
                onSelectionChange={(e) => {
                  const text = (e.detail as any).selectedItems?.[0]?.textContent?.trim();
                  if (text === 'List' || text === 'Table') setListView('list');
                  else if (text === 'Graph') setListView('graph');
                }}
              >
                <SegmentedButtonItem selected={listView === 'list'}>{msg.tableEnabled ? 'Table' : 'List'}</SegmentedButtonItem>
                <SegmentedButtonItem selected={listView === 'graph'}>Graph</SegmentedButtonItem>
              </SegmentedButton>
            </ToolbarItem>
          ) : undefined}
        >
          {listView === 'list' || !msg.graphEnabled ? (
            msg.tableEnabled
              ? <InitiativeTable items={filteredList} selectedItem={selectedBpmnItem} onSelect={onSelectBpmnItem} />
              : msg.treeListEnabled
              ? <BpmnTreeList items={filteredList} selectedItem={selectedBpmnItem} onSelect={onSelectBpmnItem} />
              : <BpmnModelList items={filteredList} selectedItem={selectedBpmnItem} onSelect={onSelectBpmnItem} />
          ) : (
            <PCAGraphView items={filteredGraph} centerNodeName={msg.graphCenterNodeName} centerFlagged={msg.graphCenterFlagged} centerWarning={msg.graphCenterWarning} layout={msg.graphLayout as any} onSelectNode={(item) => item && onSelectBpmnItem(item)} />
          )}
        </SigTableWrapper>
        </div>
        <Dialog
          open={saveDialogOpen}
          headerText="Save View"
          onClose={() => setSaveDialogOpen(false)}
          footer={
            <UI5Bar
              className="save-view-footer-bar"
              endContent={
                <>
                  <UI5Button
                    design="Emphasized"
                    disabled={!saveViewName.trim()}
                    onClick={() => setSaveDialogOpen(false)}
                  >
                    Save
                  </UI5Button>
                  <UI5Button design="Transparent" onClick={() => setSaveDialogOpen(false)}>Cancel</UI5Button>
                </>
              }
            />
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 400 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <UI5Label required style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e' } as React.CSSProperties}>Name</UI5Label>
              <Input
                placeholder="Enter view name"
                value={saveViewName}
                onInput={(e) => setSaveViewName((e.target as unknown as HTMLInputElement).value)}
                style={{ width: '100%' } as React.CSSProperties}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <UI5Label style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#1d2d3e' } as React.CSSProperties}>Description</UI5Label>
              <TextArea
                placeholder="Enter a description (optional)"
                value={saveViewDesc}
                onInput={(e) => setSaveViewDesc((e.target as unknown as HTMLTextAreaElement).value)}
                rows={3}
                style={{ width: '100%' } as React.CSSProperties}
              />
            </div>
            <MessageStrip design="Information" hideCloseButton>
              You can find saved views in the <strong>Repository</strong> side navigation under "Pinned Views"
            </MessageStrip>
          </div>
        </Dialog>
        </>
        );
      })()}
      {msg.closingText && (
        <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <MarkdownMessage content={msg.closingText} />
        </div>
      )}
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
        <MessageActions visible={isLast || hovered} />
      </div>
      {isLast && msg.followUpPrompts && msg.followUpPrompts.length > 0 && (
        <div style={{ marginTop: 20, maxWidth: 720, width: '100%', margin: '20px auto 0' }}>
          <QuickReplies prompts={msg.followUpPrompts} onSelect={onQuickReply} />
        </div>
      )}
    </div>
  );
}



export function PCAConversationPage() {
  const { getActiveConversation, sendMessage, isTyping, sidebarOpen, setSidebarOpen, createConversation } = usePCA();
  const conversation = getActiveConversation();
  const [contentWidth, setContentWidth] = useState(0);
  const [selectedBpmnItem, setSelectedBpmnItem] = useState<BpmnListItem | null>(null);
  const lastUserMsgRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevMsgCountRef = useRef(0);
  const prevIsTypingRef = useRef(false);
  const [panelWidth, setPanelWidth] = useState(360);
  const panelDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasFlex, setCanvasFlex] = useState(2);
  const canvasDragRef = useRef<{ startX: number; startFlex: number; totalWidth: number } | null>(null);
  const [mcpDismissedMsgId, setMcpDismissedMsgId] = useState<string | null>(null);
  const [selectedPanelItem, setSelectedPanelItem] = useState<PanelListItem | null>(null);

  // Measure scroll container inner width to compute safe table breakout
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContentWidth(entries[0].contentRect.width);
    });
    ro.observe(scrollContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-focus textarea when conversation becomes active
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversation?.id]);

  // Reset info strip when switching conversations
  useEffect(() => {
  }, [conversation?.id]);

  useEffect(() => {
    const msgs = conversation?.messages ?? [];
    const msgCountChanged = msgs.length !== prevMsgCountRef.current;
    const typingJustStopped = prevIsTypingRef.current && !isTyping;

    // Scroll the last user message to the top of the viewport when:
    // - User sends a new message (show their question + typing indicator below)
    // - AI finishes responding (show their question + start of the reply)
    if ((msgCountChanged || typingJustStopped) && lastUserMsgRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const el = lastUserMsgRef.current;
      // rAF ensures the new message is painted before we measure
      requestAnimationFrame(() => {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - 12;
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      });
    }

    prevMsgCountRef.current = msgs.length;
    prevIsTypingRef.current = isTyping;
  }, [conversation?.messages, isTyping]);


  if (!conversation) return null;

  const messages = conversation.messages;
  const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const lastAssistantIdx = lastAssistantIndex === -1 ? -1 : messages.length - 1 - lastAssistantIndex;
  const lastAssistantMsg = lastAssistantIdx >= 0 ? messages[lastAssistantIdx] : null;
  const activeMcpMode = lastAssistantMsg && lastAssistantMsg.id !== mcpDismissedMsgId
    ? (lastAssistantMsg.mcpDisplayMode ?? null)
    : null;

  // How far the table can break out of the 720px column on each side.
  // contentWidth is the scroll container's inner width (excludes its 32px padding).
  // We leave 24px of breathing room from each edge → safe_space = 24px.
  const breakoutMargin = contentWidth > 720 + 48
    ? Math.min(160, (contentWidth - 720 - 48) / 2)
    : 0;

  const startPanelDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    panelDragRef.current = { startX: e.clientX, startWidth: panelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!panelDragRef.current) return;
      const delta = panelDragRef.current.startX - ev.clientX;
      setPanelWidth(Math.max(200, Math.min(800, panelDragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      panelDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startCanvasDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const totalWidth = containerRef.current?.offsetWidth ?? 0;
    canvasDragRef.current = { startX: e.clientX, startFlex: canvasFlex, totalWidth };
    const onMove = (ev: MouseEvent) => {
      if (!canvasDragRef.current) return;
      const { startX, startFlex, totalWidth: tw } = canvasDragRef.current;
      const delta = ev.clientX - startX;
      // chat is flex 1, canvas is canvasFlex; total flex = 1 + canvasFlex
      // deltaFlex = delta / tw * (1 + canvasFlex)
      const totalFlex = 1 + startFlex;
      const deltaFlex = (delta / tw) * totalFlex * -1;
      setCanvasFlex(Math.max(0.5, Math.min(5, startFlex + deltaFlex)));
    };
    const onUp = () => {
      canvasDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden" style={{ backgroundColor: 'white' }}>
      {/* Main conversation column — narrows to flex:1 in canvas mode */}
      <div
        className="flex flex-col min-w-0 overflow-hidden"
        style={{ flex: activeMcpMode === 'canvas' ? 1 : '1 1 0%' }}
      >
        {/* Header */}
        <div className="flex items-center shrink-0 px-4" style={{ height: 72, position: 'relative' }}>
          {!sidebarOpen && (
            <div className="flex items-center" style={{ gap: 8 }}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#eae5ff', border: '1px solid transparent', cursor: 'pointer' }}
                title="Open sidebar"
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff' }}
              >
                <PanelLeftOpen size={16} color="#5d36ff" />
              </button>
              <button
                onClick={createConversation}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{ width: 36, height: 36, flexShrink: 0, backgroundColor: '#eae5ff', border: '1px solid transparent', cursor: 'pointer' }}
                title="New Conversation"
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(93,54,255,0.25)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eae5ff' }}
              >
                <Plus size={16} color="#5d36ff" />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden" style={{ position: 'relative' }}>
          <div className="flex flex-col items-center" style={{ gap: 32, padding: '12px 32px 80px' }}>
            {messages.map((msg, i) => {
              const isLastUser = msg.role === 'user' && messages.slice(i + 1).every((m) => m.role === 'assistant');
              return (
                <div key={msg.id} ref={isLastUser ? lastUserMsgRef : undefined} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <MessageBubble
                    msg={msg}
                    isLast={i === lastAssistantIdx && !isTyping}
                    breakoutMargin={breakoutMargin}
                    onQuickReply={(p) => sendMessage(p)}
                    selectedBpmnItem={selectedBpmnItem}
                    onSelectBpmnItem={setSelectedBpmnItem}
                    canvasOpen={msg.mcpDisplayMode === 'canvas' && activeMcpMode === 'canvas'}
                    onOpenCanvas={() => setMcpDismissedMsgId(null)}
                    selectedPanelItem={msg.mcpDisplayMode === 'panel' ? selectedPanelItem : null}
                    onSelectPanelItem={(item) => { setSelectedPanelItem(item); setMcpDismissedMsgId(null); }}
                    panelOpen={msg.mcpDisplayMode === 'panel' && activeMcpMode === 'panel'}
                  />
                </div>
              );
            })}
            {isTyping && (
              <div className="flex flex-col" style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
                <TypingIndicator />
              </div>
            )}
          </div>
          <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(to bottom, rgba(255,255,255,0), white)', pointerEvents: 'none' }} />
        </div>

        {/* Input area */}
        <div className="flex flex-col items-center shrink-0 pb-8" style={{ paddingLeft: 32, paddingRight: 32 }}>
          <PCAInputField ref={textareaRef} onSend={sendMessage} dropdownUp />
        </div>
      </div>

      {/* Canvas panel — 2/3 split, resizable */}
      {activeMcpMode === 'canvas' && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={startCanvasDrag}
            style={{
              width: 4,
              flexShrink: 0,
              backgroundColor: '#d9d9d9',
              cursor: 'col-resize',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#5d36ff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#d9d9d9' }}
          />
          <div
            style={{
              flex: canvasFlex,
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              overflow: 'hidden',
              padding: 16,
            }}
          >
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#d9d9d9', borderRadius: 16 }} />
              <button
                onClick={() => lastAssistantMsg && setMcpDismissedMsgId(lastAssistantMsg.id)}
                title="Close canvas"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 16,
                  lineHeight: 1,
                  fontFamily: 'sans-serif',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.32)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.18)' }}
              >
                ×
              </button>
            </div>
          </div>
        </>
      )}

      {/* MCP side panel — SigRightSidePanel, resizable */}
      {activeMcpMode === 'panel' && (
        <>
          {/* Drag handle */}
          <div
            onMouseDown={startPanelDrag}
            style={{
              width: 4,
              flexShrink: 0,
              backgroundColor: '#d9d9d9',
              cursor: 'col-resize',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#5d36ff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#d9d9d9' }}
          />
          <div style={{ width: panelWidth, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <SigRightSidePanel
              headerTitle={selectedPanelItem?.title ?? 'Panel'}
              isOpen={true}
              toggleRightSidePanel={() => { if (lastAssistantMsg) { setMcpDismissedMsgId(lastAssistantMsg.id); setSelectedPanelItem(null); } }}
              style={{ width: '100%', height: '100%' }}
            >
              {selectedPanelItem ? (
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82', margin: 0 }}>
                    {selectedPanelItem.subtitle}
                  </p>
                  <div style={{ height: 120, backgroundColor: '#f0f0f0', borderRadius: 8 }} />
                  <div style={{ height: 80, backgroundColor: '#f0f0f0', borderRadius: 8 }} />
                  <div style={{ height: 80, backgroundColor: '#f0f0f0', borderRadius: 8 }} />
                </div>
              ) : (
                <div style={{ padding: '1rem' }}>
                  <p style={{ fontFamily: "'72', sans-serif", fontSize: 14, color: '#556b82', margin: 0 }}>
                    Select an item from the chat to view details here.
                  </p>
                </div>
              )}
            </SigRightSidePanel>
          </div>
        </>
      )}

      {/* BPMN detail panel */}
      {selectedBpmnItem && (
        <BpmnDetailPanel item={selectedBpmnItem} onClose={() => setSelectedBpmnItem(null)} />
      )}
    </div>
  );
}
