# 🚀 Quick Start Guide - Authentication & Authorization

## For Users: How to Use the System

### Register
```bash
# 1. Go to registration page
# 2. Fill in:
#    - Name
#    - Email
#    - Password (8+ characters)
#    - Phone number
#    - Upload profile image (optional)
# 3. Click Register

# Result: ✅ Logged in automatically with 7-day token
```

### Login
```bash
# 1. Go to login page
# 2. Enter:
#    - Email
#    - Password
# 3. Click Login

# Result: ✅ Logged in, token expires in 7 days
```

### Access Admin Features
```
IF you are admin:
  → Can visit /Admindashboard
  → Can manage users, programs, categories

IF you are user:
  → Redirected to home page
  → Cannot access admin features
```

### Token Expiration
```
After 7 days:
  → Token automatically expires
  → Next page visit → redirected to login
  → Must login again for new token

To change this:
  → Admin changes JWT_EXPIRE in .env file
  → Then restart server
```

---

## For Developers: Configuration & Testing

### Environment Setup
```bash
# .env file in server root
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRE=7d    # Options: 1h, 24h, 7d, 30d

# Restart server after changes
npm run dev
```

### Test Authentication
```bash
# 1. Register user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John",
    "email":"john@test.com",
    "password":"SecurePass123",
    "number":"+1234567890"
  }'

# Response includes:
# - token: "eyJhbGciOiJIUzI1NiIs..."
# - user: { id, name, email, role, image }

# 2. Copy token from response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 3. Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/auth/me

# Should return user data
```

### Test Authorization
```bash
# Get all users (admin only)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/auth/users
# ✅ Works (status 200)

curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:5000/auth/users
# ❌ Forbidden (status 403)
```

### Test Image Upload
```bash
# Register with image
curl -X POST http://localhost:5000/auth/register \
  -F "name=John" \
  -F "email=john@test.com" \
  -F "password=SecurePass123" \
  -F "number=+1234567890" \
  -F "images=@/path/to/image.jpg"

# Response includes:
# "image": "/uploads/users/1770844859228.jfif"

# Image file is here:
# server/uploads/users/1770844859228.jfif
```

### Test Token Expiration
```bash
# Use an old/expired token
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:5000/auth/me

# Response:
# 401 "Token has expired"
```

---

## API Endpoints Reference

### Public Endpoints (No Auth Needed)
```
POST /auth/register
  - Input: name, email, password, number, images (optional)
  - Returns: token, user
  - Status: 201

POST /auth/login
  - Input: email, password
  - Returns: token, user
  - Status: 200
```

### Protected Endpoints (Auth Required)
```
GET /auth/me
  - Header: Authorization: Bearer <token>
  - Returns: user { id, name, email, role, number, image }
  - Status: 200
  
GET /auth/users (ADMIN ONLY)
  - Header: Authorization: Bearer <admin_token>
  - Returns: users[]
  - Status: 200 (admin) or 403 (non-admin)
  
DELETE /auth/deleteUser/:id (ADMIN ONLY)
  - Header: Authorization: Bearer <admin_token>
  - Returns: { message: "User deleted successfully" }
  - Status: 200 (admin) or 403 (non-admin)
```

---

## Common Issues & Solutions

### Issue: "No token, authorization denied"
**Solution**: Add Authorization header to request
```javascript
const headers = {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
};
```

### Issue: "Token has expired"
**Solution**: User must login again
```javascript
// Frontend auto-handles this
// On page refresh → auto-logout if expired
// On API call → redirects to login
```

### Issue: "Forbidden: insufficient permissions"
**Solution**: Only admins can access that route
```
Check: Is user.role === "admin"?
If no: Create admin account or ask admin to promote user
```

### Issue: Image returns undefined
**Solution**: User didn't upload image during registration
```
This is optional - field defaults to null
Feature: Support image upload in profile update
```

### Issue: Can't visit /Admindashboard
**Check**:
1. Are you logged in? (localStorage.auth_token exists?)
2. Is your token expired? (isTokenExpired() function)
3. Are you admin? (user.role === "admin"?)
4. Did token expire mid-session? (Check server logs)
```

---

## Frontend Integration

### In Components:
```typescript
import { useAuth } from "@/context/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please login</p>;
  }
  
  return (
    <>
      <p>Welcome {user?.name}</p>
      {user?.image && <img src={user.image} />}
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### Protected Pages:
```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### Check Token Expiration:
```typescript
import { isTokenExpired, getTokenTimeRemaining } from "@/lib/auth";

// Check if expired
if (isTokenExpired()) {
  router.push("/login");
}

// Get time remaining
const secondsLeft = getTokenTimeRemaining();
if (secondsLeft < 3600) {
  console.log("Token expires in less than 1 hour");
}
```

---

## File Locations

### Core Files
- Auth routes: `server/routes/authRoutes.js`
- Auth middleware: `server/middlewares/authMiddleware.js`
- Authorize middleware: `server/middlewares/authorizeMiddleware.js`
- User model: `server/models/Users.js`

### Frontend
- Auth context: `client/context/AuthContext.tsx`
- Auth utilities: `client/lib/auth.ts`
- Protected route: `client/components/ProtectedRoute.tsx`

### Upload Directories
- User images: `server/uploads/users/`
- Program images: `server/uploads/programs/`
- Category images: `server/uploads/categories/`

---

## Key Concepts

### JWT Token
- JWT = JSON Web Token
- Format: `header.payload.signature`
- Unsigned = can be decoded but not verified
- Signed = cryptographically verified
- Contains: user ID, role, expiration
- Expires: 7 days default

### Authentication
- **Who are you?**
- Verified by password + bcrypt
- Confirmed by JWT signature
- Token stored client-side

### Authorization
- **What can you do?**
- Based on user role
- Enforced by middleware
- Always verified server-side

### Token Expiration
- **When does it end?**
- 7 days from creation
- Checked server-side on every request
- Checked client-side on page load
- Configurable via JWT_EXPIRE

---

## Security Notes

### What's Protected ✅
- Passwords hashed with bcrypt
- Tokens signed with secret key
- Token expiration enforced
- Role-based access control
- Server-side validation

### What's Not Protected ⚠️
- localStorage vulnerable to XSS
- Consider httpOnly cookies in production
- Implement refresh tokens for better UX

### Never Do ❌
- Store passwords in JWT
- Skip server-side validation
- Trust client-side checks only
- Use weak JWT_SECRET

---

## Useful Functions

### Client-Side (Import from `@/lib/auth`):
```typescript
getAuthToken()              // Get token from storage
getAuthUser()               // Get user data
getAuthHeader()             // Get Authorization header
isAuthenticated()           // Check if logged in
isTokenExpired()            // Check token expiration ✅ NEW
getTokenTimeRemaining()     // Get seconds until expiration ✅ NEW
decodeToken(token)          // Decode JWT payload ✅ NEW
hasRole(role)               // Check user role
isAdmin()                   // Check if admin
saveAuthData(token, user)   // Save to localStorage
clearAuthData()             // Clear localStorage (logout)
```

### Backend (Built-in):
```javascript
authMiddleware              // Verify JWT token
authorize('admin')          // Check user role
bcrypt.hash()               // Hash password
bcrypt.compare()            // Compare password
jwt.sign()                  // Create token
jwt.verify()                // Verify token
```

---

## Performance Tips

1. **Don't re-fetch user data on every page**
   - Use AuthContext (already cached)
   
2. **Check token expiration before API call**
   - Use `isTokenExpired()` to avoid 401 errors
   
3. **Cache image paths**
   - Image URL doesn't change (unless user updates)
   
4. **Use stored user data**
   - Don't call `/auth/me` repeatedly
   - Already in localStorage

---

## Next Steps

1. **Test the system** - Use curl commands above
2. **Check documentation** - See other README files
3. **Monitor in production** - Watch for 401/403 errors
4. **Plan enhancements** - Refresh tokens, 2FA, etc.

---

## Support Files

| File | Purpose |
|------|---------|
| [AUTH_EXPIRATION_GUIDE.md](AUTH_EXPIRATION_GUIDE.md) | Complete technical guide |
| [ACCESS_CONTROL_QUICK_GUIDE.md](ACCESS_CONTROL_QUICK_GUIDE.md) | Quick reference |
| [VISUAL_FLOW_DIAGRAMS.md](VISUAL_FLOW_DIAGRAMS.md) | Flow diagrams |
| [CHANGES_MADE.md](CHANGES_MADE.md) | Code changes |
| [CHECKLIST_VERIFICATION.md](CHECKLIST_VERIFICATION.md) | Verification checklist |

---

## Questions?

Check the documentation or review:
- Error messages (they're descriptive)
- HTTP status codes
- Browser console (client-side errors)
- Server logs (backend errors)

All systems operational! ✅

