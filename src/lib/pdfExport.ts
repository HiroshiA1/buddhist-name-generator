import jsPDF from 'jspdf'
import { ExportData } from '@/types'

export const exportToPDF = (data: ExportData): void => {
  // jsPDFインスタンス作成（A4サイズ）
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // フォント設定（日本語対応）
  pdf.setFont('helvetica')
  
  let yPosition = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // タイトル
  pdf.setFontSize(20)
  pdf.text('法名生成結果', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 20

  // 生成日時
  const createdAt = data.createdAt || new Date().toLocaleString('ja-JP')
  pdf.setFontSize(10)
  pdf.text(`生成日時: ${createdAt}`, margin, yPosition)
  yPosition += 15

  // 故人情報セクション
  pdf.setFontSize(16)
  pdf.text('故人の情報', margin, yPosition)
  yPosition += 10
  
  pdf.setFontSize(12)
  pdf.text(`俗名: ${data.firstName}`, margin + 5, yPosition)
  yPosition += 7
  pdf.text(`性別: ${data.gender === 'male' ? '男性' : '女性'}`, margin + 5, yPosition)
  yPosition += 7
  pdf.text(`院号: ${data.hasIngo ? 'あり' : 'なし'}`, margin + 5, yPosition)
  yPosition += 7

  if (data.hobbies && data.hobbies.length > 0) {
    pdf.text(`趣味: ${data.hobbies.join(', ')}`, margin + 5, yPosition)
    yPosition += 7
  }

  if (data.skills && data.skills.length > 0) {
    pdf.text(`特技: ${data.skills.join(', ')}`, margin + 5, yPosition)
    yPosition += 7
  }

  if (data.personality) {
    pdf.text('人柄・人生:', margin + 5, yPosition)
    yPosition += 7
    // 長いテキストを改行
    const personalityLines = pdf.splitTextToSize(data.personality, contentWidth - 10)
    pdf.text(personalityLines, margin + 10, yPosition)
    yPosition += personalityLines.length * 5 + 5
  }

  if (data.customCharacter) {
    pdf.text(`俗名から含めた漢字: ${data.customCharacter}`, margin + 5, yPosition)
    yPosition += 7
  }

  yPosition += 10

  // 法名案セクション
  data.generatedNames.forEach((suggestion, index) => {
    // ページが足りない場合は新しいページを追加
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(16)
    pdf.text(`法名案 ${index + 1}`, margin, yPosition)
    yPosition += 10

    // 法名（大きな文字）
    pdf.setFontSize(18)
    pdf.text(suggestion.name, margin + 5, yPosition)
    yPosition += 10

    // 読み方
    pdf.setFontSize(12)
    pdf.text(`読み方: ${suggestion.reading}`, margin + 5, yPosition)
    yPosition += 7

    // 意味
    pdf.text('意味:', margin + 5, yPosition)
    yPosition += 5
    const meaningLines = pdf.splitTextToSize(suggestion.meaning, contentWidth - 10)
    pdf.text(meaningLines, margin + 10, yPosition)
    yPosition += meaningLines.length * 5 + 3

    // 選定理由
    pdf.text('選定理由:', margin + 5, yPosition)
    yPosition += 5
    const reasoningLines = pdf.splitTextToSize(suggestion.reasoning, contentWidth - 10)
    pdf.text(reasoningLines, margin + 10, yPosition)
    yPosition += reasoningLines.length * 5 + 3

    // 仏教的背景
    pdf.text('仏教的背景:', margin + 5, yPosition)
    yPosition += 5
    const contextLines = pdf.splitTextToSize(suggestion.buddhistContext, contentWidth - 10)
    pdf.text(contextLines, margin + 10, yPosition)
    yPosition += contextLines.length * 5 + 10

    // 区切り線
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10
  })

  // フッター
  const pageCount = pdf.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(
      '浄土真宗 法名ジェネレーター', 
      pageWidth / 2, 
      pdf.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    )
  }

  // PDFをダウンロード
  const filename = `法名生成結果_${data.firstName}_${new Date().toISOString().slice(0, 10)}.pdf`
  pdf.save(filename)
}

