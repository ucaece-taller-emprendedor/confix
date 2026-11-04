'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleClick() {
    setPending(true)
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-base font-bold hover:bg-accent disabled:opacity-60"
    >
      <LogOut className="size-5 text-primary" aria-hidden="true" />
      Cerrar sesión
    </button>
  )
}
