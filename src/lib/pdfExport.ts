import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ExportData } from '@/types'

export const exportToPDF = async (data: ExportData): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210 // A4幅（mm）
  const margin = 20

  const createdAt = data.createdAt || new Date().toLocaleString('ja-JP')

  // ヘッダーページを作成
  const headerContainer = document.createElement('div')
  headerContainer.style.position = 'absolute'
  headerContainer.style.left = '-9999px'
  headerContainer.style.width = '750px'
  headerContainer.style.padding = '40px'
  headerContainer.style.backgroundColor = 'white'
  headerContainer.style.fontFamily = "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif"
  headerContainer.style.color = '#2c2c2c'
  headerContainer.style.lineHeight = '1.8'

  headerContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 32px; margin-bottom: 10px; color: #2c2c2c;">法名生成結果</h1>
      <p style="font-size: 14px; color: #666;">生成日時: ${createdAt}</p>
    </div>

    <div style="padding: 20px; background-color: #fafaf9; border-radius: 8px;">
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
  `

  document.body.appendChild(headerContainer)

  try {
    // ヘッダーページをキャンバスに変換
    const headerCanvas = await html2canvas(headerContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const headerImgHeight = (headerCanvas.height * (pageWidth - margin * 2)) / headerCanvas.width
    const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(headerImgData, 'JPEG', margin, margin, pageWidth - margin * 2, headerImgHeight)

    // 各法名案を個別ページとして作成
    for (let i = 0; i < data.generatedNames.length; i++) {
      const suggestion = data.generatedNames[i]

      const nameContainer = document.createElement('div')
      nameContainer.style.position = 'absolute'
      nameContainer.style.left = '-9999px'
      nameContainer.style.width = '750px'
      nameContainer.style.padding = '40px'
      nameContainer.style.backgroundColor = 'white'
      nameContainer.style.fontFamily = "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', serif"
      nameContainer.style.color = '#2c2c2c'
      nameContainer.style.lineHeight = '1.8'

      nameContainer.innerHTML = `
        <div style="padding: 20px; border: 2px solid #e8dcc6; border-radius: 8px;">
          <h3 style="font-size: 20px; margin-bottom: 10px; color: #d4af37;">法名案 ${i + 1}</h3>
          <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #2c2c2c;">${suggestion.name}</div>
          <p style="font-size: 16px; margin-bottom: 15px; color: #666;">読み方: ${suggestion.reading}</p>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">💠 意味</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px; line-height: 1.6;">${suggestion.meaning}</p>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">📝 選定理由</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px; line-height: 1.6;">${suggestion.reasoning}</p>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; color: #2c2c2c; margin-bottom: 5px;">🏛️ 仏教的背景</p>
            <p style="font-size: 15px; color: #555; padding-left: 10px; line-height: 1.6;">${suggestion.buddhistContext}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #999;">浄土真宗 法名ジェネレーター</p>
        </div>
      `

      document.body.appendChild(nameContainer)

      const nameCanvas = await html2canvas(nameContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      pdf.addPage()
      const nameImgHeight = (nameCanvas.height * (pageWidth - margin * 2)) / nameCanvas.width
      const nameImgData = nameCanvas.toDataURL('image/jpeg', 0.95)
      pdf.addImage(nameImgData, 'JPEG', margin, margin, pageWidth - margin * 2, nameImgHeight)

      document.body.removeChild(nameContainer)
    }

    // PDFをダウンロード
    const filename = `法名生成結果_${data.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
    pdf.save(filename)
  } finally {
    // 一時的な要素を削除
    document.body.removeChild(headerContainer)
  }
}

