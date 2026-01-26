# API `/auth/me` - Get Current User

## 🎯 Mục đích

1. **Verify token** - Kiểm tra token còn hợp lệ không
2. **Lấy thông tin user** - Trả về profile của user đang login (name, email, avatar, role...)
3. **Khôi phục session** - Khi user refresh trang, dùng token trong localStorage để lấy lại thông tin user

## 📍 Được gọi khi nào

- **Khi app khởi động** - ProtectedRoute component gọi checkAuth() để kiểm tra user đã login chưa
- **Khi refresh trang** - Khôi phục thông tin user từ token
- **Sau khi token refresh** - Verify token mới có hợp lệ không

## 🔄 Flow hoạt động

```
Frontend                 API Gateway                Identity Service
   |                          |                            |
   |---(1) GET /auth/me------>|                            |
   |    Bearer <token>        |                            |
   |                          |                            |
   |                          |---(2) Verify JWT--------->|
   |                          |    (JwtAuthGuard)          |
   |                          |                            |
   |                          |---(3) Send userId-------->|
   |                          |    via Microservice        |
   |                          |                            |
   |                          |                            |---(4) Query DB
   |                          |                            |    Get User Profile
   |                          |                            |
   |                          |<---(5) Return User---------|
   |<---(6) Response User-----|                            |
   |    (without password)    |                            |
```

## 💻 Request

### HTTP Method
```
GET /auth/me
```

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Example với cURL
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example với JavaScript/TypeScript
```typescript
const getMe = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3000/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const user = await response.json();
    return user;
  } else if (response.status === 401) {
    // Token expired or invalid
    // Redirect to login
    window.location.href = '/login';
  }
};
```

### Example với Axios
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    throw error;
  }
};
```

## 📦 Response

### Success Response (200 OK)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "middleName": "William",
  "lastName": "Doe",
  "fullName": "John William Doe",
  "phoneNumber": "+84123456789",
  "organizationId": "org-123",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T15:45:00.000Z",
  "organization": {
    "id": "org-123",
    "name": "ABC Company",
    "code": "ABC"
  },
  "userRoles": [
    {
      "role": {
        "id": "role-1",
        "name": "Admin",
        "code": "ADMIN"
      }
    }
  ]
}
```

### Error Response (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User with ID \"123\" not found"
}
```

## ⚠️ Lưu ý

1. **Endpoint này yêu cầu authentication** - Phải có Bearer token trong header
2. **Token expired** - Nếu token hết hạn, trả về 401 Unauthorized
3. **Verify user session** - Dùng để kiểm tra user session còn hợp lệ không
4. **Password không được trả về** - Response không bao gồm trường passwordHash
5. **Include relations** - Response bao gồm thông tin organization và roles của user

## 🔐 Security

- JWT token được verify bởi `JwtAuthGuard`
- Token phải match với secret key: `supersecret`
- Token có thời hạn:
  - Normal login: 1 giờ
  - Remember me: 7 ngày

## 📚 Cách tích hợp vào Frontend

### React Example với Context
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  // ... other fields
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Protected Route Component
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Usage in App
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## 🧪 Testing

### Test với Swagger UI
1. Đăng nhập để lấy token: `POST /auth/login`
2. Copy `accessToken` từ response
3. Click "Authorize" button ở đầu trang Swagger
4. Nhập: `Bearer <your_token>`
5. Gọi `GET /auth/me`

### Test với Postman
1. Tạo request mới: GET `http://localhost:3000/auth/me`
2. Vào tab "Authorization"
3. Chọn Type: "Bearer Token"
4. Paste token vào ô "Token"
5. Click "Send"

## 🔧 Implementation Details

### Files Created/Modified

1. **libs/common/src/enum/message-pattern.enum.ts**
   - Thêm `IDENTITY_AUTH_GET_ME` pattern

2. **apps/api-gateway/src/guards/jwt.strategy.ts**
   - JWT Strategy để verify token
   - Extract user info từ JWT payload

3. **apps/api-gateway/src/guards/jwt-auth.guard.ts**
   - Guard để protect routes cần authentication

4. **apps/identity/src/modules/auth/auth.service.ts**
   - Thêm method `getCurrentUser(userId: string)`

5. **apps/identity/src/modules/auth/controllers/auth.controller.ts**
   - Thêm handler cho `IDENTITY_AUTH_GET_ME` pattern

6. **apps/api-gateway/src/controllers/identity/auth-gateway.controller.ts**
   - Thêm endpoint `GET /auth/me` với JwtAuthGuard

7. **apps/api-gateway/src/api-gateway.module.ts**
   - Import PassportModule và JwtModule
   - Register JwtStrategy as provider

## 📖 Related Endpoints

- `POST /auth/login` - Login và lấy access token
- `POST /auth/register` - Đăng ký user mới
- `GET /users/profile` - Lấy profile (alternative endpoint)
