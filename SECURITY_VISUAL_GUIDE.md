# 🔐 Security Architecture - Visual Guide

## Complete Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         1. USER REGISTRATION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Register Form │
│ - Email      │
│ - Password   │
│ - Name       │
│ - Phone      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Client-Side Validation (UX)          │
│ - Email format check                 │
│ - Password strength check (8+, UC, LC, #)
│ - Name & phone format                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ POST /auth/register                  │
│ Content-Type: application/json       │
│ Body: {name, email, password, number}│
└──────┬───────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Server-Side Validation (REQUIRED)                  │
│ ✓ Express-validator rules                                   │
│ ✓ Email format & uniqueness check                           │
│ ✓ Password strength requirements                            │
│ ✓ Name & phone constraints                                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Password Hashing (Pre-save Hook)                   │
│ 1. Generate salt (10 rounds)                                │
│ 2. Hash: bcrypt.hash(password, salt)                        │
│ 3. Replace plaintext with hash                              │
│ 4. Save to MongoDB                                          │
│                                                              │
│ Database stores ONLY: hash (never plaintext!)               │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Response 201 Created                 │
│ {                                    │
│   "token": "eyJhbGc...",             │
│   "user": {                          │
│     "id": "507f...",                 │
│     "name": "John Doe",              │
│     "email": "john@example.com",     │
│     "role": "user"                   │
│   }                                  │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Client: Save to localStorage         │
│ localStorage.setItem(                │
│   "auth_token",                      │
│   "eyJhbGc..."                       │
│ )                                    │
│ localStorage.setItem(                │
│   "auth_user",                       │
│   JSON.stringify(user)               │
│ )                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ React Context Updated                │
│ setUser(userData)                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Redirect to Home / Dashboard         │
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         2. USER LOGIN FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Login Form   │
│ - Email      │
│ - Password   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Client-Side Validation (UX only)     │
│ - Email format                       │
│ - Password not empty                 │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ POST /auth/login                     │
│ Content-Type: application/json       │
│ Body: {email, password}              │
└──────┬───────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: Server-Side Validation                             │
│ ✓ Express-validator rules                                   │
│ ✓ Email format                                              │
│ ✓ Password not empty                                        │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Find user by email                   │
│ db.findOne({ email })                │
│                                      │
│ ❌ If not found: 401 Unauthorized    │
└──────┬───────────────────────────────┘
       │ ✓ Found
       ▼
┌──────────────────────────────────────┐
│ Compare passwords                    │
│ bcrypt.compare(                      │
│   inputPassword,                     │
│   dbPasswordHash                     │
│ )                                    │
│                                      │
│ ❌ If false: 401 Unauthorized        │
└──────┬───────────────────────────────┘
       │ ✓ Match
       ▼
┌──────────────────────────────────────┐
│ Generate JWT token                   │
│ jwt.sign(                            │
│   { id, role },                      │
│   JWT_SECRET,                        │
│   { expiresIn: "7d" }                │
│ )                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Response 200 OK                      │
│ {                                    │
│   "token": "eyJhbGc...",             │
│   "user": {...}                      │
│ }                                    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Client: Save & Redirect              │
│ Same as registration                 │
└──────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                    3. PROTECTED API REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Component calls API                  │
│ api.categories.create(data)          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Axios Request Interceptor                                   │
│ const token = getAuthToken()                                │
│ if (token) {                                                │
│   config.headers.Authorization = `Bearer ${token}`          │
│ }                                                            │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ HTTP Request                                                │
│ POST /categories                                            │
│ Authorization: Bearer eyJhbGc...                            │
│ Content-Type: multipart/form-data                           │
│ Body: {nameEn, nameAr, type, ...}                           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: authMiddleware                                      │
│ 1. Extract Authorization header                             │
│ 2. Verify Bearer format                                     │
│ 3. Extract token                                            │
│ 4. Verify JWT signature with JWT_SECRET                     │
│ 5. Check token expiration                                   │
│ 6. Attach req.user = { id, role }                           │
│                                                              │
│ ❌ If invalid: 401 Unauthorized                             │
│ ❌ If expired: 401 Token has expired                        │
│ ❌ If missing: 401 Authorization header missing             │
└──────┬──────────────────────────────────────────────────────┘
       │ ✓ Valid token
       ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: authorize("admin")                                 │
│ if (!["admin"].includes(req.user.role)) {                   │
│   return 403 Forbidden                                      │
│ }                                                            │
│                                                              │
│ ❌ If user role: 403 Insufficient permissions               │
└──────┬──────────────────────────────────────────────────────┘
       │ ✓ User is admin
       ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: Input Validation                                   │
│ Validators check all fields                                 │
│                                                              │
│ ❌ If invalid: 400 Bad Request (with field errors)          │
└──────┬──────────────────────────────────────────────────────┘
       │ ✓ All validated
       ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: Business Logic                                     │
│ 1. Process form data                                        │
│ 2. Save to MongoDB                                          │
│ 3. Return 201 Created                                       │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Client: Response Interceptor                                │
│ ✓ 201 Created: Process and render                           │
│ ❌ 401 Unauthorized:                                         │
│    - clearAuthData()                                        │
│    - Redirect to /login                                     │
│ ❌ 403 Forbidden:                                            │
│    - Redirect to /                                          │
│ ❌ 400 Bad Request:                                          │
│    - Display validation errors                              │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Component receives data                                      │
│ Updates UI with response                                    │
└──────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         4. PROTECTED ROUTE FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

User navigates to /admin
                    │
                    ▼
┌──────────────────────────────────────────┐
│ <ProtectedRoute requiredRole="admin">    │
│   <AdminDashboard />                     │
│ </ProtectedRoute>                        │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ useAuth() checks:                        │
│ 1. Is user loading?                      │
│    → Show loading spinner                │
│ 2. Is user authenticated?                │
│    → Yes: Continue to step 3             │
│    → No: Redirect to /login              │
└──────┬───────────────────────────────────┘
       │ ✓ Authenticated
       ▼
┌──────────────────────────────────────────┐
│ 3. Does user have required role?         │
│    user.role === "admin"?                │
│    → Yes: Render <AdminDashboard />      │
│    → No: Redirect to /                   │
└──────┬───────────────────────────────────┘
       │ ✓ Has required role
       ▼
┌──────────────────────────────────────────┐
│ Render Protected Component               │
│ <AdminDashboard />                       │
└──────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          5. LOGOUT FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ User clicks Logout   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ logout() from useAuth()                  │
│ clearAuthData()                          │
│ ├─ localStorage.removeItem("auth_token") │
│ └─ localStorage.removeItem("auth_user")  │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ setUser(null)                            │
│ Update React Context                     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ router.push("/")                         │
│ Redirect to home                         │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ User is logged out                       │
│ All tokens cleared                       │
│ Can't access protected routes            │
└──────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                      USER BROWSER                          │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 1: React Components                            │  │
│ │ - Login/Register forms                               │  │
│ │ - Client-side validation (UX)                        │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 2: Auth Context (useAuth)                      │  │
│ │ - Global state management                            │  │
│ │ - User data & token                                  │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 3: Protected Routes (ProtectedRoute)           │  │
│ │ - Auth status check                                  │  │
│ │ - Role-based access check                            │  │
│ │ - Redirect on unauthorized                           │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 4: Secure API Client (axios)                  │  │
│ │ - Request: Add Bearer token                          │  │
│ │ - Response: Handle 401/403                           │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 5: localStorage                                │  │
│ │ - Persist token & user data                          │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
              │ HTTP/HTTPS + Bearer Token
              ▼
┌────────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                        │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 1: Helmet + CORS                               │  │
│ │ - Security headers                                   │  │
│ │ - Origin whitelisting                                │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 2: authMiddleware                              │  │
│ │ - Verify Bearer token format                         │  │
│ │ - Validate JWT signature                             │  │
│ │ - Check expiration                                   │  │
│ │ - Attach req.user                                    │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 3: authorize("admin")                          │  │
│ │ - Check user.role                                    │  │
│ │ - Return 403 if unauthorized                         │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 4: Input Validators (express-validator)       │  │
│ │ - Email format                                       │  │
│ │ - Password strength                                  │  │
│ │ - Type checking                                      │  │
│ │ - Length constraints                                 │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 5: Business Logic                              │  │
│ │ - Database operations                                │  │
│ │ - bcrypt password comparison                         │  │
│ │ - JWT generation                                     │  │
│ └──────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Layer 6: Error Handler                               │  │
│ │ - Catch all errors                                   │  │
│ │ - Format responses                                   │  │
│ │ - No stack leaks in prod                             │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
              │ JSON Response
              ▼
┌────────────────────────────────────────────────────────────┐
│              RESPONSE INTERCEPTOR                          │
│ - Handle 201: Update UI                                  │
│ - Handle 400: Show validation errors                     │
│ - Handle 401: Logout & redirect                          │
│ - Handle 403: Redirect to home                           │
│ - Handle 500: Show error message                         │
└────────────────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────────────────┐
│              COMPONENT UPDATE                              │
│ - Render response data                                    │
│ - Show success message                                    │
│ - Update app state                                        │
└────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATABASE SECURITY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

User Registration → Password Hash → Database
                        │
                        ▼
                  Bcrypt Algorithm
                  ├─ Salt: 10 rounds
                  ├─ Hash: BCRYPT(password, salt)
                  └─ Store hash (never plaintext)

User Login → Input Password → Bcrypt Comparison
                                   │
                                   ▼
                     bcrypt.compare(input, dbHash)
                     ├─ If match: ✓ Login allowed
                     └─ If no match: ✗ 401 Unauthorized

Database Users Collection:
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "$2a$10$abcdef...", ← BCRYPT HASH (NOT PLAINTEXT)
  "role": "user",
  "name": "User Name",
  "number": "+1234567890"
}
```

---

## Key Security Principles Illustrated

1. **Defense in Depth**: Multiple layers of security
2. **Never Trust Frontend**: Backend validates everything
3. **Passwords Never Stored**: Only bcrypt hashes
4. **Tokens in Headers**: Not in URLs or body
5. **Clear Error Messages**: But no sensitive data
6. **Role Enforcement**: Server-side only
7. **Automatic Cleanup**: Logout clears all data
8. **Loading States**: Show auth status transitions

---

## Decision Tree: Is This Request Allowed?

```
Request → Has Authorization Header?
          ├─ No  → 401 Unauthorized
          └─ Yes → Is token format "Bearer ..."?
                   ├─ No  → 401 Invalid format
                   └─ Yes → Is JWT signature valid?
                           ├─ No  → 401 Invalid token
                           └─ Yes → Is token expired?
                                   ├─ Yes → 401 Expired
                                   └─ No  → Extract user id & role
                                           ↓
                                           Does route require role?
                                           ├─ No  → Proceed
                                           └─ Yes → Is user.role in allowed?
                                                   ├─ No  → 403 Forbidden
                                                   └─ Yes → Validate input
                                                           ├─ Invalid → 400 Bad Request
                                                           └─ Valid   → Execute handler
```

This comprehensive visual guide shows how every part of the security architecture works together!
