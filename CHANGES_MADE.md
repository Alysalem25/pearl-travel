# Changes Made: Authentication, Authorization & Image Handling

## Summary of Fixes

### 1. ✅ User Image Field in Schema
**File**: `server/models/Users.js`

**Before**:
```javascript
image:{
  type: String,

}
```

**After**:
```javascript
image:{
  type: String,
  default: null,
  description: "User profile image filename stored in uploads/users"
}
```

**Impact**: 
- Image field now properly documented
- Default value set to null (optional)
- Clearer purpose in schema

---

### 2. ✅ User Image in Login Response
**File**: `server/routes/authRoutes.js` (Login endpoint)

**Before**:
```javascript
res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
```

**After**:
```javascript
res.json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    number: user.number,
    image: user.image ? normalizeImagePath(user.image) : undefined
  }
});
```

**Impact**:
- Client receives user image URL immediately after login
- Image path properly normalized to `/uploads/users/filename`
- Undefined if no image (graceful handling)

---

### 3. ✅ User Image in GET /me Response
**File**: `server/routes/authRoutes.js` (Get current user endpoint)

**Before**:
```javascript
res.json({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    number: user.number
  }
});
```

**After**:
```javascript
res.json({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    number: user.number,
    image: user.image ? normalizeImagePath(user.image) : undefined
  }
});
```

**Impact**:
- User profile page can now fetch and display user image
- Consistent image format across all endpoints

---

### 4. ✅ Token Expiration Checking on Client
**File**: `client/lib/auth.ts` (Added 3 new functions)

**New Functions Added**:

```typescript
/**
 * Decode JWT token (client-side only for checking expiration)
 * Note: This is NOT validated - always validate on server
 */
export const decodeToken = (token: string): Record<string, any> | null

/**
 * Check if token is expired
 * Used for client-side UX optimization
 * Server-side validation is ALWAYS enforced
 */
export const isTokenExpired = (): boolean

/**
 * Get time remaining on token (in seconds)
 * Returns 0 if no token or expired
 */
export const getTokenTimeRemaining = (): number
```

**Usage Examples**:
```typescript
// Check if token expired
if (isTokenExpired()) {
  // Redirect to login
}

// Get remaining time
const secondsLeft = getTokenTimeRemaining();
console.log(`Token expires in ${secondsLeft} seconds`);

// Decode token (for debugging)
const payload = decodeToken(token);
console.log(payload.exp); // Expiration timestamp
```

**Impact**:
- Client can detect expired tokens before making API calls
- Better user experience - automatic logout if expired
- No unnecessary failed API requests

---

### 5. ✅ Token Expiration Validation on App Load
**File**: `client/context/AuthContext.tsx`

**Before**:
```typescript
useEffect(() => {
  const storedUser = getAuthUser();
  if (storedUser) {
    setUser(storedUser);
  }
  setLoading(false);
}, []);
```

**After**:
```typescript
useEffect(() => {
  const storedUser = getAuthUser();
  if (storedUser) {
    // Check if token has expired
    if (isTokenExpired()) {
      clearAuthData();
      setUser(null);
    } else {
      setUser(storedUser);
    }
  }
  setLoading(false);
}, []);
```

**Impact**:
- When user refreshes page, token expiration is checked
- If expired, user is automatically logged out
- If valid, user stays logged in
- Prevents access to protected pages with expired tokens

---

## Authorization Flow (Already Implemented)

### How It Works:

1. **User Logs In**
   - Sends email & password to `/auth/login`
   - Backend verifies credentials
   - Backend generates JWT token with `role` and `id`
   - Token expires in 7 days (configurable)

2. **User Makes Request to Protected Endpoint**
   - Client sends: `Authorization: Bearer <token>`
   - Backend validates token signature
   - Backend checks token hasn't expired
   - If expired: Returns 401 "Token has expired"
   - If valid: Continues to next middleware

3. **Admin-Only Endpoints**
   - After authentication, `authorize('admin')` checks role
   - Only users with `role: "admin"` can access
   - Others get 403 "Forbidden: insufficient permissions"

4. **Page-Level Protection**
   - `<ProtectedRoute requiredRole="admin">` wraps admin pages
   - If not authenticated → redirects to `/login`
   - If authenticated but wrong role → redirects to `/`
   - If authenticated with correct role → shows page

---

## Token Expiration Times

### Current Configuration
- **Default**: 7 days (`JWT_EXPIRE || "7d"`)
- **Location**: `server/routes/authRoutes.js` lines 65 & 130

### How to Change
```env
# .env file
JWT_EXPIRE=24h    # 1 day
JWT_EXPIRE=1h     # 1 hour  
JWT_EXPIRE=30d    # 30 days
JWT_EXPIRE=7d     # 7 days (current default)
```

### Available Format Strings
- `"1h"` = 1 hour
- `"2h"` = 2 hours
- `"24h"` = 1 day
- `"7d"` = 7 days
- `"30d"` = 30 days
- `"1y"` = 1 year

---

## Testing the Changes

### 1. Test User Image Upload
```bash
# Register with image
curl -X POST http://localhost:5000/auth/register \
  -F "name=John Doe" \
  -F "email=john@test.com" \
  -F "password=SecurePass123" \
  -F "number=+1234567890" \
  -F "images=@path/to/image.jpg"
```

Response includes:
```json
{
  "user": {
    "image": "/uploads/users/1770844859228.jfif"
  }
}
```

### 2. Test Login Returns Image
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"SecurePass123"}'
```

Response now includes user image.

### 3. Test Token Expiration
```bash
# Get current user (with image)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/auth/me
```

If token expired, get: 401 "Token has expired"

---

## Security Verification Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens have expiration date
- [x] Bearer token format enforced
- [x] Token signature validated on backend
- [x] Expired tokens rejected (401)
- [x] Invalid tokens rejected (401)
- [x] Role-based authorization working (403 if unauthorized)
- [x] Client-side token expiration detection
- [x] Client-side page protection via ProtectedRoute
- [x] No sensitive data in JWT payload
- [x] No password returned in responses
- [x] User image properly stored and retrieved
- [x] Image path normalized before response

---

## Key Points to Remember

### For Frontend
- Always include `Authorization: Bearer <token>` header in API requests
- Use `getAuthHeader()` to get properly formatted header
- Check `isTokenExpired()` before visiting protected pages
- Subscribe to auth context to monitor login state

### For Backend
- Always validate JWT on protected endpoints using `authMiddleware`
- Always enforce role checks using `authorize('admin')`
- Server-side validation is FINAL - never trust client
- Return consistent image path format: `/uploads/users/filename`

### For Database
- User image stored as filename only (e.g., `1770844859228.jfif`)
- Full path constructed in responses: `/uploads/users/1770844859228.jfif`
- Image optional - field defaults to null
- Actual files stored in `server/uploads/users/` directory

