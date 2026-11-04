import Image from 'next/image'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function ProfessionalPhoto({
  nombre,
  foto,
  sizes,
  className,
  priority,
}: {
  nombre: string
  foto: string
  sizes: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden bg-accent', className)}>
      {foto ? (
        <Image src={foto} alt={`Foto de ${nombre}`} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <span
          role="img"
          aria-label={`Iniciales de ${nombre}`}
          className="flex size-full items-center justify-center text-lg font-extrabold text-primary"
        >
          {initials(nombre)}
        </span>
      )}
    </div>
  )
}
