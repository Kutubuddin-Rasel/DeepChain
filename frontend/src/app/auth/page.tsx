"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import { authService } from "@/services/auth.service";
import { useAuthStore, AuthState } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const redirectParam = searchParams.get("redirect");
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/";

  const login = useAuthStore((state: AuthState) => state.login);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let userRole = "USER";
      if (mode === "register") {
        const res = await authService.register({ name, email, address, password });
        login(res.accessToken, res.user);
        userRole = res.user.role;
        toast.success("Account created successfully!");
      } else {
        const res = await authService.login({ email, password });
        login(res.accessToken, res.user);
        userRole = res.user.role;
        toast.success("Welcome back!");
      }

      // Redirect after auth (fallback to home)
      if (userRole === "ADMIN" && redirectTo === "/") {
        router.push("/admin/menu-items");
      } else {
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Authentication failed. Please check your credentials.");
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-105 overflow-hidden rounded-2xl bg-[#FBF7F2] shadow-soft border border-foreground/10">
        <div className="p-8">
          <div className="mb-7 text-center">
            <Link href="/" className="inline-block mb-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                Foodio<span className="text-foreground">.</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/60">Premium flavors, delivered.</p>
          </div>

          <div className="mb-6 flex rounded-full bg-[#EEE9E1] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`cursor-pointer flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
                mode === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`cursor-pointer flex-1 rounded-full py-2.5 text-sm font-semibold transition-all ${
                mode === "register"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-white border border-foreground/15 text-sm placeholder:text-foreground/40"
                />
                <Input
                  label="Address"
                  placeholder="e.g. House 23, Road 23, Jamaica, USA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="h-12 rounded-xl bg-white border border-foreground/15 text-sm placeholder:text-foreground/40"
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl bg-white border border-foreground/15 text-sm placeholder:text-foreground/40"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl bg-white border border-foreground/15 text-sm placeholder:text-foreground/40"
            />

            <Button
              type="submit"
              className="w-full mt-7! h-12 rounded-full text-[15px] font-semibold"
              isLoading={isLoading}
              size="md"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center flex-1 items-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
