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
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

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
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

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