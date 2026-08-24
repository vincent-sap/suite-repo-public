import { DynamicPage, DynamicPageTitle, Title, IllustratedMessage } from '@ui5/webcomponents-react'


export default function VariantManagementPage() {
  return (
    <DynamicPage className="repo-dynamic-page" style={{ height: '100%', flex: 1 }} hidePinButton titleArea={
      <DynamicPageTitle>
        <Title slot="heading" level="H3">Variant Management</Title>
      </DynamicPageTitle>
    }>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem' }}>
        <IllustratedMessage
          name="BeforeSearch"
          titleText="Variant Management"
          subtitleText="This feature is coming soon. Details will be specified later."
        />
      </div>
    </DynamicPage>
  )
}
