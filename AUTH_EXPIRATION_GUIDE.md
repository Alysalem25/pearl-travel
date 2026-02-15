# Authentication & Authorization Guide with Token Expiration

## Overview
This guide explains how authentication, authorization, and token expiration work in the Pearl Travel application.

---

## 1. TOKEN EXPIRATION CONFIGURATION

### Server-Side (Backend)
- **Token Expiration Time**: 7 days (configurable via `JWT_EXPIRE` environment variable)
- **Location**: `server/routes/authRoutes.js` (lines 65 & 130)
- **Default**: `"7d"` (can be changed to `"1h"`, `"24h"`, `"30d"`, etc.)

```javascript
// In authRoutes.js - register endpoint (line 65)
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "7d" }
);

// In authRoutes.js - login endpoint (line 130)
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "7d" }
);
```

**Environment Variable Setup**:
```
# In .env file (create if doesn't exist)
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

---

## 2. HOW AUTHORIZATION & AUTHENTICATION WORK

### Authentication (Verifying WHO you are)
Happens via `authMiddleware` on protected routes.

**Location**: `server/middlewares/authMiddleware.js`

**Process**:
1. Client sends request with `Authorization: Bearer <token>` header
2. Middleware extracts and validates the token
3. If expired → returns 401 "Token has expired"
4. If invalid → returns 401 "Invalid token"
5. If valid → attaches user info to `req.user` and allows request to proceed

**Example Request**:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." http://localhost:5000/auth/me
```

### Authorization (Checking if you have PERMISSION)
Happens via `authorize` middleware on admin-only routes.

**Location**: `server/middlewares/authorizeMiddleware.js`

**Process**:
1. First, `authMiddleware` must run (validates token)
2. Then `authorize('admin')` checks if `req.user.role === 'admin'`
3. If not admin → returns 403 "Forbidden: insufficient permissions"
4. If admin → allows request to proceed

**Example Usage**:
```javascript
// Only admins can delete users
router.delete('/deleteUser/:id', authMiddleware, authorize('admin'), deleteUserController);
```

---

## 3. PROTECTED ROUTES (ENDPOINTS REQUIRING AUTHENTICATION)

| Endpoint | Method | Auth Required | Role Required | Purpose |
|----------|--------|---------------|---------------|---------|
| `/auth/register` | POST | ❌ No | None | Create new account |
| `/auth/login` | POST | ❌ No | None | Get JWT token |
| `/auth/me` | GET | ✅ Yes | Any | Get current user info |
| `/auth/users` | GET | ✅ Yes | `admin` | List all users |
| `/auth/deleteUser/:id` | DELETE | ✅ Yes | `admin` | Delete user (admin only) |

---

## 4. CLIENT-SIDE TOKEN EXPIRATION CHECKING

### Automatic Validation on App Load
**Location**: `client/context/AuthContext.tsx` (lines 52-66)

When the app loads:
```typescript
const storedUser = getAuthUser();
if (storedUser) {
  // Check if token has expired
  if (isTokenExpired()) {
    clearAuthData();        // Clear invalid token
    setUser(null);          // Log out user
  } else {
    setUser(storedUser);    // Keep user logged in
  }
}
```

### Token Validation Utilities
**Location**: `client/lib/auth.ts` (added functions)

```typescript
// Check if token is expired
isTokenExpired(): boolean

// Get remaining time (in seconds)
getTokenTimeRemaining(): number

// Decode token payload (for debugging)
decodeToken(token): Record<string, any>
```

---

## 5. USER IMAGE HANDLING IN SCHEMA

### Database Schema Update
**Location**: `server/models/Users.js`

```javascript
image: {
  type: String,
  default: null,
  description: "User profile image filename stored in uploads/users"
}
```

### Image Upload Process
1. User uploads image during registration/profile update
2. Multer saves file to `uploads/users/` folder with timestamp filename
3. Only filename stored in database (e.g., `1770844859228.jfif`)
4. API returns full URL path: `/uploads/users/1770844859228.jfif`

### Image Response Examples

**Register Endpoint Response**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "inTeam": false,
    "image": "/uploads/users/1770844859228.jfif"
  }
}
```

**Login Endpoint Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "number": "+1234567890",
    "image": "/uploads/users/1770844859228.jfif"
  }
}
```

**Get User Info (/me) Response**:
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "number": "+1234567890",
    "image": "/uploads/users/1770844859228.jfif"
  }
}
```

---

## 6. PROTECTED PAGE ACCESS FLOW

### Admin Dashboard Example
**Location**: `client/app/Admindashbord/page.tsx`

**Flow**:
1. User visits `/Admindashbord`
2. `ProtectedRoute` component checks authentication
3. If not logged in → redirects to `/login`
4. If logged in but not admin → redirects to `/`
5. If logged in and admin → shows dashboard

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Token Expiration During Session
**Scenario**: Token expires while user is on the page

**Client Response**:
1. On next API call, server returns 401 "Token has expired"
2. Client intercepts 401 error
3. Client clears auth data and redirects to login
4. User must re-login to get new token

---

## 7. SECURITY CHECKLIST

✅ **Implemented**:
- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT token expiration (7 days default)
- [x] Bearer token format validation
- [x] Role-based access control (RBAC)
- [x] Token validation on every protected request
- [x] Client-side token expiration detection
- [x] No password stored in JWT
- [x] No sensitive data in localStorage beyond token

⚠️ **Recommended for Production**:
- [ ] Use httpOnly cookies instead of localStorage for tokens
- [ ] Implement token refresh mechanism (refresh tokens)
- [ ] Add logout endpoint that invalidates tokens server-side
- [ ] Use HTTPS in production
- [ ] Add rate limiting on login endpoint
- [ ] Implement CORS properly with whitelist

---

## 8. TESTING AUTHENTICATION

### Test with cURL

**1. Register**:
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"SecurePass123","number":"+1234567890"}'
```

**2. Login**:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"SecurePass123"}'
```

**3. Get Current User (Protected)**:
```bash
curl -H "Authorization: Bearer <token_from_login>" \
  http://localhost:5000/auth/me
```

**4. Get All Users (Admin Only)**:
```bash
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:5000/auth/users
```

---

## 9. TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| "No token, authorization denied" | Add `Authorization: Bearer <token>` header to request |
| "Token has expired" | User must login again to get new token |
| "Forbidden: insufficient permissions" | User role must be `admin` to access this endpoint |
| "Invalid authorization format" | Use `Bearer <token>` format, not `Basic` or just `<token>` |
| Image returns `undefined` | User registered without uploading image; optional field |
| Token validation fails intermittently | Check `JWT_SECRET` matches in frontend and backend |

---

## 10. CHANGING TOKEN EXPIRATION TIME

To change token expiration globally:

**Option 1: Environment Variable** (Recommended)
```bash
# In your .env file
JWT_EXPIRE=24h    # 1 day
JWT_EXPIRE=30d    # 30 days
JWT_EXPIRE=1h     # 1 hour
```

**Option 2: Code Change**
Modify `server/routes/authRoutes.js` lines 65 and 130:
```javascript
{ expiresIn: "24h" }  // Change from "7d"
```

**Time Format Options**:
- `"1h"` = 1 hour
- `"24h"` = 1 day
- `"7d"` = 7 days
- `"30d"` = 30 days

---

## Summary Table: What Allows Page Access?

| Page | Requires Auth? | Requires Admin? | Token Expires? | Can View Image? |
|------|----------------|-----------------|----------------|-----------------|
| `/` (Home) | ❌ No | ❌ No | N/A | ✅ Yes |
| `/login` | ❌ No | ❌ No | N/A | ✅ Yes |
| `/Admindashboard` | ✅ Yes | ✅ Yes | ✅ 7 days | ✅ Yes |
| `/Admindashboard/users` | ✅ Yes | ✅ Yes | ✅ 7 days | ✅ Yes |
| `/Admindashboard/categories` | ✅ Yes | ✅ Yes | ✅ 7 days | ✅ Yes |
| `/Admindashboard/programs` | ✅ Yes | ✅ Yes | ✅ 7 days | ✅ Yes |

