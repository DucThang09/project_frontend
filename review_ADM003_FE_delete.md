# ADM003 FE Review - Delete

| page | component |  | hook | lib/api | type |
|---|---|---|---|---|---|
| `app/(protected)/employees/adm003/page.tsx` chỉ gọi `useAuth()` và render `EmployeeDetail`. Không chứa logic delete. | `components/EmployeeDetail.tsx` gắn nút `削除` với `onDelete` từ hook. UI không disable nút khi đang xử lý delete, nên có rủi ro click lặp nhanh nhiều request. | Điều hướng sau delete dùng query `message` (`/employees/adm006?message=...`) để màn hoàn tất hiển thị đúng message code backend. | `hooks/useADM003.ts` xử lý chính: kiểm tra `employeeDetail`, xác nhận `window.confirm(MSG004)`, gọi API `deleteEmployee(String(employeeDetail.employeeId))`, nếu `response.code !== 200` hoặc thiếu `message.code` thì vào `/employees/system-error`, success thì sang `/employees/adm006?message=${response.message.code}`. | `lib/api/employee.api.ts` dùng `DELETE /employee` với query param `employeeId`. Wrapper trả `EmployeeDeleteApiResponse`. Contract frontend đang giả định backend luôn trả `code` và có `message.code` khi thành công. | `types/employee.ts` định nghĩa `EmployeeDeleteApiResponse` gồm `code`, `employeeId?`, `message?`. Type khá lỏng (optional), nên hook phải tự guard `response.message?.code` (đã làm). |

## Test Coverage Check

| Item | Status |
|---|---|
| Delete success -> điều hướng `/employees/adm006?message=MSG003` | Có (`tests/__tests__/hooks/useADM003.test.tsx`) |
| User cancel confirm -> không gọi API delete | Có |
| Không có detail -> vào system error | Có |
| API delete lỗi/không trả message -> vào system error | Có |
| Chặn double-click delete (isDeleting) | Chưa có |

## Notes

- Nếu muốn tránh gửi nhiều request delete khi người dùng bấm liên tục, nên thêm state `isDeleting` trong `useADM003` và disable nút `削除` trong lúc chờ response.
- Luồng hiện tại phụ thuộc `response.message.code` để hiển thị ADM006. Nếu backend đổi shape response, màn ADM006 sẽ rơi system-error theo guard hiện tại.
