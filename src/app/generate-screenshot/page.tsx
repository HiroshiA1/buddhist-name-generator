'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import html2canvas from 'html2canvas'

// Import the generate page component dynamically to avoid any SSR quirks
const GeneratePage = dynamic(() => import('../generate/page'), { ssr: false })

export default function GenerateScreenshotPage() {
  const smallRef = useRef<HTMLDivElement | null>(null)
  const largeRef = useRef<HTMLDivElement | null>(null)
  const [smallImg, setSmallImg] = useState<string>('')
  const [largeImg, setLargeImg] = useState<string>('')

  useEffect(() => {
    const capture = async () => {
      // Give child components time to mount
      await new Promise((r) => setTimeout(r, 400))

      if (smallRef.current) {
        const canvas = await html2canvas(smallRef.current, {
          backgroundColor: '#ffffff',
          scale: 1,
          useCORS: true,
          logging: false,
        })
        setSmallImg(canvas.toDataURL('image/png'))
      }

      if (largeRef.current) {
        const canvas = await html2canvas(largeRef.current, {
          backgroundColor: '#ffffff',
          scale: 1,
          useCORS: true,
          logging: false,
        })
        setLargeImg(canvas.toDataURL('image/png'))
      }
    }

    capture()
  }, [])

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 className="h2" style={{ marginBottom: '1rem' }}>/generate スクリーンショット</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        幅390px（iPhone 12相当）と幅1280pxでの表示をキャプチャし、Before/Afterとして並べています。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Before（幅390px）</div>
          <div
            ref={smallRef}
            style={{
              width: 390,
              minHeight: 844,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <GeneratePage />
          </div>
          {smallImg && (
            <div style={{ marginTop: '1rem' }}>
              <img src={smallImg} alt="generate-390" style={{ maxWidth: '100%', border: '1px solid #eee' }} />
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>After（幅1280px）</div>
          <div
            ref={largeRef}
            style={{
              width: 1280,
              minHeight: 800,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <GeneratePage />
          </div>
          {largeImg && (
            <div style={{ marginTop: '1rem' }}>
              <img src={largeImg} alt="generate-1280" style={{ maxWidth: '100%', border: '1px solid #eee' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

