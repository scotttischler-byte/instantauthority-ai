import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/portal/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecret = process.env.CLERK_SECRET_KEY || "";
  const hasUsableClerk =
    /^pk_(test|live)_/.test(clerkKey) &&
    /^sk_(test|live)_/.test(clerkSecret) &&
    !clerkKey.includes("your_clerk") &&
    !clerkSecret.includes("your_clerk");
  if (!hasUsableClerk) return;
  if (!isPublicRoute(req)) {
    try {
      await auth.protect();
    } catch {
      return;
    }
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|svg|ico|woff2?)).*)", "/(api|trpc)(.*)"],
};
