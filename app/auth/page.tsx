"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useUserStore } from "@/store/useUserStore";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UX states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const isPasswordStrong = passwordChecks.length && passwordChecks.capital && passwordChecks.number && passwordChecks.special;

  const checkOnboardingAndRedirect = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (isLogin || userDoc.exists()) {
        const data = userDoc.exists() ? userDoc.data() : {};
        useUserStore.getState().completeOnboarding({
          profession: data.profession || "Developer",
          workingHoursStart: data.workingHoursStart || "09:00",
          workingHoursEnd: data.workingHoursEnd || "17:00",
          customInstructions: data.customInstructions || ""
        });
        router.push("/dashboard");
      } else {
        useUserStore.getState().resetOnboarding();
        router.push("/onboarding");
      }
    } catch (e) {
      console.error("Error checking onboarding:", e);
      if (isLogin) {
        useUserStore.getState().completeOnboarding({
          profession: "Developer",
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          customInstructions: ""
        });
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkOnboardingAndRedirect(userCredential.user.uid);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please verify your credentials or sign up if you don't have an account.");
      } else if (err.code === "auth/user-not-found") {
        setError("No user found with this email. Please sign up first!");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.message || "Failed to log in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!isPasswordStrong) {
      setError("Please ensure your password meets all strength requirements.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName) {
        await updateProfile(userCredential.user, { displayName: fullName });
      }
      useUserStore.getState().resetOnboarding();
      router.push("/onboarding");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await checkOnboardingAndRedirect(result.user.uid);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selection:bg-primary/30 min-h-screen">
      <main className="min-h-screen flex flex-col md:flex-row">
        {/* Left Section: Branding & Vision */}
        <section className="relative w-full md:w-1/2 flex flex-col justify-center p-gutter lg:p-xl overflow-hidden bg-surface-container-lowest border-r border-outline-variant/10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 max-w-[36rem] mx-auto md:mx-0 w-full space-y-xl">
            <div className="flex items-center gap-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Commit AI Logo" className="w-12 h-12 object-contain" src="/logo.png" />
              <span className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">Commit AI</span>
            </div>
            <div className="space-y-md">
              <h2 className="font-display text-display max-w-[28rem] leading-tight">Ready to organize your next achievement?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[24rem]">Experience the first AI-native productivity ecosystem designed for high-performance precision.</p>
            </div>
            {/* Product Illustration with Glassmorphism Overlay */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-panel rounded-xl overflow-hidden ai-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Commit AI Interface Mockup" className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBPVcQPlSiJMUuyCiRYbohrddonFbsWHKatDSbFwxX50UaCRs_x-NrfAsiLtLS8rfqkVvaK1rrGYG7TA1Ln6qutRtuV24uGtJV74rCVZHDgv6AAsIgk2ghhKnHWM-mdm0f4ktF5EisIpTIsOadYNMxXTMUWYUzGZqdqbR6pHxhDHBMPyVrJaaFEG6FCbpBt-l7yfiOCCPvAlHgYidi_ABw8XCESvddxKMTOQt9vfmB-P34DxnbkQqJNiTx4TPvIwObZSEN9Sl54kwO" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent"></div>
              </div>
            </div>
            {/* AI Whisper/Welcome Message */}
            <div className="flex items-start gap-md p-md glass-panel rounded-lg border-primary/20 ai-shimmer">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <div className="space-y-xs">
                <p className="font-label-md text-label-md text-primary uppercase tracking-widest">System Ready</p>
                <p className="text-on-surface-variant font-body-md italic leading-relaxed" id="ai-welcome-text">
                  &quot;Analyzing workflow patterns... Standing by to optimize your productivity cycle.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Right Section: Authentication */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-gutter bg-surface">
          <div className="w-full max-w-[28rem] space-y-lg">
            {/* Auth Card */}
            <div className="glass-panel p-lg lg:p-xl rounded-xl space-y-lg relative">
              {/* Tabs */}
              <div className="flex border-b border-outline-variant/20">
                <button 
                  disabled={loading}
                  className={`flex-1 py-md font-label-md text-label-md transition-all ${isLogin ? "auth-tab-active text-primary" : "text-on-surface-variant hover:text-on-surface"}`} 
                  onClick={() => { setIsLogin(true); setError(null); }}
                >
                  Login
                </button>
                <button 
                  disabled={loading}
                  className={`flex-1 py-md font-label-md text-label-md transition-all ${!isLogin ? "auth-tab-active text-primary" : "text-on-surface-variant hover:text-on-surface"}`} 
                  onClick={() => { setIsLogin(false); setError(null); }}
                >
                  Signup
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-md rounded-lg bg-destructive-container/20 border border-destructive/20 text-error font-label-md text-label-md">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className={`space-y-lg ${isLogin ? "block" : "hidden"}`}>
                <div className="space-y-md">
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-primary transition-colors">Email Address</label>
                    <input 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-surface-container-high border-0 rounded-lg px-md py-md text-on-surface focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/30 transition-all" 
                      placeholder="name@company.com" 
                      type="email" 
                    />
                  </div>
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-primary transition-colors">Password</label>
                    <div className="relative">
                      <input 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-surface-container-high border-0 rounded-lg pl-md pr-12 py-md text-on-surface focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/30 transition-all" 
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px] select-none">
                          {showPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-sm cursor-pointer group">
                    <input className="rounded border-outline-variant bg-surface-container-high text-primary focus:ring-0 focus:ring-offset-0" type="checkbox" />
                    <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                  </label>
                  <a className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors" href="#">Forgot password?</a>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg shadow-lg shadow-primary/10 hover:bg-primary-container hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-sm disabled:opacity-75"
                >
                  <span>{loading ? "Logging in..." : "Login"}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-outline-variant/20"></div>
                  <span className="relative bg-surface px-md font-label-sm text-label-sm text-on-surface-variant">OR CONTINUE WITH</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleGoogleAuth} 
                  disabled={loading}
                  className="w-full border border-outline-variant/50 hover:border-primary/50 text-on-surface font-label-md text-label-md py-md rounded-lg flex items-center justify-center gap-md transition-all disabled:opacity-75"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                  </svg>
                  Google login
                </button>
              </form>

              {/* Signup Form */}
              <form onSubmit={handleSignup} className={`space-y-lg ${!isLogin ? "block" : "hidden"}`}>
                <div className="space-y-md">
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-tertiary transition-colors">Full Name</label>
                    <input 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="w-full bg-surface-container-high border-0 rounded-lg px-md py-md text-on-surface focus:ring-1 focus:ring-tertiary transition-all" 
                      placeholder="John Doe" 
                      type="text" 
                    />
                  </div>
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-tertiary transition-colors">Email Address</label>
                    <input 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full bg-surface-container-high border-0 rounded-lg px-md py-md text-on-surface focus:ring-1 focus:ring-tertiary transition-all" 
                      placeholder="name@company.com" 
                      type="email" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="group">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-tertiary transition-colors">Password</label>
                      <div className="relative">
                        <input 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="w-full bg-surface-container-high border-0 rounded-lg pl-md pr-12 py-md text-on-surface focus:ring-1 focus:ring-tertiary transition-all" 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px] select-none">
                            {showPassword ? "visibility" : "visibility_off"}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs group-focus-within:text-tertiary transition-colors">Confirm</label>
                      <div className="relative">
                        <input 
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          className="w-full bg-surface-container-high border-0 rounded-lg pl-md pr-12 py-md text-on-surface focus:ring-1 focus:ring-tertiary transition-all" 
                          placeholder="••••••••" 
                          type={showConfirmPassword ? "text" : "password"} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px] select-none">
                            {showConfirmPassword ? "visibility" : "visibility_off"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {password && (
                    <div className="space-y-sm p-md rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-label-sm font-label-sm mt-md">
                      <div className="text-on-surface-variant font-bold mb-xs uppercase tracking-wider text-[11px]">Password Requirements:</div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[16px] ${passwordChecks.length ? 'text-[#4edea3]' : 'text-on-surface-variant/40'}`}>
                          {passwordChecks.length ? 'check_circle' : 'circle'}
                        </span>
                        <span className={passwordChecks.length ? 'text-on-surface' : 'text-on-surface-variant/60'}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[16px] ${passwordChecks.capital ? 'text-[#4edea3]' : 'text-on-surface-variant/40'}`}>
                          {passwordChecks.capital ? 'check_circle' : 'circle'}
                        </span>
                        <span className={passwordChecks.capital ? 'text-on-surface' : 'text-on-surface-variant/60'}>One capital letter (A-Z)</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[16px] ${passwordChecks.number ? 'text-[#4edea3]' : 'text-on-surface-variant/40'}`}>
                          {passwordChecks.number ? 'check_circle' : 'circle'}
                        </span>
                        <span className={passwordChecks.number ? 'text-on-surface' : 'text-on-surface-variant/60'}>One number (0-9)</span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className={`material-symbols-outlined text-[16px] ${passwordChecks.special ? 'text-[#4edea3]' : 'text-on-surface-variant/40'}`}>
                          {passwordChecks.special ? 'check_circle' : 'circle'}
                        </span>
                        <span className={passwordChecks.special ? 'text-on-surface' : 'text-on-surface-variant/60'}>One special character (!@#$ etc.)</span>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  type="submit" 
                  disabled={loading || (password.length > 0 && !isPasswordStrong)}
                  className="w-full bg-tertiary text-on-tertiary font-label-md text-label-md py-md rounded-lg shadow-lg shadow-tertiary/10 hover:bg-tertiary-container hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-sm disabled:opacity-75 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Creating account..." : "Create account"}</span>
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-outline-variant/20"></div>
                  <span className="relative bg-surface px-md font-label-sm text-label-sm text-on-surface-variant">OR CONTINUE WITH</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleGoogleAuth} 
                  disabled={loading}
                  className="w-full border border-outline-variant/50 hover:border-tertiary/50 text-on-surface font-label-md text-label-md py-md rounded-lg flex items-center justify-center gap-md transition-all disabled:opacity-75"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
                  </svg>
                  Google signup
                </button>
              </form>
            </div>
            {/* Subtle Footer Branding */}
            <div className="flex flex-col items-center gap-md pt-lg">
              <div className="flex gap-lg">
                <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
                <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Security</a>
                <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
