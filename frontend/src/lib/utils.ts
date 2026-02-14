import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PICONERO_PER_XMR = 1e12

export function piconeroToXMR(piconero: number): number {
  return piconero / PICONERO_PER_XMR
}

export function xmrToPiconero(xmr: number): number {
  return Math.round(xmr * PICONERO_PER_XMR)
}

export function formatXMR(piconero: number): string {
  const xmr = piconero / PICONERO_PER_XMR
  return xmr.toFixed(4)
}

export function shortHash(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}
