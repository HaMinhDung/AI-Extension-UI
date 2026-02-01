# Backend CORS Configuration

## 🔴 Vấn đề hiện tại

Extension không kết nối được backend mặc dù backend đã chạy và test được bằng Postman.

**Nguyên nhân:** Backend chưa enable CORS (Cross-Origin Resource Sharing)

- ✅ Postman test OK (không bị giới hạn CORS)
- ❌ Extension không gọi được (bị chặn bởi CORS policy)

## ✅ Giải pháp

Backend cần thêm CORS headers vào response.

### Nếu backend dùng **Spring Boot (Java)**:

#### Cách 1: WebMvcConfigurer (Khuyến nghị)

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")  // Cho phép tất cả origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
```

#### Cách 2: @CrossOrigin annotation

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // Thêm annotation này
public class TranslateController {
    
    @PostMapping("/translate")
    public TranslateResponse translate(@RequestBody TranslateRequest request) {
        // Your translation logic
    }
}
```

### Nếu backend dùng **Express.js (Node.js)**:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Hoặc cấu hình chi tiết hơn:
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.post('/api/translate', (req, res) => {
    // Your translation logic
});

app.listen(8080);
```

### Nếu backend dùng **Flask (Python)**:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS cho tất cả routes

# Hoặc cấu hình chi tiết:
# CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/translate', methods=['POST'])
def translate():
    # Your translation logic
    pass

if __name__ == '__main__':
    app.run(port=8080)
```

### Nếu backend dùng **ASP.NET Core (C#)**:

```csharp
// Program.cs hoặc Startup.cs

var builder = WebApplication.CreateBuilder(args);

// Thêm CORS service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Enable CORS middleware
app.UseCors("AllowAll");

app.MapControllers();
app.Run();
```

## 🧪 Kiểm tra CORS đã hoạt động

Sau khi thêm CORS vào backend, kiểm tra bằng cách:

### 1. Test với curl:

```powershell
curl -Method OPTIONS -Uri "http://localhost:8080/api/translate" -Headers @{
    "Access-Control-Request-Method" = "POST"
    "Origin" = "chrome-extension://abc123"
} -Verbose
```

Response headers phải có:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
```

### 2. Test với browser console:

Mở F12 Console trên bất kỳ trang web nào và chạy:

```javascript
fetch('http://localhost:8080/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: 'Hello',
        prompt: 'Translate to Vietnamese:',
        apiKey: 'your-key'
    })
})
.then(r => r.json())
.then(data => console.log('✅ CORS OK:', data))
.catch(err => console.error('❌ CORS failed:', err));
```

## 📋 Headers cần thiết

Backend phải trả về các headers sau:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 🔒 Production Security (Tùy chọn)

Trong production, thay `*` bằng origin cụ thể:

```java
// Chỉ cho phép extension của bạn
.allowedOrigins("chrome-extension://your-extension-id")
```

Nhưng để development dễ dàng, dùng `*` là OK.

## ✅ Sau khi fix CORS

1. Restart backend
2. Reload extension trong Chrome
3. Thử dịch lại
4. Kiểm tra Console (F12) để xem logs

---

**Lưu ý:** Nếu vẫn không được, kiểm tra:
- Backend có log request không?
- Port có đúng 8080 không?
- Firewall có block không?
