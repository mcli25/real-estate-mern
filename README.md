# Real Estate MERN Stack Project

This project is a full-stack web application for real estate listings and publishing, built using the MERN stack.

## Key Features

### User Authentication and Management

- Complete login/registration system with email confirmation
- Forgot and reset password functionality
- JWT-based authentication and authorization
- User profile management

### Property Listings and Management

- Detailed property listings with multiple image uploads
- Advanced search and filter functionality
- Interactive map integration using Mapbox
- Address auto-completion and Geolocation-based property search for improved user experience
- User-specific property management:
  - Create new property listings
  - Update existing property information
  - Delete own property listings

### AWS Integration

- User authentication integrated with AWS IAM for secure access control
- Email services (confirmation, password reset) using AWS SES
- Property image storage and retrieval using AWS S3

### User Interactions

- Property wishlist management for registered users
- Direct property inquiries via email (powered by AWS SES)

### Security and Middleware

- Custom middleware for enhanced security and functionality:
  - JSON Web Token (JWT) extraction and verification
  - User extraction based on JWT for authenticated routes
  - Error handling middleware for consistent error responses

## Tech Stack

- Frontend: React.js with Vite
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- Map Integration: Mapbox
- Styling: Bootstrap
- State Management: React Context API
- Cloud Services: AWS IAM, AWS SES, AWS S3
- Deployment: Render

## Deployment

This project is deployed on Render. The frontend is hosted at:
[https://real-estate-mern-pjya.onrender.com/](https://real-estate-mern-pjya.onrender.com/)
