// Inline SVG converted from src/models/EntryDiagram.svg
// CSS class names are prefixed with "ed-" to avoid collisions when inlined into the page DOM.
import type { MouseEvent } from 'react'

interface EntryDiagramSVGProps {
  onShapeClick?: (title: string, index: number) => void
}

export function EntryDiagramSVG({ onShapeClick }: EntryDiagramSVGProps) {
  const sh = (title: string, index: number) =>
    onShapeClick
      ? { onClick: (e: MouseEvent) => { e.stopPropagation(); onShapeClick(title, index) } }
      : {}

  return (
    <svg width="100%" viewBox="0 0 1600 696" style={{ maxWidth: '1600px' }}>
      <style>{`
        .ed-section-title { font-size: 15px; font-weight: bold; fill: #1D2D3E; font-family: '72', sans-serif; }
        .ed-lane-title { font-size: 13px; font-weight: bold; fill: #1D2D3E; font-family: '72', sans-serif; }
        .ed-chevron { fill: #3992a8; stroke: transparent; stroke-width: 3; cursor: pointer; }
        .ed-label { display: flex; align-items: center; justify-content: center; height: 100%; padding: 0 10px; text-align: center; font-size: 14px; color: white; font-family: '72', sans-serif; }
        .ed-box-card { fill: white; stroke: #D8DCE0; stroke-width: 1; }
        .ed-box-title { display: flex; align-items: center; justify-content: center; height: 100%; padding: 0 6px; text-align: center; font-size: 14px; font-weight: bold; color: white; font-family: '72', sans-serif; }
        .ed-box-items { display: flex; flex-direction: column; height: 100%; padding: 0; text-align: center; font-size: 13px; font-family: '72', sans-serif; }
        .ed-box-items span { display: flex; align-items: center; justify-content: center; padding: 0 8px; height: 27px; flex-shrink: 0; border-bottom: 1px solid #E8EAED; }
        foreignObject { pointer-events: none; }
        .ed-chevron:hover { stroke: #0044cc; stroke-width: 3; }
        .ed-box-hover { fill: none; pointer-events: all; stroke: none; cursor: pointer; }
        .ed-box-hover:hover { stroke: #0044cc; stroke-width: 3; }
      `}</style>

      <text x="20" y="30" className="ed-lane-title">Market to Demand</text>
      <polygon className="ed-chevron" points="20,37 220,37 240,62 220,87 20,87" {...sh('Strategy and Planning', 1)}/>
      <foreignObject x="24" y="37" width="191" height="50"><div className="ed-label">Strategy and Planning</div></foreignObject>
      <polygon className="ed-chevron" points="224,37 424,37 444,62 424,87 224,87 244,62" {...sh('Product Marketing', 2)}/>
      <foreignObject x="246" y="37" width="172" height="50"><div className="ed-label">Product Marketing</div></foreignObject>
      <polygon className="ed-chevron" points="428,37 628,37 648,62 628,87 428,87 448,62" {...sh('Campaign Management', 3)}/>
      <foreignObject x="450" y="37" width="172" height="50"><div className="ed-label">Campaign Management</div></foreignObject>

      <text x="20" y="122" className="ed-lane-title">Idea to Launch</text>
      <polygon className="ed-chevron" points="20,129 220,129 240,154 220,179 20,179" {...sh('Strategy and Portfolio Management', 4)}/>
      <foreignObject x="24" y="129" width="191" height="50"><div className="ed-label">Strategy and Portfolio Management</div></foreignObject>
      <polygon className="ed-chevron" points="224,129 424,129 444,154 424,179 224,179 244,154" {...sh('Product Design and Development', 5)}/>
      <foreignObject x="246" y="129" width="172" height="50"><div className="ed-label">Product Design and Development</div></foreignObject>
      <polygon className="ed-chevron" points="428,129 628,129 648,154 628,179 428,179 448,154" {...sh('Product Introduction', 6)}/>
      <foreignObject x="450" y="129" width="172" height="50"><div className="ed-label">Product Introduction</div></foreignObject>
      <polygon className="ed-chevron" points="632,129 832,129 852,154 832,179 632,179 652,154" {...sh('Packaging and Pricing', 7)}/>
      <foreignObject x="654" y="129" width="172" height="50"><div className="ed-label">Packaging and Pricing</div></foreignObject>

      <text x="20" y="214" className="ed-lane-title">Lead to Order</text>
      <polygon className="ed-chevron" points="20,221 220,221 240,246 220,271 20,271" {...sh('Lead and Opp Management', 8)}/>
      <foreignObject x="24" y="221" width="191" height="50"><div className="ed-label">Lead and Opp Management</div></foreignObject>
      <polygon className="ed-chevron" points="224,221 424,221 444,246 424,271 224,271 244,246" {...sh('Deal Management', 9)}/>
      <foreignObject x="246" y="221" width="172" height="50"><div className="ed-label">Deal Management</div></foreignObject>
      <polygon className="ed-chevron" points="428,221 628,221 648,246 628,271 428,271 448,246" {...sh('Digital Sales', 10)}/>
      <foreignObject x="450" y="221" width="172" height="50"><div className="ed-label">Digital Sales</div></foreignObject>
      <polygon className="ed-chevron" points="632,221 832,221 852,246 832,271 632,271 652,246" {...sh('Quotes and Prices', 11)}/>
      <foreignObject x="654" y="221" width="172" height="50"><div className="ed-label">Quotes and Prices</div></foreignObject>

      <text x="20" y="306" className="ed-lane-title">Order to Cash</text>
      <polygon className="ed-chevron" points="20,313 220,313 240,338 220,363 20,363" {...sh('Order Management', 12)}/>
      <foreignObject x="24" y="313" width="191" height="50"><div className="ed-label">Order Management</div></foreignObject>
      <polygon className="ed-chevron" points="224,313 424,313 444,338 424,363 224,363 244,338" {...sh('Credit Management', 13)}/>
      <foreignObject x="246" y="313" width="172" height="50"><div className="ed-label">Credit Management</div></foreignObject>
      <polygon className="ed-chevron" points="428,313 628,313 648,338 628,363 428,363 448,338" {...sh('Order Fulfillment', 14)}/>
      <foreignObject x="450" y="313" width="172" height="50"><div className="ed-label">Order Fulfillment</div></foreignObject>
      <polygon className="ed-chevron" points="632,313 832,313 852,338 832,363 632,363 652,338" {...sh('Product Shipping', 15)}/>
      <foreignObject x="654" y="313" width="172" height="50"><div className="ed-label">Product Shipping</div></foreignObject>
      <polygon className="ed-chevron" points="836,313 1036,313 1056,338 1036,363 836,363 856,338" {...sh('Invoicing', 16)}/>
      <foreignObject x="858" y="313" width="172" height="50"><div className="ed-label">Invoicing</div></foreignObject>
      <polygon className="ed-chevron" points="1040,313 1240,313 1260,338 1240,363 1040,363 1060,338" {...sh('Accounts Receivables', 17)}/>
      <foreignObject x="1062" y="313" width="172" height="50"><div className="ed-label">Accounts Receivables</div></foreignObject>
      <polygon className="ed-chevron" points="1244,313 1444,313 1464,338 1444,363 1244,363 1264,338" {...sh('Collection Management', 18)}/>
      <foreignObject x="1266" y="313" width="172" height="50"><div className="ed-label">Collection Management</div></foreignObject>

      <text x="20" y="398" className="ed-lane-title">Adoption to Retention</text>
      <polygon className="ed-chevron" points="20,405 220,405 240,430 220,455 20,455" {...sh('Customer Analytics', 19)}/>
      <foreignObject x="24" y="405" width="191" height="50"><div className="ed-label">Customer Analytics</div></foreignObject>
      <polygon className="ed-chevron" points="224,405 424,405 444,430 424,455 224,455 244,430" {...sh('Customer Success', 20)}/>
      <foreignObject x="246" y="405" width="172" height="50"><div className="ed-label">Customer Success</div></foreignObject>
      <polygon className="ed-chevron" points="428,405 628,405 648,430 628,455 428,455 448,430" {...sh('Customer Experience Management', 21)}/>
      <foreignObject x="450" y="405" width="172" height="50"><div className="ed-label">Customer Experience Management</div></foreignObject>

      <text x="20" y="523" className="ed-section-title">Enterprise Management</text>

      <rect className="ed-box-card" x="20" y="535" width="210" height="140" rx="4"/>
      <rect x="20" y="535" width="210" height="30" rx="4" fill="#00a08b"/>
      <rect x="20" y="550" width="210" height="15" fill="#00a08b"/>
      <foreignObject x="20" y="535" width="210" height="30"><div className="ed-box-title">Sales</div></foreignObject>
      <foreignObject x="20" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#00a08b' }}><span>GTM Strategy</span><span>Sales Strategy</span><span>Sales Enablement</span></div></foreignObject>

      <rect className="ed-box-card" x="240" y="535" width="210" height="140" rx="4"/>
      <rect x="240" y="535" width="210" height="30" rx="4" fill="#188894"/>
      <rect x="240" y="550" width="210" height="15" fill="#188894"/>
      <foreignObject x="240" y="535" width="210" height="30"><div className="ed-box-title">Channel Management</div></foreignObject>
      <foreignObject x="240" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#188894' }}><span>Partner Program</span><span>Ecosystem Management</span></div></foreignObject>

      <rect className="ed-box-card" x="460" y="535" width="210" height="140" rx="4"/>
      <rect x="460" y="535" width="210" height="30" rx="4" fill="#30709E"/>
      <rect x="460" y="550" width="210" height="15" fill="#30709E"/>
      <foreignObject x="460" y="535" width="210" height="30"><div className="ed-box-title">Procure to Pay</div></foreignObject>
      <foreignObject x="460" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#30709E' }}><span>Requirement Management</span><span>Purchasing</span><span>Invoicing</span><span style={{ borderBottom: 'none' }}>Payment</span></div></foreignObject>

      <rect className="ed-box-card" x="680" y="535" width="210" height="140" rx="4"/>
      <rect x="680" y="535" width="210" height="30" rx="4" fill="#4858A7"/>
      <rect x="680" y="550" width="210" height="15" fill="#4858A7"/>
      <foreignObject x="680" y="535" width="210" height="30"><div className="ed-box-title">Finance</div></foreignObject>
      <foreignObject x="680" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#4858A7' }}><span>Accounting &amp; Month-End Close</span><span>Finance Operations</span><span>Treasury Management</span><span style={{ borderBottom: 'none' }}>Real Estate Management</span></div></foreignObject>

      <rect className="ed-box-card" x="900" y="535" width="210" height="140" rx="4"/>
      <rect x="900" y="535" width="210" height="30" rx="4" fill="#6040B0"/>
      <rect x="900" y="550" width="210" height="15" fill="#6040B0"/>
      <foreignObject x="900" y="535" width="210" height="30"><div className="ed-box-title">Legal</div></foreignObject>
      <foreignObject x="900" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#6040B0' }}><span>Contract Management</span><span>Compliance</span></div></foreignObject>

      <rect className="ed-box-card" x="1120" y="535" width="210" height="140" rx="4"/>
      <rect x="1120" y="535" width="210" height="30" rx="4" fill="#7830A8"/>
      <rect x="1120" y="550" width="210" height="15" fill="#7830A8"/>
      <foreignObject x="1120" y="535" width="210" height="30"><div className="ed-box-title">Hire to Retire</div></foreignObject>
      <foreignObject x="1120" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#7830A8' }}><span>Talent Acquisition</span><span>Contract Management</span><span>Culture</span></div></foreignObject>

      <rect className="ed-box-card" x="1340" y="535" width="210" height="140" rx="4"/>
      <rect x="1340" y="535" width="210" height="30" rx="4" fill="#3C2C44"/>
      <rect x="1340" y="550" width="210" height="15" fill="#3C2C44"/>
      <foreignObject x="1340" y="535" width="210" height="30"><div className="ed-box-title">Issue to Resolution</div></foreignObject>
      <foreignObject x="1340" y="565" width="210" height="110"><div className="ed-box-items" style={{ color: '#3C2C44' }}><span>Customer Care</span><span>Tech Support</span></div></foreignObject>

      <rect className="ed-box-hover" x="20"   y="535" width="210" height="140" rx="4" {...sh('Sales', 22)}/>
      <rect className="ed-box-hover" x="240"  y="535" width="210" height="140" rx="4" {...sh('Channel Management', 23)}/>
      <rect className="ed-box-hover" x="460"  y="535" width="210" height="140" rx="4" {...sh('Procure to Pay', 24)}/>
      <rect className="ed-box-hover" x="680"  y="535" width="210" height="140" rx="4" {...sh('Finance', 25)}/>
      <rect className="ed-box-hover" x="900"  y="535" width="210" height="140" rx="4" {...sh('Legal', 26)}/>
      <rect className="ed-box-hover" x="1120" y="535" width="210" height="140" rx="4" {...sh('Hire to Retire', 27)}/>
      <rect className="ed-box-hover" x="1340" y="535" width="210" height="140" rx="4" {...sh('Issue to Resolution', 28)}/>
    </svg>
  )
}
