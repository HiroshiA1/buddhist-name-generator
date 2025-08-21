'use client'

import Navigation from '@/components/Layout/Navigation'
import { Noto_Serif_JP } from 'next/font/google'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/buddhist-name-gene_fabicon.png" type="image/png" />
      </head>
      <body className={`${notoSerifJP.className} bg-[#faf8f4] text-[#1f2937]`}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}