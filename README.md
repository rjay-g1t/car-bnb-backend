# CarBnB Backend

## Overview

Backend service for a car rental application inspired by Airbnb's model. This service provides APIs for searching, booking, and managing car rentals.

## Features

### User Features

- Location-based car search
- Filtering options (price, car quality, etc.)
- Booking management
- Payment processing
- Booking history (pending, active, upcoming)
- KYC verification
- Rating system for owners

### Owner Features

- Account management
- Car listing management
- Payment tracking
- Rating system for renters

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/carbnb-backend.git
cd carbnb-backend
```

2. Install dependencies

```bash
npm install
```

3. Environment Setup

- Create a `.env` file in the root directory with the following contents:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/carbnb
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start MongoDB (if running locally)

```bash
mongod
```

5. Start the server

```bash
npm run dev
```

The API will be running at `http://localhost:3000/api`

## Postman Setup

1. Import the Postman collection

   - Use the included `carbnb-postman-collection.json` file in the project root
   - Open Postman and import the collection by selecting File > Import > Upload Files

2. Set up environment variables in Postman

   - Create a new environment with the following variables:
     - `base_url`: `http://localhost:3000/api`
     - `token`: (Leave empty, will be populated after login)

3. Running API tests
   - First run the "Register" or "Login" request to get a valid token
   - The collection will automatically save the token for subsequent requests

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/refresh` - Refresh token

### KYC Verification

- `POST /api/kyc/submit` - Submit KYC documents
- `GET /api/kyc/status` - Check verification status

### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/bookings` - Get user bookings

### Car Management (Owners)

- `POST /api/cars` - Add new car
- `GET /api/cars` - Get owner's cars
- `GET /api/cars/:id` - Get specific car details
- `PUT /api/cars/:id` - Update car details
- `DELETE /api/cars/:id` - Remove car listing

### Car Search

- `GET /api/search` - Search cars by location
- `GET /api/search/filter` - Filter search results

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments

- `POST /api/payments/process/:bookingId` - Process payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Ratings

- `POST /api/ratings/owner` - Rate an owner
- `POST /api/ratings/renter` - Rate a renter
- `POST /api/ratings/car` - Rate a car
- `GET /api/ratings/owner/:id` - Get owner ratings
- `GET /api/ratings/renter/:id` - Get renter ratings

## Request Examples

### Register a new user

```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "passwordConfirm": "password123",
  "userType": "both"
}
```

### Login

```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create a car listing

```
POST /api/cars
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Black",
  "transmission": "automatic",
  "fuelType": "petrol",
  "seats": 5,
  "location": {
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "coordinates": [-122.419416, 37.774929]
  },
  "dailyRate": 50,
  "weeklyRate": 300,
  "monthlyRate": 1200,
  "features": ["GPS", "Bluetooth", "Backup Camera"],
  "description": "Well maintained Toyota Camry"
}
```

### Search for cars

```
GET /api/search?lat=37.774929&lng=-122.419416&distance=10
```

### Create a booking

```
POST /api/bookings
{
  "car": "60d21b4667d0d8992e610c85",
  "startDate": "2023-07-15",
  "endDate": "2023-07-20",
  "pickupAddress": "123 Main St, San Francisco, CA",
  "dropoffAddress": "123 Main St, San Francisco, CA"
}
```

## Data Models

### User

- Basic info (name, email, phone)
- KYC verification status
- User type (renter, owner, both)
- Payment methods
- Ratings

### Car

- Details (make, model, year, etc.)
- Location
- Availability
- Pricing
- Features
- Images
- Owner info
- Ratings

### Booking

- Car details
- Renter details
- Dates (start, end)
- Status
- Payment info

### Payment

- Booking reference
- Amount
- Status
- Transaction details

### Rating

- User (rater)
- Target (ratee)
- Score
- Comments
- Date

## Technology Stack

- Node.js/Express
- MongoDB/Mongoose
- JWT Authentication
- Payment Gateway Integration (Stripe)
- Cloud Storage for Images
- Geolocation Services
# car-bnb-backend
