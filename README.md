# InstantAuthority.ai

## Quick Start (5 minutes)

### Step 1: Get Clerk Keys
1. Go to [clerk.com](https://clerk.com)
2. Create account
3. Create new application
4. Copy Publishable Key + Secret Key
5. Paste into `.env.local`

### Step 2: Get Anthropic Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Paste into `.env.local`

### Step 3: Run Locally
```bash
npm install
npx prisma db push
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### Step 4: Deploy to Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. New Project → Import repo
4. Add ALL env variables
5. Deploy

### Step 5: Connect Domain
1. Vercel → Project → Settings → Domains
2. Add your domain
3. Copy DNS records
4. Add in Namecheap/GoDaddy
5. Wait 10-30 min

## Environment Variables
- `DATABASE_URL=file:./dev.db`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
- `ANTHROPIC_API_KEY`
