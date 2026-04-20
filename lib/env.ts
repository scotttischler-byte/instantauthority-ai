export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
};

Object.entries(env).forEach(([key, value]) => {
  if (!value) throw new Error(`Missing required env var: ${key}`);
});
