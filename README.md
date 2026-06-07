# Zirect Label — Frontend

Giao diện web cho nền tảng quản lý và phân phối âm nhạc **Zirect Label**, được xây dựng với Next.js 16, React 19 và Tailwind CSS.

## Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| **Next.js 16** | React framework với App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui + Radix UI** | Component library |
| **Recharts** | Biểu đồ thống kê doanh thu & streams |
| **React Hook Form + Zod** | Quản lý form & validation |
| **next-themes** | Dark/Light mode |
| **Sonner** | Toast notifications |

## Cấu trúc thư mục

```
zirect-label-frontend/
├── app/
│   ├── admin/              # Trang dành cho admin
│   │   ├── albums/         # Quản lý album (duyệt, phân phối)
│   │   ├── analytics/      # Thống kê streams & doanh thu
│   │   ├── artists/        # Quản lý nghệ sĩ
│   │   ├── edit-home-page/ # Chỉnh sửa nội dung trang chủ
│   │   ├── reports/        # Báo cáo & xuất Excel
│   │   ├── revenue/        # Quản lý thanh toán
│   │   ├── setting-label/  # Cài đặt nhãn
│   │   └── settings/       # Cài đặt hệ thống
│   ├── artist/             # Trang dành cho nghệ sĩ
│   │   ├── albums/         # Xem album của mình
│   │   ├── analytics/      # Xem số liệu streams
│   │   └── settings/       # Cài đặt hồ sơ
│   ├── contact/            # Trang đăng ký hợp tác (public)
│   ├── login/              # Trang đăng nhập
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Trang chủ (public)
├── components/             # UI components dùng chung
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, API client
├── styles/                 # Global styles
├── public/                 # Static assets
├── middleware.ts           # Auth middleware (route protection)
├── .env.example            # Template biến môi trường
└── next.config.mjs
```

## Tính năng

### Dành cho Admin
- 📊 **Dashboard tổng quan** — thống kê toàn bộ hệ thống
- 🎵 **Quản lý album** — duyệt, phân phối, từ chối album từ nghệ sĩ
- 👥 **Quản lý nghệ sĩ** — xem hồ sơ, trạng thái, số dư
- 💰 **Quản lý doanh thu** — nhập liệu doanh thu từ Spotify/YouTube, xử lý thanh toán PayPal
- 📈 **Analytics** — biểu đồ streams theo nền tảng, khu vực, thời gian
- 📄 **Báo cáo** — xuất báo cáo Excel
- 🏠 **Chỉnh sửa trang chủ** — quản lý banner, featured releases

### Dành cho Nghệ sĩ
- 🎵 **Quản lý album** — xem danh sách album, trạng thái phân phối
- 📈 **Analytics cá nhân** — streams, doanh thu theo thời gian
- ⚙️ **Cài đặt hồ sơ** — cập nhật thông tin, thêm tài khoản PayPal

### Public
- 🌐 **Trang chủ** — giới thiệu nhãn nhạc, featured releases
- 📝 **Trang liên hệ** — nghệ sĩ gửi đơn đăng ký hợp tác

## Cài đặt & Chạy dự án

### Yêu cầu

- Node.js >= 18
- pnpm (khuyến nghị) hoặc npm
- Backend server đang chạy (xem [zirect-label-backend](../zirect-label-backend))

### 1. Clone & cài đặt dependencies

```bash
git clone <repo-url>
cd zirect-label-frontend
pnpm install
```

### 2. Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Chỉnh sửa file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Chạy ứng dụng

```bash
# Development (hot-reload)
pnpm dev

# Build production
pnpm build
pnpm start
```

Ứng dụng chạy tại `http://localhost:3000`

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy development server |
| `pnpm build` | Build production bundle |
| `pnpm start` | Chạy bản build production |
| `pnpm lint` | Kiểm tra lỗi ESLint |

## Biến môi trường

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `NEXT_PUBLIC_API_URL` | URL của backend API | `http://localhost:5000/api` |

## Liên quan

- 🔗 **Backend repo**: [zirect-label-backend](../zirect-label-backend) — REST API server
