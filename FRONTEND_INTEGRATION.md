# Frontend Integration Guide

This guide shows you exactly how to connect your existing Next.js frontend to the new backend API.

---

## 📝 Steps to Integrate

### 1. Create API Service (Recommended)

Create a new file: `Frontend/src/services/authService.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth';

/**
 * Register a new user
 */
export const registerUser = async (fullName, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error - Unable to connect to server',
    };
  }
};

/**
 * Login with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error - Unable to connect to server',
    };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error - Unable to connect to server',
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
    };
  }
};

/**
 * Initiate Google OAuth flow
 */
export const loginWithGoogle = () => {
  const googleAuthUrl = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/auth/google`
    : 'http://localhost:5000/api/auth/google';
  
  window.location.href = googleAuthUrl;
};
```

---

### 2. Update AuthContext

Replace `Frontend/src/contexts/AuthContext.jsx` with this updated version:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('skynav_token');
    const storedUser = localStorage.getItem('skynav_user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Optionally verify token is still valid
      authService.getCurrentUser(token).then(data => {
        if (!data.success) {
          // Token expired or invalid
          localStorage.removeItem('skynav_token');
          localStorage.removeItem('skynav_user');
          setUser(null);
        }
      });
    }
    
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    const data = await authService.registerUser(name, email, password);
    
    if (data.success) {
      localStorage.setItem('skynav_token', data.token);
      localStorage.setItem('skynav_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    }
    
    return { success: false, error: data.message };
  };

  const login = async (email, password) => {
    const data = await authService.loginUser(email, password);
    
    if (data.success) {
      localStorage.setItem('skynav_token', data.token);
      localStorage.setItem('skynav_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    }
    
    return { success: false, error: data.message };
  };

  const loginWithGoogle = () => {
    authService.loginWithGoogle();
  };

  const logout = async () => {
    const token = localStorage.getItem('skynav_token');
    if (token) {
      await authService.logoutUser(token);
    }
    
    localStorage.removeItem('skynav_token');
    localStorage.removeItem('skynav_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('skynav_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      loginWithGoogle,
      logout, 
      updateUser, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 3. Update Login Page

In `Frontend/src/pages/LoginPage.jsx`, update the Google login button:

```javascript
// Change the onClick handler for Google login button
<button
  type="button"
  onClick={() => {
    setIsGoogleLoading(true);
    loginWithGoogle(); // Use the context function
  }}
  disabled={isGoogleLoading}
  className="w-full flex items-center justify-center gap-2 border border-primary-200 rounded-2xl py-3 font-semibold text-sm text-primary-700 hover:bg-primary-50 transition disabled:cursor-not-allowed disabled:opacity-70"
>
  <FaGoogle className="text-lg text-red-500" />
  {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
</button>
```

Also import `loginWithGoogle` from context:
```javascript
const { login, loginWithGoogle, loading } = useAuth();
```

---

### 4. Update Signup Page

In `Frontend/src/pages/SignUpPage.jsx`, update similarly:

```javascript
// Import loginWithGoogle
const { register, loginWithGoogle } = useAuth();

// Update Google button onClick
<button
  type="button"
  onClick={() => {
    setIsGoogleLoading(true);
    loginWithGoogle();
  }}
  disabled={isGoogleLoading}
  className="w-full flex items-center justify-center gap-2 border border-primary-200 rounded-2xl py-3 font-semibold text-sm text-primary-700 hover:bg-primary-50 transition disabled:cursor-not-allowed disabled:opacity-70"
>
  <FaGoogle className="text-lg text-red-500" />
  {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
</button>
```

---

### 5. Create OAuth Callback Page

Create: `Frontend/src/pages/AuthCallbackPage.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (token) {
        try {
          // Fetch user data with the token
          const data = await getCurrentUser(token);

          if (data.success) {
            // Store token and user data
            localStorage.setItem('skynav_token', token);
            localStorage.setItem('skynav_user', JSON.stringify(data.user));
            
            setStatus('Success! Redirecting...');
            
            // Redirect to homepage
            setTimeout(() => {
              window.location.href = '/'; // Full page reload to update context
            }, 1000);
          } else {
            setStatus('Authentication failed');
            setTimeout(() => navigate('/login'), 2000);
          }
        } catch (error) {
          setStatus('Authentication failed');
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-primary-50 to-sky-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg text-primary-900 font-medium">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
```

---

### 6. Add Route in App.jsx

In `Frontend/src/App.jsx`, add the callback route:

```javascript
import AuthCallbackPage from './pages/AuthCallbackPage';

// Inside your Routes:
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

---

### 7. Create Environment Variable (Optional)

Create `Frontend/.env` (if not exists):

```env
VITE_API_URL=http://localhost:5000/api
```

This allows you to easily change the backend URL for production.

---

## ✅ Testing the Integration

### 1. Start Backend Server
```bash
cd Backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd Frontend
npm run dev
```

### 3. Test Registration
1. Go to `http://localhost:5173/signup`
2. Fill in the form
3. Click "Register"
4. Should redirect to homepage with user logged in

### 4. Test Login
1. Go to `http://localhost:5173/login`
2. Enter credentials
3. Click "Sign In"
4. Should redirect to homepage

### 5. Test Google OAuth
1. Click "Continue with Google" on login/signup page
2. Should redirect to Google consent screen
3. After approval, should redirect back to homepage with user logged in

---

## 🔍 Debugging Tips

### Check browser console for:
- Network errors (CORS issues)
- API response errors
- Token storage

### Check backend console for:
- Incoming requests
- MongoDB connection status
- Authentication errors

### Common Issues:

**CORS Error:**
- Ensure backend is running
- Check FRONTEND_URL in backend `.env` matches your frontend URL

**Google OAuth not working:**
- Verify Google credentials in backend `.env`
- Check redirect URI in Google Console

**Token not persisting:**
- Check localStorage in browser DevTools
- Verify token is being saved after login

---

## 🎉 You're Done!

Your frontend is now fully integrated with the backend. All authentication features should work seamlessly!
```

---

### 8. Environment Configuration

Update `Frontend/.env` (create if it doesn't exist):

```env
VITE_API_URL=http://localhost:5000/api
```

Update `Frontend/.env.production` for production:

```env
VITE_API_URL=https://your-production-api.com/api
```

---

## 🚀 Quick Start Checklist

- [ ] Create `authService.js`
- [ ] Update `AuthContext.jsx`
- [ ] Update `LoginPage.jsx`
- [ ] Update `SignUpPage.jsx`
- [ ] Create `AuthCallbackPage.jsx`
- [ ] Add route in `App.jsx`
- [ ] Create `.env` file (optional)
- [ ] Test registration
- [ ] Test login
- [ ] Test Google OAuth

---

**Happy Coding! 🎉**
