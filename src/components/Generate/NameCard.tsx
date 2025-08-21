import { GeneratedName } from '@/types'

interface NameCardProps {
  suggestion: GeneratedName
  index: number
}

export default function NameCard({ suggestion, index }: NameCardProps) {
  return (
    <div className="result-card fade-in">
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="text-sm text-gray-500" style={{ marginBottom: 'var(--spacing-sm)' }}>
            法名案 {index + 1}
          </div>
          <div className="text-4xl font-bold" style={{ 
            color: 'var(--color-charcoal)', 
            letterSpacing: '0.15em',
            marginBottom: 'var(--spacing-sm)'
          }}>
            {suggestion.name}
          </div>
          <div className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {suggestion.reading}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="result-label">意味</h4>
            <p className="result-text">{suggestion.meaning}</p>
          </div>

          <div>
            <h4 className="result-label">選定理由</h4>
            <p className="result-text">{suggestion.reasoning}</p>
          </div>

          <div>
            <h4 className="result-label">仏教的背景</h4>
            <p className="result-text">{suggestion.buddhistContext}</p>
          </div>
        </div>
      </div>
    </div>
  )
}