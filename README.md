# Personal Tracker

Web app dashboard cá nhân: todo (kanban / calendar / timeline), thói quen, nhắc
việc, ghi chú, lời chào theo giờ. Data lưu trên **Supabase** (Postgres).

## Tech stack

- React 18 + Vite 5 + TypeScript + Tailwind CSS v4.
- [Supabase](https://supabase.com) (Postgres) làm backend, gọi thẳng từ
  frontend qua `@supabase/supabase-js`.
- Triển khai: tự host static build lên Vercel (hoặc Netlify / Cloudflare Pages).

## Cần cài sẵn

- [Node.js](https://nodejs.org) 18 trở lên (kèm `npm`).
- Tài khoản Supabase (free tier đủ dùng).

## Setup

### 1. Tạo project Supabase

- Vào [supabase.com](https://supabase.com) → New project.
- Chọn region gần bạn, đặt password cho database.
- Mở **SQL Editor**, copy nội dung file [`supabase/schema.sql`](./supabase/schema.sql)
  rồi Run. Sau khi chạy, ở **Table Editor** có 3 bảng: `tasks`, `habits`,
  `settings` (1 row mặc định).
- Vào **Project Settings** → **API**, copy:
  - **Project URL** → `VITE_SUPABASE_URL`.
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`.

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env
```

Mở `.env`, điền 2 key vừa copy.

### 3. Cài dependencies

```bash
npm install
```

### 4. Chạy thử

```bash
npm run dev
```

Mở link localhost hiện ra. Lần đầu nếu trình duyệt còn data cũ (từ bản
extension / localStorage), app sẽ hỏi **Đồng bộ lên cloud**.

## Build & deploy

```bash
npm run build       # output ở dist/
```

Deploy lên Vercel:

1. Push repo lên GitHub.
2. Vào [vercel.com](https://vercel.com) → New Project → import repo.
3. Build command: `npm run build` · Output directory: `dist` · Framework: Vite.
4. Trong **Environment Variables**, thêm 2 biến `VITE_SUPABASE_URL` và
   `VITE_SUPABASE_ANON_KEY` (giống trong `.env`).
5. Bấm Deploy. Mỗi lần push là Vercel tự build lại.

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — TypeScript check + Vite build ra `dist/`.
- `npm run preview` — Serve `dist/` ở local.
- `npm run typecheck` — Chỉ chạy `tsc --noEmit`.

## Cấu trúc dữ liệu (Supabase)

| Bảng        | Mô tả                                               |
| ----------- | --------------------------------------------------- |
| `tasks`     | Mỗi task todo (title, dueDate, status, …).         |
| `habits`    | Thói quen (id, name).                               |
| `settings`  | 1 row (id=1): boardName, theme, accent, background. |

RLS đang **tắt** (1 user, single dataset), anon key an toàn ở frontend.
Nếu sau này muốn auth, xem [`supabase/README.md`](./supabase/README.md).

## Lưu ý

- Data cũ trong `chrome.storage` không migrate tự động — chỉ `localStorage`
  (khi chạy `npm run dev` / `vite preview` ở Chrome) được nút **Đồng bộ lên
  cloud** phát hiện.
- Project này không còn là Chrome extension.
