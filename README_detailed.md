# README Chi Tiết

Tài liệu này được tạo để giải thích các file chính trong project `nextjs-web-practice-develop`.

## 1. Tổng quan project

Đây là project frontend sử dụng Next.js App Router để mô phỏng hệ thống quản lý nhân viên. Hiện tại:

- Chức năng `login` và `logout` đã có logic xử lý.
- Các trang `employees/*` chủ yếu là mockup giao diện và điều hướng.
- Project có bộ hook xác thực, API client dùng Axios, validation dùng Zod, và test bằng Jest.

## 2. Các file gốc của project

### `README.md`
- README tổng quan.
- Giải thích cách chạy dự án, yêu cầu môi trường, biến `NEXT_PUBLIC_API_URL`, và các công nghệ chính.

### `README_detailed.md`
- File tài liệu chi tiết này.
- Dùng để mô tả cấu trúc thư mục và vai trò của từng file chính.

### `.gitignore`
- Khai báo các file/thư mục Git sẽ bỏ qua.
- Thường bao gồm build output, dependency, cache, file môi trường cục bộ.

### `package.json`
- Khai báo metadata project, scripts và dependencies.
- Scripts chính:
  - `npm run dev`: chạy môi trường phát triển.
  - `npm run build`: build production.
  - `npm run start`: chạy bản build production.
  - `npm run lint`: chạy ESLint.
  - `npm run test`: chạy Jest.

### `package-lock.json`
- Khóa phiên bản dependency để cài đặt đồng nhất giữa các máy.

### `tsconfig.json`
- Cấu hình TypeScript.
- Bật `strict`, không sinh file output (`noEmit`), dùng alias `@/*` trỏ đến thư mục gốc project.

### `eslint.config.mjs`
- Cấu hình ESLint cho Next.js + TypeScript.
- Bỏ qua các thư mục sinh ra từ build như `.next`, `out`, `build`.

### `jest.config.mjs`
- Cấu hình Jest cho Next.js.
- Sử dụng `next/jest`, môi trường `jsdom`, map alias `@/`, và nạp `jest.setup.ts`.

### `jest.setup.ts`
- File setup cho test.
- Import `@testing-library/jest-dom` để bổ sung matcher cho DOM.

### `next.config.ts`
- File cấu hình Next.js.
- Hiện đang ở trạng thái mặc định, chưa có tùy chỉnh đặc biệt.

### `next-env.d.ts`
- File TypeScript được Next.js tạo để hỗ trợ type cho framework.
- Thường không cần sửa tay.

### `proxy.ts`
- File xử lý proxy/middleware kiểu đơn giản cho route.
- Phân loại route `login/logout` và route được bảo vệ `employees/*`.
- Hiện tại chưa redirect thật sự ở server; chủ yếu là nơi để đặt logic route protection về sau.

## 3. Thư mục `app/`

Thư mục này chứa các route theo App Router của Next.js.

### `app/layout.tsx`
- Root layout của toàn bộ ứng dụng.
- Import CSS global.
- Render `Header` và `Footer` cho tất cả trang, trừ trang có đường dẫn chứa `/login`.
- Dùng `usePathname()` để quyết định có hiện layout đầy đủ hay không.

### `app/globals.css`
- CSS global của dự án.
- Chứa style cho:
  - khung login,
  - header/footer,
  - bảng danh sách nhân viên,
  - form nhập liệu,
  - datepicker,
  - thông báo lỗi và validation.

### `app/page.tsx`
- Trang gốc `/`.
- Hiện vẫn đang là giao diện mặc định của Next.js, chưa được đổi theo business của bài tập.

### `app/page.module.css`
- CSS module chỉ dùng cho `app/page.tsx`.
- Tạo bố cục và style riêng cho trang gốc mặc định.

### `app/favicon.ico`
- Icon hiển thị trên tab trình duyệt.

## 4. Nhóm route `app/(auth)/`

Nhóm route liên quan đến xác thực.

### `app/(auth)/login/page.tsx`
- Trang đăng nhập.
- Gọi `useGuest()` để nếu đã đăng nhập thì chuyển thẳng sang `/employees/list`.
- Hiển thị hình minh họa và component `LoginForm`.

### `app/(auth)/logout/page.tsx`
- Trang đăng xuất.
- Khi mount sẽ xóa token trong `sessionStorage`, sau đó chuyển hướng về `/login`.

## 5. Nhóm route `app/(protected)/employees/`

Nhóm route cần đăng nhập mới truy cập.

### `app/(protected)/employees/list/page.tsx`
- Trang danh sách nhân viên.
- Gọi `useAuth()` để chặn truy cập nếu chưa đăng nhập.
- Hiển thị mockup bộ lọc, bảng dữ liệu, phân trang, và nút thêm mới.
- Dữ liệu hiện tại là hard-code.

### `app/(protected)/employees/detail/page.tsx`
- Trang xem chi tiết một nhân viên.
- Hiển thị thông tin nhân viên và thông tin chứng chỉ tiếng Nhật.
- Các nút điều hướng đến trang sửa hoặc quay lại danh sách.

### `app/(protected)/employees/edit/page.tsx`
- Trang tạo mới/chỉnh sửa nhân viên.
- Có nhiều ô nhập liệu và 3 `DatePicker` cho ngày sinh, ngày cấp chứng chỉ, ngày hết hạn.
- Chưa có kết nối API submit thật; nút `Xác nhận` đang chuyển sang trang confirm.

### `app/(protected)/employees/confirm/page.tsx`
- Trang xác nhận thông tin trước khi lưu.
- Đang hiển thị dữ liệu mẫu.
- Nút `OK` chuyển sang trang hoàn tất, nút quay lại trở về trang sửa.

### `app/(protected)/employees/complete/page.tsx`
- Trang thông báo hoàn tất.
- Dùng để hiển thị kết quả sau khi thêm/sửa/xóa.
- Nút `OK` đưa người dùng về trang danh sách.

## 6. Thư mục `components/`

Nơi chứa các component tái sử dụng.

### `components/auth/LoginForm.tsx`
- Form đăng nhập chính.
- Sử dụng:
  - `react-hook-form` để quản lý form,
  - `zodResolver` + `loginSchema` để validation,
  - `apiClient` để gọi API `/login`,
  - `storeToken()` để lưu token,
  - `router.push('/employees/list')` khi đăng nhập thành công.
- Nếu lỗi sẽ set `errors.root` để hiển thị thông báo trên form.

### `components/layout/Header.tsx`
- Thanh đầu trang.
- Hiển thị logo, tên công ty, link đến danh sách nhân viên và logout.

### `components/layout/Footer.tsx`
- Chân trang.
- Hiển thị dòng copyright.

## 7. Thư mục `hooks/`

### `hooks/useAuth.ts`
- Chứa 2 hook:
  - `useAuth()`: nếu không có token hoặc token hết hạn thì chuyển về `/login`.
  - `useGuest()`: nếu đã có token hợp lệ thì chuyển sang `/employees/list`.
- Đây là lớp bảo vệ route ở phía client.

## 8. Thư mục `lib/`

Thư mục này chứa logic dùng chung.

### `lib/api/client.ts`
- Tạo `apiClient` bằng Axios.
- Lấy `baseURL` từ `NEXT_PUBLIC_API_URL`, mặc định là `http://localhost:8085`.
- `setupInterceptors()` thực hiện:
  - request interceptor: gắn `Authorization: Bearer ...` nếu có token.
  - response interceptor: nếu API trả `401` thì xóa token và chuyển về `/login`.

### `lib/auth/token.ts`
- Đóng vai trò helper cho token trong `sessionStorage`.
- Các hàm chính:
  - `storeToken()`: lưu access token và token type.
  - `getToken()`: đọc token hiện tại.
  - `removeToken()`: xóa token.
  - `isTokenExpired()`: giải mã JWT và kiểm tra thời điểm hết hạn.

### `lib/validation/auth.ts`
- Định nghĩa `loginSchema` bằng Zod.
- Ràng buộc `username` và `password` bắt buộc nhập.
- Export thêm type `LoginForm` suy ra từ schema.

## 9. Thư mục `types/`

Nơi chứa type/interface của ứng dụng.

### `types/auth.ts`
- Type cho request/response đăng nhập.
- Gồm:
  - `LoginRequest`
  - `LoginResponse`
  - `TokenPayload`

### `types/api.ts`
- Type dùng chung cho API.
- Gồm:
  - `ApiError`
  - `PaginationParams`
  - `PaginationMeta`

### `types/employee.ts`
- File type lớn nhất, mô tả nhiều tầng dữ liệu nhân viên:
  - `EmployeeDB`: cấu trúc gần với backend/database.
  - `Employee`: cấu trúc frontend để hiển thị.
  - `EmployeeCreateRequest`: body tạo nhân viên.
  - `EmployeeUpdateRequest`: body cập nhật nhân viên.
  - `EmployeeListResponse`: response danh sách có phân trang.
  - `EmployeeSearchParams`: tham số tìm kiếm.
  - `Department`, `Certification`, `EmployeeCertification`: type phụ liên quan phòng ban và chứng chỉ.

## 10. Thư mục `public/`

Chứa tài nguyên tĩnh để phục vụ trình duyệt.

### `public/assets/images/Logo-Luvina.svg`
- Logo công ty trên header.

### `public/assets/images/img-01.png`
- Ảnh minh họa ở trang login.

### `public/assets/images/ic_email.svg`
- Icon email trong form login.

### `public/assets/images/ic_lock.svg`
- Icon mật khẩu trong form login.

### `public/assets/images/ic_calendar.svg`
- Icon lịch dùng trong datepicker.

### `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- Asset mặc định do Next.js scaffold sẵn.
- Hiện đang không phục vụ luồng nghiệp vụ chính, chủ yếu được dùng ở trang `app/page.tsx`.

## 11. Thư mục `tests/__tests__/`

Chứa các bài test chia theo nhóm chức năng.

### `tests/__tests__/app/Pages.test.tsx`
- Test render các trang trong thư mục `app`.

### `tests/__tests__/app/__snapshots__/Pages.test.tsx.snap`
- Snapshot được tạo từ `Pages.test.tsx`.

### `tests/__tests__/app/auth/logout.test.tsx`
- Test logic trang logout.

### `tests/__tests__/components/auth/LoginForm.test.tsx`
- Test component form đăng nhập.
- Thường bao gồm validation, submit, và xử lý lỗi.

### `tests/__tests__/components/layout/Layout.test.tsx`
- Test layout và các thành phần header/footer.

### `tests/__tests__/components/layout/__snapshots__/Layout.test.tsx.snap`
- Snapshot cho layout test.

### `tests/__tests__/hooks/useAuth.test.tsx`
- Test hai hook `useAuth` và `useGuest`.

### `tests/__tests__/lib/api/interceptors.test.ts`
- Test request/response interceptors của Axios client.

### `tests/__tests__/lib/auth/token.test.ts`
- Test các helper lưu, đọc, xóa và kiểm tra hết hạn token.

### `tests/__tests__/lib/validation/auth.test.ts`
- Test schema validation cho form login.

### `tests/__tests__/proxy/proxy.test.ts`
- Test logic xử lý route trong `proxy.ts`.

## 12. Thư mục phụ trợ khác

### `.next/`
- Thư mục build/cache do Next.js sinh ra.
- Không nên sửa tay.

### `node_modules/`
- Chứa toàn bộ dependency đã cài.
- Không nên sửa tay.

## 13. Luồng chạy chính của ứng dụng

1. Người dùng vào `/login`.
2. `useGuest()` kiểm tra nếu đã đăng nhập thì chuyển sang `/employees/list`.
3. `LoginForm` gửi request `POST /login`.
4. Token được lưu trong `sessionStorage`.
5. Các trang `employees/*` dùng `useAuth()` để kiểm tra token.
6. `apiClient` tự động gắn Bearer token cho request.
7. Nếu backend trả `401`, interceptor xóa token và đưa người dùng về `/login`.

## 14. Trạng thái hiện tại của dự án

- Phần xác thực có logic cơ bản và có test.
- Nhiều trang nghiệp vụ nhân viên vẫn là giao diện mockup, chưa nối API thật.
- Trang `/` vẫn là trang mặc định của Next.js, có thể thay bằng trang chuyển hướng hoặc dashboard sau.
