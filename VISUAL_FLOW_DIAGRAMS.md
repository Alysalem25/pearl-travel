# Visual Diagrams: Authentication & Authorization Flow

## 1. Login & Token Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN FLOW                         │
└─────────────────────────────────────────────────────────────────┘

FRONTEND (Client)
├─ User enters email & password
├─ Sends POST /auth/login
│
BACKEND (Server)
├─ Receives: { email, password }
├─ Find user in database by email
│  ├─ User not found → 401 "Invalid credentials" ❌
│  └─ User found → Continue
├─ Compare passwords using bcrypt
│  ├─ Doesn't match → 401 "Invalid credentials" ❌
│  └─ Matches → Continue
├─ Generate JWT Token
│  ├─ Payload: { id: "...", role: "admin" }
│  ├─ Secret: process.env.JWT_SECRET
│  └─ Expires: 7 days from now
├─ Return to client:
│  ├─ token: "eyJhbGciOiJIUzI1NiIs..."
│  ├─ user: { id, name, email, role, image }
│
FRONTEND (Client)
├─ Receives token & user data
├─ Save to localStorage
│  ├─ localStorage.auth_token = token
│  └─ localStorage.auth_user = JSON.stringify(user)
├─ Update AuthContext
│  └─ setUser(userData)
├─ User logged in ✅
└─ Can now visit protected pages
```

---

## 2. Token Expiration Check Timeline

```
┌──────────────────────────────────────────────────────────────┐
│                 TOKEN LIFETIME (7 DAYS)                      │
└──────────────────────────────────────────────────────────────┘

Day 0, 10:00 AM
└─ User logs in
   └─ Token generated with exp = Day 7, 10:00 AM
   
Day 1-6 (Any time)
└─ ✅ Token VALID
   └─ All API calls work
   └─ Pages accessible
   
Day 7, 9:59 AM
└─ ✅ Token still VALID (1 minute left)
   └─ Can still make API calls
   
Day 7, 10:00:00 AM
└─ ❌ Token EXPIRED
   └─ isTokenExpired() returns true
   └─ API calls return 401
   └─ User auto-logged out
   
Day 7, 10:00:01 AM onwards
└─ ❌ Token EXPIRED
   └─ User must login again
   └─ redirected to /login

ENVIRONMENT CONFIGURATION:
└─ Default: JWT_EXPIRE = "7d"
   ├─ Change to "1h" → 1 hour tokens
   ├─ Change to "24h" → 1 day tokens
   ├─ Change to "30d" → 30 day tokens
   └─ Restart server for change to take effect
```

---

## 3. Protected Page Access Decision Tree

```
                    User Visits Protected Page
                            |
                            v
                  Is Token in Storage?
                      /            \
                    NO              YES
                    |                |
                    v                v
              Redirect to      Is Token
              /login ❌         Expired?
                              /        \
                            YES        NO
                            |          |
                            v          v
                       Logout &    Does Page
                       Redirect to  Require
                       /login ❌    Admin Role?
                                   /        \
                                 YES        NO
                                 |          |
                                 v          v
                            Is User     Show Page
                            Role =      ✅ Access
                            "admin"?    Granted
                            /      \
                          YES      NO
                          |        |
                          v        v
                       Show    Redirect to
                       Page     /home ❌
                       ✅


IMPLEMENTATION IN CODE:

ProtectedRoute.tsx:
├─ if (!isAuthenticated) → router.push("/login")
├─ if (requiredRole && !hasRole) → router.push("/")
└─ else → Show children ✅

AuthContext.tsx:
├─ On mount:
│  ├─ Get storedUser from localStorage
│  ├─ if (isTokenExpired()) → clearAuthData()
│  └─ else → setUser(storedUser)
```

---

## 4. API Request Protection Layers

```
┌────────────────────────────────────────────────────────────────┐
│                   API REQUEST JOURNEY                          │
└────────────────────────────────────────────────────────────────┘

CLIENT
├─ Make request to protected endpoint
└─ Include header: Authorization: Bearer <token>

                        ↓

BACKEND - SERVER
├─ Endpoint: DELETE /auth/deleteUser/:id
├─
├─ MIDDLEWARE LAYER 1: authMiddleware
│  ├─ Check: Authorization header exists?
│  │  ├─ NO → 401 "Authorization header missing" ❌
│  │  └─ YES → Continue
│  ├─ Check: Format is "Bearer <token>"?
│  │  ├─ NO → 401 "Invalid authorization format" ❌
│  │  └─ YES → Continue
│  ├─ Check: Token signature valid?
│  │  ├─ NO → 401 "Invalid token" ❌
│  │  └─ YES → Continue
│  ├─ Check: Token expired?
│  │  ├─ YES → 401 "Token has expired" ❌
│  │  └─ NO → Continue
│  └─ Attach user to req.user: { id, role }
│
├─ MIDDLEWARE LAYER 2: authorize('admin')
│  ├─ Check: req.user exists?
│  │  ├─ NO → 401 "Unauthorized" ❌
│  │  └─ YES → Continue
│  ├─ Check: req.user.role === "admin"?
│  │  ├─ NO → 403 "Forbidden: insufficient permissions" ❌
│  │  └─ YES → Continue
│
├─ CONTROLLER: deleteUserController
│  └─ User ID verified ✅
│  └─ User role verified ✅
│  └─ Execute deletion logic
│  └─ Return 200 success ✅

RESPONSE BACK TO CLIENT
```

---

## 5. User Image Flow

```
┌────────────────────────────────────────────────────────────────┐
│              USER IMAGE UPLOAD & RETRIEVAL                     │
└────────────────────────────────────────────────────────────────┘

REGISTRATION WITH IMAGE:

Frontend
├─ User selects image file
├─ POST /auth/register with multipart form data
│  ├─ name: "John Doe"
│  ├─ email: "john@test.com"
│  ├─ password: "SecurePass123"
│  ├─ number: "+1234567890"
│  └─ images: <file buffer>

Backend
├─ uploadUser middleware (multer)
│  ├─ Save file to: /uploads/users/
│  ├─ Generated filename: 1770844859228.jfif
│  ├─ Attach to req.files[0].filename
│  └─ Continue to handler
├─ Create User document
│  ├─ name: "John Doe"
│  ├─ email: "john@test.com"
│  ├─ password: "hashed_password"
│  ├─ number: "+1234567890"
│  └─ image: "1770844859228.jfif" (filename only)
├─ Return to client:
│  {
│    "message": "User registered successfully",
│    "token": "eyJhbGciOiJIUzI1NiIs...",
│    "user": {
│      "id": "507f1f77bcf86cd799439011",
│      "name": "John Doe",
│      "email": "john@test.com",
│      "role": "user",
│      "inTeam": false,
│      "image": "/uploads/users/1770844859228.jfif" ← Full path!
│    }
│  }

Frontend
├─ Receives user object with image path
├─ Store in localStorage
├─ Display image: <img src="/uploads/users/1770844859228.jfif" />


RETRIEVAL (GET /auth/me):

Frontend
├─ GET /auth/me
├─ Header: Authorization: Bearer <token>

Backend
├─ Find user by ID from token
├─ Return user object with normalized image path
│  {
│    "user": {
│      "id": "507f1f77bcf86cd799439011",
│      "name": "John Doe",
│      "image": "/uploads/users/1770844859228.jfif"
│    }
│  }

Frontend
├─ Display user profile with image


DATABASE STORAGE:
┌─────────────────────────┐
│   Users Collection      │
├─────────────────────────┤
│ _id: "507f1f77bcf..."   │
│ name: "John Doe"        │
│ email: "john@test.com"  │
│ image: "1770844859..." ← Only filename!
│ (timestamps)            │
└─────────────────────────┘

FILE SYSTEM:
server/uploads/users/
├─ 1770844859228.jfif ← Actual image file
├─ 1770844861178.jfif
├─ 1770844876189.jfif
└─ ...
```

---

## 6. Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────────┐
│          ROLE-BASED ACCESS CONTROL (RBAC)                      │
└────────────────────────────────────────────────────────────────┘

DATABASE - User Document:
{
  name: "John Doe",
  email: "john@test.com",
  role: "admin" ← Key field for authorization
}

ROUTES & ROLE REQUIREMENTS:

Public Routes (anyone, no token needed):
├─ POST /auth/register
├─ POST /auth/login
├─ GET / (home page)
└─ GET /[id]/... (public pages)

User Routes (authenticated, any role):
├─ GET /auth/me
└─ (user data access)

Admin-Only Routes (authenticated + admin role):
├─ GET /auth/users ← Admin needs role="admin"
├─ DELETE /auth/deleteUser/:id
├─ POST /categories
├─ DELETE /categories/:id
├─ POST /programs
├─ DELETE /programs/:id
└─ (admin operations)


AUTHORIZATION CHECK LOGIC:

When user requests admin route:
│
├─ authMiddleware extracts role from token
│  └─ req.user.role = "admin" or "user"
│
├─ authorize('admin') middleware checks role
│  │
│  ├─ if (req.user.role === "admin")
│  │  └─ ✅ Access granted → next()
│  │
│  └─ else (role !== "admin")
│     └─ ❌ Access denied → 403 response


TOKENS CONTAIN ROLES:

When creating token (in authRoutes.js):
{
  id: user._id,
  role: user.role ← Encrypted in token
}
secret: process.env.JWT_SECRET

Server can decode and verify:
├─ Token signature matches secret
├─ Token hasn't expired
└─ User role extracted from token payload
```

---

## 7. Token Expiration Checking

```
┌────────────────────────────────────────────────────────────────┐
│            TOKEN EXPIRATION CHECKING FLOW                      │
└────────────────────────────────────────────────────────────────┘

CLIENT-SIDE (UX Optimization):

Token in localStorage:
{
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2Y..."
  "auth_user": { "id": "...", "name": "...", "role": "admin" }
}

On App Load:
├─ AuthContext.useEffect triggered
├─ Get token from localStorage
├─ Call: isTokenExpired()
│  ├─ Decode JWT payload
│  ├─ Extract: exp = 1739486400 (Unix timestamp)
│  ├─ Compare: current_time / 1000 > exp?
│  │  ├─ YES → Token expired ❌
│  │  └─ NO → Token still valid ✅
│
├─ if (isTokenExpired())
│  ├─ clearAuthData() ← Remove token from storage
│  ├─ setUser(null) ← Clear user
│  ├─ setLoading(false)
│  └─ useEffect in ProtectedRoute triggers
│     └─ router.push("/login") ← Redirect to login
│
└─ else
   ├─ setUser(storedUser) ← Keep logged in
   └─ ProtectedRoute allows page access


SERVER-SIDE (Enforcement):

Client sends request:
├─ Header: Authorization: Bearer <token>

authMiddleware runs:
├─ Extract token from header
├─ Call: jwt.verify(token, JWT_SECRET)
│  ├─ Node.js jwt library checks expiration
│  ├─ Compares: current_time > token.exp?
│  │  ├─ YES → TokenExpiredError thrown
│  │  └─ NO → Token valid, decode successful
│
├─ catch (err)
│  ├─ if (err.name === "TokenExpiredError")
│  │  └─ Return 401 "Token has expired"
│  ├─ if (err.name === "JsonWebTokenError")
│  │  └─ Return 401 "Invalid token"
│
└─ Token valid → Attach to req.user, continue


NEW UTILITY FUNCTIONS (Added):

isTokenExpired(): boolean
├─ Decodes token from localStorage
├─ Gets exp timestamp
├─ Compares to current time
└─ Returns true if expired

getTokenTimeRemaining(): number
├─ Decodes token
├─ Calculates: exp - currentTime
└─ Returns seconds remaining (0 if expired)

decodeToken(token): object
├─ Safely decodes JWT payload
├─ Returns decoded object or null
└─ Useful for debugging
```

---

## 8. Complete Request-Response Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│         COMPLETE PROTECTED API CALL CYCLE                       │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: Admin wants to delete a user

CLIENT (Frontend)
├─ 1. Check if authenticated
│  ├─ const { isAuthenticated } = useAuth()
│  └─ if (!isAuthenticated) → Don't send request ❌
│
├─ 2. Check if token expired
│  ├─ const expired = isTokenExpired()
│  └─ if (expired) → Logout and redirect ❌
│
├─ 3. Get token from storage
│  ├─ const token = getAuthToken()
│  └─ if (!token) → Redirect to login ❌
│
├─ 4. Prepare request
│  ├─ Method: DELETE
│  ├─ URL: /auth/deleteUser/507f1f77bcf86cd799439011
│  ├─ Headers: {
│  │   Authorization: `Bearer ${token}`,
│  │   Content-Type: application/json
│  └─ }
│
├─ 5. Send request
│  └─ fetch(url, options)

                    ↓ Network ↓

SERVER (Backend)
├─ 6. Receive request
│  ├─ Method: DELETE
│  ├─ URL: /auth/deleteUser/:id
│  └─ Headers: { Authorization: Bearer ... }
│
├─ 7. authMiddleware runs
│  ├─ Get Authorization header
│  ├─ Extract token
│  ├─ Verify JWT signature
│  ├─ Check token not expired
│  ├─ Decode token → { id: "...", role: "admin" }
│  ├─ if (failed) → Send 401 response ❌
│  ├─ Attach to req.user
│  └─ Call next()
│
├─ 8. authorize('admin') middleware runs
│  ├─ Check req.user exists
│  ├─ Check req.user.role === "admin"
│  ├─ if (not admin) → Send 403 response ❌
│  └─ Call next()
│
├─ 9. deleteUserController runs
│  ├─ userId from req.params.id = 507f1f77bcf86cd799439011
│  ├─ Find and delete user from database
│  ├─ Check if user existed
│  ├─ if (!user) → Send 404 response
│  └─ Send 200 success response ✅
│
├─ 10. Return response
│  └─ {
│      "message": "User deleted successfully"
│    }

                    ↓ Network ↓

CLIENT (Frontend)
├─ 11. Receive response
│  ├─ Status: 200 OK ✅
│  └─ Body: { message: "User deleted successfully" }
│
├─ 12. Update UI
│  ├─ Remove user from list
│  ├─ Show success message
│  └─ Refresh admin dashboard


POSSIBLE ERROR RESPONSES:

❌ No token sent:
└─ 401 Authorization header missing

❌ Invalid token format:
└─ 401 Invalid authorization format

❌ Token signature invalid:
└─ 401 Invalid token

❌ Token expired:
└─ 401 Token has expired
└─ Client: clearAuthData() + redirect to /login

❌ User role is "user", not "admin":
└─ 403 Forbidden: insufficient permissions

❌ User to delete not found:
└─ 404 User not found

✅ Successful deletion:
└─ 200 User deleted successfully
```

---

## Summary of All Flows

| Flow | Purpose | Security Layers |
|------|---------|-----------------|
| Login | Authenticate user | Password hashing + JWT |
| Token Validation | Check token validity | Signature + expiration |
| Page Access | Authorize page view | Auth + role + expiration |
| API Request | Authorize API call | Auth + role + expiration |
| Image Upload | Store user profile image | Multer + filename |
| Image Retrieval | Return image path | Include in response |

All flows are now implemented and secured! ✅

