import { useId } from 'react'

interface EpbjcLogoProps {
  className?: string
  title?: string
}

/** Logo EPBJC — branco da imagem vira `currentColor` (vermelho); fundo preto transparente. */
export function EpbjcLogo({ className = '', title = 'EPBJC' }: EpbjcLogoProps) {
  const maskId = `epbjc-logo-mask-${useId().replace(/:/g, '')}`

  return (
    <svg
      className={`epbjc-logo ${className}`.trim()}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <image href="/epbjc-logo.png" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
        </mask>
      </defs>
      <rect width="512" height="512" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  )
}
