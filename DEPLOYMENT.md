# BhoomiSetu Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Push your code to GitHub**

2. **Deploy Backend on Render:**
   - Go to [render.com](https://render.com)
   - Create a new **Web Service**
   - Connect your GitHub repo
   - Settings:
     - **Root Directory:** `new_backend`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Add Environment Variables:
     ```
     NODE_ENV=production
     MONGO_URI=your-mongodb-atlas-uri
     JWT_SECRET=your-strong-secret-key
     GEMINI_API_KEY=your-gemini-api-key
     CORS_ORIGIN=https://your-frontend-url.onrender.com
     ```

3. **Deploy Frontend on Render:**
   - Create a new **Static Site**
   - Connect your GitHub repo
   - Settings:
     - **Root Directory:** `frontend`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `dist`
   - Add Environment Variables:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

---

### Option 2: Railway (Easy One-Click Deploy)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect the project
5. Add environment variables in the dashboard

---

### Option 3: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```
- Set `VITE_API_URL` in Vercel dashboard

**Backend on Render:**
- Follow Render backend steps above

---

### Option 4: Single Server Deployment (VPS/EC2)

```bash
# Clone repository
git clone your-repo-url
cd BhoomiSetu

# Install dependencies
npm run install:all

# Create production .env in new_backend/
cp new_backend/.env.example new_backend/.env
# Edit the .env file with production values

# Create frontend .env
cp frontend/.env.example frontend/.env
# Set VITE_API_URL to your domain

# Build frontend
npm run build

# Start with PM2 (recommended)
npm install -g pm2
cd new_backend
NODE_ENV=production pm2 start index.js --name bhoomisetu

# Or use the start script
npm start
```

---

## 📋 Environment Variables

### Backend (`new_backend/.env`)
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bhoomisetu
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend-domain.com
VITE_ENV=production
```

---

## 🗃️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist IP `0.0.0.0/0` for cloud deployment
5. Get connection string and add to `MONGO_URI`

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS on your domain
- [ ] Set proper `CORS_ORIGIN` (don't use `*` in production)
- [ ] Use MongoDB Atlas with IP whitelist

---

## 📦 Build Commands Summary

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev:backend   # Start backend (port 3000)
npm run dev:frontend  # Start frontend (port 5173)

# Production
npm run build        # Build frontend
npm start            # Start production server
```

---

## 🐛 Troubleshooting

**CORS Errors:**
- Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly

**MongoDB Connection Failed:**
- Check if IP is whitelisted in MongoDB Atlas
- Verify connection string format

**Build Failures:**
- Ensure Node.js >= 18.0.0
- Run `npm run install:all` first

---

## 📞 Support

For deployment issues, check the logs:
- Render: Dashboard → Logs
- Railway: Dashboard → Deployments → Logs
- Vercel: Dashboard → Functions → Logs
