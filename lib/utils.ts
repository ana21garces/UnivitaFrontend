import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** «1 día», «2 días»… — para no mostrar «1 días». */
export function dias(n: number): string {
  return `${n} ${n === 1 ? 'día' : 'días'}`
}
