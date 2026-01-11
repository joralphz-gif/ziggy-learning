#!/bin/bash

# Ziggy Alpha Hub - Database Setup Script
# Run this after deploying to Vercel to initialize your database

echo "🌟 Ziggy Alpha Hub - Database Setup"
echo "===================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set!"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL=\"postgresql://user:pass@host/db?sslmode=require\""
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Push schema to database
echo "🗄️  Pushing schema to database..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema"
    exit 1
fi

echo "✅ Schema pushed"
echo ""

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "===================================="
echo "🎉 Setup complete!"
echo ""
echo "You can now access your app with:"
echo "  Email: joseph@ziggyalpha.com"
echo "  Password: ziggy2024"
echo ""
