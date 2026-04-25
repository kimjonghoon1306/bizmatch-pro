-- =============================================
-- BIZMATCH PRO - Supabase Schema
-- Supabase SQL Editor에 그대로 붙여넣고 실행하세요
-- =============================================

-- 1. 랜딩페이지 테이블
create table if not exists landing_pages (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  category text not null default 'network',
  contact_phone text,
  offer_text text,
  fields jsonb not null default '["name","phone"]',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. 리드 테이블
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  landing_page_id uuid references landing_pages(id) on delete cascade,
  name text not null,
  phone text not null,
  kakao_id text,
  age text,
  region text,
  current_job text,
  desired_income text,
  available_time text,
  memo text,
  status text not null default 'new', -- new | contact | done | trash
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 메시지 발송 로그 테이블
create table if not exists message_logs (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete cascade,
  type text not null, -- sms | kakao
  content text not null,
  sent_at timestamptz default now(),
  status text default 'sent' -- sent | failed
);

-- 4. 자동화 설정 테이블
create table if not exists automation_settings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  trigger_type text not null, -- immediate | d1 | d3 | d7
  message_template text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. 기본 자동화 메시지 삽입
insert into automation_settings (name, trigger_type, message_template, is_active) values
('즉시 감사 메시지', 'immediate', '[비즈매치 PRO] {{name}}님, 신청해 주셔서 감사합니다! 담당자가 곧 연락드리겠습니다. 문의: {{contact_phone}}', true),
('D+1 팔로업', 'd1', '[비즈매치 PRO] {{name}}님, 안녕하세요! 사업 설명 자료를 보내드립니다. 궁금하신 점은 편하게 연락 주세요.', true),
('D+3 설명회 안내', 'd3', '[비즈매치 PRO] {{name}}님! 이번 주 온라인 설명회에 초대합니다. 참석 여부를 알려주시면 링크를 보내드릴게요.', false),
('D+7 마지막 오퍼', 'd7', '[비즈매치 PRO] {{name}}님, 마지막으로 한번 더 연락드립니다. 언제든지 준비되시면 함께 시작해요!', false);

-- 6. RLS (Row Level Security) 설정
alter table landing_pages enable row level security;
alter table leads enable row level security;
alter table message_logs enable row level security;
alter table automation_settings enable row level security;

-- 공개 읽기 (랜딩페이지)
create policy "landing_pages_public_read" on landing_pages
  for select using (is_active = true);

-- 서비스 롤만 모든 접근 가능 (관리자)
create policy "landing_pages_service_all" on landing_pages
  for all using (true);

create policy "leads_service_all" on leads
  for all using (true);

create policy "message_logs_service_all" on message_logs
  for all using (true);

create policy "automation_settings_service_all" on automation_settings
  for all using (true);

-- 공개 insert (리드 신청)
create policy "leads_public_insert" on leads
  for insert with check (true);

-- 7. updated_at 자동 갱신 함수
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger landing_pages_updated_at
  before update on landing_pages
  for each row execute function update_updated_at();

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();
