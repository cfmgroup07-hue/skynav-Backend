# Skynav Backend API

Complete backend implementation for Skynav Flight Booking Application with Node.js, Express, MongoDB, JWT authentication, and Google OAuth.

---

## 🚀 Features

- ✅ User Registration (Email + Password)
- ✅ User Login (Email + Password)
- ✅ Google OAuth Authentication (Auto-registration)
- ✅ JWT-based Authentication
- ✅ Secure Password Hashing (bcrypt)
- ✅ Protected Routes Middleware
- ✅ MongoDB Database with Mongoose
- ✅ Input Validation
- ✅ CORS Configuration
- ✅ Error Handling

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **Google Cloud Console Account** - [Console](https://console.cloud.google.com/)

---

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/skynav?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FRONTEND_URL=http://localhost:5173

SESSION_SECRET=your_session_secret
```

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free tier is sufficient)

### Step 2: Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a username and password (save these!)
4. Set permissions to **Read and write to any database**

### Step 3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production, restrict to specific IPs

### Step 4: Get Connection String

1. Go to **Database** → Click **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<database>` with `skynav`
6. Paste into `.env` as `MONGO_URI`

---

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: "Skynav Auth"
4. Click **Create**

### Step 2: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and enable

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: **External**
   - App name: **Skynav**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Skip scopes (click **Save and Continue**)
   - Add test users if needed
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Skynav Backend**
   - Authorized JavaScript origins:
     - `http://localhost:5000`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
   - Click **Create**

5. Copy **Client ID** and **Client Secret**
6. Paste into `.env` file

### Step 4: Configure Scopes

The application requests:
- `profile` - User's basic profile information
- `email` - User's email address

---

## 🏃 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Base URL: `http://localhost:5000`

### Health Check

**GET** `/health`

Response:
```json
{
  "success": true,
  "message": "Skynav Backend API is running",
  "timestamp": "2026-01-13T05:09:35.000Z"
}
```

---

### Authentication Endpoints

#### 1. Register User

**POST** `/api/auth/register`

Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Success Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "65abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "authProvider": "local",
    "profilePicture": null,
    "createdAt": "2026-01-13T05:09:35.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. Login User

**POST** `/api/auth/login`

Request Body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Success Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "65abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "authProvider": "local",
    "profilePicture": null,
    "createdAt": "2026-01-13T05:09:35.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 3. Google OAuth Login

**GET** `/api/auth/google`

Redirects to Google login page. After successful authentication, Google redirects to:

**GET** `/api/auth/google/callback`

This callback then redirects to frontend:
```
http://localhost:5173/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### 4. Get Current User (Protected)

**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Success Response (200):
```json
{
  "success": true,
  "user": {
    "_id": "65abc123...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "authProvider": "local",
    "profilePicture": null,
    "createdAt": "2026-01-13T05:09:35.000Z"
  }
}
```

---

#### 5. Logout User (Protected)

**POST** `/api/auth/logout`

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Success Response (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔗 Frontend Integration

### Update AuthContext.jsx

Replace the mock authentication in `Frontend/src/contexts/AuthContext.jsx` with API calls:

```javascript
const API_URL = 'http://localhost:5000/api/auth';

// Register function
const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name, email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('skynav_token', data.token);
      localStorage.setItem('skynav_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};

// Login function
const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('skynav_token', data.token);
      localStorage.setItem('skynav_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    }

    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};
```

### Google Login Button

Update the Google login button onClick handler:

```javascript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};
```

### Handle Google OAuth Callback

Create a callback page at `Frontend/src/pages/AuthCallbackPage.jsx`:

```javascript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Fetch user data with token
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('skynav_token', token);
            localStorage.setItem('skynav_user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/');
          }
        });
    } else {
      navigate('/login?error=auth_failed');
    }
  }, [searchParams, navigate, setUser]);

  return <div>Authenticating...</div>;
}

export default AuthCallbackPage;
```

Add route in `App.jsx`:
```javascript
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

---

## 🧪 Testing the API

### Using cURL

#### Test Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"TestPass123\"}"
```

#### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123\"}"
```

#### Test Protected Route:
```bash
# Replace TOKEN with actual token from login response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the collection (create requests for each endpoint)
2. Set environment variable `{{base_url}}` = `http://localhost:5000`
3. Test each endpoint following the API documentation above

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong JWT_SECRET** - Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **Enable HTTPS in production** - Use SSL certificates
4. **Restrict CORS origins** - Only allow your frontend domain
5. **Rate limiting** - Add rate limiting middleware for production
6. **Input sanitization** - Already included via express-validator
7. **MongoDB injection prevention** - Mongoose provides protection

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── passport.js        # Google OAuth configuration
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── authRoutes.js      # Auth endpoints
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── utils/
│   │   └── generateToken.js   # JWT generator
│   └── app.js                 # Express app config
├── server.js                  # Entry point
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `MongoDB connection failed`

**Solution:**
- Check `MONGO_URI` in `.env`
- Verify database user credentials
- Ensure IP address is whitelisted in MongoDB Atlas
- Check internet connection

### Google OAuth Not Working

**Error:** Redirect URI mismatch

**Solution:**
- Verify redirect URI in Google Console matches: `http://localhost:5000/api/auth/google/callback`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Ensure frontend URL matches `FRONTEND_URL` in `.env`

### JWT Token Invalid

**Error:** `Invalid token` or `Token expired`

**Solution:**
- Check if `JWT_SECRET` is consistent
- Verify token is being sent in `Authorization: Bearer <token>` format
- Token may have expired (default: 30 days)

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check if credentials are enabled in frontend fetch requests

---

## 📝 Additional Notes

- **Session vs JWT**: This implementation uses JWT tokens. Sessions are only used for Google OAuth flow.
- **Password Reset**: Not implemented yet. Can be added as future enhancement.
- **Email Verification**: Not implemented yet. Consider adding for production.
- **Refresh Tokens**: Current implementation uses long-lived tokens. Consider adding refresh token rotation for production.

---

## 📧 Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

## 📄 License

MIT License - Feel free to use this code for your projects.

---

**Happy Coding! 🚀**
