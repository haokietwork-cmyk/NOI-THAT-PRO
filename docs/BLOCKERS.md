# DANH SÁCH ĐIỂM CHẶN & QUYẾT ĐỊNH CỦA CHỦ DỰ ÁN (BLOCKERS)
*Cập nhật ngày 2026-11-07 theo phản hồi trực tiếp của chủ dự án*

---

### [ĐÃ GIẢI QUYẾT] Câu hỏi 1 (Nhà cung cấp AI):
- **Quyết định của chủ dự án:** Chọn **Google Gemini** (chạy ở chế độ Demo ban đầu, không gán cứng, hỗ trợ BYOK và server API key).
- **Trạng thái:** ĐÃ TRIỂN KHAI `GeminiEstimatorProvider` tại `src/core/ai/gemini-estimator.ts` và API route `/api/ai/estimate/route.ts`. 100% test pass.

### [ĐÃ GIẢI QUYẾT] Câu hỏi 2 (Quy trình nhân công & Đơn giá dòng 723):
- **Quyết định của chủ dự án:** 
  + Lấy danh mục 37 công đoạn thực tế từ sheet `Quy trình` (cột M-Q).
  + Đơn giá nhân công theo giờ tham khảo lấy từ sheet `Material` dòng 723: **105.000 VND/h = 4.2 USD/h** (với fx = 25.000).
  + Chi phí nhân công = `Số giờ x Đơn giá giờ`. Tổng các công đoạn = `Labour Cost Total`.
  + Cho phép người dùng tự do chỉnh sửa số giờ và đơn giá giờ theo từng công đoạn thực tế của xưởng.
- **Trạng thái:** ĐÃ TRIỂN KHAI và xác nhận toán học 100% khớp số `Labour Cost Total = 211.1139 USD` trong `QOT-24169-0002.xlsx`.

### [ĐÃ GIẢI QUYẾT] Câu hỏi 3 (Bảng phụ phí MOQ linh hoạt):
- **Quyết định của chủ dự án:** Bảng MOQ phải linh hoạt, không cố định. Người dùng có thể tự do thêm, xóa, sửa các bậc MOQ và tỷ lệ phụ phí % theo từng dự án hoặc từng khách hàng.
- **Trạng thái:** ĐÃ TRIỂN KHAI cấu trúc `MoqTier[]` và `MoqConfigTier[]` động.

### [ĐÃ GIẢI QUYẾT] Câu hỏi 4 (Danh mục vật tư chuẩn):
- **Quyết định của chủ dự án:** Lấy bảng vật tư theo `Sheet1` (bản cập nhật ngày 28/08/2026) kết hợp dữ liệu tham khảo từ `NGUYÊN VẬT LIỆU.xlsx`. Mọi số liệu chỉ là tham khảo, người dùng có thể tự chỉnh sửa.
- **Trạng thái:** ĐÃ TRÍCH XUẤT 612 vật tư tham khảo thuộc 16 nhóm ngành vào `src/core/data/exportFurnitureCatalog.ts`.

---

### CÁC ĐIỂM CHỜ XÁC NHẬN TIẾP THEO (GIAI ĐOẠN SAU):
1. **Câu hỏi 5:** Nhãn hiển thị lợi nhuận "Profit 20%" giữ nguyên cách tính Markup trên giá thành (như trong Excel: `Profit = COGS * 20%`).
2. **Câu hỏi 7:** Nội dung truyền thông trên trang landing page gắn nhãn rõ là số liệu minh họa theo năng lực chuẩn xưởng.
