# DANH SÁCH ĐIỂM CHẶN & CÂU HỎI CẦN CHỦ DỰ ÁN QUYẾT ĐỊNH (BLOCKERS)
*Theo Mục 11 của runbook-trien-khai-brief.md*

---

### Câu hỏi 1 (Chặn Bước 7 — AI Ước tính):
- Dự kiến sử dụng nhà cung cấp AI nào (OpenAI, Anthropic Claude, Google Gemini)?
- Ngân sách trần tối đa mỗi tháng là bao nhiêu (USD)?
- Có cho phép người dùng tự cấu hình khóa API riêng (BYOK - Bring Your Own Key) không?

### Câu hỏi 2 (Chặn Bước 3 — Import Data.xlsx):
- Bảng danh mục vật tư hiện hành là sheet `Material` (ngày 2026-06-09) hay sheet `Sheet1` (ngày 2026-08-28)?
- Đơn giá nhân công theo từng công đoạn (RAW, MAC, VEN, ASS, SandSpay, UPH...) nằm ở đâu trong file?
- Hàng `Labour Cost Total` trong `Costing sheet` được tính từ nguồn nào (vì sao khác tổng các hàng nhân công theo công đoạn ở cả hai file mẫu)?

### Câu hỏi 3 (Bảng phụ phí MOQ):
- Bảng phụ phí MOQ hiện hành của xưởng áp dụng cho MOQ 1 và 2 là **120%** (như trong `Data.xlsx`) hay **200%** (như trong `QOT-24169-0002.xlsx`)? Có cho phép cấu hình linh hoạt theo từng khách hàng không?

### Câu hỏi 4 (Cập nhật giá vật tư từ lịch sử mua NGUYÊN_VẬT_LIỆU.xlsx):
- Khi cập nhật giá vật tư từ lịch sử PO, nên lấy theo:
  a) Giá giao dịch gần nhất,
  b) Giá trung vị 12 tháng gần nhất, hay
  c) Giá thương lượng riêng?
- Có loại bỏ hoàn toàn các đơn PO ở trạng thái "Not Approved" không?

### Câu hỏi 5 (Hiển thị Lợi nhuận):
- Nhãn "Profit 20%" nên hiển thị là **Markup trên giá vốn** (như công thức file: `Profit = COGS * 20%`) hay chuyển thành **Margin trên doanh thu**?

### Câu hỏi 6 (Quy định xuất báo giá chính thức khi có dòng AI):
- Có cho phép kết xuất báo giá chính thức gửi khách hàng khi dự án vẫn còn dòng "Ước tính AI, chưa xác nhận" hay bắt buộc người dùng phải xác nhận/nhập tay trước?

### Câu hỏi 7 (Nội dung truyền thông trên trang giới thiệu):
- Các tuyên bố như "500+ xưởng", "95% chủ xưởng" trên trang giới thiệu: nên giữ nguyên, sửa lại thành số liệu thực tế, hay gắn nhãn rõ là số liệu minh họa sản phẩm?
