import type { Metadata } from 'next'
import { Pixelify_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-pixel',
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
    <html lang="en" className={`${pixelify.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-mist font-sans text-soil">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
