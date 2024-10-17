import { ReactNode } from 'react'
import RootLayout from './layout'
import { metadata } from './metadata'

export { metadata }

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return <RootLayout>{children}</RootLayout>
}
