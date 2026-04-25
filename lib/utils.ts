import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { LeadStatus, LandingCategory } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string) {
  return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko })
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const rand = Math.random().toString(36).substring(2, 7)
  return `${base}-${rand}`
}

export const statusLabel: Record<LeadStatus, string> = {
  new: '신규',
  contact: '연락중',
  done: '완료',
  trash: '휴지통',
}

export const statusColor: Record<LeadStatus, string> = {
  new: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  contact: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  trash: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export const categoryLabel: Record<LandingCategory, string> = {
  network: '네트워크 마케팅',
  franchise: '프랜차이즈',
  startup: '창업/부업',
  beauty: '뷰티/건강',
  edu: '교육/강의',
  custom: '직접 입력',
}

export const categoryEmoji: Record<LandingCategory, string> = {
  network: '🌐',
  franchise: '🏪',
  startup: '🚀',
  beauty: '💄',
  edu: '📚',
  custom: '✏️',
}

export const fieldLabel: Record<string, string> = {
  name: '이름',
  phone: '전화번호',
  kakao: '카톡 ID',
  age: '나이',
  region: '지역',
  job: '현직업',
  income: '희망 수입',
  time: '가능 시간',
}
