import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LeadForm } from '@/components/landing/LeadForm'
import { categoryEmoji } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('landing_pages')
    .select('title, description')
    .eq('slug', slug)
    .single()

  return {
    title: data?.title ?? '사업자 모집',
    description: data?.description ?? '지금 신청하세요',
  }
}

export default async function JoinPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!page) notFound()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'inherit',
    }}>
      {/* HERO */}
      <div style={{
        background: 'linear-gradient(160deg, var(--accent-bg) 0%, transparent 60%)',
        padding: '48px 24px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{categoryEmoji[page.category as keyof typeof categoryEmoji]}</div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-bg)', border: '1px solid var(--accent)',
          borderRadius: 100, padding: '5px 14px',
          marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>지금 모집 중</span>
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 900, lineHeight: 1.3,
          letterSpacing: -0.8, marginBottom: 12, maxWidth: 340, margin: '0 auto 12px',
        }}>
          {page.title}
        </h1>

        {page.description && (
          <p style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 320, margin: '0 auto 16px' }}>
            {page.description}
          </p>
        )}

        {page.offer_text && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--success-bg)', border: '1px solid var(--success)',
            borderRadius: 100, padding: '7px 16px',
          }}>
            <span style={{ fontSize: 14 }}>🎁</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>{page.offer_text}</span>
          </div>
        )}
      </div>

      {/* FORM */}
      <div style={{ padding: '0 20px 60px', maxWidth: 480, margin: '0 auto' }}>
        <LeadForm
          landingPageId={page.id}
          fields={page.fields as string[]}
          contactPhone={page.contact_phone}
        />
      </div>
    </div>
  )
}
