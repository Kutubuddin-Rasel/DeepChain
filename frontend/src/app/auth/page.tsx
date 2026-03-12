"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import { api } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const { login } = useAuth();

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
      if (mode === "register") {
        const res = await api.post("/auth/register", { name, email, address, password });
        login(res.data.access_token, res.data.user);
        toast.success("Account created successfully!");
      } else {
        const res = await api.post("/auth/login", { email, password });
        login(res.data.access_token, res.data.user);
        toast.success("Welcome back!");
      }

      // Auto-redirect to home on success
      router.push("/");
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-hover border border-foreground/5">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-3">
              <span className="font-serif text-3xl font-bold tracking-tight text-primary">
                Foodio<span className="text-foreground">.</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/60">Premium flavors, delivered.</p>
          </div>

          <div className="mb-8 flex rounded-xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
                }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${mode === "register"
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
                />
                <Input
                  label="Address"
                  placeholder="e.g. House:23, Road:23, Jamaica, USA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
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
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full !mt-8" isLoading={isLoading} size="lg">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-foreground/40 leading-relaxed">
            By accessing the system, you agree to our Terms of Service and Privacy Policy. <br className="hidden sm:block" />
            <span className="italic mt-1 block">Demo Admin: admin@foodio.com / Admin123!</span>
          </div>
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
