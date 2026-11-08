import { Link } from 'react-router'
import { MARCA } from '@/config/app'

export function Marca({ to = '/', claro = false }: { to?: string; claro?: boolean }) {
  return (
    <Link to={to} aria-label={`${MARCA.nombre}, ir al inicio`} className={`flex items-center gap-2 text-xl font-extrabold tracking-tight ${claro ? 'text-white' : 'text-texto'}`}>
      <img src={MARCA.logo} alt="" className="size-9 rounded-xl" />
      <span>{MARCA.nombre}</span>
    </Link>
  )
}
