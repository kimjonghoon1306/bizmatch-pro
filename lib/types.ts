export type Theme = 'dark' | 'light' | 'yellow'

export type LeadStatus = 'new' | 'contact' | 'done' | 'trash'

export type LandingCategory =
  | 'network'
  | 'franchise'
  | 'startup'
  | 'beauty'
  | 'edu'
  | 'custom'

export type TriggerType = 'immediate' | 'd1' | 'd3' | 'd7'

export interface LandingPage {
  id: string
  slug: string
  title: string
  description: string | null
  category: LandingCategory
  contact_phone: string | null
  offer_text: string | null
  fields: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  landing_page_id: string | null
  name: string
  phone: string
  kakao_id: string | null
  age: string | null
  region: string | null
  current_job: string | null
  desired_income: string | null
  available_time: string | null
  memo: string | null
  status: LeadStatus
  created_at: string
  updated_at: string
}

export interface MessageLog {
  id: string
  lead_id: string
  type: 'sms' | 'kakao'
  content: string
  sent_at: string
  status: 'sent' | 'failed'
}

export interface AutomationSetting {
  id: string
  name: string
  trigger_type: TriggerType
  message_template: string
  is_active: boolean
  created_at: string
}

export interface DashboardStats {
  totalLeads: number
  todayLeads: number
  contactingLeads: number
  doneLeads: number
  conversionRate: number
}
