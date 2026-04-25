# 🚀 BizMatch PRO

> 사업자 모집 자동화 플랫폼 — 네트워크, 프랜차이즈, 창업 등 모든 사업에서 사람을 모으는 가장 스마트한 방법

---

## ✨ 주요 기능

- 🎨 **다크 / 라이트 / 핑크** 테마 지원
- 📄 **랜딩페이지 빌더** — 5분 완성, 업종별 템플릿
- 👥 **리드 CRM** — 신청자 목록, 상태 관리, CSV 내보내기
- 📊 **대시보드** — 전환 퍼널, 실시간 통계
- 💬 **자동화 메시지** — D+0, D+1, D+3, D+7 시퀀스
- 📱 **모바일 최적화** — 누구나 쉽게 사용 가능

---

## 🛠 설치 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/bizmatch-pro.git
cd bizmatch-pro
npm install
```

### 2. Supabase 설정

1. [supabase.com](https://supabase.com) 에서 무료 계정 생성
2. 새 프로젝트 만들기
3. **SQL Editor** 에서 `supabase-schema.sql` 파일 내용 전체 복사 후 실행
4. **Settings > API** 에서 URL과 anon key 복사

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 로컬 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 🌐 Vercel 배포

### 방법 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### 방법 2: GitHub 연동

1. GitHub에 저장소 push
2. [vercel.com](https://vercel.com) 에서 **New Project** → GitHub 저장소 선택
3. **Environment Variables** 에 `.env.local` 내용 입력
4. **Deploy** 클릭

---

## 📂 프로젝트 구조

```
bizmatch-pro/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── globals.css             # 전역 스타일 + 테마
│   ├── (public)/join/[slug]/   # 공개 랜딩페이지
│   └── (admin)/                # 관리자 페이지
│       ├── dashboard/          # 대시보드
│       ├── leads/              # 리드 목록
│       ├── builder/            # 랜딩 빌더
│       ├── messages/           # 메시지 설정
│       └── settings/           # 시스템 설정
├── components/
│   ├── ui/                     # 공통 UI
│   ├── admin/                  # 관리자 컴포넌트
│   └── landing/                # 랜딩 컴포넌트
├── lib/
│   ├── types.ts                # 타입 정의
│   ├── utils.ts                # 유틸 함수
│   ├── store.ts                # Zustand 상태
│   └── supabase/               # Supabase 클라이언트
└── supabase-schema.sql         # DB 스키마
```

---

## 🔌 외부 API 연동 (선택)

### 솔라피 문자 발송
1. [solapi.com](https://solapi.com) 회원가입
2. API Key 발급
3. `.env.local` 에 `SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_FROM` 추가

### 카카오 알림톡
1. [business.kakao.com](https://business.kakao.com) 에서 채널 생성
2. 알림톡 서비스 신청
3. API Key 발급 후 설정에 입력

---

## 📄 라이선스

MIT License — 자유롭게 사용, 수정, 재판매 가능
