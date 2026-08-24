export type Release = 'R27Q1' | 'R27Q2' | 'NS2'

export const RELEASES: { id: Release; label: string; description: string }[] = [
  { id: 'R27Q1', label: 'R27 Q1', description: 'Initial release' },
  { id: 'R27Q2', label: 'R27 Q2', description: 'Q2 feature additions' },
  { id: 'NS2', label: 'NS2', description: 'NS2 Canary Release Q1 2027' },
]

const RELEASE_ORDER: Release[] = ['R27Q1', 'R27Q2', 'NS2']

export function isReleaseAvailable(featureRelease: Release, currentRelease: Release): boolean {
  return RELEASE_ORDER.indexOf(featureRelease) <= RELEASE_ORDER.indexOf(currentRelease)
}

export const DEFAULT_RELEASE: Release = 'R27Q1'
