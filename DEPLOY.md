# 🚀 Deploy Ziggy Alpha Hub to Vercel

This guide will get your app live in ~10 minutes.

## Prerequisites

- GitHub account
- Vercel account (free)
- Neon account (free database)

---

## Step 1: Create Free Database (Neon)

1. Go to **[neon.tech](https://neon.tech)**
2. Click **"Sign Up"** → Sign in with GitHub
3. Click **"Create Project"**
   - Name: `ziggy-alpha-hub`
   - Region: Choose closest to you (e.g., `eu-west-1` for UK)
4. Once created, copy the **Connection String**
   - It looks like: `postgresql://username:password@ep-cool-name-123456.eu-west-1.aws.neon.tech/neondb?sslmode=require`
   - **Save this! You'll need it in Step 3**

---

## Step 2: Push to GitHub

```bash
# If you haven't already extracted the zip
unzip ziggy-alpha-hub.zip
cd ziggy-alpha-hub

# Initialize git repository
git init
git add .
git commit -m "Initial commit - Ziggy Alpha Hub"

# Create a new repo on GitHub (github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/ziggy-alpha-hub.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** → Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find and click **"Import"** next to `ziggy-alpha-hub`
5. **Configure Environment Variables** (expand this section):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `JWT_SECRET` | `ziggy-alpha-hub-production-secret-2024` |

6. Click **"Deploy"**
7. Wait ~2 minutes for build to complete ✅

---

## Step 4: Initialize Database

After Vercel deploys, you need to create tables and seed data.

**In your local terminal:**

```bash
cd ziggy-alpha-hub

# Set the production database URL
export DATABASE_URL="postgresql://...your-neon-string..."

# Push schema and seed data
npx prisma generate
npx prisma db push
npm run db:seed
```

**Or use the setup script:**

```bash
export DATABASE_URL="postgresql://...your-neon-string..."
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

---

## Step 5: Test Your Live App! 🎉

Your app is now live at: `https://ziggy-alpha-hub-YOUR_USERNAME.vercel.app`

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Parent | joseph@ziggyalpha.com | ziggy2024 |

### What to Test

1. **/** → Landing page
2. **/login** → Login as parent
3. **/parent/dashboard** → View track progress
4. **/parent/topics** → See mastery breakdown
5. **/today** → Learner daily plan
6. **Start a block** → Practice questions

---

## Troubleshooting

### Build fails on Vercel

**Check:** Environment variables are set correctly
- Go to Vercel → Project → Settings → Environment Variables
- Ensure `DATABASE_URL` and `JWT_SECRET` are present

### Database connection error

**Check:** Your Neon connection string includes `?sslmode=require`

```
# ✅ Correct
postgresql://user:pass@host/db?sslmode=require

# ❌ Wrong
postgresql://user:pass@host/db
```

### "Relation does not exist" error

**Fix:** Run the database setup again:
```bash
export DATABASE_URL="your-connection-string"
npx prisma db push
npm run db:seed
```

### Login doesn't work

**Check:** Database was seeded properly
```bash
# Re-seed the database
export DATABASE_URL="your-connection-string"
npm run db:seed
```

---

## Custom Domain (Optional)

1. Go to Vercel → Project → Settings → Domains
2. Add your domain (e.g., `ziggy.yourdomain.com`)
3. Update DNS records as instructed

---

## Updating Your App

After making changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel auto-deploys on every push to `main` ✨

---

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
