# Kế hoạch triển khai Widget iPhone cho Todo App

## 1. Mục tiêu

Tạo một Widget trên màn hình chính iPhone (iOS 26) để xem nhanh task từ website Todo App hiện tại.

Widget cần hiển thị 4 nhóm:

- **Chưa làm**
- **Đang làm**
- **Hoàn thành**
- **Quá hạn**

Mỗi nhóm là một block nhỏ, có tên nhóm và số lượng task. Mỗi task chỉ hiển thị tiêu đề rút gọn; tiêu đề quá dài được cắt bằng `...`. Nếu có quá nhiều task, chỉ hiển thị một số task đầu tiên và dòng `+N task khác`.

## 2. Phương án đề xuất

Bắt đầu bằng **Scriptable + JavaScript + API của website**.

- **Website React**: tiếp tục là giao diện đầy đủ để tạo, sửa và quản lý task.
- **Backend/API hiện có**: cung cấp danh sách task của người dùng đã đăng nhập.
- **Scriptable trên iPhone**: gọi API, phân nhóm task và dựng giao diện Widget.
- **iOS**: quyết định thời điểm làm mới Widget; không đảm bảo cập nhật liên tục theo thời gian thực.

Phương án này phù hợp để thử nghiệm mà chưa cần viết ứng dụng iOS riêng. Nếu sau này cần Widget có tích hợp sâu, cập nhật đáng tin cậy hơn hoặc phân phối cho nhiều người dùng, cân nhắc ứng dụng iOS dùng WidgetKit.

## 3. Kiến trúc dữ liệu

Luồng hoạt động:

1. Người dùng đăng nhập và sử dụng website như bình thường.
2. Backend cung cấp endpoint chỉ đọc dữ liệu task của chính người dùng.
3. Scriptable gọi endpoint qua HTTPS.
4. Scriptable nhận JSON, phân loại task theo trạng thái và hạn hoàn thành.
5. Scriptable dựng các block vừa kích thước Widget.
6. Khi người dùng chạm Widget, mở website Todo App để xem hoặc chỉnh sửa chi tiết.

**Không để Scriptable kết nối trực tiếp vào database.** Không đưa database password, Supabase `service_role` key hay secret backend vào script chạy trên iPhone.

## 4. Việc cần kiểm tra trong website trước khi viết Widget

- [ ] Xác định dữ liệu task đang lưu ở đâu: backend/database, Supabase hay `localStorage`.
- [ ] Xác định website đã có API lấy danh sách task hay chưa.
- [ ] Xác định cách đăng nhập: JWT/access token, cookie/session hay không cần đăng nhập.
- [ ] Xác định cấu trúc task và các giá trị status thực tế trong source code.
- [ ] Xác định trường deadline và quy tắc xác định task quá hạn.
- [ ] Kiểm tra API có thể truy cập qua HTTPS từ iPhone.
- [ ] Đảm bảo API chỉ trả về task mà tài khoản hiện tại được phép xem.

Nếu dữ liệu chỉ nằm trong `localStorage`, Scriptable không thể tự đọc `localStorage` của Safari/Web App vì chạy trong môi trường riêng. Cần cung cấp API hoặc chuyển dữ liệu sang một nguồn dùng chung.

## 5. Thiết kế API đề xuất

Nếu website chưa có API phù hợp, có thể tạo endpoint dạng:

`GET https://your-domain.com/api/widget/tasks`

Endpoint cần xác thực người dùng và chỉ trả về dữ liệu cần thiết cho Widget.

Ví dụ JSON đề xuất (điều chỉnh theo schema thật của dự án):

```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Responsive mobile todo app",
      "status": "IN_PROGRESS",
      "dueDate": "2026-10-11T10:40:00+07:00",
      "completedAt": null
    },
    {
      "id": "task-002",
      "title": "Hoàn thiện giao diện đăng nhập",
      "status": "TODO",
      "dueDate": "2026-10-12T09:00:00+07:00",
      "completedAt": null
    }
  ]
}
```

Đây chỉ là hợp đồng API minh họa, không phải cấu trúc đã xác nhận của website. Tên trường và giá trị trạng thái phải khớp với source code thực tế.

### Quy tắc phân nhóm

Cần thống nhất thứ tự ưu tiên để một task không xuất hiện trong nhiều nhóm:

1. Nếu task đã hoàn thành, xếp vào **Hoàn thành**.
2. Nếu chưa hoàn thành và deadline đã qua, xếp vào **Quá hạn**.
3. Nếu chưa hoàn thành và status là đang làm, xếp vào **Đang làm**.
4. Các task còn lại xếp vào **Chưa làm**.

Nếu sản phẩm có quy tắc khác, hãy dùng đúng quy tắc đang áp dụng trong website. Xử lý ngày giờ theo múi giờ phù hợp, ví dụ `Asia/Ho_Chi_Minh`.

## 6. Thiết kế giao diện Widget

### Các thành phần của mỗi block

- Chấm màu hoặc biểu tượng để nhận biết trạng thái.
- Tên nhóm.
- Số lượng task.
- Danh sách task rút gọn.
- Dòng `+N task khác` khi không đủ chỗ.

Màu gợi ý:

- Chưa làm: xám hoặc vàng.
- Đang làm: xanh dương.
- Hoàn thành: xanh lá.
- Quá hạn: đỏ.

### Giới hạn hiển thị

- Widget nhỏ: ưu tiên số liệu tổng quan hoặc 1–2 task quan trọng; không cố nhồi đủ cả 4 danh sách.
- Widget vừa: hiển thị 4 nhóm theo dạng rút gọn nếu không gian cho phép.
- Widget lớn: hiển thị nhiều task hơn, nhưng vẫn giới hạn số dòng.

Số task tối đa cần thử nghiệm trên thiết bị thật vì diện tích phụ thuộc kích thước Widget, cỡ chữ và phiên bản iOS. Khi hết chỗ, ưu tiên tiêu đề nhóm và task quan trọng; không để nội dung tràn khỏi Widget.

### Rút gọn tiêu đề

Có thể giới hạn số ký tự bằng JavaScript, nhưng cắt theo ký tự không hoàn toàn tương đương cắt theo chiều rộng pixel. Nên kết hợp giới hạn ký tự với giới hạn dòng của Scriptable, sau đó kiểm tra trực quan trên iPhone.

Ví dụ logic:

```js
function shortenTitle(title, maxLength = 24) {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3).trimEnd() + "...";
}
```

## 7. Các bước triển khai

### Giai đoạn A — Khảo sát website

1. Tìm model/schema task.
2. Tìm API lấy danh sách task và middleware xác thực.
3. Kiểm tra status, deadline và cách đánh dấu hoàn thành.
4. Gọi thử API bằng công cụ kiểm thử API hoặc trình duyệt phù hợp.
5. Xác nhận JSON trả về đúng dữ liệu của tài khoản hiện tại.

**Kết quả cần có:** endpoint đọc task ổn định và ví dụ JSON thực tế.

### Giai đoạn B — Làm script Scriptable

1. Cài Scriptable từ App Store.
2. Tạo script mới, ví dụ `TodoWidget`.
3. Cấu hình URL API.
4. Gọi API và xử lý lỗi mạng, lỗi xác thực, JSON không hợp lệ.
5. Phân loại task thành 4 nhóm.
6. Dựng giao diện theo kích thước Widget.
7. Thêm URL để khi chạm Widget có thể mở website.

**Kết quả cần có:** script hiển thị dữ liệu thật và có trạng thái lỗi dễ hiểu.

### Giai đoạn C — Thêm Widget vào màn hình chính

1. Lưu script trong Scriptable.
2. Nhấn giữ màn hình chính iPhone.
3. Chọn thêm Widget và tìm Scriptable.
4. Chọn kích thước phù hợp.
5. Thêm Widget vào màn hình chính.
6. Nhấn giữ Widget, mở phần chỉnh sửa và chọn script `TodoWidget`.
7. Kiểm tra khi có task dài, nhiều task, mất mạng hoặc hết phiên đăng nhập.

Tên mục trong giao diện iOS có thể khác nhẹ theo ngôn ngữ và phiên bản hệ thống.

### Giai đoạn D — Kiểm thử

- [ ] Có đủ 4 nhóm trạng thái.
- [ ] Số lượng mỗi nhóm đúng.
- [ ] Task hoàn thành không bị tính là quá hạn.
- [ ] Deadline được so sánh đúng theo múi giờ.
- [ ] Tiêu đề dài được rút gọn.
- [ ] Danh sách dài không làm vỡ giao diện.
- [ ] Mất mạng có thông báo phù hợp.
- [ ] Token hết hạn không làm lộ dữ liệu.
- [ ] Widget không hiển thị task của tài khoản khác.
- [ ] Chạm Widget mở đúng website.
- [ ] Thời điểm làm mới được kiểm tra trên thiết bị thật.

## 8. Xác thực và bảo mật

Widget có thể hiển thị thông tin riêng tư trên màn hình khóa hoặc màn hình chính. Vì vậy:

- API phải xác thực và kiểm tra quyền ở backend.
- Chỉ trả về các trường cần hiển thị.
- Không hard-code mật khẩu hoặc secret vào script.
- Không dùng khóa đặc quyền quản trị database trong Scriptable.
- Nếu dùng access token, cần có phương án lưu trữ và hết hạn phù hợp. Không nên dán token dài hạn trực tiếp vào mã nguồn.
- Nếu chưa có cơ chế xác thực an toàn, chỉ thử nghiệm với dữ liệu giả lập hoặc endpoint phát triển không chứa dữ liệu nhạy cảm.

## 9. Giới hạn cần biết

- Widget không phải bản thu nhỏ chạy nguyên website React; giao diện phải được dựng lại bằng các API UI của Scriptable.
- iOS kiểm soát lịch làm mới Widget. `refreshAfterDate` chỉ là gợi ý, không đảm bảo cập nhật đúng từng phút.
- Widget phù hợp để xem nhanh; thao tác quản lý task phức tạp nên mở website.
- Nếu muốn trải nghiệm Widget iOS chính thức, tích hợp sâu và phân phối quy mô lớn, phương án dài hạn là ứng dụng iOS dùng WidgetKit.

## 10. Checklist trước khi bắt đầu code

Hãy xác định các thông tin sau:

- [ ] URL website đã deploy.
- [ ] Công nghệ backend và nơi lưu task.
- [ ] Endpoint hiện có để lấy task.
- [ ] Cách xác thực API.
- [ ] Schema task thực tế.
- [ ] Giá trị status thực tế.
- [ ] Trường deadline và quy tắc quá hạn.
- [ ] Kích thước Widget ưu tiên: nhỏ, vừa hay lớn.
- [ ] Số task tối đa muốn hiển thị cho mỗi nhóm.

**Bước tiếp theo khuyến nghị:** kiểm tra source code để xác định API và schema task trước. Sau đó mới viết script Scriptable dựa trên JSON thật, tránh dùng các tên trường giả định trong ví dụ.
