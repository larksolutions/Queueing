# Vercel Deployment Guide for CICS Queueing System

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account (for production database)
- GitHub repository (recommended for continuous deployment)

## Environment Variables

### Required Environment Variables for Vercel

Add these in your Vercel project settings (Settings > Environment Variables):

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=production
PORT=5001

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=CICS Queue System <noreply@cics.edu>

# Frontend API URL (will be auto-set by Vercel)
VITE_API_URL=https://your-project.vercel.app
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the root directory:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **cics-queue-system** (or your choice)
   - In which directory is your code located? **./**
   - Want to override settings? **N**

5. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave default)
   - **Output Directory**: (leave default)

6. Add environment variables in the deployment settings

7. Click "Deploy"

## Post-Deployment Configuration

### 1. Update API URL in Client

After deployment, update the API URL in your client code if needed:

In `client/src/services/api.js`, the baseURL should use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

### 2. Database Setup

Ensure your MongoDB Atlas:
- Allows connections from anywhere (0.0.0.0/0) or specific Vercel IPs
- Has the correct database and collections
- Has proper indexes for performance

### 3. Test Endpoints

After deployment, test:
- Frontend: `https://your-project.vercel.app`
- API Health: `https://your-project.vercel.app/api`
- Login endpoints: `https://your-project.vercel.app/api/auth/login`

## Project Structure for Vercel

```
Que/
├── vercel.json              # Main Vercel configuration
├── client/                  # React frontend
│   ├── dist/               # Build output (generated)
│   ├── package.json
│   └── vite.config.js
├── server/                  # Express backend
│   ├── api/
│   │   └── index.js        # Serverless function entry
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## Vercel Configuration Explained

### vercel.json
- **builds**: Defines how to build client (static) and server (serverless)
- **routes**: Routes API calls to serverless functions, others to static files
- **rewrites**: Additional routing rules for API endpoints

### Serverless Functions
- Located in `server/api/index.js`
- Exports the Express app
- Vercel converts Express routes to serverless functions

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### API Not Working
- Check that MONGODB_URI is correctly set
- Verify MongoDB Atlas whitelist includes Vercel IPs
- Check API route configuration in vercel.json

### Frontend Not Loading
- Verify build output directory is correct
- Check routing configuration
- Ensure all assets are in public folder

### Database Connection Issues
- Use MongoDB Atlas connection string (not localhost)
- Enable "Allow access from anywhere" in Atlas Network Access
- Check connection string format

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers production deployment
- Pull requests create preview deployments
- Automatic rollbacks on failed deployments

## Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL is automatically provisioned

## Monitoring

- View logs: Vercel Dashboard > Project > Deployments > View Function Logs
- Analytics: Available in Vercel Dashboard
- Error tracking: Consider adding Sentry or similar

## Support

For issues:
- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Check your GitHub repository issues

---

**Note**: Remember to never commit `.env` files to version control. Always use Vercel's environment variable settings.
