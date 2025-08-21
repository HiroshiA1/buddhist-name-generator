export default function LoadingSpinner({ message = '読み込み中...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <div className="mt-4">{message}</div>
      </div>
    </div>
  )
}