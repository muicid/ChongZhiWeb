interface SealProps {
  character: string
  label?: string
  small?: boolean
}

export function Seal({ character, label, small = false }: SealProps) {
  return (
    <span className={small ? 'seal seal--small' : 'seal'} aria-label={label} role={label ? 'img' : undefined}>
      <span aria-hidden="true">{character}</span>
    </span>
  )
}
