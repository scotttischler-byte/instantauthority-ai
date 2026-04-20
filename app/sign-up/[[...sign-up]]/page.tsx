import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-charcoal p-12 text-white lg:block">
        <h1 className="font-display text-4xl">Start your free trial</h1>
        <p className="mt-4 text-white/80">Launch authority campaigns for agencies, law firms, and SaaS teams.</p>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <SignUp />
      </div>
    </div>
  );
}
