# 🔐 Security Implementation - Code Examples & Recipes

## Common Operations with Security Examples

---

## 🚀 Backend Examples

### 1. Creating a Protected Admin Route

```javascript
// server/routes/myRoute.js
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorizeMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/**
 * DELETE /dangerous/:id
 * Admin-only route with protection
 */
router.delete(
  "/:id",
  authMiddleware,           // Step 1: Verify JWT token
  authorize("admin"),       // Step 2: Check user is admin
  async (req, res, next) => {
    try {
      // At this point:
      // - User is authenticated (token verified)
      // - User is admin (role checked)
      // - req.user = { id, role }
      
      const result = await MyModel.findByIdAndDelete(req.params.id);
      
      if (!result) {
        return res.status(404).json({ error: "Not found" });
      }
      
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      next(err); // Caught by error handler
    }
  }
);

module.exports = router;
```

### 2. Input Validation with Error Messages

```javascript
// server/middlewares/validators.js
const { body, validationResult } = require("express-validator");

// Define validators
const validateCreatePost = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be 3-200 characters"),
  
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ max: 5000 })
    .withMessage("Content must be less than 5000 characters"),
  
  body("category")
    .isIn(["tech", "travel", "food"])
    .withMessage("Invalid category")
];

// Error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formatted = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    return res.status(400).json({
      error: "Validation failed",
      details: formatted
    });
  }
  
  next();
};

// Usage in route
router.post(
  "/",
  validateCreatePost,
  handleValidationErrors,
  async (req, res, next) => {
    // All inputs are validated here
    const { title, content, category } = req.body;
    // ... create post
  }
);

module.exports = { validateCreatePost, handleValidationErrors };
```

### 3. Comparing Passwords Securely

```javascript
// server/models/Admin.js - In schema
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare returns true if passwords match
  return await bcrypt.compare(candidatePassword, this.password);
};

// server/routes/authRoutes.js - Usage in login
router.post("/login", validateLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Get user WITH password field (normally excluded)
    const user = await Admin.findOne({ email }).select("+password");
    
    if (!user) {
      // Don't reveal if email exists
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Use the model method to compare
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Password is correct - generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});
```

### 4. JWT Token Generation and Verification

```javascript
// server/routes/authRoutes.js - Generation
const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// server/middlewares/authMiddleware.js - Verification
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }
    
    const [scheme, token] = authHeader.split(" ");
    
    if (scheme !== "Bearer") {
      return res.status(401).json({ error: "Invalid authorization format" });
    }
    
    // Verify and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach to request
    req.user = { id: decoded.id, role: decoded.role };
    
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
```

### 5. Error Handler with Proper Status Codes

```javascript
// server/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log (server-side only)
  console.error("Error:", err.message);
  
  let status = 500;
  let message = "Internal server error";
  
  // Handle specific errors
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation error";
  }
  
  if (err.code === 11000) { // MongoDB duplicate key
    status = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }
  
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token has expired";
  }
  
  // Never send stack traces to client in production
  const response = { error: message };
  
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }
  
  res.status(status).json(response);
};

module.exports = errorHandler;
```

---

## 🎨 Frontend Examples

### 1. Login Component with Security

```typescript
// client/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/");
    return null;
  }
  
  // Client-side validation (UX enhancement)
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      // Backend validates everything
      await login(email, password);
      
      // Success - context redirects
      router.push("/");
    } catch (error: any) {
      // Backend returns error message
      setErrors({
        submit: error?.response?.data?.error || "Login failed"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        placeholder="Email"
      />
      {errors.email && <p className="error">{errors.email}</p>}
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        placeholder="Password"
      />
      {errors.password && <p className="error">{errors.password}</p>}
      
      {errors.submit && (
        <div className="alert-error">{errors.submit}</div>
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### 2. Using Auth Context

```typescript
// Any component
"use client";

import { useAuth } from "@/context/AuthContext";

export function UserProfile() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      
      {isAdmin() && (
        <div>
          <h2>Admin Section</h2>
          {/* Admin-only content */}
        </div>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Protected API Call with Error Handling

```typescript
// Any component
"use client";

import { api } from "@/lib/api";
import { useState } from "react";

export function CreateCategory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    
    try {
      // API automatically includes Authorization header
      const response = await api.categories.create(formData);
      
      console.log("Created:", response.data);
      // Update UI
      
    } catch (err: any) {
      // Error interceptor handles 401/403
      // Client gets meaningful error message
      setError(err.response?.data?.error || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit(formData);
    }}>
      {error && <div className="alert-error">{error}</div>}
      
      <input type="text" name="nameEn" placeholder="English name" required />
      <input type="text" name="nameAr" placeholder="Arabic name" required />
      <select name="type" required>
        <option value="">Select type</option>
        <option value="Incoming">Incoming</option>
        <option value="Outgoing">Outgoing</option>
      </select>
      <input type="file" name="image" />
      
      <button disabled={loading}>
        {loading ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}
```

### 4. Protected Route Wrapper

```typescript
// Usage in page.tsx
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}

// Or use the hook
"use client";

import { useCanAccess } from "@/components/ProtectedRoute";

export function MyComponent() {
  const canAccess = useCanAccess("admin");
  
  if (!canAccess) {
    return <div>Not authorized</div>;
  }
  
  return <div>Admin content</div>;
}
```

### 5. Navbar with Auth Integration

```typescript
// Usage in Navbar
"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  
  return (
    <nav>
      <div>Pearl Travel</div>
      
      {isAuthenticated ? (
        <div className="auth-section">
          <span>{user?.name}</span>
          
          {isAdmin() && (
            <Link href="/admin">Dashboard</Link>
          )}
          
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
```

---

## 🧪 Testing Examples

### Test Admin Route

```bash
# Get a token first
TOKEN=$(curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123"}' \
  | jq -r '.token')

# Use token to access admin route
curl -X POST http://localhost:5000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nameEn":"Tours","nameAr":"جولات","type":"Outgoing","country":"Egypt"}'
```

### Test Without Token

```bash
# Should fail with 401
curl -X POST http://localhost:5000/categories \
  -H "Content-Type: application/json" \
  -d '{"nameEn":"Tours","nameAr":"جولات"}'

# Response: 401 Unauthorized
```

### Test with User Token (Not Admin)

```bash
# Get user token
TOKEN=$(curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}' \
  | jq -r '.token')

# Try to create category
curl -X POST http://localhost:5000/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nameEn":"Tours","nameAr":"جولات","type":"Outgoing","country":"Egypt"}'

# Response: 403 Forbidden (Insufficient permissions)
```

---

## 🐛 Debugging Tips

### Check Token in Browser

```javascript
// In browser console
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')
JSON.parse(localStorage.getItem('auth_user'))
```

### Decode JWT

```javascript
// In browser console
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);
// Output: { id: "...", role: "admin", iat: ..., exp: ... }
```

### Check API Headers

```javascript
// In network tab, click request
// See: Authorization: Bearer eyJhbGc...
```

### Check Expiration

```javascript
// In browser console
const token = localStorage.getItem('auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
const exp = new Date(payload.exp * 1000);
console.log("Token expires:", exp);
```

---

## 📊 Performance Considerations

### Cache User Data

```typescript
// After login
const user = JSON.parse(localStorage.getItem('auth_user'));
// This persists across page reloads
// AuthContext restores it on mount

// No need to fetch /auth/me on every page
```

### Avoid Multiple Token Checks

```typescript
// ❌ WRONG: Check token multiple times
const token1 = getAuthToken();
const token2 = getAuthToken();
const token3 = getAuthToken();

// ✅ RIGHT: Use context
const { isAuthenticated } = useAuth();
// Checked once, cached in React context
```

### Reuse API Instance

```typescript
// ❌ WRONG: Create new axios instance
const api1 = axios.create();
const api2 = axios.create();

// ✅ RIGHT: Reuse singleton
import { api } from "@/lib/api";
// Interceptors set up once
```

---

## 🔄 Common Workflows

### Complete Login → Create Data → Logout Flow

```typescript
// 1. Login
const { login } = useAuth();
await login("admin@example.com", "SecurePass123");

// 2. Make protected API call
const { data } = await api.categories.create(formData);

// 3. Logout
logout();

// Now all tokens cleared, can't access protected routes
```

### Update User Profile

```typescript
// After login, user data in context
const { user } = useAuth();

// Update locally
const updatedUser = { ...user, name: "New Name" };

// Save to backend (protected route)
await api.auth.updateProfile(updatedUser);

// Would need backend implementation to sync context
```

---

These examples cover the most common security scenarios in the application!
