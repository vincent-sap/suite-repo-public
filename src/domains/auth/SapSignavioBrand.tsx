export default function SapSignavioBrand({ height = 32 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="https://www.sap.com/content/dam/application/shared/logos/sap-logo-svg.svg"
        alt="SAP"
        style={{ height, width: 'auto' }}
      />
      <span style={{
        fontSize: height * 0.6,
        fontWeight: 600,
        color: '#002A86',
        fontFamily: 'var(--sapFontFamily, "72", Arial, sans-serif)',
        letterSpacing: 0,
        lineHeight: 1,
        marginLeft: -2,
      }}>
        Signavio
      </span>
    </div>
  )
}
