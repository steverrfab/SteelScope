import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <SignIn
        routing="hash"
        signUpUrl="/register"
        afterSignInUrl="/"
        redirectUrl="/"
      />
    </main>
  );
}
