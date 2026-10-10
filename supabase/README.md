# Supabase setup

## 1. Tạo project

- Vào [supabase.com](https://supabase.com) → New project.
- Chọn region gần bạn, đặt password cho database.

## 2. Chạy schema

- Mở **SQL Editor** trong dashboard Supabase.
- Copy nội dung file [`schema.sql`](./schema.sql) → paste → Run.
- Sau khi chạy, ở **Table Editor** sẽ thấy 3 bảng: `tasks`, `habits`, `settings`.
- Bảng `settings` có sẵn 1 row mặc định (id=1).

## 3. Lấy URL + anon key

- Vào **Project Settings** → **API**.
- Copy:
  - **Project URL** → dán vào `VITE_SUPABASE_URL` trong `.env`.
  - **anon public** key → dán vào `VITE_SUPABASE_ANON_KEY` trong `.env`.

> `anon` key an toàn để public ở frontend vì RLS đang tắt. Nếu sau này bật auth/RLS, đọc lại docs.

## 4. Verify nhanh

Trong SQL Editor, chạy:

```sql
select * from settings;
```

Phải trả về 1 row với `id = 1`.
