import { Droplets, Hammer, PaintRoller, Wrench, Zap, type LucideIcon } from 'lucide-react'
import type { CategoryId } from '@/lib/data'

const icons: Record<string, LucideIcon> = {
  plomeria: Droplets,
  electricidad: Zap,
  pintura: PaintRoller,
  carpinteria: Hammer,
}

// Las categorías nuevas que cargue el admin usan una herramienta genérica.
export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = icons[id] ?? Wrench
  return <Icon className={className} aria-hidden="true" />
}
