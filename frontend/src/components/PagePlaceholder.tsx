type PagePlaceholderProps = {
  title: string
  description: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        {title} content coming soon.
      </div>
    </div>
  )
}
