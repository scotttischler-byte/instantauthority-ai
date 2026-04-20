import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-charcoal p-12 text-white lg:block">
        <h1 className="font-display text-4xl">Build Instant Authority</h1>
        <ul className="mt-6 space-y-3 text-white/80">
          <li>• GEO-first AI press releases</li>
          <li>• Website authority analyzer</li>
          <li>• White-label client reporting</li>
        </ul>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <SignIn />
      </div>
    </div>
  );
}
