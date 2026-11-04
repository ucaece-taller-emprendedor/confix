import { Droplets, Hammer, PaintRoller, Zap, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '@/lib/data'

const icons: Record<CategoryId, LucideIcon> = {
  plomeria: Droplets,
  electricidad: Zap,
  pintura: PaintRoller,
  carpinteria: Hammer,
}

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = icons[id]
  return <Icon className={className} aria-hidden="true" />
}
