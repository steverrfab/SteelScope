import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <SignUp
        routing="hash"
        signInUrl="/login"
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </main>
  );
}
