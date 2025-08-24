import AuthBackground from "@/components/background/auth-background";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthBackground>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
          },
        }}
      />
    </AuthBackground>
  );
}
