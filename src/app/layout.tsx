import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'RootFocus',
  description: 'Garden-themed productivity and focus tracking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-mist font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
