import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/portal/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const hasUsableClerk = /^pk_(test|live)_/.test(clerkKey) && !clerkKey.includes("your_clerk");
  if (!hasUsableClerk) return;
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|svg|ico|woff2?)).*)", "/(api|trpc)(.*)"],
};
