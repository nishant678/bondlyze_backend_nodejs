# Bondlyze Backend API Usage

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=Welcome@1998
   DB_NAME=bondlyze_db
   DB_PORT=3306
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=30d
   PORT=5000
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run server
   ```

The server will automatically create the database tables on startup.

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Content-Type**: `multipart/form-data`

**Body Parameters**:
- `name` (string, required): User's full name
- `email` (string, required): User's email address (must be unique)
- `mobile_number` (string, required): User's mobile number (10-15 digits, must be unique)
- `password` (string, required): Password (minimum 6 characters)
- `dob` (date, required): Date of birth (format: YYYY-MM-DD)
- `gender` (string, required): Gender (male, female, or other)
- `goals` (string, optional): User goals
- `interest` (string, optional): User interests
- `user_profile` (file, optional): Profile images (multiple files allowed, max 10 images, 5MB per image)

**Example Request** (using curl):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "mobile_number=1234567890" \
  -F "password=password123" \
  -F "dob=1990-01-01" \
  -F "gender=male" \
  -F "goals=Fitness" \
  -F "interest=Sports" \
  -F "user_profile=@/path/to/image1.jpg" \
  -F "user_profile=@/path/to/image2.jpg"
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile_number": "1234567890",
      "dob": "1990-01-01",
      "gender": "male",
      "goals": "Fitness",
      "interest": "Sports",
      "profiles": [
        {
          "id": 1,
          "user_id": 1,
          "image_url": "/uploads/profile-images/profile-1234567890-987654321.jpg",
          "image_order": 0
        }
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

**Content-Type**: `application/json`

**Body Parameters** (use either email OR mobile_number):
- `email` (string, optional): User's email address
- `mobile_number` (string, optional): User's mobile number
- `password` (string, required): User's password

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile_number": "1234567890",
      "dob": "1990-01-01",
      "gender": "male",
      "goals": "Fitness",
      "interest": "Sports",
      "profiles": [...]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User Profile
**GET** `/api/auth/me`

**Headers**:
- `Authorization: Bearer <token>`

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile_number": "1234567890",
      "dob": "1990-01-01",
      "gender": "male",
      "goals": "Fitness",
      "interest": "Sports",
      "profiles": [...]
    }
  }
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"]
}
```

**Common Status Codes**:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials or token)
- `404`: Not Found
- `500`: Internal Server Error

## Database Tables

The application automatically creates two tables:

1. **users**: Stores user information
2. **user_profiles**: Stores multiple profile images per user

Tables are created automatically when the server starts if they don't exist.

## Project Structure

```
bondlyze_backend/
├── config/
│   └── database.js           # Database configuration
├── controller/
│   └── authController.js     # Authentication logic
├── database/
│   ├── connection.js         # Database connection pool
│   └── migrations/
│       └── createTables.js    # Table creation migrations
├── middlewares/
│   ├── authMiddleware.js     # JWT authentication middleware
│   ├── errorHandler.js       # Error handling middleware
│   └── uploadMiddleware.js  # File upload middleware
├── model/
│   ├── User.js              # User model
│   └── UserProfile.js       # User profile model
├── routes/
│   └── authRoutes.js        # Authentication routes
├── utils/
│   └── validation.js        # Input validation utilities
├── uploads/
│   └── profile-images/      # Uploaded profile images (auto-created)
└── index.js                 # Main server file
```

