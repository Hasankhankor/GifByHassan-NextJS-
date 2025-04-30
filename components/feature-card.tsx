import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-xl border bg-background shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
