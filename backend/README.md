# Bhoomisetu Backend

## Features
- User registration and login (JWT authentication)
- Dispute submission and tracking
- MongoDB database

## Setup
1. Install dependencies:
   ```
npm install
   ```
2. Set up MongoDB (local or Atlas) and update `.env` if needed.
3. Start the server:
   ```
npm run dev
   ```

## API Endpoints
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `POST /api/disputes` — Create dispute (auth required)
- `GET /api/disputes` — List user disputes (auth required)

Add more endpoints as needed for your app.
