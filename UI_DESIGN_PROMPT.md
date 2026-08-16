# Prompt tạo giao diện Task Management

Sao chép toàn bộ nội dung dưới đây vào AI tạo giao diện (v0, Lovable, Figma AI, Bolt, v.v.).

```text
Thiết kế giao diện web responsive cho ứng dụng "Task Management". Đây là frontend cho REST API quản lý công việc; ưu tiên trải nghiệm rõ ràng, hiện đại, dễ thao tác và sẵn sàng để triển khai bằng React.

Phong cách thiết kế:
- Dashboard tối giản, chuyên nghiệp, sáng, có nhiều khoảng trắng.
- Màu chủ đạo indigo/xanh dương (#4F46E5), nền xám rất nhạt, thẻ trắng, điểm nhấn xanh lá cho trạng thái hoàn thành và đỏ cho hành động xoá.
- Font sans-serif hiện đại như Inter.
- Bo góc 12px, shadow nhẹ, icon nét mảnh.
- Responsive tốt cho desktop, tablet và mobile.

Thiết kế các thành phần và trạng thái sau:

1. Header
- Logo/icon dạng checkmark và tên "Task Management".
- Nút chính "+ Thêm công việc".

2. Khu vực tổng quan
- Ba thẻ thống kê: "Tổng công việc", "Đang thực hiện", "Đã hoàn thành".
- Mỗi thẻ có icon, số lượng lớn và màu trạng thái phù hợp.

3. Thanh công cụ
- Ô tìm kiếm với placeholder "Tìm theo tiêu đề hoặc mô tả...".
- Bộ lọc dạng tabs hoặc select: Tất cả, Đang thực hiện, Đã hoàn thành.
- Tuỳ chọn sắp xếp theo mới nhất/cũ nhất.

4. Danh sách công việc
- Hiển thị dạng card hoặc table card hiện đại.
- Mỗi task gồm: checkbox hoàn thành, title, description, trạng thái badge, ngày tạo và menu ba chấm.
- Task hoàn thành có title gạch ngang nhẹ, nền/độ tương phản dịu hơn.
- Menu hành động gồm: "Chỉnh sửa" và "Xoá".
- Có trạng thái hover/focus rõ ràng và animation nhẹ khi hoàn thành/xoá.

5. Modal tạo/chỉnh sửa task
- Tiêu đề thay đổi theo ngữ cảnh: "Thêm công việc" hoặc "Chỉnh sửa công việc".
- Input bắt buộc: title.
- Textarea: description.
- Switch hoặc checkbox: completed.
- Nút "Huỷ" và nút chính "Lưu công việc".
- Hiển thị validation khi thiếu title.

6. Các trạng thái bổ sung
- Empty state: minh hoạ checklist đơn giản, câu "Chưa có công việc nào", nút "Tạo công việc đầu tiên".
- Loading state bằng skeleton cards.
- Error state với thông báo thân thiện và nút "Thử lại".
- Modal xác nhận xoá: cảnh báo ngắn gọn, nút "Huỷ" và "Xoá công việc".

Yêu cầu trải nghiệm:
- Có thể đánh dấu hoàn thành trực tiếp từ danh sách.
- Có toast thành công/thất bại sau khi tạo, cập nhật hoặc xoá.
- Đảm bảo khả năng truy cập: label cho form, focus state, tương phản màu đủ tốt, thao tác được bằng bàn phím.
- Không cần trang đăng nhập hoặc chức năng phân quyền.

Thông tin API để frontend tích hợp:
- Base URL: http://localhost:3001/api/tasks
- GET /: lấy danh sách task.
- GET /:id: lấy chi tiết task.
- POST /: tạo task với body { "title": "...", "description": "...", "completed": false }.
- PUT /:id: cập nhật task với các trường title, description, completed.
- DELETE /:id: xoá task.
- Dữ liệu task có dạng: { "_id": "...", "title": "...", "description": "...", "completed": false, "createdAt": "...", "updatedAt": "..." }.

Hãy trả về thiết kế hoàn chỉnh cho màn hình dashboard chính, modal tạo/chỉnh sửa, empty/loading/error states và phiên bản mobile. Dùng dữ liệu mẫu thực tế bằng tiếng Việt.
```
