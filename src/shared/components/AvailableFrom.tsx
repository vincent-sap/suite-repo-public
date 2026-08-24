import type { ReactNode } from 'react'
import { useRelease } from '../../contexts/ReleaseContext'
import type { Release } from '../../releases'

interface AvailableFromProps {
  release: Release
  children: ReactNode
  placeholder?: ReactNode
}

export default function AvailableFrom({ release, children, placeholder = null }: AvailableFromProps) {
  const { isAvailable } = useRelease()
  return isAvailable(release) ? <>{children}</> : <>{placeholder}</>
}
