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
  title: '法名ジェネレーター',
  description: '故人の情報から適切な法名を生成するサービス',
  icons: {
    icon: '/buddhist-name-gene_fabicon.png',
  },
  openGraph: {
    images: ['/buddhist-name-gene_fabicon.png'],
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
