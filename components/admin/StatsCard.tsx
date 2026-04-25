interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'accent' | 'success' | 'warning' | 'danger'
}

const colorMap = {
  accent:  'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger:  'var(--danger)',
}

export function StatsCard({ label, value, sub, color = 'accent' }: StatsCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 14px',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: colorMap[color], lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}
