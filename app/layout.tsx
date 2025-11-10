import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { ToggleTheme } from '../components/ui'

export const metadata: Metadata = {
  title: 'Ölradar – The Hype Edition',
  description: 'Hitta bästa ölfynden nära dig (sv/en).'
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className="min-h-screen gradient-bg text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Ölradar</h1>
              <ToggleTheme />
            </div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
