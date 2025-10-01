import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ExportData } from '@/types'

export const exportToPDF = async (data: ExportData): Promise<void> => {
  // 一時的なHTMLコンテナを作成
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  container.style.padding = '40px'
  container.style.backgroundColor = 'white'
  container.style.fontFamily = "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif"
  container.style.color = '#2c2c2c'
  container.style.lineHeight = '1.8'

  // HTMLコンテンツを生成
  const createdAt = data.createdAt || new Date().toLocaleString('ja-JP')

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 32px; margin-bottom: 10px; color: #2c2c2c;">法名生成結果</h1>
      <p style="font-size: 14px; color: #666;">生成日時: ${createdAt}</p>
    </div>

    <div style="margin-bottom: 30px; padding: 20px; background-color: #fafaf9; border-radius: 8px;">
      <h2 style="font-size: 24px; margin-bottom: 15px; color: #2c2c2c; border-bottom: 2px solid #e8dcc6; padding-bottom: 10px;">故人の情報</h2>
      <div style="font-size: 16px; line-height: 2;">
        <p><strong>俗名:</strong> ${data.firstName}</p>
        <p><strong>性別:</strong> ${data.gender === 'male' ? '男性' : '女性'}</p>
        <p><strong>院号:</strong> ${data.hasIngo ? 'あり' : 'なし'}</p>
        ${data.hobbies && data.hobbies.length > 0 ? `<p><strong>趣味:</strong> ${data.hobbies.join('、')}</p>` : ''}
        ${data.skills && data.skills.length > 0 ? `<p><strong>仕事・職業:</strong> ${data.skills.join('、')}</p>` : ''}
        ${data.personality ? `<p><strong>人柄・人生:</strong><br/>${data.personality}</p>` : ''}
        ${data.customCharacter ? `<p><strong>俗名から含めた漢字:</strong> ${data.customCharacter}</p>` : ''}
      </div>
    </div>

    <div>
      <h2 style="font-size: 24px; margin-bottom: 20px; color: #2c2c2c; border-bottom: 2px solid #e8dcc6; padding-bottom: 10px;">生成された法名案</h2>
      ${data.generatedNames.map((suggestion, index) => `
        <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #e8dcc6; border-radius: 8px; page-break-inside: avoid;">
          <h3 style="font-size: 20px; margin-bottom: 10px; color: #d4af37;">法名案 ${index + 1}</h3>
          <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #2c2c2c;">${suggestion.name}</div>
          <p style="font-size: 16px; margin-bottom: 15px; color: #666;">読み方: ${suggestion.reading}</p>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">💠 意味</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px;">${suggestion.meaning}</p>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">📝 選定理由</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px;">${suggestion.reasoning}</p>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">🏛️ 仏教的背景</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px;">${suggestion.buddhistContext}</p>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #999;">浄土真宗 法名ジェネレーター</p>
    </div>
  `

  document.body.appendChild(container)

  try {
    // HTML要素をキャンバスに変換
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // PDFを作成
    const imgWidth = 210 // A4幅（mm）
    const pageHeight = 297 // A4高さ（mm）
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    // キャンバスをPDFに追加
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 複数ページが必要な場合
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // PDFをダウンロード
    const filename = `法名生成結果_${data.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(filename)
  } finally {
    // 一時的な要素を削除
    document.body.removeChild(container)
  }
}

