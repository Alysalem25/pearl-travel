# Quick Reference: Authorization & Authentication Access Control

## Does User Image Upload Work?
✅ **YES** - Fixed!

### What Was Missing:
- Schema image field was empty (no default or description)
- Login endpoint didn't return image path
- GET /me endpoint didn't return image path

### What's Fixed:
- Image field now has `default: null` and description
- Login response includes: `image: "/uploads/users/filename.jfif"`
- GET /me response includes: `image: "/uploads/users/filename.jfif"`
- Register response already included image path

---

## Can User Visit Protected Pages with Expired Token?
❌ **NO** - Blocked on both client and server!

### Client-Side Protection:
```typescript
// AuthContext.tsx - On app load
if (isTokenExpired()) {
  clearAuthData();  // Remove token
  setUser(null);    // Clear user
  // User redirected to login
}
```

### Server-Side Protection:
```javascript
// authMiddleware.js - On every API request
if (err.name === "TokenExpiredError") {
  return res.status(401).json({ error: "Token has expired" });
}
```

### What Happens:
1. User tries to refresh page → token checked
2. If expired → automatically logged out
3. User cannot make API calls with expired token
4. Protected pages show loading then redirect to login

---

## How to Know if You're Allowed to Visit a Page?

### Flow Diagram:
```
User Visits Page
    ↓
Is Token Stored?
    ├─ NO → Redirect to Login ❌
    ↓ YES
Is Token Expired?
    ├─ YES → Logout & Redirect to Login ❌
    ↓ NO
Does Page Require Admin Role?
    ├─ YES
    │   ├─ User Role = Admin?
    │   │   ├─ NO → Redirect to Home ❌
    │   │   ↓ YES
    │   └─ Show Admin Page ✅
    │
    └─ NO → Show Page ✅
```

### Code Check:
```typescript
// ProtectedRoute.tsx
if (!isAuthenticated) {
  router.push("/login");           // Not logged in
}

if (requiredRole && user?.role !== requiredRole) {
  router.push("/");                // Wrong role
}

// Otherwise, show page
```

---

## HTTP Status Codes & Meanings

| Code | Error | Meaning | What to Do |
|------|-------|---------|-----------|
| 200 | (None) | ✅ Success - Access granted | Proceed |
| 401 | "Token has expired" | Token expired after 7 days | Login again |
| 401 | "Token is not valid" | Token signature corrupted | Login again |
| 401 | "No token" | Missing `Authorization` header | Add token to request |
| 403 | "Forbidden: insufficient permissions" | User role not allowed | Use admin account |
| 401 | "Unauthorized" | Other auth error | Check credentials |

---

## Example: Admin Dashboard Access

### User Role: admin, Token Valid
```
Request: GET /auth/users
Header: Authorization: Bearer <valid_token>
Response: ✅ 200 - Returns all users with images
```

### User Role: user, Token Valid
```
Request: GET /auth/users
Header: Authorization: Bearer <valid_token>
Response: ❌ 403 - "Forbidden: insufficient permissions"
```

### User Role: admin, Token Expired
```
Request: GET /auth/users
Header: Authorization: Bearer <expired_token>
Response: ❌ 401 - "Token has expired"
Action: User must login again
```

---

## Token Expiration Timeline

### Default: 7 Days

```
Day 0:          User logs in → Token created
                └─ Token expires: Day 7 at same time

Day 1-6:        ✅ Token valid - all API calls work

Day 7:          
├─ Before expiration time → ✅ Still valid
└─ After expiration time  → ❌ Token expired

What happens after expiration:
├─ API calls return 401 "Token has expired"
├─ Next page refresh detects expiration
├─ Client automatically logs user out
└─ User redirected to login page
```

### To Change Duration:

**1. Via Environment Variable** (Recommended)
```bash
# .env file
JWT_EXPIRE=24h    # Tokens last 1 day instead of 7
```

**2. Via Code Change**
```javascript
// server/routes/authRoutes.js, lines 65 & 130
{ expiresIn: "24h" }  // Change from "7d"
```

---

## Page Access Matrix

| Page/Endpoint | Public | Auth Required | Admin Required | Image Included | Token Expires |
|---------------|--------|---------------|----------------|---|---|
| `/` | ✅ | ❌ | ❌ | ✅ (in posts) | N/A |
| `/login` | ✅ | ❌ | ❌ | ✅ (UI) | N/A |
| `/[id]/...` | ✅ | ❌ | ❌ | ✅ | N/A |
| `/Admindashboard` | ❌ | ✅ | ✅ | ✅ | ✅ 7d |
| `/Admindashboard/users` | ❌ | ✅ | ✅ | ✅ | ✅ 7d |
| `/Admindashboard/categories` | ❌ | ✅ | ✅ | ✅ | ✅ 7d |
| `/Admindashboard/programs` | ❌ | ✅ | ✅ | ✅ | ✅ 7d |
| `POST /auth/register` | ✅ | ❌ | ❌ | ✅ (uploads) | N/A |
| `POST /auth/login` | ✅ | ❌ | ❌ | ✅ (in response) | ✅ 7d |
| `GET /auth/me` | ❌ | ✅ | ❌ | ✅ | ✅ 7d |
| `GET /auth/users` | ❌ | ✅ | ✅ | ✅ | ✅ 7d |
| `DELETE /auth/deleteUser/:id` | ❌ | ✅ | ✅ | ❌ | ✅ 7d |

---

## Implementation Summary

### ✅ Authentication (Who Are You?)
- Login with email & password
- Receive JWT token valid for 7 days
- Token includes user ID and role
- Server validates token on every protected request
- If token expired → 401 response
- Client checks expiration on page load

### ✅ Authorization (What Can You Do?)
- User role: `"admin"` or `"user"`
- Admin routes require `role === "admin"`
- Non-admin users get 403 "Forbidden"
- ProtectedRoute component enforces on frontend
- authMiddleware + authorize enforce on backend
- Backend validation is final - never trust frontend

### ✅ Image Handling
- Stored as filename in database
- Returned as full path: `/uploads/users/filename.jfif`
- Included in login, register, and GET /me responses
- Images in `server/uploads/users/` directory
- Image field optional (defaults to null)

### ✅ Token Expiration
- 7 day default expiration
- Configurable via `JWT_EXPIRE` env variable
- Server rejects expired tokens (401)
- Client detects expired tokens on load
- User auto-logged out if token expired
- User must login again for new token

---

## Troubleshooting Quick Fixes

### Problem: "Token has expired"
**Solution**: User must login again
```bash
# Get new token
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'
```

### Problem: Can't access admin page
**Check**: 
1. Are you logged in? `isAuthenticated === true`
2. Is your role admin? `user?.role === "admin"`
3. Is your token expired? `isTokenExpired() === false`

### Problem: Image returns undefined
**Check**:
1. Did user upload image during register? 
2. Server has file in `uploads/users/`?
3. Response includes `image` field?

### Problem: Redirect to login keeps happening
**Check**:
1. Is token in localStorage? `getAuthToken() !== null`
2. Is token valid? `isTokenExpired() === false`
3. Server returns 401? Check browser console

---

## For Developers

### Import These in Your Components:
```typescript
import { useAuth } from "@/context/AuthContext";
import { 
  getAuthToken, 
  isTokenExpired, 
  getTokenTimeRemaining 
} from "@/lib/auth";
```

### Check Authentication:
```typescript
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated) {
  // Show login button
}

if (user?.role === "admin") {
  // Show admin menu
}
```

### Check Token Expiration:
```typescript
if (isTokenExpired()) {
  // Token expired - redirect to login
  router.push("/login");
}

const secondsLeft = getTokenTimeRemaining();
if (secondsLeft < 3600) {
  // Token expires in less than 1 hour
  // Could show warning to user
}
```

### Include Token in API Requests:
```typescript
import { getAuthHeader } from "@/lib/auth";

const headers = getAuthHeader();
// Returns: { Authorization: "Bearer <token>" }
// Or: {} if no token

const response = await fetch("/api/endpoint", {
  headers: {
    ...headers,
    "Content-Type": "application/json"
  }
});
```

