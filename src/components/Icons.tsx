import type { SVGProps } from 'react'

function Icon(props: SVGProps<SVGSVGElement> & { label?: string }) {
  const { label, children, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IconLayoutGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </Icon>
  )
}

export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  )
}

export function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  )
}

export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Icon>
  )
}

export function IconAlertTriangle(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  )
}

export function IconPalmtree(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 22v-6" />
      <path d="M12 8a4 4 0 0 1 4 4v2H8v-2a4 4 0 0 1 4-4Z" />
      <path d="M12 2v2" />
      <path d="M4.93 10.93 6.34 9.52" />
      <path d="M2 16h2" />
      <path d="M19.07 10.93 17.66 9.52" />
      <path d="M22 16h-2" />
    </Icon>
  )
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
  )
}

export function IconUmbrella(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M22 12a10.06 10.06 0 0 0-20 0Z" />
      <path d="M12 12v8a2 2 0 1 0 4 0" />
    </Icon>
  )
}
