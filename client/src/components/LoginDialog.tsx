"use client";
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Lock, Mail, User, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, Check } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import api from "@/config/api";
import { toast } from "sonner";
import { trackSignup, trackDbActivity } from "@/utils/analytics";

export interface UserData {
  name?: string;
  email?: string;
  picture?: string;
  id?: string;
  username?: string;
}

export interface BackendResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    expiresIn: number;
    user: UserData;
    isSignup?: boolean;
  };
}

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string, userInfo: UserData, backendResponse?: BackendResponse) => void;
  loading?: boolean;
}

type AuthView = "signin" | "signup" | "signup-otp" | "forgot" | "forgot-otp";

export function LoginDialog({ isOpen, onClose, onSuccess, loading = false }: LoginDialogProps) {
  const [view, setView] = useState<AuthView>("signin");
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [country, setCountry] = useState("Unknown");
  const [resendCountdown, setResendCountdown] = useState(0);

  const [locationData, setLocationData] = useState<{
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

  // Auto-detect country and coordinates
  React.useEffect(() => {
    if (!isOpen) return;
    axios.get("https://ipapi.co/json/")
      .then((res) => {
        if (res.data) {
          setLocationData({
            city: res.data.city || "",
            country: res.data.country_name || "",
            latitude: res.data.latitude || null,
            longitude: res.data.longitude || null
          });
          if (res.data.country_name) setCountry(res.data.country_name);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Resend countdown
  React.useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // Reset on close
  React.useEffect(() => {
    if (!isOpen) {
      setFirstName(""); setLastName(""); setEmail(""); setPassword("");
      setConfirmPassword(""); setOtpCode(""); setErrorMessage("");
      setShowPassword(false); setResendCountdown(0); setView("signin");
      setLocationData(null);
    }
  }, [isOpen]);

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setFormLoading(true);
        setErrorMessage("");
        const accessToken = tokenResponse.access_token;
        const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const response = await api.post<BackendResponse>("/auth/google", {
          googleAccessToken: accessToken,
          authType: "access_token",
          location: locationData,
        });
        if (response.data.success && response.data.data) {
          const { token, user: backendUser, isSignup } = response.data.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify({ ...userInfo, ...backendUser }));
          if (isSignup) {
            trackSignup("google");
            trackDbActivity("/auth/signup/google");
          }
          if (onSuccess) onSuccess(token, backendUser, response.data);
          toast.success(`Welcome back, ${backendUser.name}!`);
          onClose();
          window.location.reload();
        } else {
          throw new Error(response.data.message || "Google Authentication failed");
        }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || "Google login failed. Please try again.");
      } finally {
        setFormLoading(false);
      }
    },
    onError: () => { setErrorMessage("Google authentication failed. Please try again."); setFormLoading(false); },
    scope: "openid email profile",
    flow: "implicit",
  });

  // GitHub Login
  const handleGithubLogin = () => {
    setErrorMessage("");
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) { toast.error("GitHub client ID not configured"); return; }
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  };

  // Send OTP
  const sendOtp = async (purpose: "signup" | "forgot") => {
    try {
      setFormLoading(true);
      setErrorMessage("");
      const endpoint = purpose === "signup" ? "/auth/send-signup-otp" : "/auth/send-forgot-otp";
      const res = await api.post(endpoint, { email });
      if (res.data.success) {
        toast.success(res.data.message || "Verification code sent!");
        setResendCountdown(30);
        setView(purpose === "signup" ? "signup-otp" : "forgot-otp");
      } else {
        throw new Error(res.data.message || "Failed to send code");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to send code. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleResendOtp = (purpose: "signup" | "forgot") => {
    if (resendCountdown > 0) return;
    sendOtp(purpose);
  };

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (view === "signin") {
      if (!email || !password) { setErrorMessage("Email and password are required"); return; }
      try {
        setFormLoading(true);
        const res = await api.post<BackendResponse>("/auth/login", { email, password, location: locationData });
        if (res.data.success && res.data.data) {
          const { token, user: backendUser } = res.data.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(backendUser));
          if (onSuccess) onSuccess(token, backendUser, res.data);
          toast.success(`Welcome back, ${backendUser.name}!`);
          onClose();
          window.location.reload();
        } else { throw new Error(res.data.message || "Login failed"); }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || "Login failed. Please check credentials.");
      } finally { setFormLoading(false); }
      return;
    }

    if (view === "signup") {
      if (!firstName || !lastName || !email || !password || !confirmPassword) { setErrorMessage("All fields are required"); return; }
      if (password !== confirmPassword) { setErrorMessage("Passwords do not match"); return; }
      if (password.length < 8) { setErrorMessage("Password must be at least 8 characters long"); return; }
      await sendOtp("signup");
      return;
    }

    if (view === "signup-otp") {
      if (!otpCode || otpCode.length !== 6) { setErrorMessage("Please enter the 6-digit code"); return; }
      try {
        setFormLoading(true);
        const name = `${firstName} ${lastName}`.trim();
        const res = await api.post<BackendResponse>("/auth/register", { name, email, password, otpCode, country, location: locationData });
        if (res.data.success && res.data.data) {
          const { token, user: backendUser } = res.data.data;
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(backendUser));
          trackSignup("email");
          trackDbActivity("/auth/signup/email");
          if (onSuccess) onSuccess(token, backendUser, res.data);
          toast.success(`Account created! Welcome, ${backendUser.name}!`);
          onClose();
          window.location.reload();
        } else { throw new Error(res.data.message || "Registration failed"); }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || "Verification failed. Please try again.");
      } finally { setFormLoading(false); }
      return;
    }

    if (view === "forgot") {
      if (!email) { setErrorMessage("Email is required"); return; }
      await sendOtp("forgot");
      return;
    }

    if (view === "forgot-otp") {
      if (!otpCode || otpCode.length !== 6) { setErrorMessage("Please enter the 6-digit code"); return; }
      if (!password || !confirmPassword) { setErrorMessage("Passwords are required"); return; }
      if (password !== confirmPassword) { setErrorMessage("Passwords do not match"); return; }
      if (password.length < 8) { setErrorMessage("Password must be at least 8 characters long"); return; }
      try {
        setFormLoading(true);
        const res = await api.post("/auth/reset-password-otp", { email, otpCode, newPassword: password });
        if (res.data.success) {
          toast.success("Password reset successfully! You can now log in.");
          setOtpCode(""); setPassword(""); setConfirmPassword("");
          setView("signin");
        } else { throw new Error(res.data.message || "Password reset failed"); }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || err.message || "Failed to reset password. Please try again.");
      } finally { setFormLoading(false); }
      return;
    }
  };

  const handleClose = () => { if (!formLoading && !loading) onClose(); };

  /* ─────────────────────────────────────────────────
     Reusable input class
  ───────────────────────────────────────────────── */
  const inputCls = "w-full py-3 bg-[#0d0d14] border border-white/[0.09] hover:border-white/[0.18] focus:border-red-500/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-neutral-500 text-white shadow-inner";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[96vw] max-w-[420px] lg:max-w-[880px] bg-[#09090e] border border-white/[0.09] text-white shadow-[0_40px_100px_rgba(0,0,0,0.85),0_0_60px_rgba(220,38,38,0.1)] p-0 gap-0 rounded-2xl overflow-hidden backdrop-blur-2xl">

        <div className="flex flex-col lg:flex-row">

          {/* ═══════════════════════════════════════════
              LEFT PANEL – Branding (desktop only)
          ═══════════════════════════════════════════ */}
          <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-10 bg-gradient-to-br from-[#101016] via-[#09090d] to-black border-r border-white/[0.07] overflow-hidden min-h-[580px]">

            {/* Glow blobs */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-28 -left-28 w-80 h-80 bg-red-600 rounded-full blur-[100px] pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.15, 0.07] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute -bottom-20 -right-12 w-64 h-64 bg-rose-600 rounded-full blur-[80px] pointer-events-none"
            />
            {/* Grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Top: Logo + animated headline */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <span className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                  PAPER<span className="text-red-500 drop-shadow-[0_0_16px_rgba(239,68,68,0.7)]">XIFY</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm">
                  AI
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view + "-lp"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-black tracking-tight text-white leading-snug mb-3">
                    {view === "signin" && <>Welcome back,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white">scholar.</span></>}
                    {view === "signup" && <>Start learning<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white">smarter today.</span></>}
                    {view === "signup-otp" && <>One last<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white">step!</span></>}
                    {view === "forgot" && <>Reset your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white">password.</span></>}
                    {view === "forgot-otp" && <>Almost<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-white">done!</span></>}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-[260px]">
                    {view === "signin" && "Your AI notes, flashcards, and study guides are ready."}
                    {view === "signup" && "Turn any YouTube video into structured AI notes — instantly."}
                    {view === "signup-otp" && "We just emailed you a 6-digit code. Check your inbox."}
                    {view === "forgot" && "We'll send a secure code to reset your password."}
                    {view === "forgot-otp" && "Enter the code and set your new password below."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Middle: Feature checklist */}
            <div className="relative z-10 space-y-3.5 my-8">
              {[
                "AI-powered YouTube → Notes",
                "Smart flashcard generation",
                "10 free tokens every single day",
                "No credit card required",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <Check size={11} strokeWidth={3} />
                  </div>
                  <span className="text-[13px] text-neutral-300 font-medium leading-snug">{feat}</span>
                </div>
              ))}
            </div>

            {/* Bottom: Modern Social proof */}
            <div className="relative z-10 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { initial: "O", bg: "from-blue-500 to-cyan-400" },
                    { initial: "V", bg: "from-red-500 to-rose-400" },
                    { initial: "A", bg: "from-amber-500 to-orange-400" },
                    { initial: "S", bg: "from-purple-500 to-indigo-400" },
                  ].map((u, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-7 h-7 rounded-full border-2 border-[#09090d] flex items-center justify-center text-[10px] font-bold text-white shadow-md bg-gradient-to-tr",
                        u.bg
                      )}
                    >
                      {u.initial}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>Active Study Platform</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Trusted by students from <span className="text-neutral-300 font-medium">150+ countries</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT PANEL – Auth Form
          ═══════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col overflow-y-auto max-h-[92vh] scrollbar-none">

            {/* Mobile logo header */}
            <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black italic tracking-tighter uppercase text-white">
                  PAPER<span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">XIFY</span>
                </span>
                <span className="text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  AI
                </span>
              </div>
            </div>

            <div className="px-7 lg:px-10 py-7 lg:py-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.2 }}
                >

                  {/* Heading row */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                      {view === "signin" && "Sign in to your account"}
                      {view === "signup" && "Create your free account"}
                      {view === "signup-otp" && "Verify your email"}
                      {view === "forgot" && "Forgot your password?"}
                      {view === "forgot-otp" && "Enter verification code"}
                    </h3>
                    <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
                      {view === "signin" && (
                        <>No account yet?{" "}
                          <button onClick={() => { setView("signup"); setErrorMessage(""); }}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline underline-offset-2">
                            Sign up free →
                          </button>
                        </>
                      )}
                      {view === "signup" && (
                        <>Already have one?{" "}
                          <button onClick={() => { setView("signin"); setErrorMessage(""); }}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline underline-offset-2">
                            Log in
                          </button>
                        </>
                      )}
                      {view === "signup-otp" && <>Code sent to <span className="text-neutral-300 font-medium">{email}</span></>}
                      {view === "forgot" && (
                        <>Remembered it?{" "}
                          <button onClick={() => { setView("signin"); setErrorMessage(""); }}
                            className="text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline underline-offset-2">
                            Log in
                          </button>
                        </>
                      )}
                      {view === "forgot-otp" && <>Check inbox at <span className="text-neutral-300 font-medium">{email}</span></>}
                    </p>
                  </div>

                  {/* Error banner */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-start gap-2 px-3.5 py-3 mb-5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs font-medium leading-relaxed"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  {/* ── OAuth buttons (signin & signup) ── */}
                  {["signin", "signup"].includes(view) && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <button
                          type="button"
                          onClick={() => googleLogin()}
                          disabled={formLoading}
                          className="h-11 flex items-center justify-center gap-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                          <FcGoogle className="text-lg shrink-0" />
                          <span>Google</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGithubLogin}
                          disabled={formLoading}
                          className="h-11 flex items-center justify-center gap-2.5 px-4 bg-[#14141c] hover:bg-[#1c1c27] border border-white/[0.1] hover:border-white/20 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm text-white shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                          <FaGithub className="text-lg shrink-0" />
                          <span>GitHub</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-px bg-white/[0.08] flex-1" />
                        <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest whitespace-nowrap">or with email</span>
                        <div className="h-px bg-white/[0.08] flex-1" />
                      </div>
                    </>
                  )}

                  {/* ── Form ── */}
                  <form onSubmit={handleFormSubmit} className="space-y-3">

                    {/* Name fields */}
                    {view === "signup" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                          <input
                            type="text" placeholder="First name"
                            value={firstName} onChange={(e) => setFirstName(e.target.value)}
                            disabled={formLoading} required
                            className={`${inputCls} pl-10 pr-3`}
                          />
                        </div>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                          <input
                            type="text" placeholder="Last name"
                            value={lastName} onChange={(e) => setLastName(e.target.value)}
                            disabled={formLoading} required
                            className={`${inputCls} pl-10 pr-3`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {["signin", "signup", "forgot"].includes(view) && (
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                        <input
                          type="email" placeholder="Email address"
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          disabled={formLoading} required
                          className={`${inputCls} pl-10 pr-4`}
                        />
                      </div>
                    )}

                    {/* Password */}
                    {["signin", "signup"].includes(view) && (
                      <>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder={view === "signup" ? "Password (min 8 chars)" : "Password"}
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            disabled={formLoading} required
                            className={`${inputCls} pl-10 pr-11`}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors focus:outline-none">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {view === "signup" && (
                          <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                            <input
                              type={showPassword ? "text" : "password"} placeholder="Confirm password"
                              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={formLoading} required
                              className={`${inputCls} pl-10 pr-4`}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* OTP – Signup */}
                    {view === "signup-otp" && (
                      <div className="space-y-3 py-1">
                        <p className="text-xs text-neutral-500 text-center">Enter the 6-digit code from your inbox</p>
                        <input
                          type="text" maxLength={6} placeholder="· · · · · ·"
                          value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          disabled={formLoading} required
                          className="w-full text-center py-4 bg-neutral-900 border border-white/[0.08] hover:border-white/[0.16] focus:border-red-500/60 rounded-xl text-3xl font-mono tracking-[0.65em] focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-neutral-700 placeholder:tracking-[0.3em] text-white"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <button type="button" onClick={() => { setView("signup"); setErrorMessage(""); }}
                            className="text-neutral-500 hover:text-neutral-300 transition-colors">← Change email</button>
                          <button type="button" onClick={() => handleResendOtp("signup")} disabled={resendCountdown > 0}
                            className={`font-semibold transition-colors ${resendCountdown > 0 ? "text-neutral-600 cursor-not-allowed" : "text-red-400 hover:text-red-300"}`}>
                            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* OTP + new password – Forgot */}
                    {view === "forgot-otp" && (
                      <div className="space-y-3 py-1">
                        <input
                          type="text" maxLength={6} placeholder="· · · · · ·"
                          value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          disabled={formLoading} required
                          className="w-full text-center py-4 bg-neutral-900 border border-white/[0.08] hover:border-white/[0.16] focus:border-red-500/60 rounded-xl text-2xl font-mono tracking-[0.6em] focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-neutral-700 placeholder:tracking-[0.3em] text-white"
                        />
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                          <input
                            type={showPassword ? "text" : "password"} placeholder="New password (min 8 chars)"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            disabled={formLoading} required
                            className={`${inputCls} pl-10 pr-11`}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors focus:outline-none">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 transition-colors group-focus-within:text-red-400" />
                          <input
                            type={showPassword ? "text" : "password"} placeholder="Confirm new password"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={formLoading} required
                            className={`${inputCls} pl-10 pr-4`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <button type="button" onClick={() => { setView("forgot"); setErrorMessage(""); }}
                            className="text-neutral-500 hover:text-neutral-300 transition-colors">← Back</button>
                          <button type="button" onClick={() => handleResendOtp("forgot")} disabled={resendCountdown > 0}
                            className={`font-semibold transition-colors ${resendCountdown > 0 ? "text-neutral-600 cursor-not-allowed" : "text-red-400 hover:text-red-300"}`}>
                            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* .edu tip */}
                    {view === "signup" && (
                      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-950/20 border border-red-500/15 text-xs text-red-300">
                        <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Have a <strong className="text-red-400">.edu</strong> email? Get a <strong className="text-red-400">50% student discount</strong>!</span>
                      </div>
                    )}

                    {/* Forgot password link */}
                    {view === "signin" && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => { setView("forgot"); setErrorMessage(""); }}
                          className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit" disabled={formLoading}
                      className="w-full h-12 mt-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.5)] text-sm cursor-pointer"
                    >
                      {formLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /><span>Please wait...</span></>
                      ) : (
                        <>
                          <span>
                            {view === "signin" && "Sign In"}
                            {view === "signup" && "Create Account →"}
                            {view === "signup-otp" && "Verify & Create Account"}
                            {view === "forgot" && "Send Reset Code"}
                            {view === "forgot-otp" && "Reset Password"}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Terms */}
                  <p className="mt-5 text-[11px] text-neutral-600 text-center leading-relaxed">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="hover:text-neutral-400 transition-colors underline underline-offset-2">Terms</a>
                    {" & "}
                    <a href="/privacy" className="hover:text-neutral-400 transition-colors underline underline-offset-2">Privacy Policy</a>
                  </p>

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}