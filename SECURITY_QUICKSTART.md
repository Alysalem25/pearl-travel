# Security Implementation - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. Environment Setup

**server/.env**
```
MONGO_URI=mongodb://localhost:27017/pearl-travel
JWT_SECRET=your-super-secret-key-32-chars-minimum
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**client/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_USER_KEY=auth_user
```

### 3. Run Application
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

---

## 🔐 Security Implementation Checklist

### Backend ✅
- [x] Password hashing with bcrypt
- [x] JWT authentication (7-day expiry)
- [x] Role-based access control (admin/user)
- [x] Input validation (express-validator)
- [x] Helmet.js HTTP headers
- [x] CORS properly configured
- [x] Centralized error handling
- [x] Protected routes for admin operations

### Frontend ✅
- [x] Auth context for global state
- [x] Secure axios instance with interceptors
- [x] Protected routes wrapper
- [x] Login page with validation
- [x] Token storage and management
- [x] Logout functionality
- [x] Admin role-based UI
- [x] Automatic redirect on 401/403

---

## 📚 File Structure

```
server/
├── index.js                          # Main app with security setup
├── .env                             # Environment variables
├── models/
│   ├── Admin.js                     # User model with bcrypt hooks
│   ├── Category.js
│   └── Programs.js
├── routes/
│   ├── authRoutes.js                # Register, Login, Get User
│   ├── categoryRoutes.js            # Protected category endpoints
│   └── programRoutes.js             # Protected program endpoints
└── middlewares/
    ├── authMiddleware.js            # JWT verification
    ├── authorizeMiddleware.js       # Role-based access
    ├── validators.js                # Input validation rules
    └── errorHandler.js              # Centralized error handling

client/
├── app/
│   ├── layout.tsx                   # Wrapped with AuthProvider
│   ├── login/page.tsx               # Login page
│   └── ...
├── lib/
│   ├── auth.ts                      # Auth utilities (token, user)
│   └── api.ts                       # Axios instance with interceptors
├── context/
│   └── AuthContext.tsx              # Global auth state
├── components/
│   ├── Navbar.tsx                   # Updated with auth UI
│   ├── ProtectedRoute.tsx           # Protected route wrapper
│   └── ...
└── .env.local                       # Frontend env vars
```

---

## 🔑 Key Components

### 1. Authentication Flow
```
User → Login Form → api.auth.login()
                    ↓
              Backend Validation
                    ↓
              Compare Passwords (bcrypt)
                    ↓
              Generate JWT Token
                    ↓
              Response: { token, user }
                    ↓
              Save to localStorage
                    ↓
              Update Auth Context
                    ↓
              Redirect to home
```

### 2. Protected API Call
```
Component uses: api.categories.create(data)
                    ↓
        Request Interceptor adds Bearer token
                    ↓
        POST /categories with Authorization header
                    ↓
        Backend: authMiddleware verifies JWT
                    ↓
        Backend: authorize("admin") checks role
                    ↓
        Backend: validators check input
                    ↓
        Response or 403 Forbidden
```

### 3. Protected Route
```
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
                    ↓
        useAuth() checks isAuthenticated
                    ↓
        useAuth() checks user.role === "admin"
                    ↓
        Redirect to /login if not authenticated
                    ↓
        Redirect to / if wrong role
                    ↓
        Render <AdminDashboard /> if authorized
```

---

## 🧪 Testing

### Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "number": "+1234567890",
    "role": "user"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Response includes token
```

### Protect Route (Admin Only)
```bash
curl -X POST http://localhost:5000/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nameEn": "Adventure Tours",
    "nameAr": "جولات المغامرة",
    "type": "Outgoing",
    "country": "Egypt"
  }'

# Without token: 401 Unauthorized
# With user token: 403 Forbidden (need admin)
# With admin token: 201 Created
```

---

## 🛡️ Security Principles

### Backend Enforces Everything
```javascript
// ❌ DON'T: Trust frontend authorization
if (user.role === "admin") {
  // Show admin button - BUT backend doesn't check!
}

// ✅ DO: Backend validates
app.post("/categories", authMiddleware, authorize("admin"), handler);
```

### No Sensitive Data in Responses
```javascript
// ❌ DON'T: Send password
res.json({ user: { password: "SecurePass123" } });

// ✅ DO: Exclude password
res.json({ user: { id, name, email, role } });
```

### Input Validation on Backend
```javascript
// ❌ DON'T: Only validate on frontend
const email = req.body.email; // Trust user input

// ✅ DO: Validate on backend
const { email, password } = validatedReq.body;
```

---

## 📊 API Endpoints

### Public Routes (No Auth)
```
GET   /stats                    # Get dashboard stats
GET   /categories               # List all categories
GET   /categories/:id           # Get one category
GET   /programs                 # List all programs
GET   /programs/:id             # Get one program
POST  /auth/register            # User registration
POST  /auth/login               # User login
```

### Protected Routes (Auth Required)
```
GET   /auth/me                  # Get current user (any role)
```

### Admin Only Routes
```
POST   /categories              # Create category
PUT    /categories/:id          # Update category
DELETE /categories/:id          # Delete category
POST   /categories/:id/images   # Add images

POST   /programs                # Create program
PUT    /programs/:id            # Update program
DELETE /programs/:id            # Delete program
```

---

## 🔍 Debugging

### Check Token
```javascript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')
```

### Check Auth Context
```javascript
// In any component
const { user, isAuthenticated, isAdmin } = useAuth();
console.log(user, isAuthenticated, isAdmin());
```

### Check API Headers
```javascript
// In network tab of DevTools
// Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Server Logs
```bash
# Should show:
✓ MongoDB Connected
🔐 Security-Hardened Architecture
Port: 5000
```

---

## 📱 Frontend Usage Examples

### Login
```typescript
import { useAuth } from "@/context/AuthContext";

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Redirects automatically
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
}
```

### Check Authorization
```typescript
import { useAuth } from "@/context/AuthContext";

function AdminPanel() {
  const { isAdmin } = useAuth();
  
  if (!isAdmin()) {
    return <div>Not authorized</div>;
  }
  
  return <div>Admin content</div>;
}
```

### API Calls
```typescript
import { api } from "@/lib/api";

// Automatically includes Authorization header
const categories = await api.categories.getAll();
const newCategory = await api.categories.create(formData);
const deleted = await api.categories.delete(categoryId);
```

---

## ⚠️ Common Mistakes

### 1. Forgetting authMiddleware
```javascript
// ❌ WRONG: Anyone can delete
app.delete("/categories/:id", handleDelete);

// ✅ RIGHT: Only authenticated users
app.delete("/categories/:id", authMiddleware, authorize("admin"), handleDelete);
```

### 2. Wrong Middleware Order
```javascript
// ❌ WRONG: Authorize before auth
app.post("/categories", authorize("admin"), authMiddleware, handler);

// ✅ RIGHT: Auth then authorize
app.post("/categories", authMiddleware, authorize("admin"), handler);
```

### 3. Not Handling 401 in Frontend
```javascript
// ❌ WRONG: Ignore auth errors
axios.get("/protected").catch(() => {});

// ✅ RIGHT: Handle with interceptor
// Already implemented in api.ts
```

### 4. Storing Passwords
```javascript
// ❌ WRONG: Plaintext
user.password = "MyPassword123";
await user.save();

// ✅ RIGHT: Pre-save hook hashes automatically
user.password = "MyPassword123";
await user.save(); // Hook hashes it
```

---

## 🚀 Next Steps

1. **Add Rate Limiting**: Prevent brute force attacks
2. **Refresh Token**: Extend sessions without re-login
3. **2FA**: Two-factor authentication
4. **API Keys**: For third-party integrations
5. **Audit Logging**: Track all sensitive operations
6. **Monitoring**: Alert on suspicious activity

---

## 📞 Support

- Check SECURITY.md for detailed documentation
- Review middleware comments for implementation details
- Check backend/frontend console logs for errors
- Ensure .env variables are correct
