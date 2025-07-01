# Hướng dẫn tính năng mới cho Host

## 1. Icon Hướng dẫn Host (❓)

### Vị trí
- Nằm ở đầu panel Host Management
- Màu xanh lá, dễ nhận biết

### Chức năng
- Hiển thị hướng dẫn chi tiết cho từng vòng thi
- Tự động thay đổi nội dung theo vòng hiện tại
- Bao gồm flow hoàn chỉnh từ bắt đầu đến kết thúc vòng

### Nội dung hướng dẫn

#### Vòng 1 - NHỔ NEO
1. Bắt đầu vòng thi
2. Phát nhạc
3. Câu hỏi tiếp theo
4. Đếm giờ (15s)
5. Hiện đáp án
6. Chấm điểm (tự động/thủ công)
7. Lặp lại cho 10 câu

#### Vòng 2 - VƯỢT SÓNG
1. Bắt đầu vòng thi
2. Phát nhạc
3. Câu hỏi tiếp theo
4. Đếm giờ
5. Hiện đáp án
6. Chấm điểm câu thường
7. **Đặc biệt cho CNV:**
   - Mở chướng ngại vật
   - Chọn thí sinh đúng
   - Cập nhật lượt thi
   - Chấm điểm CNV

#### Vòng 3 - BỨT PHÁ
1. **Phân lượt:** Xác định thứ tự thí sinh
2. **Thi chính:**
   - Chọn thí sinh theo thứ tự
   - Thí sinh chọn chủ đề
   - Câu hỏi tiếp theo (câu đầu)
   - Bấm Đúng/Sai cho các câu tiếp theo (tự động chuyển)

#### Vòng 4 - CHINH PHỤC
1. **Chuẩn bị:** Chọn màu cho thí sinh
2. **Phân lượt:** Xác định thứ tự
3. **Thi chính:**
   - Chọn thí sinh theo lượt
   - Thí sinh chọn ô trên bảng 5x5
   - Bấm Select trên ô
   - Câu hỏi tiếp theo
   - Chọn thí sinh → Cập nhật lượt chơi
   - Bấm Đúng/Sai/Sai NSHV
4. **Xử lý sai/NSHV:**
   - Tự động mở chuông
   - Chọn ô thí sinh giành lượt (KHÔNG cập nhật lượt)
   - Bấm Giành lượt đúng/sai
5. **Khi đúng:** Tô màu ô tương ứng

## 2. Tính năng chọn màu thí sinh (🎨)

### Khi nào hiển thị
- Chỉ hiển thị trong Vòng 4
- Nút màu tím, dễ nhận biết

### Chức năng
- Chọn màu khác nhau cho mỗi thí sinh
- 8 màu có sẵn: Đỏ, Xanh lá, Xanh dương, Vàng, Tím, Cam, Hồng, Xanh lam
- Không cho phép trùng màu
- Hiển thị màu đã chọn trong ô thí sinh

### Cách sử dụng
1. Bấm nút "Chọn màu" trong Vòng 4
2. Chọn màu cho từng thí sinh
3. Bấm "Lưu màu"
4. Màu sẽ hiển thị dưới dạng chấm tròn nhỏ trong ô thí sinh

### Hiển thị màu
- **Trong danh sách thí sinh:** Chấm tròn nhỏ ở góc dưới phải avatar
- **Khi chọn thí sinh:** Chấm tròn lớn hơn ở góc dưới phải avatar
- **Trên bảng 5x5:** Tô màu ô khi thí sinh trả lời đúng

## 3. Lưu ý quan trọng

### Thứ tự thực hiện
1. **Trước khi bắt đầu Vòng 4:** Chọn màu cho thí sinh
2. **Trong mọi vòng:** Sử dụng hướng dẫn để không bỏ sót bước nào
3. **Vòng 2:** Chú ý phân biệt câu thường và CNV
4. **Vòng 3-4:** Phải phân lượt trước khi thi chính

### Tips sử dụng
- Luôn kiểm tra mode chấm điểm trước khi bắt đầu
- Quan sát phản ứng thí sinh để điều chỉnh tốc độ
- Sử dụng "Hiển thị luật thi" khi cần thiết
- Kiểm tra kết nối mạng trước khi bắt đầu

### Troubleshooting
- **Modal hướng dẫn không hiện:** Bấm lại icon dấu hỏi
- **Không chọn được màu:** Kiểm tra xem có đang ở Vòng 4 không
- **Màu không hiển thị:** Đảm bảo đã bấm "Lưu màu"
- **Thí sinh không thấy màu:** Kiểm tra kết nối mạng

## 4. Keyboard Shortcuts (Tương lai)

Các phím tắt sẽ được thêm vào:
- `Space`: Câu hỏi tiếp theo
- `Enter`: Đếm giờ
- `R`: Hiển thị luật thi
- `G`: Hướng dẫn host
- `C`: Chọn màu (Vòng 4)

---

**Lưu ý:** Tài liệu này sẽ được cập nhật khi có thêm tính năng mới.
