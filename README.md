# Auth Management API

A production-ready authentication service built with NestJS, PostgreSQL, and Prisma ORM.

## Features

- **User Registration**: Create new accounts with email validation
- **User Login**: Authenticate with email and password
- **JWT Authentication**: Secure token-based authentication
- **Token Validation**: Check if JWT tokens are valid
- **User Profile Management**: Update user information (fullname, phone, position, photo)

## Tech Stack

- **NestJS**: Backend framework
- **PostgreSQL**: Database
- **Prisma ORM**: Database ORM
- **JWT**: Authentication tokens
- **Argon2**: Password hashing
- **class-validator**: DTO validation
- **Passport JWT**: JWT strategy

## API Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- **Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullname": "John Doe",
  "phone_number": "1234567890",
  "position": "Developer",
  "photo_url": "https://example.com/photo.jpg"
}
```
- **Response**:
```json
{
  "id": "clxxxxxx",
  "email": "user@example.com",
  "fullname": "John Doe",
  "phone_number": "1234567890",
  "position": "Developer",
  "photo_url": "https://example.com/photo.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Login
- **POST** `/auth/login`
- **Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxxxxx",
    "email": "user@example.com",
    "fullname": "John Doe",
    "phone_number": "1234567890",
    "position": "Developer",
    "photo_url": "https://example.com/photo.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Note**: Only non-deleted users can log in. Soft-deleted users (those with a `deleted_at` timestamp) cannot authenticate.

#### Check Token
- **GET** `/auth/check-token`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "valid": true,
  "user": {
    "id": "clxxxxxx",
    "email": "user@example.com",
    "fullname": "John Doe",
    "phone_number": "1234567890",
    "position": "Developer",
    "photo_url": "https://example.com/photo.jpg",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### Users

#### List Employees (Users)
- **GET** `/users`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10): Items per page (max: 100)
  - `search` (optional): Search by fullname or email (case-insensitive)
- **Response**:
```json
{
  "data": [
    {
      "id": "clxxxxxx",
      "email": "john.doe@example.com",
      "fullname": "John Doe",
      "phone_number": "1234567890",
      "position": "Software Engineer",
      "photo_url": "https://example.com/photo.jpg",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "last_page": 2
  }
}
```

**Note**: Only non-deleted users are returned in the list. Soft-deleted users (those with a `deleted_at` timestamp) are excluded from results.

#### Get Employee by ID
- **GET** `/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "id": "clxxxxxx",
  "email": "john.doe@example.com",
  "fullname": "John Doe",
  "phone_number": "1234567890",
  "position": "Software Engineer",
  "photo_url": "https://example.com/photo.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Update User
- **PUT** `/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Request**:
```json
{
  "fullname": "Jane Doe",
  "phone_number": "0987654321",
  "position": "Senior Developer",
  "photo_url": "https://example.com/new-photo.jpg"
}
```
- **Response**:
```json
{
  "id": "clxxxxxx",
  "email": "user@example.com",
  "fullname": "Jane Doe",
  "phone_number": "0987654321",
  "position": "Senior Developer",
  "photo_url": "https://example.com/new-photo.jpg",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

#### Delete User (Soft Delete)
- **DELETE** `/users/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Authorization**: Only users with position "HRD" can delete other users' accounts. All users can delete their own account.
- **Response**:
```json
{
  "message": "User deleted successfully"
}
```

**Important**: 
- **HRD users**: Can delete any user's account
- **Regular users**: Can only delete their own account
- This is a soft delete - the user record is not removed from the database
- Soft-deleted users cannot log in or appear in user lists
- The `deleted_at` field is set to the current timestamp to mark the deletion

## Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Configure environment variables**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/auth_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

4. **Generate Prisma client**:
```bash
npx prisma generate
```

5. **Run database migrations**:
```bash
npx prisma migrate dev
```

6. **Start the application**:
```bash
npm run start:dev
```

## Database Schema

```sql
CREATE TABLE users (
  id           VARCHAR PRIMARY KEY,
  email        VARCHAR UNIQUE NOT NULL,
  password     VARCHAR NOT NULL,
  fullname     VARCHAR NOT NULL,
  phone_number VARCHAR,
  position     VARCHAR,
  photo_url    VARCHAR,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  deleted_at   TIMESTAMP
);
```

**Note**: The `deleted_at` field is used for soft deletes. When a user is deleted, this field is set to the current timestamp instead of removing the record from the database.

## Security Features

- Passwords are hashed using Argon2
- JWT tokens with configurable expiration
- Email uniqueness validation
- Input validation with class-validator
- Global validation pipe for all requests
- Protected routes with JWT authentication

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid credentials or expired token
- **403 Forbidden**: Attempting to update another user's data
- **404 Not Found**: User not found
- **409 Conflict**: Email already exists

## Production Notes

- Use strong, unique JWT secrets
- Configure proper CORS settings
- Set up proper logging and monitoring
- Use HTTPS in production
- Implement rate limiting for authentication endpoints
- Regularly update dependencies