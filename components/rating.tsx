import { Star } from 'lucide-react'
import { formatRating } from '@/lib/data'
import { cn } from '@/lib/utils'

type RatingProps = {
  value: number
  count?: number
  className?: string
}

export function Rating({ value, count, className }: RatingProps) {
  if (value === 0) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-primary', className)}>
        <Star className="size-4 text-primary" aria-hidden="true" />
        Nuevo
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-foreground', className)}>
      <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
      <span>{formatRating(value)}</span>
      {typeof count === 'number' && (
        <span className="font-normal text-muted-foreground">({count})</span>
      )}
      <span className="sr-only">de 5 estrellas</span>
    </span>
  )
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('size-3.5', n <= Math.round(value) ? 'fill-primary text-primary' : 'text-border')}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
