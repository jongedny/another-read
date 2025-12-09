# Authentication System

This application now includes a comprehensive authentication and authorization system with three user tiers.

## User Tiers

1. **Admin** - Full access including user management
2. **Marketer** - Standard access (reserved for future features)
3. **User** - Standard access (reserved for future features)

## User Status

- **Active** - User can login and access the application
- **Pending** - User account created but awaiting admin approval
- **Closed** - User account has been deactivated

## Features

### For All Users

- **Registration** - Users can self-register at `/auth/register`
  - New accounts are created with "Pending" status
  - Users cannot login until an admin changes their status to "Active"
  
- **Login** - Users can login at `/auth/login`
  - Only users with "Active" status can login
  - JWT-based authentication with 7-day expiry
  
- **Password Reset** - Users can reset forgotten passwords
  - Request reset at `/auth/forgot-password`
  - Reset password at `/auth/reset-password?token=TOKEN`
  - Reset tokens expire after 1 hour

### For Admins Only

- **User Management** - Accessible at `/users`
  - View all users with their status and tier
  - Add new users with any status/tier
  - Edit existing users (name, email, tier, status, password)
  - Delete users (cannot delete yourself)
  - Activate pending user registrations

## Getting Started

### 1. Initial Setup

An admin user has already been created with these credentials:

```
Email: admin@anotherread.com
Password: admin123
```

**⚠️ IMPORTANT:** Change this password immediately after first login!

### 2. Creating Additional Admin Users

You can create additional admin users by:

1. Using the admin panel at `/users` (while logged in as admin)
2. Running the script: `npm run create-admin` (edit the script first to change credentials)

### 3. User Registration Flow

1. New users register at `/auth/register`
2. Account is created with "Pending" status
3. Admin logs in and goes to `/users`
4. Admin changes user status from "Pending" to "Active"
5. User can now login

## Security Features

- **Password Hashing** - All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens** - Secure, stateless authentication
- **HTTP-Only Cookies** - Tokens stored in secure, HTTP-only cookies
- **Route Protection** - Middleware protects all routes except auth pages
- **Role-Based Access** - Admin routes are restricted to Admin tier users
- **Status Checking** - Only Active users can access the application

## API Routes

### Authentication (`/api/trpc/auth`)

- `auth.register` - Register a new user (public)
- `auth.login` - Login with email/password (public)
- `auth.logout` - Logout current user (public)
- `auth.getCurrentUser` - Get current logged-in user (public)
- `auth.requestPasswordReset` - Request password reset token (public)
- `auth.resetPassword` - Reset password with token (public)

### Admin (`/api/trpc/admin`)

- `admin.getAllUsers` - Get all users (admin only)
- `admin.addUser` - Create a new user (admin only)
- `admin.updateUser` - Update user details (admin only)
- `admin.deleteUser` - Delete a user (admin only)

## Environment Variables

The following environment variable is required for authentication:

```bash
JWT_SECRET="your-jwt-secret-at-least-32-characters-long"
```

This has been automatically generated and added to your `.env` file.

## Future Enhancements

- Email notifications for password resets
- Email verification on registration
- Two-factor authentication
- Password strength requirements
- Account lockout after failed login attempts
- Audit logging for admin actions
- Differentiated features for Marketer and User tiers
