import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import Header from '@/components/Header'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://buddhist-name-generator.vercel.app'),
  title: '法名ジェネレーター | 浄土真宗の法名を自動生成',
  description: '故人の人柄や人生を反映した、浄土真宗の教義に基づいた法名を自動生成します。AIが故人の情報から適切な法名案を提案します。',
  keywords: ['法名', '浄土真宗', '仏教', '法名生成', '院号', '戒名', '釋'],
  authors: [{ name: '法名ジェネレーター' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '100x100' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: '法名ジェネレーター | 浄土真宗の法名を自動生成',
    description: '故人の人柄や人生を反映した、浄土真宗の教義に基づいた法名を自動生成します。',
    url: '/',
    siteName: '法名ジェネレーター',
    images: [
      {
        url: '/ogp-image.png',
        width: 1200,
        height: 630,
        alt: '法名ジェネレーター',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '法名ジェネレーター | 浄土真宗の法名を自動生成',
    description: '故人の人柄や人生を反映した、浄土真宗の教義に基づいた法名を自動生成します。',
    images: ['/ogp-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.className} bg-[#faf8f4] text-[#1f2937]`}>
        <Header />
        {children}
      </body>
    </html>
  )
}
