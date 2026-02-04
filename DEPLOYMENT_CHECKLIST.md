# Pre-Deployment Checklist

## 🔍 Before Deploying

### Database
- [ ] MongoDB Atlas cluster is created
- [ ] Network access allows connections from anywhere (0.0.0.0/0)
- [ ] Database user credentials are ready
- [ ] Connection string is tested locally

### Environment Variables
- [ ] All environment variables are documented
- [ ] Sensitive data is NOT in code
- [ ] `.env.example` files are up to date
- [ ] Production values are ready

### Code Quality
- [ ] All console.logs reviewed (remove sensitive data)
- [ ] Error handling is in place
- [ ] API endpoints are tested
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts without errors (`npm start`)

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] Default admin password is documented to be changed
- [ ] CORS settings are configured
- [ ] API rate limiting considered
- [ ] Input validation is in place

## 🚀 Deployment Steps

### 1. Prepare MongoDB Atlas
```bash
# Update connection string format
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### 2. Set Environment Variables in Vercel
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add:
```
MONGODB_URI=<your-atlas-connection-string>
JWT_SECRET=<strong-random-string>
NODE_ENV=production
PORT=5001
VITE_API_URL=https://<your-project>.vercel.app
```

### 3. Deploy
```bash
# Via CLI
vercel --prod

# Or push to GitHub (if auto-deploy is enabled)
git push origin main
```

### 4. Post-Deployment Verification
- [ ] Visit the deployed URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test queue creation
- [ ] Test faculty status updates
- [ ] Check browser console for errors
- [ ] Verify API calls are successful

## 🔧 Troubleshooting

### Build Errors
1. Check build logs in Vercel
2. Verify all dependencies in package.json
3. Test local build: `npm run build`

### Database Connection Fails
1. Verify MONGODB_URI format
2. Check MongoDB Atlas Network Access
3. Confirm database name exists
4. Test connection string locally

### API Not Responding
1. Check Vercel function logs
2. Verify environment variables
3. Check API routes configuration
4. Test endpoints with Postman/curl

### Frontend Can't Reach Backend
1. Verify VITE_API_URL is correct
2. Check CORS configuration
3. Inspect network tab in browser
4. Verify API routes in vercel.json

## 📊 Monitoring

### Check These Regularly
- [ ] Vercel deployment logs
- [ ] MongoDB Atlas metrics
- [ ] Error rates in logs
- [ ] Response times
- [ ] Database usage

### Performance Optimization
- [ ] Enable caching where appropriate
- [ ] Optimize database queries (add indexes)
- [ ] Minimize bundle size
- [ ] Lazy load components
- [ ] Use production builds

## 🔄 Continuous Deployment

### GitHub Integration
- Main branch → Production
- Feature branches → Preview deployments
- Pull requests → Automatic previews

### Best Practices
- Test locally before pushing
- Use feature branches
- Review preview deployments
- Merge only tested code

## 📝 Notes

- Vercel functions have a 10-second timeout (Hobby plan)
- Free tier has usage limits
- Consider upgrading for production apps
- Monitor function execution times
- Optimize cold start times

## 🆘 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Project Issues](https://github.com/larksolutions/Queueing/issues)
