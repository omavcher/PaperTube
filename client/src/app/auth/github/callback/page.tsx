"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/config/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      toast.error("No authorization code found from GitHub.");
      router.push("/");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const verifyGithubAuth = async () => {
      try {
        const response = await api.post("/auth/github", { code });
        if (response.data.success && response.data.data) {
          const { token, user } = response.data.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          window.dispatchEvent(new Event("auth-change"));
          toast.success(`Welcome back, ${user.name}!`);
          router.push("/");
        } else {
          throw new Error(response.data.message || "GitHub authentication failed");
        }
      } catch (err: any) {
        console.error("GitHub Auth Callback Error:", err);
        toast.error(err.response?.data?.message || err.message || "GitHub authentication failed.");
        router.push("/");
      }
    };

    verifyGithubAuth();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
      <h2 className="text-xl font-bold">Authenticating with GitHub</h2>
      <p className="text-sm text-neutral-400 mt-2">Please wait while we set up your session...</p>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Loading...</h2>
      </div>
    }>
      <GithubCallbackContent />
    </Suspense>
  );
}
