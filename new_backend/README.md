# BhoomiSetu Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file** (optional - defaults will be used if not created)
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/bhoomisetu
   JWT_SECRET=your_secret_key_here
   ```

3. **Start MongoDB** (if running locally)
   - Make sure MongoDB is running on `localhost:27017`
   - Or use MongoDB Atlas and update `MONGO_URI` in `.env`

4. **Run the Server**
   ```bash
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```

5. **Verify Server is Running**
   - Open browser: http://localhost:3000
   - Should see: "New Bhoomisetu backend is running"
   - Health check: http://localhost:3000/api/health

## Common Issues

### Cannot Login
1. **Check if backend is running**: Open http://localhost:3000/api/health
2. **Check MongoDB connection**: Look for "MongoDB connected successfully" in console
3. **Check if user exists**: Make sure you've registered first via `/api/auth/signup`
4. **Check browser console**: Look for CORS or network errors

### MongoDB Connection Failed
- Ensure MongoDB is installed and running
- Check `MONGO_URI` in `.env` file
- Default: `mongodb://localhost:27017/bhoomisetu`
- Server will still start, but database operations will fail

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

## API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/disputes` - Get user disputes (requires auth)
- `POST /api/disputes` - Create dispute (requires auth)
- `GET /api/admin/disputes` - Get all disputes (admin only)
- `PATCH /api/admin/disputes/:id` - Update dispute status (admin only)

## Testing Login

1. First, register a user:
   ```bash
   POST http://localhost:3000/api/auth/signup
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. Then login:
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
