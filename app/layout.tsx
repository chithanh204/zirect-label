import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Zirect Label',
  description: 'Professional music distribution and artist management platform. Discover featured releases, track analytics, and grow your music career with Zirect Label.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/black-zirect.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/white-zirect.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/zirect-label.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/zirect-label.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased text-foreground min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
