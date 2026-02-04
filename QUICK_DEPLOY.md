# 🚀 Quick Deploy Guide

## Deploy to Vercel in 5 Minutes

### Prerequisites
- GitHub account
- MongoDB Atlas account (free tier)
- Vercel account (free)

---

## Step 1: Prepare MongoDB Atlas (2 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Choose username and password
   - Grant "Read and write to any database"
4. Set network access:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" → Confirm
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<database>` with `cics-queue`

**Your connection string should look like:**
```
mongodb+srv://username:password@cluster.mongodb.net/cics-queue?retryWrites=true&w=majority
```

---

## Step 2: Push to GitHub (1 min)

```bash
# If not already a git repository
git init
git add .
git commit -m "Initial commit with Vercel config"

# Create new repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy on Vercel (2 min)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. **Configure Project:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Leave build settings as default

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   MONGODB_URI = your-connection-string-from-step1
   JWT_SECRET = any-long-random-string-here
   NODE_ENV = production
   PORT = 5001
   ```

6. Click **"Deploy"**

---

## Step 4: Wait & Test (30 seconds)

1. Wait for build to complete (usually ~1-2 minutes)
2. Click the preview link
3. Test the application:
   - Try registering a student
   - Login
   - Create a queue

---

## 🎉 Done!

Your app is now live at: `https://your-project.vercel.app`

### Default Admin Login:
```
Email: queuing@neu.edu.ph
Password: queuingadmin@123
```
⚠️ Change this password after first login!

---

## 🔧 Post-Deployment

### Update API URL (Optional)

If you created a `.env` or `.env.local` file in the client folder:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL = https://your-project.vercel.app
   ```
3. Redeploy (Deployments → ... → Redeploy)

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration

---

## 🆘 Troubleshooting

### Can't login / API errors
- Check MongoDB connection string in environment variables
- Verify MongoDB Atlas Network Access allows all IPs
- Check Vercel function logs

### Build Failed
- Check build logs in Vercel
- Ensure all dependencies are in package.json
- Try building locally first: `cd client && npm run build`

### Database Connection Error
- Verify MONGODB_URI is correct
- Check username/password (no special characters or encode them)
- Ensure MongoDB cluster is running

---

## 📱 Continuous Deployment

Now every time you push to GitHub:
- `main` branch → Production deployment
- Other branches → Preview deployment

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel automatically redeploys! 🎉

---

## 📚 More Help

- [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Configuration Summary](./VERCEL_CONFIG_SUMMARY.md)
- [Vercel Documentation](https://vercel.com/docs)

---

**Questions?** Check the detailed guides or create an issue on GitHub.
