# Pearl Travel - Security Architecture Documentation

## 🔐 Overview

This document describes the production-ready security implementation for the Pearl Travel MERN/Next.js application. The architecture enforces security at every layer - backend validation, authentication, authorization, and frontend role-based UI.

---

## 📋 Table of Contents

1. [Backend Security](#backend-security)
2. [Frontend Security](#frontend-security)
3. [API Contract](#api-contract)
4. [Setup & Deployment](#setup--deployment)
5. [Security Best Practices](#security-best-practices)

---

## Backend Security

### 🔑 Authentication Flow

#### Password Management
- **Hashing**: Bcrypt with 10 salt rounds (10 iterations)
- **Pre-save Hook**: Automatic hashing before database storage
- **Never Stored**: Plaintext passwords NEVER transmitted or logged
- **Comparison**: bcrypt.compare() for login validation

```javascript
// Admin Model - Pre-save Hook
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

#### JWT Tokens
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiry**: 7 days (configurable via `.env`)
- **Payload**: `{ id: user._id, role: user.role }`
- **Secret**: Stored in `.env` (minimum 32 characters recommended)
- **Format**: Bearer token in Authorization header

```javascript
// Login Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 🛡️ Middleware Stack

#### 1. Helmet.js
Protects against common HTTP vulnerabilities:
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME-type sniffing
- Other HTTP header attacks

```javascript
app.use(helmet());
```

#### 2. CORS Configuration
Restricts API access to authorized origins:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL, // Only localhost:3000 in dev
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

#### 3. Authentication Middleware (`authMiddleware.js`)
Verifies JWT token and extracts user information:
- Checks Authorization header format (Bearer token)
- Validates JWT signature with secret
- Handles token expiration
- Attaches `req.user` for downstream handlers

```javascript
// Protected route usage
app.post("/categories", authMiddleware, authorize("admin"), controller);
```

#### 4. Authorization Middleware (`authorizeMiddleware.js`)
Role-based access control (RBAC):
- Checks if user has required role
- Returns 403 Forbidden if unauthorized
- Must follow authMiddleware

```javascript
// Roles: "admin", "user"
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
```

#### 5. Input Validation Middleware (`validators.js`)
express-validator rules for:
- **Register**: Name, Email, Password (8+ chars, mixed case, number), Phone
- **Login**: Email, Password
- **Category**: English/Arabic names, Type enum, Description
- Sanitization: trim(), normalizeEmail()
- Length constraints to prevent abuse

```javascript
// Example: Password must be 8+ chars with uppercase, lowercase, number
body("password")
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage("Password must contain uppercase, lowercase, and number")
```

#### 6. Error Handler Middleware (`errorHandler.js`)
Centralized error responses:
- No stack traces sent to clients in production
- Consistent JSON error format
- Proper HTTP status codes
- Mongoose validation/duplicate key handling
- JWT error handling
- Multer file upload errors

```javascript
// Error Response (Production)
{
  "error": "Email already registered"
  // Stack trace only in development
}
```

### 📡 Protected API Routes

#### Authentication Routes (`/auth`)

```
POST /auth/register
- Public
- Input: { name, email, password, number, role: "user" }
- Returns: { token, user, message }
- Security: Password validation, duplicate email check

POST /auth/login
- Public
- Input: { email, password }
- Returns: { token, user, message }
- Security: Bcrypt password comparison, 401 on invalid credentials

GET /auth/me
- Protected (requires authMiddleware)
- Returns: { user: { id, name, email, role, number } }
```

#### Category Routes (`/categories`)

```
GET /categories
- Public - No auth required
- Returns: Array of all categories

POST /categories
- Protected (authMiddleware + authorize("admin"))
- Input: FormData with category details and image
- Returns: Created category with normalized image paths
- Security: Admin-only, validated input, file upload restrictions

PUT /categories/:id
- Protected (admin-only)
- Validates all input fields
- Returns: Updated category

DELETE /categories/:id
- Protected (admin-only)
- Returns: { message: "Category deleted successfully" }
```

#### Program Routes (`/programs`)

```
GET /programs
- Public
- Returns: Array of all programs with normalized images

POST /programs
- Protected (admin-only)
- Input: FormData with 5 image max
- Returns: Created program

PUT /programs/:id
- Protected (admin-only)

DELETE /programs/:id
- Protected (admin-only)
```

### 🚀 Security Enforcement

**Critical Principle**: Backend ALWAYS enforces security. Frontend is for UX only.

1. **Authentication**: Every protected route checks JWT token
2. **Authorization**: Every admin route checks user.role
3. **Validation**: All inputs validated server-side
4. **Errors**: No sensitive data in responses

---

## Frontend Security

### 🔐 Auth Storage (`lib/auth.ts`)

**Methods**:
- `saveAuthData(token, user)` - Store token and user in localStorage
- `getAuthToken()` - Retrieve token for API requests
- `getAuthUser()` - Get current user data
- `clearAuthData()` - Logout (clear storage)
- `isAuthenticated()` - Check if user logged in
- `hasRole(role)` - Check specific role
- `isAdmin()` - Check if admin
- `getAuthHeader()` - Generate Authorization header

```typescript
// Usage in components
import { getAuthToken, isAdmin } from "@/lib/auth";

const token = getAuthToken();
if (isAdmin()) {
  // Show admin panel
}
```

**⚠️ Security Note**: localStorage is vulnerable to XSS. In production, prefer httpOnly cookies (server-set only). This implementation uses localStorage for simplicity.

### 📡 Secure API Client (`lib/api.ts`)

Axios instance with:
- **Automatic Token Injection**: Adds Bearer token to all requests
- **Request Interceptor**: Attaches Authorization header
- **Response Interceptor**: Handles errors globally
  - 401: Token expired → redirect to login
  - 403: Insufficient permissions → redirect to home
  - 400: Validation errors → return formatted errors
  - 500: Server error → return user-friendly message
  - Network errors: Return connection error

```typescript
import { api } from "@/lib/api";

// Automatically includes Authorization header
const { data } = await api.auth.login({ email, password });
const categories = await api.categories.getAll();
```

### 🔑 Auth Context (`context/AuthContext.tsx`)

Global state management:
- **useAuth() hook**: Access auth state anywhere
- **User State**: Persists across page reloads
- **Auto-initialization**: Checks localStorage on mount
- **Methods**: login(), register(), logout(), hasRole(), isAdmin()

```typescript
import { useAuth } from "@/context/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      {isAdmin() && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 🛡️ Protected Routes (`components/ProtectedRoute.tsx`)

Wraps components that require authentication/authorization:
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

Features:
- Shows loading state while checking auth
- Redirects to /login if not authenticated
- Redirects to home if insufficient role
- Optional fallback component

**Hook Usage**:
```typescript
const canAccess = useCanAccess("admin");
if (canAccess) {
  // Show admin UI
}
```

### 📝 Login Page (`app/login/page.tsx`)

Professional login form:
- Client-side validation (email format, password strength)
- Clear error messages
- Show/hide password toggle
- Loading state during submission
- Redirects authenticated users to home
- Link to register page
- Demo credentials displayed

### 🧭 Navbar Integration (`components/Navbar.tsx`)

**Authenticated Users**:
- Display user name and role
- Show "Admin Dashboard" button (admin-only)
- "Logout" button clears auth and redirects

**Unauthenticated Users**:
- Show "Login" button

---

## API Contract

### Error Responses

**400 Bad Request** (Validation Failed):
```json
{
  "error": "Validation failed",
  "details": {
    "email": "Email must be valid",
    "password": "Password must contain uppercase, lowercase, and number"
  }
}
```

**401 Unauthorized** (Token Invalid/Expired):
```json
{
  "error": "Token has expired"
}
```

**403 Forbidden** (Insufficient Permissions):
```json
{
  "error": "Forbidden: insufficient permissions",
  "requiredRole": ["admin"],
  "userRole": "user"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found"
}
```

**500 Server Error**:
```json
{
  "error": "Internal server error"
  // Stack trace only in development
}
```

---

## Setup & Deployment

### Prerequisites

```bash
# Backend
Node.js 18+
MongoDB 5.0+

# Frontend
Node.js 18+
npm or yarn
```

### Backend Setup

```bash
cd server

# 1. Install dependencies
npm install

# 2. Create .env file
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRE=7d
MONGO_URI=mongodb://localhost:27017/pearl-travel
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# 3. Start server
npm run dev  # Development with nodemon
npm start    # Production
```

### Frontend Setup

```bash
cd client

# 1. Install dependencies
npm install

# 2. Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_TOKEN_KEY=auth_token
NEXT_PUBLIC_AUTH_USER_KEY=auth_user

# 3. Start development server
npm run dev  # http://localhost:3000
```

### Production Deployment

#### Backend
1. Use strong JWT_SECRET (32+ characters, random)
2. Set NODE_ENV=production
3. Use process manager (PM2, systemd, Docker)
4. Enable HTTPS only
5. Set secure CORS origin (your frontend domain)
6. MongoDB: Use Atlas with authentication
7. Environment variables via secret management

#### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or Docker
3. Use httpOnly cookies for tokens (if backend supports)
4. Enable HTTPS
5. Set NEXT_PUBLIC_API_URL to production backend

---

## Security Best Practices

### ✅ DO

- ✅ **Always validate on backend** - Frontend validation is UX only
- ✅ **Hash passwords with bcrypt** - Never store plaintext
- ✅ **Use HTTPS everywhere** - Encrypt all traffic
- ✅ **Rotate JWT secrets** - Use strong, random secrets
- ✅ **Log security events** - Monitor auth failures
- ✅ **Keep dependencies updated** - Regular npm audit
- ✅ **Use environment variables** - Never hardcode secrets
- ✅ **Implement rate limiting** - Prevent brute force
- ✅ **Use CSRF protection** - For state-changing operations
- ✅ **Sanitize user input** - Prevent injection attacks

### ❌ DON'T

- ❌ **Trust frontend authorization** - Backend enforces rules
- ❌ **Store passwords in plaintext** - Always hash
- ❌ **Use weak passwords** - Enforce strong policy
- ❌ **Send tokens in URL parameters** - Use headers only
- ❌ **Log sensitive data** - No passwords, tokens in logs
- ❌ **Commit .env files** - Use .env.example
- ❌ **Use old JWT algorithms** - Use HS256 or RS256
- ❌ **Allow unrestricted uploads** - Validate file types/sizes
- ❌ **Skip CORS validation** - Restrict to known origins
- ❌ **Ignore error messages** - Log and monitor

### 📊 Monitoring & Logging

Key events to log:
1. Failed login attempts (rate limit after 5 attempts)
2. Unauthorized access attempts
3. Role changes
4. Admin actions (delete, create, update)
5. File uploads
6. Token refresh/revocation

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Login Page  │  │  Protected   │  │   Navbar     │  │
│  │              │  │  Routes      │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                │                    │         │
│         └────────────────┴────────────────────┘         │
│                     │                                    │
│         ┌───────────┴──────────────┐                    │
│         ▼                          ▼                    │
│  ┌─────────────────┐      ┌──────────────────┐         │
│  │  Auth Context   │      │  Secure API      │         │
│  │  (useAuth)      │      │  Client (Axios)  │         │
│  └─────────────────┘      └──────────────────┘         │
│         │                          │                    │
│         ▼                          ▼                    │
│  ┌──────────────────────────────────────────┐          │
│  │     localStorage (Token + User)          │          │
│  └──────────────────────────────────────────┘          │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS + Bearer Token
                      │
┌─────────────────────▼────────────────────────────────────┐
│                  BACKEND (Express.js)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Helmet + CORS Middleware              │   │
│  └──────────────────────────────────────────────────┘   │
│                     │                                    │
│         ┌───────────┼───────────┐                       │
│         ▼           ▼           ▼                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │   Auth   │ │ Category │ │ Program  │               │
│  │  Routes  │ │  Routes  │ │  Routes  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
│         │           │           │                      │
│         └───────────┼───────────┘                      │
│                     ▼                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Auth Middleware (verify JWT) +                 │  │
│  │  Authorize Middleware (check role) +            │  │
│  │  Input Validation (express-validator)           │  │
│  └─────────────────────────────────────────────────┘  │
│                     │                                  │
│         ┌───────────┼───────────┐                     │
│         ▼           ▼           ▼                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Business │ │ Database │ │  File    │             │
│  │ Logic    │ │ (MongoDB)│ │ Storage  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│         │           │           │                    │
│         └───────────┼───────────┘                    │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │  Centralized Error Handler (no stack leaks)  │   │
│  └──────────────────────────────────────────────┘   │
│                     │                                │
└─────────────────────┼────────────────────────────────┘
                      │
                      ▼ JSON Response (error or data)
```

---

## Troubleshooting

### Common Issues

**"Invalid token" error**
- Check token hasn't expired (7 days)
- Verify JWT_SECRET matches between requests
- Ensure Authorization header format: `Bearer <token>`

**"Forbidden" (403) error**
- Check user role is correct
- Admin operations require admin role
- Verify authMiddleware runs before authorize middleware

**CORS errors**
- Check FRONTEND_URL in .env matches frontend origin
- Ensure credentials: true in CORS config
- Verify Authorization header in allowedHeaders

**Password validation fails**
- Password must be 8+ characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT.io](https://jwt.io/)
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- [Helmet.js](https://helmetjs.github.io/)

---

**Last Updated**: February 2025
**Version**: 1.0.0 - Production Ready
