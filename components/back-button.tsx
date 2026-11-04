'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter()

  function handleClick() {
    if (window.history.length > 1) router.back()
    else router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-secondary pl-3 pr-4 text-sm font-semibold hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ArrowLeft className="size-5 text-primary" aria-hidden="true" />
      Volver
    </button>
  )
}
