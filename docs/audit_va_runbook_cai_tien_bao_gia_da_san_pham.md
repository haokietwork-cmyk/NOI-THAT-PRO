# BÁO CÁO AUDIT LỖI LOGIC & RUNBOOK CẢI TIẾN ĐỘNG CƠ BÁO GIÁ ĐA SẢN PHẨM (UNIVERSAL COMPOSABLE QUOTING ENGINE)

> **Tài liệu đặc tả kỹ thuật và hướng dẫn thực thi dành cho Coding Agent trên dự án [Auto-Mộc Quoting Tool](https://auto-moc.vercel.app/quoting?demo=true).**  
> **Mục tiêu cốt lõi:** Xóa bỏ hoàn toàn sự phụ thuộc cứng vào "Tủ ván công nghiệp" hoặc bất kỳ loại sản phẩm cố định nào. Chuyển đổi Mục 2 (Kết cấu & Vật liệu) và Động cơ tính giá sang kiến trúc **Lắp ghép Mô-đun Vật lý Tổng quát (`Universal Composable Structural Engine`)**, đảm bảo **MỌI sản phẩm nội/ngoại thất** (tủ kệ, bàn ghế, sofa, giường, cửa, vách trang trí, quầy đảo, đồ gỗ thịt, kim loại, đá, kính, mây đan, sản phẩm lai ghép độc bản...) với **MỌI quy mô số lượng (từ 1 cái lẻ đến 500+ cái xuất khẩu)** đều được bóc tách và báo giá trơn tru, chính xác.

## 1. BÁO CÁO ĐÁNH GIÁ & 8 LỖI HỆ THỐNG PHÁT HIỆN TRÊN TRANG WEB HIỆN TẠI

Qua kiểm thử thực tế trên [Auto-Mộc Quoting Tool](https://auto-moc.vercel.app/quoting?demo=true) (sử dụng ca kiểm thử áp lực là sản phẩm có kết cấu phức tạp ngoài tủ ván: `W2000 × D900 × H700`, kết cấu đa vật liệu `Plywood + Beech + Poplar`, phạm vi hoàn thiện `Finish to Foam`, số lượng `500 cái`), hệ thống bộc lộ **8 lỗi kiến trúc và logic tính toán** làm sai lệch kết quả của mọi dòng sản phẩm không phải tủ áo/tủ bếp:

| Mã lỗi | Mức độ | Vị trí / Thành phần | Mô tả lỗi & Bằng chứng tái hiện trên Web | Hậu quả đối với các dòng sản phẩm khác nhau |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **Critical** | Mục 2 UI & Engine sinh BOM cơ sở | **Khóa cứng giả định "Mọi sản phẩm đều là Tủ có 4 cánh + 2 ngăn kéo":** Hai trường `Cốt vật liệu thùng & đợt (*)` và `Bề mặt cánh & mặt tiền (*)` là bắt buộc, không thể tắt. Khi nhập kích thước `2000×900×700`, hệ thống tự động sinh cứng `2.5 tấm ván MDF` (`1.955.000 đ`), `50.5 md chỉ PVC` (`190.890 đ`), `12 bản lề` (`540.000 đ`), `2 bộ ray kéo` (`330.000 đ`) và `1 gói ốc cam` (`69.000 đ`). | Mọi sản phẩm không có thùng/cánh (Bàn ăn, Ghế rời, Sofa, Giường, Vách ốp, Kệ khung sắt, Gương LED...) đều bị đội khống hơn `3.000.000 đ/cái` tiền ván, chỉ dán cạnh, bản lề và ray trượt không hề tồn tại. |
| **BUG-02** | **Critical** | Dropdown chọn vật liệu Mục 2 | **Ràng buộc đơn vật liệu (`Single-Select`) cho mỗi bộ phận:** Chỉ cho phép chọn 1 mã vật tư duy nhất trong dropdown. Ngoài ra, khi chọn ván ở dropdown đầu, dòng BOM hiển thị mã `WO01_THONG_SAY` (Gỗ thông sấy) nhưng đơn giá lại lấy `680.000 đ/tấm` của MDF 17mm. | Không thể báo giá các sản phẩm phối hợp nhiều vật liệu trong cùng một hệ khung/thân (VD: Khung kết hợp `Ván Plywood + Gỗ cứng Beech + Gỗ phụ Poplar`, hoặc Bàn kết hợp `Gỗ tự nhiên + Sắt sơn tĩnh điện + Đồng thau`). |
| **BUG-03** | **High** | Nhóm nút gạt "Thành phần kết cấu & vật liệu phụ trợ" | **Nút gạt `[Không / Có]` thiếu tham số định lượng hình học:** Ngoại trừ mục Mặt đá có 2 câu hỏi con, các mục `Kính cường lực`, `Khung kim loại`, `Bọc nệm/da/nỉ/mây`, `Đèn LED` khi gạt sang `Có` hoàn toàn không có câu hỏi con để xác định quy cách, tỷ trọng hay phạm vi phủ. Hệ thống áp cứng một con số cố định (VD: Bọc nệm luôn tính `1.6 m² × 750.000 đ = 1.260.000 đ`). | Sai lệch nghiêm trọng khi thành phần đó là kết cấu chính (VD: Sofa bọc toàn khối cần `~0.45 m³` mút + `8.6 md` vải; Tủ cánh kính full cao 2.6m cần diện tích kính gấp 4 lần kệ thấp; Khung sắt đan nan dày tốn mét dài gấp 3 lần khung chân bàn đơn giản). |
| **BUG-04** | **High** | Cấu trúc dữ liệu lớp hoàn thiện | **Gộp cứng các lớp vật tư trung gian và hoàn thiện cuối vào 1 dòng:** Ví dụ gộp chung "Mút xốp D40 + Vải/da" vào một đơn giá `750.000 đ/m²`, hoặc gộp cứng ván với bề mặt phủ. | Không thể báo giá các đơn hàng gia công theo công đoạn thực tế như: `Phôi mộc chưa sơn (Raw Wood)`, `Hoàn thiện tới lớp mút (Finish to Foam)`, hay `Khách hàng tự cấp vải/da/đá (COM - Customer's Own Material)`. |
| **BUG-05** | **High** | Ô `Số lượng đặt hàng (SL)` Mục 1 & Tab 4 MOQ | **Đứt gãy đồng bộ State giữa ô Số lượng (`SL`) và kết quả báo giá:** Gõ `500` vào ô `SL` ở Mục 1 nhưng cột kết quả bên phải vẫn hiển thị đơn giá lẻ của mốc cơ sở 20 bộ (`12.198.018 đ/cái`). Phải tự mở Tab 4 (`Bậc thang MOQ`) và bấm nút `+ 500 bộ (-20%)` mới ra giá `9.758.414 đ/cái`. | Gây nhầm lẫn trực tiếp cho người báo giá khi tưởng đơn giá ở cột phải đã được chiết khấu theo số lượng vừa nhập ở Mục 1. |
| **BUG-06** | **High** | Engine tính Giá vốn (COGS) & Đóng gói vận chuyển | **Giá vốn (COGS) vô cảm với quy mô lô sản xuất (Batch Size = 500):** Ở mốc 500 cái, hệ thống chỉ giảm giá bán `-20%` (ăn vào biên lợi nhuận), còn Giá vốn `7.392.738 đ/cái` giữ nguyên như làm 1 cái lẻ. Đặc biệt, chi phí vận chuyển giữ nguyên `1 chuyến × 450.000 đ/cái` (tương đương tính **500 chuyến xe tải = 225.000.000 đ** cho 500 cái!). | Làm đội giá vốn lô lớn lên 25%–40% so với thực tế xưởng (lô 500 cái thực tế giảm mạnh hao hụt cắt phôi nhờ Nesting, giảm giờ công nhờ cữ/rập dây chuyền, và đóng gói tính theo `CBM m³` xếp container chứ không đi 500 chuyến xe lẻ). |
| **BUG-07** | **Medium** | Bảng Nhân công 5 phân xưởng | **Lỗi cộng tổng ẩn dòng (`315.000 đ`) và gán cứng công đoạn:** Tiêu đề ghi "5 phân xưởng", tổng nhân công ghi `1.270.500 đ` (`12.1 giờ × 105.000 đ/h`), nhưng giao diện chỉ hiển thị 4 dòng cộng lại bằng `955.500 đ` (`9.1 giờ`), bị ẩn mất 1 phân xưởng `3.0 giờ` (`315.000 đ`). Đồng thời luôn tính công `Cắt CNC & Dán nẹp` và `Phun sơn 2K` dù sản phẩm không dùng ván CNC hay sơn 2K. | Bảng giải trình nhân công thiếu minh bạch (cộng các dòng hiển thị không bằng tổng) và tính sai tổ thợ thực tế tham gia sản xuất. |
| **BUG-08** | **Medium** | Phân bổ Overhead & Hiển thị tiền tệ | **Gán cứng tỷ lệ Overhead (`0% / 10% / 25%`) và thiếu quy đổi `USD / VND`:** Mặc định đẩy Bọc nệm vào `10% OH Thầu phụ`, Đá/Kính/Kim loại vào `0% OH` mà không cho xưởng chọn *Tự sản xuất tại xưởng* hay *Thuê ngoài*; thiếu hiển thị song song `USD` và `VND` cho đơn hàng xuất khẩu. | Xưởng tự làm khung sắt hoặc tự bọc nệm tại xưởng bị tính thiếu Overhead nhà xưởng; báo giá khách nước ngoài phải tự chia tỷ giá thủ công ngoài Excel. |

## 2. KIẾN TRÚC CẢI TIẾN TỔNG QUÁT: MÔ HÌNH LẮP GHÉP KẾT CẤU VẬT LÝ CHO MỌI SẢN PHẨM

Để giải quyết triệt để bài toán **"Tất cả sản phẩm đều được báo giá trơn tru và chính xác"** (mẫu Sofa 500 cái chỉ là 1 ca kiểm thử), Agent **TUYỆT ĐỐI KHÔNG** viết câu hỏi hay hàm tính toán đóng khung theo tên sản phẩm (không viết hàm riêng cho Tủ, Bàn, hay Sofa). Thay vào đó, toàn bộ hệ thống phải vận hành trên **3 nguyên lý kiến trúc tổng quát** sau:

### 2.1. Nguyên lý 1: Mọi sản phẩm đều là tổ hợp bật/tắt của 6 Khối Kết Cấu Vật Lý (`Universal Structural Blocks`)

Từ kích thước bao tổng thể `W (Rộng) × D (Sâu) × H (Cao)` và `SL (Số lượng)`, bất kỳ sản phẩm nào cũng được cấu thành bằng cách bật/tắt từ 1 đến 6 khối vật lý độc lập dưới đây. **Khối nào không bật thì khối lượng vật tư, phụ kiện và nhân công của khối đó bằng 0 tuyệt đối:**

| Mã Khối (`BlockId`) | Tên hiển thị trên Giao diện (Mục 2) | Bản chất vật lý & Đơn vị đo gốc | Áp dụng thực tế cho các sản phẩm bất kỳ |
| :--- | :--- | :--- | :--- |
| **`B1_PANEL_BOX`** | **Thùng hộp, Vách tấm & Cánh** | Diện tích tấm phẳng ($m^2$ / tấm chuẩn `1220×2440`) + Chu vi cạnh ($md$) | Tủ áo, tủ bếp, kệ tivi, hộc tủ, bàn gỗ công nghiệp, vách ngăn phẳng, hộp kỹ thuật |
| **`B2_FRAME_SKELETON`** | **Khung xương, Chân đỡ & Thanh giằng** | Chiều dài thanh ($md$) $\rightarrow$ Quy đổi ra thể tích gỗ phôi ($m^3$) hoặc trọng lượng kim loại ($kg$/cây $6\text{m}$) + Ván định hình khung ($m^2$) | Khung gỗ thịt bàn/ghế, khung xương ẩn của sofa/giường bọc, chân bàn sắt/inox, khung kệ sắt, khung vách, cầu thang |
| **`B3_SURFACE_SLAB`** | **Mặt phẳng, Ốp bề mặt & Kính/Đá** | Diện tích mặt tiếp xúc ($m^2$) + Chu vi gia công cạnh mài/vát mòi ($md$) | Mặt bàn đá/gỗ nguyên tấm/kính, mặt bếp, đảo bếp thác đổ, cánh kính khung nhôm, gương soi, vách ốp đá/mây mắt cáo |
| **`B4_VOLUME_CUSHION`** | **Khối Đệm mút, Đàn hồi & Bọc phủ** | Thể tích khối ($m^3$ mút/bông) + Diện tích/Mét tới lớp bọc ngoài ($m^2$ / $md$ khổ cuộn / $sqft$ da) + Đường may viền ($md$) | Đệm ghế ăn, sofa mọi kiểu dáng, đầu giường bọc nệm, vách tiêu âm bọc nỉ, nệm rời, gối tựa |
| **`B5_SURFACE_FINISH`** | **Hoàn thiện Sơn, Phủ & Xử lý bề mặt** | Diện tích bề mặt lộ thiên ($m^2$ sơn PU/2K, lau dầu, mạ PVD, sơn tĩnh điện) | Đồ gỗ tự nhiên sơn PU, cánh MDF sơn 2K, khung sắt sơn tĩnh điện, khung inox mạ PVD, xử lý chống thấm ngoài trời |
| **`B6_HARDWARE_ELECTRO`** | **Phụ kiện Cơ khí, Liên kết & Đèn/Điện** | Đếm theo đơn vị rời (`cái`, `bộ`, `gói`) hoặc theo chiều dài lắp đặt ($md$ dây LED/máng nhôm) | Bản lề, ray kéo, tay nắm, ốc cam/chốt mộng, chân tăng chỉnh, bánh xe, lò xo/đai thun, đèn LED cảm biến |

### 2.2. Nguyên lý 2: Đa vật liệu trong cùng một khối (`Multi-Material Mix`) & Tách cấp độ hoàn thiện (`Completion Scope`)

Trong mỗi khối được bật, thay vì 1 dropdown đơn lẻ, người dùng có thể:
1. **Chọn nhanh 1 vật liệu chuẩn (Chế độ Cơ bản - 1 chạm):** Dành cho người dùng phổ thông cần báo giá trong 15 giây.
2. **Bấm `[+ Phối thêm vật liệu trong khối này]` (Chế độ Thực chiến xưởng):** Cho phép khai báo nhiều vật liệu cùng tham gia vào một kết cấu kèm tỷ trọng phân bổ (VD: Trong khối `B2_FRAME_SKELETON`, khai báo `50% Ván Plywood định hình + 30% Gỗ Beech chịu lực chính + 20% Gỗ Poplar làm đố phụ`; hoặc trong khối `B4_VOLUME_CUSHION`, khai báo `70% Mút cứng D40 + 30% Mút êm D25`).
3. **Chọn Phạm vi cung ứng (`Supply & Completion Scope`) cho từng khối:**
   - `FULL_TURNKEY` *(Xưởng cấp 100% vật tư + gia công hoàn thiện)*.
   - `SEMI_FINISHED` *(Bán thành phẩm / Hoàn thiện tới lớp trung gian — ví dụ: `Phôi mộc chưa sơn`, hoặc `Finish to Foam - Khung + Mút chưa bọc vải ngoài`)*.
   - `CLIENT_SUPPLIED_MATERIAL (COM)` *(Khách tự cấp vật tư chính như Vải/Da/Đá/Phụ kiện; xưởng chỉ tính vật tư phụ + nhân công lắp đặt/gia công)*.
4. **Chọn Nguồn thực hiện (`Execution Source` quyết định Overhead):**
   - `IN_HOUSE` *(Sản xuất tại xưởng — chịu `% OH Xưởng`, mặc định `25%` hoặc `35%`)*.
   - `SUBCONTRACT` *(Thuê gia công ngoài — chịu `% OH Quản lý thầu phụ`, mặc định `10%`)*.
   - `PASS_THROUGH` *(Mua thương mại trao tay — `0% OH`)*.

### 2.3. Nguyên lý 3: Từ điển Công thức Hình học Chuẩn hóa (`Parametric Geometry Drivers`)

Thay vì gán cứng số lượng tấm ván hay `1.6 m²` nệm, mọi dòng vật tư trong các khối `B1 -> B6` đều được tính tự động từ bộ biến kích thước phủ bì `(W, D, H)` (đổi sang đơn vị mét: $w = W/1000, d = D/1000, h = H/1000$) thông qua các chế độ hình học trực quan mà người dùng chọn bằng mắt:

| Khối kết cấu | Chế độ hình học chọn trên UI (`Geometry Mode`) | Công thức toán học tổng quát từ $(w, d, h)$ |
| :--- | :--- | :--- |
| **`B1_PANEL_BOX`** *(Thùng/Vách/Cánh)* | • `SINGLE_PANEL_FACE` (Vách phẳng 1 mặt)<br>• `OPEN_SHELF_BOX` (Khung hộp không cánh)<br>• `CLOSED_CABINET_BOX` (Tủ hộp kín có cánh/ngăn) | • Diện tích vỏ hộp: $A_{\text{shell}} = k_{\text{top}}\cdot(w\cdot d) + k_{\text{bottom}}\cdot(w\cdot d) + 2(d\cdot h) + k_{\text{back}}\cdot(w\cdot h)$<br>• Diện tích vách đứng & đợt ngang: $A_{\text{internal}} = N_{\text{div}}\cdot(d\cdot h) + N_{\text{shelf}}\cdot(w\cdot d)$<br>• Diện tích cánh & mặt ngăn kéo: $A_{\text{front}} = k_{\text{door\_cov}}\cdot(w\cdot h)$<br>• Chu vi dán cạnh PVC: $L_{\text{edge}} = 2(w + h)\cdot N_{\text{door}} + (w + 2d)\cdot(N_{\text{shelf}} + 2) + 2h\cdot(N_{\text{div}} + 2)$ |
| **`B2_FRAME_SKELETON`** *(Khung thanh & Ván khung)* | • `PERIMETER_4_LEGS` (4 chân + diềm mặt bàn/ghế)<br>• `SPACE_FRAME_3D` (Khung lồng 3D kệ/bàn)<br>• `RIBBED_STRUCTURAL_BOX` (Khung hộp đố giằng chịu lực dày) | • Tổng chiều dài thanh chính ($md$): $L_{\text{main}} = 2(w + d)\cdot n_{\text{tiers}} + 4h\cdot k_{\text{legs}}$<br>• Số đố giằng phụ theo bước đố $s$ (`0.3m - 0.5m`): $N_{\text{rib}} = \lceil w / s \rceil + 1 \implies L_{\text{sub}} = N_{\text{rib}}\cdot(d + h) + 2w$<br>• Thể tích gỗ phôi ($m^3$): $V_{\text{wood}} = (L \times \text{Rộng tiết diện} \times \text{Dày tiết diện}) \times k_{\text{waste}}$<br>• Diện tích ván định hình khung ($m^2$): $A_{\text{form}} = [w\cdot d + 2(w\cdot h + d\cdot h)] \times k_{\text{form\_cov}}$ |
| **`B3_SURFACE_SLAB`** *(Mặt đá/Kính/Tấm mặt)* | • `TOP_HORIZONTAL` (Mặt nằm ngang $W\times D$)<br>• `FRONT_VERTICAL` (Mặt đứng $W\times H$)<br>• `WATERFALL_3_SIDES` (Mặt ngang + 2 vách thác đổ) | • Mặt ngang: $A = w\cdot d$, Chu vi cạnh: $P = 2(w + d)$<br>• Mặt đứng: $A = w\cdot h$, Chu vi cạnh: $P = 2(w + h)$<br>• Thác đổ 3 mặt: $A = w\cdot d + 2(d\cdot h)$, Chu vi mòi: $P = 2w + 4d + 4h$ |
| **`B4_VOLUME_CUSHION`** *(Đệm mút & Bọc da/vải)* | • `FLAT_PAD_1D` (Đệm lót mặt phẳng $W\times D$)<br>• `L_SHAPE_SEAT_BACK` (Đệm ngồi + Tựa lưng)<br>• `FULL_WRAP_360` (Bọc trùm 360° toàn khối)<br>• `SCULPTED_PLUMP_3D` (Khối đệm dày bo tròn 3D) | • Thể tích mút ($m^3$):<br>  - Đệm phẳng / L-shape: $V_{\text{foam}} = A_{\text{covered}} \times T_{\text{foam}}$ (Độ dày $T_{\text{foam}} \in [0.03, 0.25]\text{m}$)<br>  - Khối 3D toàn phần: $V_{\text{foam}} = (w \cdot d \cdot h) \times r_{\text{fill}}$ (Tỷ lệ lấp đầy mút $r_{\text{fill}} \in [0.20, 0.55]$)<br>• Lượng vải bọc khổ $1.4\text{m}$ ($md$): $L_{\text{fabric}} = \frac{A_{\text{wrap}} \times k_{\text{pleat}}}{1.4} \times k_{\text{waste}}$ (với $A_{\text{wrap}} = [w\cdot d + 2(w\cdot h + d\cdot h)] \times k_{\text{wrap\_factor}}$) |
| **`B5_SURFACE_FINISH`** *(Sơn/Hoàn thiện)* | • Tự động tính từ diện tích lộ thiên của `B1`, `B2`, `B3` | • $A_{\text{finish}} = \sum (\text{Diện tích bề mặt các thành phần có } \texttt{isExposedFinish = true})$ |
| **`B6_HARDWARE_ELECTRO`** *(Phụ kiện & Điện)* | • Tự động suy từ số lượng cấu kiện thực tế | • Bản lề $= N_{\text{swing\_doors}} \times \text{hingesPerDoor}(h)$ *(Nếu $N_{\text{swing\_doors}} = 0 \implies 0$)*<br>• Ray trượt $= N_{\text{drawers}}$ *(Nếu $N_{\text{drawers}} = 0 \implies 0$)*<br>• Lò xo/Đai thun $= \lceil w / 0.12 \rceil$ *(Chỉ sinh khi bật `B4` có hệ đàn hồi đáy)* |

### 2.4. Nguyên lý 4: Động cơ Kinh tế học theo Quy mô Lô (`Batch Scale Economics Engine`)

Khi số lượng đặt hàng `quantity (SL)` thay đổi từ `1` lên `500+`, hệ thống không chỉ áp chiết khấu thương mại trên giá bán mà phải tự động cập nhật **Giá vốn đơn vị (`Unit COGS`)** theo 4 quy luật vật lý của sản xuất công nghiệp:

$$\text{Unit COGS}(Q) = \text{MatCost}\big(k_{\text{waste}}(Q)\big) + \text{LaborCost}\big(\eta_{\text{labor}}(Q)\big) + \frac{C_{\text{setup\_jig}}}{Q} + \text{LogisticsPerUnit}(Q, \text{CBM}) + \text{Overhead}(Q)$$

1. **Hàm giảm hao hụt vật tư theo quy mô cắt Nesting $k_{\text{waste}}(Q)$:**
   $$k_{\text{waste}}(Q) = 1 + (k_{\text{waste\_base}} - 1) \times \max\Big(0.40,\; 1 - 0.12 \cdot \ln(Q)\Big)$$
   *(Ví dụ: Ván có hao hụt lẻ $k_{\text{waste\_base}} = 1.15$ ở $Q=1 \rightarrow$ giảm xuống $1.10$ ở $Q=20 \rightarrow$ giảm xuống $1.06$ ở $Q=500$. Gỗ tự nhiên từ $1.45$ ở $Q=1 \rightarrow$ giảm xuống $1.32$ ở $Q=500$).*
2. **Hàm hiệu suất nhân công theo dây chuyền $\eta_{\text{labor}}(Q)$:**
   $$\eta_{\text{labor}}(Q) = \begin{cases} 1.30 & \text{nếu } Q = 1 \text{ (làm đồ lẻ, tự căn cữ)} \\ 1.10 & \text{nếu } 2 \le Q < 10 \\ 1.00 & \text{nếu } 10 \le Q < 50 \text{ (mốc chuẩn xưởng)} \\ 0.85 & \text{nếu } 50 \le Q < 200 \\ 0.75 & \text{nếu } Q \ge 200 \text{ (chuyên môn hóa cữ gá, rập khuôn hàng loạt)} \end{cases}$$
3. **Hàm Đóng gói & Vận chuyển thông minh theo Thể tích kiện hàng $\text{CBM} = w \cdot d \cdot h \cdot 1.15$:**
   - **Chế độ Giao lẻ nội địa (`LOCAL_TRIP`, mặc định khi $Q \le 10$):**
     Số chuyến xe tải $= \lceil (Q \times \text{CBM}) / V_{\text{truck}} \rceil$ (với xe tải nhỏ $V_{\text{truck}} = 8\text{ m}^3$, đơn giá `450.000 đ/chuyến`).
     Chi phí vận chuyển trên 1 sản phẩm $= \frac{\text{Số chuyến} \times 450.000}{Q} + C_{\text{pe\_wrap}}$.
   - **Chế độ Đóng kiện công nghiệp / Xuất khẩu (`INDUSTRIAL_CBM`, tự động kích hoạt khi $Q > 10$ hoặc bật chế độ Xuất khẩu):**
     Tính theo diện tích thùng Carton 5 lớp $A_{\text{carton}} = 2(wd + wh + dh) \times 1.10$, xốp góc PE và bốc xếp theo $\text{CBM}$ (khoảng `95.000 – 145.000 đ/cái` cho sản phẩm `1.26 CBM`, chấm dứt hoàn toàn lỗi nhân `500 chuyến × 450.000 đ = 225 triệu đ`).

## 3. RUNBOOK TRIỂN KHAI TỪNG BƯỚC CHO CODING AGENT

> **Quy tắc bắt buộc cho Agent khi thực thi:**
> 1. Tuân thủ nghiêm ngặt quy trình kiểm tra sau mỗi bước: `npx tsc --noEmit` $\rightarrow$ `npm test` $\rightarrow$ `npm run build`.
> 2. Bảo toàn 100% các bài test Golden cũ của `panel_cnc` và `export_furniture` (không làm gãy dữ liệu lịch sử).
> 3. Không hardcode bất kỳ con số vật tư/phụ kiện nào nếu mô-đun chứa nó đang ở trạng thái `enabled: false`.

### BƯỚC 1: Chuẩn Hóa Schema Cấu Hình Kết Cấu Tổng Quát (`src/core/calculations/structural-schema.ts`)

**Mục tiêu:** Tạo cấu trúc dữ liệu mở đại diện cho mọi sản phẩm bằng cách lắp ghép 6 khối `B1 -> B6`, hỗ trợ đa vật liệu trong mỗi khối và liên kết trực tiếp với `orderQuantity`.

**Hướng dẫn thực hiện cho Agent:**
1. Tạo file `src/core/calculations/structural-schema.ts` định nghĩa rõ các interface sau:

```typescript
export type StructuralBlockId =
  | 'B1_PANEL_BOX'        // Thùng hộp, vách phẳng, đợt kệ, cánh mở/lùa
  | 'B2_FRAME_SKELETON'   // Khung xương gỗ thịt, ván định hình khung, khung sắt/inox/nhôm
  | 'B3_SURFACE_SLAB'     // Mặt đá, mặt kính, mặt gỗ nguyên tấm, tấm ốp trang trí
  | 'B4_VOLUME_CUSHION'   // Đệm mút, hệ lò xo/đai thun, bọc da/vải/nỉ/mây
  | 'B5_SURFACE_FINISH'   // Sơn PU, sơn 2K, lau dầu, sơn tĩnh điện, mạ PVD
  | 'B6_HARDWARE_ELECTRO';// Phụ kiện kim khí, liên kết, đèn LED & nguồn

export type CompletionScope =
  | 'FULL_TURNKEY'        // Xưởng cấp đủ vật tư & hoàn thiện 100%
  | 'SEMI_FINISHED'       // Bán thành phẩm (VD: Finish to Foam / Phôi mộc chưa sơn / Khung thô)
  | 'CLIENT_MATERIAL_COM';// Khách cấp vật tư bề mặt chính, xưởng tính phụ liệu + nhân công

export type ExecutionSource =
  | 'IN_HOUSE'            // Sản xuất tại xưởng (chịu OH Xưởng: 25% - 35%)
  | 'SUBCONTRACT'         // Thuê gia công ngoài (chịu OH Thầu phụ: 10%)
  | 'PASS_THROUGH';       // Mua đứt thương mại (0% OH)

export interface MaterialAllocationRow {
  id: string;
  materialCode: string;          // Mã vật tư từ thư viện xưởng hoặc catalog 612 mã
  materialName: string;
  category: 'BOARD' | 'TIMBER_M3' | 'METAL_LEN' | 'STONE_M2' | 'GLASS_M2' | 'FOAM_M3' | 'FABRIC_MD' | 'FINISH_M2' | 'HARDWARE_UNIT';
  unit: 'sheet' | 'm2' | 'm3' | 'md' | 'kg' | 'unit' | 'set';
  unitPriceVnd: number;
  baseWasteFactor: number;       // Hao hụt ở mốc chuẩn (tự động co giãn theo SL)
  allocationRatio: number;       // Tỷ trọng trong khối (VD: 0.6 cho ván khung, 0.4 cho gỗ thanh)
  thicknessOrSpecMm?: number;    // Độ dày ván/mút hoặc tiết diện thanh
  isExposedFinish?: boolean;     // Có cần sơn/hoàn thiện bề mặt lộ thiên không
}

export interface UniversalProductStructure {
  productName: string;
  dimensionsMm: { width: number; depth: number; height: number };
  orderQuantity: number;         // Đồng bộ 2 chiều giữa Mục 1 và Tab MOQ
  targetMarginPercent: number;
  currencyConfig: {
    displayMode: 'VND_ONLY' | 'USD_AND_VND';
    usdExchangeRate: number;     // Mặc định 25000
  };
  enabledBlocks: StructuralBlockId[];

  // Cấu hình chi tiết từng khối (chỉ tính toán khi mã khối nằm trong enabledBlocks)
  panelBoxConfig?: {
    geometryMode: 'SINGLE_PANEL_FACE' | 'OPEN_SHELF_BOX' | 'CLOSED_CABINET_BOX' | 'BASE_NO_TOP';
    hasBackPanel: boolean;
    verticalDividers: number;
    horizontalShelves: number;
    swingDoors: number;          // Quyết định trực tiếp số bản lề
    slidingDoors: number;        // Quyết định trực tiếp bộ ray lùa
    drawers: number;             // Quyết định trực tiếp số bộ ray kéo
    edgeBandingRule: 'ALL_EXPOSED_EDGES' | 'FRONT_ONLY' | 'MITER_45_NO_EDGE' | 'NONE';
    materials: MaterialAllocationRow[];
    scope: CompletionScope;
    executionSource: ExecutionSource;
  };

  frameSkeletonConfig?: {
    geometryMode: 'PERIMETER_4_LEGS' | 'SPACE_FRAME_3D' | 'RIBBED_STRUCTURAL_BOX';
    ribSpacingMm: 300 | 400 | 500 | 0; // 0 nếu không có đố giằng phụ
    formingBoardCoverageRatio: number; // 0 -> 1.0 (Tỷ lệ ván Plywood định hình khung)
    materials: MaterialAllocationRow[]; // Hỗ trợ đa vật liệu: Plywood + Beech + Poplar + Sắt...
    scope: CompletionScope;
    executionSource: ExecutionSource;
  };

  surfaceSlabConfig?: {
    geometryMode: 'TOP_HORIZONTAL' | 'FRONT_VERTICAL' | 'WATERFALL_3_SIDES' | 'CUSTOM_AREA';
    edgeProfile: 'FLAT_POLISH' | 'MITER_45_THICK' | 'BULLNOSE_CNC';
    customAreaRatio?: number;
    materials: MaterialAllocationRow[];
    scope: CompletionScope;
    executionSource: ExecutionSource;
  };

  volumeCushionConfig?: {
    geometryMode: 'FLAT_PAD_1D' | 'L_SHAPE_SEAT_BACK' | 'FULL_WRAP_360' | 'SCULPTED_PLUMP_3D';
    foamFillRatioOrThickness: number;  // Độ dày m (nếu phẳng) hoặc tỷ lệ thể tích 0.25-0.55 (nếu khối 3D)
    suspensionSystem: 'NONE' | 'WEBBING_STRAP' | 'SINUOUS_SPRING_WEBBING' | 'POCKET_SPRING';
    seamAndDetailStyle: 'PLAIN_SEAM' | 'PIPING_WELT' | 'DEEP_TUFTING';
    dacronWrapGram: 0 | 200 | 300;
    foamMaterials: MaterialAllocationRow[];  // Tách riêng lớp Mút (luôn tính khi bật B4)
    coverMaterials: MaterialAllocationRow[]; // Tách riêng lớp Vỏ bọc (ẩn tiền vải khi scope === 'SEMI_FINISHED' / Finish to Foam)
    scope: CompletionScope;
    executionSource: ExecutionSource;
  };

  surfaceFinishConfig?: {
    finishType: 'NONE_RAW' | 'MELAMINE_PRELAM' | 'PU_WOOD_COATING' | 'PAINT_2K' | 'POWDER_COAT_METAL' | 'PVD_PLATING';
    coverageMultiplier: number;  // 1.0 cho 1 mặt, 2.0 cho 2 mặt
    materials: MaterialAllocationRow[];
    executionSource: ExecutionSource;
  };

  hardwareElectroConfig?: {
    hardwareTier: 'STANDARD_DTC' | 'MID_HAFELE' | 'PREMIUM_BLUM';
    hasLedSystem: boolean;
    ledMetersCount?: number;
    customDiscreteItems: Array<{
      name: string;
      qtyPerProduct: number;
      unitPriceVnd: number;
    }>;
    executionSource: ExecutionSource;
  };

  logisticsConfig: {
    mode: 'AUTO_BY_QUANTITY' | 'LOCAL_TRUCK_TRIP' | 'INDUSTRIAL_CBM_PACKING';
    truckTripPriceVnd: number;   // Mặc định 450000
    truckCapacityCbm: number;    // Mặc định 8.0 m3
    cartonAndPePricePerCbmVnd: number; // Mặc định 95000 đ/CBM
  };
}
```

### BƯỚC 2: Xây Dựng Bộ Giải Đa Kết Cấu & Kinh Tế Học Quy Mô (`src/core/calculations/universal-resolver.ts`)

**Mục tiêu:** Thay thế hoàn toàn các hằng số gán cứng (`2.5 tấm MDF`, `12 bản lề`, `2 bộ ray`, `1.6 m² nệm`, `1 chuyến xe 450.000 đ`) bằng các hàm toán học thuần túy dựa trên `UniversalProductStructure`.

**Hướng dẫn thực hiện cho Agent:**
1. **Triển khai hàm `resolveBatchEconomics(orderQuantity: number)`:**
   - Tính hệ số giảm hao hụt `wasteDecayMultiplier = Math.max(0.4, 1 - 0.12 * Math.log(Math.max(1, orderQuantity)))`.
   - Với mỗi vật tư có `baseWasteFactor` (ví dụ `1.15`), hao hụt thực tế tại số lượng `Q` là:
     `effectiveWaste = 1 + (baseWasteFactor - 1) * wasteDecayMultiplier`.
   - Tính hệ số hiệu suất giờ công `laborCurveMultiplier` (`Q=1 -> 1.30`, `Q=5 -> 1.10`, `Q=20 -> 1.00`, `Q=100 -> 0.85`, `Q>=200 -> 0.75`).
2. **Triển khai hàm `resolveBlockQuantities(structure: UniversalProductStructure)`:**
   - Kiểm tra `structure.enabledBlocks`. Nếu **KHÔNG** có `'B1_PANEL_BOX'`, trả về `0` cho ván thùng, chỉ dán cạnh PVC, bản lề cánh tủ, ray ngăn kéo và ốc cam.
   - Nếu có `'B1_PANEL_BOX'`:
     - Chỉ sinh bản lề khi `swingDoors > 0` (`qty = swingDoors * getHingesPerDoor(height)`).
     - Chỉ sinh ray trượt khi `drawers > 0` (`qty = drawers`).
     - Chỉ sinh chỉ dán cạnh PVC khi `edgeBandingRule !== 'NONE' && edgeBandingRule !== 'MITER_45_NO_EDGE'`.
   - Nếu có `'B2_FRAME_SKELETON'`:
     - Duyệt qua mảng `frameSkeletonConfig.materials` để tính đồng thời nhiều loại vật liệu khung (ví dụ: tấm `Plywood` theo $m^2$ diện tích định hình khung + thanh gỗ `Beech` theo $m^3$ chịu lực chính + thanh gỗ `Poplar` theo $m^3$ đố giằng phụ theo bước đố `ribSpacingMm`).
   - Nếu có `'B4_VOLUME_CUSHION'`:
     - Tính riêng nhóm `foamMaterials` (theo $m^3$ thể tích mút + gòn tấm + keo phun).
     - Kiểm tra `volumeCushionConfig.scope`:
       - Nếu `scope === 'SEMI_FINISHED'` (*Finish to Foam*): Tính vải lót trắng bảo vệ mút (nếu có), **đặt chi phí vải/da bọc ngoài = 0 đ** và tắt giờ công may vỏ bọc ngoài.
       - Nếu `scope === 'CLIENT_MATERIAL_COM'` (*Khách cấp vải/da*): Đặt đơn giá vải/da = `0 đ`, nhưng **giữ nguyên định mức mét vải** trên báo giá để báo cho khách biết cần cấp bao nhiêu mét vải (`md/cái` và tổng `md` cho cả lô) và **giữ nguyên giờ công cắt may bọc**.
       - Nếu `scope === 'FULL_TURNKEY'`: Tính đầy đủ cả mút, hệ đàn hồi đáy, vải/da bọc ngoài và phụ liệu may (dây gân viền `Piping`, khóa kéo, chỉ may).
3. **Triển khai hàm `resolveLogisticsCostPerUnit(structure: UniversalProductStructure)`:**
   - Tính thể tích kiện đóng gói của 1 sản phẩm: `unitCbm = (W/1000) * (D/1000) * (H/1000) * 1.15`.
   - Nếu `mode === 'INDUSTRIAL_CBM_PACKING'` hoặc `(mode === 'AUTO_BY_QUANTITY' && orderQuantity > 10)`:
     - Tính chi phí đóng kiện Carton 5 lớp + PE + bốc xếp công-ten-nơ theo `unitCbm` (không nhân số chuyến xe tải lẻ cho từng cái).
   - Nếu giao lẻ nội thành (`orderQuantity <= 10`):
     - Tính tổng thể tích lô `totalCbm = unitCbm * orderQuantity`.
     - Số chuyến xe tải `trips = Math.ceil(totalCbm / truckCapacityCbm)`.
     - Chi phí vận chuyển phân bổ cho 1 sản phẩm `= (trips * truckTripPriceVnd) / orderQuantity + peWrapPerUnit`.
4. **Triển khai hàm `resolveActiveLaborStages(structure: UniversalProductStructure)` (Sửa triệt để BUG-07):**
   - Ánh xạ từng khối `B1 -> B6` đang bật sang đúng các tổ công đoạn thực tế:
     - Bật `B1_PANEL_BOX` $\rightarrow$ Kích hoạt *Tổ Pha phôi CNC & Dán cạnh* + *Tổ Lắp ráp thùng/cánh*.
     - Bật `B2_FRAME_SKELETON` $\rightarrow$ Kích hoạt *Tổ Mộc pha gỗ/cơ khí & Đóng khung xương*.
     - Bật `B3_SURFACE_SLAB` $\rightarrow$ Kích hoạt *Tổ Gia công cắt mài Đá/Kính*.
     - Bật `B4_VOLUME_CUSHION` $\rightarrow$ Kích hoạt *Tổ Cắt & Dán mút tạo phom* (luôn bật) + *Tổ May vỏ & Bọc hoàn thiện* (chỉ bật khi `scope !== 'SEMI_FINISHED'` hoặc tính bọc vải lót).
     - Bật `B5_SURFACE_FINISH` (khi `finishType !== 'NONE_RAW' && finishType !== 'MELAMINE_PRELAM'`) $\rightarrow$ Kích hoạt *Tổ Chà nhám & Phun sơn/Hoàn thiện*.
   - **Kiểm tra bất biến toán học:** Tổng tiền của tất cả các dòng phân xưởng hiển thị trên UI (`displayedLaborRows.reduce(...)`) **PHẢI BẰNG CHÍNH XÁC 100%** `totalDirectLaborCost` trên bảng COGS (xóa bỏ hoàn toàn khoản lệch ẩn `315.000 đ`).

### BƯỚC 3: Tái Thiết Kế Giao Diện Mục 2 & Đồng Bộ State Mục 1 — Tab MOQ (`src/app/(app)/quoting/`)

**Mục tiêu:** Biến giao diện Mục 2 từ "form khai báo tủ ván cứng nhắc" thành **Bộ chọn Mô-đun Kết cấu Trực quan** ai nhìn sản phẩm cũng chọn được ngay, đồng thời nối thông suốt ô `Số lượng đặt hàng (SL)` với toàn bộ bảng giá.

**Hướng dẫn thực hiện cho Agent:**
1. **Tại đầu Mục 2 ("Vật liệu & Kết cấu chủ lực"):**
   - Thay thế 2 dropdown bắt buộc (`Cốt vật liệu thùng & đợt` và `Bề mặt cánh & mặt tiền`) bằng **Thanh chọn nhanh 6 Khối Cấu Tạo (`Structural Block Selector Bar`)** gồm 6 thẻ có icon trực quan:
     - `[x] Thùng hộp & Vách ván`
     - `[x] Khung xương & Chân chịu lực`
     - `[ ] Mặt Đá / Kính / Tấm mặt`
     - `[ ] Đệm mút & Bọc da/nỉ/mây`
     - `[ ] Sơn & Xử lý bề mặt`
     - `[x] Phụ kiện & Đèn LED`
   - Khi người dùng bấm chọn một **Mẫu xưởng nhanh (`Preset`)** ở Mục 1 (ví dụ: *Tủ áo MDF*, *Bàn ăn mặt đá chân sắt*, *Sofa khung gỗ bọc nệm*, *Ghế ăn gỗ Sồi đan mây*, *Vách ốp trang trí*), hệ thống tự động bật sẵn đúng các khối cấu tạo của mẫu đó và điền sẵn thông số chuẩn. Người dùng có thể tự do bật/tắt thêm bớt bất kỳ khối nào.
2. **Thiết kế Thẻ cấu hình mở rộng (`Expandable Config Card`) cho từng Khối được bật:**
   - Mỗi khối được bật sẽ hiển thị một Card rõ ràng có:
     - Dropdown chọn **Phạm vi (`Trọn gói 100%` | `Bán thành phẩm / Finish to Foam / Phôi thô` | `Khách cấp vật tư chính - COM`)**.
     - Nút chọn **Nguồn thực hiện (`Xưởng tự làm - OH Xưởng` | `Thuê ngoài - OH 10%` | `Mua đứt - 0% OH`)**.
     - Bộ chọn **Kiểu hình học & Số lượng cấu kiện** (Ví dụ: ở khối *Thùng ván* có ô chỉnh nhanh `Số cánh mở`, `Số ngăn kéo`, `Số đợt`; ở khối *Khung xương* có nút `+ Thêm vật liệu phối hợp` để chọn cả `Plywood`, `Beech`, `Poplar` cùng lúc; ở khối *Đệm mút & Bọc* tách rõ dòng chọn `Loại mút & Độ dày/Tỷ lệ khối` và dòng chọn `Vải/Da & Kiểu đường may`).
3. **Đồng bộ tức thì ô `Số lượng đặt hàng (SL)` ở Mục 1 với Cột Phải và Tab 4 (Sửa BUG-05 & BUG-06):**
   - Khi người dùng nhập bất kỳ số lượng `SL` nào vào Mục 1 (ví dụ `SL = 500`):
     - Cột kết quả bên phải phải hiển thị ngay:
       - **Giá vốn xưởng 1 cái (ở quy mô `SL = 500`):** Đã áp dụng giảm hao hụt Nesting, giảm giờ công dây chuyền và đóng gói theo CBM.
       - **Đơn giá báo khách 1 cái (ở mốc `SL = 500`)** và **Tổng giá trị đơn hàng (`Đơn giá × 500`)**.
     - Tự động thêm hoặc highlight đúng cột `500 cái` trong **Tab 4. Bậc thang MOQ** mà không bắt người dùng phải bấm nút `+ 500 bộ` thủ công.
4. **Bổ sung công tắc Tiền tệ `VNĐ` / `USD + VNĐ` trên Thanh Kết Quả (Sửa BUG-08):**
   - Cho phép nhập tỷ giá quy đổi (mặc định `1 USD = 25.000 VNĐ` hoặc cập nhật tự động) và hiển thị song song cột `USD` bên cạnh `VNĐ` trong bảng tổng hợp cũng như file xuất Excel/PDF.

### BƯỚC 4: Cập Nhật Kho Mẫu Xưởng (`Presets`) & Viết Bộ Unit Tests Đa Ngành Hàng

**Mục tiêu:** Đảm bảo hệ thống chạy mượt mà cho mọi loại sản phẩm thông qua bộ test tự động kiểm chứng ít nhất 6 dòng sản phẩm hoàn toàn khác nhau.

**Hướng dẫn thực hiện cho Agent:**
1. Cập nhật file dữ liệu mẫu xưởng (`Presets`) để mỗi mẫu là một cấu hình `UniversalProductStructure` hoàn chỉnh, bao gồm tối thiểu 6 nhóm đại diện:
   - **Nhóm 1 (Hệ Tủ hộp ván):** Tủ áo / Tủ bếp MDF chống ẩm (`enabledBlocks: ['B1_PANEL_BOX', 'B6_HARDWARE_ELECTRO']`).
   - **Nhóm 2 (Hệ Khung + Đệm bọc / Finish to Foam):** Sofa & Giường bọc nệm khung hỗn hợp `Plywood + Beech + Poplar` (`enabledBlocks: ['B2_FRAME_SKELETON', 'B4_VOLUME_CUSHION', 'B6_HARDWARE_ELECTRO']`).
   - **Nhóm 3 (Hệ Mặt phẳng + Chân khung):** Bàn ăn mặt đá Vicostone vát mòi 45° chân sắt sơn tĩnh điện / inox PVD (`enabledBlocks: ['B2_FRAME_SKELETON', 'B3_SURFACE_SLAB', 'B5_SURFACE_FINISH']`).
   - **Nhóm 4 (Hệ Gỗ tự nhiên lộ thiên + Đan/Bọc):** Ghế ăn / Ghế Lounge gỗ Sồi/Ash sơn PU kết hợp mây mắt cáo hoặc đệm rời (`enabledBlocks: ['B2_FRAME_SKELETON', 'B4_VOLUME_CUSHION', 'B5_SURFACE_FINISH']`).
   - **Nhóm 5 (Hệ Kim loại + Kính + Điện):** Vách ngăn / Cửa lùa nhôm hệ Slim kính cường lực sọc Fluted có đèn LED (`enabledBlocks: ['B2_FRAME_SKELETON', 'B3_SURFACE_SLAB', 'B6_HARDWARE_ELECTRO']`).
   - **Nhóm 6 (Hệ Lai ghép Độc bản / Quầy Bar / Đảo bếp):** Kết hợp cả 6 khối `B1 + B2 + B3 + B4 + B5 + B6`.
2. Tạo file kiểm thử `src/core/calculations/__tests__/universal-composable-engine.test.ts` kiểm tra 6 ràng buộc bắt buộc (Verification Gates):
   - **Test 1 (Zero Ghost Cost):** Khi tắt `B1_PANEL_BOX` (như khi báo giá Sofa, Bàn đá chân sắt, Ghế gỗ), chi phí ván MDF, chỉ dán cạnh PVC, bản lề cánh tủ và ray ngăn kéo phải bằng `0` tuyệt đối.
   - **Test 2 (Multi-Material Frame Mix):** Khi khai báo khung gồm 3 vật liệu (`Plywood 15mm` + `Beech Wood` + `Poplar Wood`), BOM sinh ra đúng 3 dòng vật tư với đúng đơn vị (`tấm`/`m²` cho Plywood và `m³` gỗ phôi cho Beech/Poplar).
   - **Test 3 (Completion Scope - Finish to Foam & COM):** Khi chọn `scope = 'SEMI_FINISHED'` (Finish to Foam), BOM tính đủ khung gỗ và mút nhưng tiền vải bọc ngoài bằng `0`; khi chọn `scope = 'CLIENT_MATERIAL_COM'`, tiền mua vải bằng `0` nhưng vẫn xuất ra số mét vải khách cần cấp và vẫn tính đủ công thợ may bọc.
   - **Test 4 (Batch Economy of Scale - 1 vs 500 units):** Với cùng một cấu hình sản phẩm, khi đổi `orderQuantity` từ `1` sang `500`, `Unit COGS` tại mốc `500` phải thấp hơn mốc `1` nhờ giảm hao hụt pha phôi, giảm giờ công dây chuyền và chuyển vận chuyển từ chuyến xe lẻ (`450.000 đ/cái`) sang đóng kiện theo `CBM`.
   - **Test 5 (Labor Breakdown Sum Integrity):** Tổng tiền của các dòng phân xưởng nhân công hiển thị trên UI phải khớp chính xác `100%` (sai số `0 đ`) với `totalDirectLaborCost` trong bảng tổng hợp COGS.
   - **Test 6 (Backward Compatibility):** Toàn bộ 132 unit tests hiện có của dự án tiếp tục pass `100%`.

## 4. CỔNG KIỂM ĐỊNH HOÀN THÀNH DÀNH CHO AGENT (DEFINITION OF DONE)

Trước khi báo cáo hoàn tất nhiệm vụ, Coding Agent phải chạy và đính kèm kết quả của 4 kiểm tra sau:

1. `npx tsc --noEmit` $\rightarrow$ `0 errors`.
2. `npm test` $\rightarrow$ Pass 100% (bao gồm 132 tests cũ + bộ 6 tests mới trong `universal-composable-engine.test.ts`).
3. `npm run build` $\rightarrow$ Build production thành công toàn bộ routes.
4. **Kiểm tra thực tế trên trình duyệt tại `/quoting`:**
   - Chọn hoặc nhập bất kỳ sản phẩm không phải tủ ván nào (VD: Bàn đá chân sắt, Ghế gỗ thịt, hoặc Sofa khung `Plywood + Beech + Poplar` kích thước `2000×900×700`, `SL = 500`):
     - Bảng BOM **không còn** xuất hiện ván MDF, chỉ PVC, 12 bản lề hay 2 ray kéo ảo.
     - Ô `SL = 500` ở Mục 1 cập nhật trực tiếp đơn giá và tổng tiền ở cột bên phải mà không cần thao tác phụ ở Tab 4.
     - Bảng nhân công hiển thị đầy đủ các dòng công đoạn, cộng khớp 100% với tổng nhân công trực tiếp.
