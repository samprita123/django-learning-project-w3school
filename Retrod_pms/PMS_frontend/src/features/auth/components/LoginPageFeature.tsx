import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ChevronDown,
  Globe,
  Sun,
  Smartphone,
  Loader2,
  AlertCircle,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import { BloombergDashboard } from "./BloombergDashboard";
import { authApi } from "@/services/auth-api";
import { settingsApi, type SystemLanguageData } from "@/services/api/settings";
import { applyTheme, readSavedTheme, persistTheme } from "@/app/theme/theme";
import { toast } from "sonner";
import { Moon } from "lucide-react";

type Mode = "otp" | "password";
type ErrorKind = null | "credentials" | "otp_expired" | "network";

const translations: Record<string, Record<string, string>> = {
  EN: {
    welcomeBack: "Welcome back",
    signInToRetrod: "Sign in to Retrod",
    useCredentials: "Use your assigned credentials to access the property.",
    otpLogin: "OTP login",
    passwordLogin: "Password login",
    phoneOrEmail: "Phone number or email ID",
    enterPhoneOrEmail: "Enter phone or email",
    continueWithOtp: "Continue with OTP",
    orLoginWithPassword: "OR LOGIN WITH PASSWORD",
    orLoginWithOtp: "OR LOGIN WITH OTP",
    enterOtpCode: "Enter OTP code",
    digitCodeSent: "A 6-digit code has been sent to your device.",
    verifySignIn: "Verify & sign in",
    resendCode: "Resend code",
    confirmIdentity: "Confirm Your Identity",
    sentVerificationLink: "We've sent a sign-in verification link to your registered email.",
    checkInbox: "Please check your inbox (and spam folder) and click the link to complete authentication.",
    password: "Password",
    enterPassword: "Enter password",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    change: "Change",
    username: "Username",
    rememberMe: "Remember me",
    resendOtpIn: "Resend OTP in ",
    resendOtpBtn: "Resend OTP",
    cancelBack: "Cancel & Go Back",
    waitingAuth: "Waiting for authorization...",
  },
  HI: {
    welcomeBack: "स्वागत है",
    signInToRetrod: "रिट्रॉड में साइन इन करें",
    useCredentials: "प्रॉपर्टी तक पहुंचने के लिए अपने असाइन किए गए क्रेडेंशियल्स का उपयोग करें।",
    otpLogin: "ओटीपी लॉगिन",
    passwordLogin: "पासवर्ड लॉगिन",
    phoneOrEmail: "फ़ोन नंबर या ईमेल आईडी",
    enterPhoneOrEmail: "फ़ोन या ईमेल दर्ज करें",
    continueWithOtp: "ओटीपी के साथ आगे बढ़ें",
    orLoginWithPassword: "या पासवर्ड के साथ लॉगिन करें",
    orLoginWithOtp: "या ओटीपी के साथ लॉगिन करें",
    enterOtpCode: "ओटीपी कोड दर्ज करें",
    digitCodeSent: "आपके डिवाइस पर 6 अंकों का कोड भेजा गया है।",
    verifySignIn: "सत्यापित करें और साइन इन करें",
    resendCode: "कोड दोबारा भेजें",
    confirmIdentity: "अपनी पहचान सत्यापित करें",
    sentVerificationLink: "हमने आपके पंजीकृत ईमेल पर साइन-इन सत्यापन लिंक भेजा है।",
    checkInbox: "कृपया अपना इनबॉक्स (और स्पैम फ़ोल्डर) जांचें और प्रमाणीकरण पूरा करने के लिए लिंक पर क्लिक करें।",
    password: "पासवर्ड",
    enterPassword: "पासवर्ड दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    signIn: "साइन इन करें",
    change: "बदलें",
    username: "उपयोगकर्ता नाम",
    rememberMe: "मुझे याद रखें",
    resendOtpIn: "ओटीपी दोबारा भेजें ",
    resendOtpBtn: "ओटीपी दोबारा भेजें",
    cancelBack: "रद्द करें और वापस जाएं",
    waitingAuth: "सत्यापन की प्रतीक्षा की जा रही है...",
  },
  OR: {
    welcomeBack: "ସ୍ୱାଗତମ୍",
    signInToRetrod: "ରେଟ୍ରୋଡ୍‌ରେ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ",
    useCredentials: "ପ୍ରପର୍ଟିକୁ ପ୍ରବେଶ କରିବା ପାଇଁ ଆପଣଙ୍କୁ ଦିଆଯାଇଥିବା କ୍ରେଡେନ୍ସିଆଲ୍ ବ୍ୟବହାର କରନ୍ତୁ।",
    otpLogin: "ଓଟିପି ଲଗଇନ୍",
    passwordLogin: "ପାସୱାର୍ଡ ଲଗଇନ୍",
    phoneOrEmail: "ଫୋନ୍ ନମ୍ବର କିମ୍ବା ଇମେଲ୍ ଆଇଡି",
    enterPhoneOrEmail: "ଫୋନ୍ କିମ୍ବା ଇମେଲ୍ ଦରଜ କରନ୍ତୁ",
    continueWithOtp: "ଓଟିପି ସହିତ ଆଗକୁ ବଢନ୍ତୁ",
    orLoginWithPassword: "କିମ୍ବା ପାସୱାର୍ଡ ସହିତ ଲଗଇନ୍ କରନ୍ତୁ",
    orLoginWithOtp: "କିମ୍ବା ଓଟିପି ସହିତ ଲଗଇନ୍ କରନ୍ତୁ",
    enterOtpCode: "ଓଟିପି କୋଡ୍ ଦରଜ କରନ୍ତୁ",
    digitCodeSent: "ଆପଣଙ୍କ ଡିଭାଇସ୍‌କୁ ୬-ଅଙ୍କ ବିଶିଷ୍ଟ କୋଡ୍ ପଠାଯାଇଛି।",
    verifySignIn: "ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ",
    resendCode: "କୋଡ୍ ପୁନର୍ବାର ପଠାନ୍ତୁ",
    confirmIdentity: "ଆପଣଙ୍କର ପରିଚୟ ନିଶ୍ଚିତ କରନ୍ତୁ",
    sentVerificationLink: "ଆମେ ଆପଣଙ୍କର ପଞ୍ଜୀକୃତ ଇମେଲ୍‌କୁ ଏକ ସାଇନ୍-ଇନ୍ ଯାଞ୍ଚ ଲିଙ୍କ୍ ପଠାଇଛୁ।",
    checkInbox: "ଦୟาକରି ଆପଣଙ୍କର ଇନବକ୍ସ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ପ୍ରମାଣୀକରଣ ସମାପ୍ତ କରିବାକୁ ଲିଙ୍କରେ କ୍ଲିକ୍ କରନ୍ତୁ।",
    password: "ପାସୱାର୍ଡ",
    enterPassword: "ପାସୱାର୍ଡ ଦରଜ କରନ୍ତୁ",
    forgotPassword: "ପାସୱାର୍ଡ ଭୁଲିଗଲେ କି?",
    signIn: "ସାଇନ୍ ଇନ୍",
    change: "ପରିବର୍ତ୍ତନ",
    username: "ଉପଭୋକ୍ତା ନାମ",
    rememberMe: "ମନେ ରଖନ୍ତୁ",
    resendOtpIn: "ଓଟିପି ପୁନର୍ବାର ପଠାନ୍ତୁ ",
    resendOtpBtn: "ଓଟିପି ପୁନର୍ବାର ପଠାନ୍ତୁ",
    cancelBack: "ବାତିଲ୍ କରନ୍ତୁ ଏବଂ ଫେରିଯାଆନ୍ତୁ",
    waitingAuth: "ପ୍ରାଧିକରଣ ପାଇଁ ଅପେକ୍ଷା କରାଯାଇଛି...",
  }
};

export function LoginPageFeature() {
  const t = (key: string) => translations[currentLang]?.[key] ?? translations.EN[key];
  const { users, isAuthenticated, loginWithPassword, requestOtp: requestOtpApi, verifyOtp: verifyOtpApi, loginWithTokens } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("otp");
  const [selected, setSelected] = useState<string>(users[0]?.id ?? "");

  // Dynamic Languages & Theme State
  const [languages, setLanguages] = useState<SystemLanguageData[]>([]);
  const [currentLang, setCurrentLang] = useState<string>("EN");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = readSavedTheme();
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    async function loadLanguages() {
      try {
        const list = await settingsApi.getLanguages();
        const active = list.filter((l) => l.is_active);
        setLanguages(active);
        
        const def = active.find((l) => l.is_default);
        if (def) {
          setCurrentLang(def.code.toUpperCase());
        } else if (active.length > 0) {
          setCurrentLang(active[0].code.toUpperCase());
        }
      } catch (err) {
        console.error("Failed to load languages:", err);
      }
    }
    loadLanguages();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // OTP state
  const [contact, setContact] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingConfirmationId, setPendingConfirmationId] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Poll confirmation status
  useEffect(() => {
    if (!pendingConfirmationId) return;
    
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await authApi.checkConfirmationStatus(pendingConfirmationId);
        if (!isMounted) return;
        
        if (res.status === 'approved') {
          clearInterval(interval);
          setConfirmationStatus('approved');
          toast.success("Login verified!");
          loginWithTokens(res.tokens.tokens, res.tokens.user, res.tokens.properties, res.tokens.permissions);
          nav({ to: "/one" });
        } else if (res.status === 'rejected') {
          clearInterval(interval);
          setConfirmationStatus('rejected');
          setCustomError("This sign-in request was rejected. Access blocked.");
        }
      } catch (err: any) {
        console.error(err);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pendingConfirmationId]);

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setCustomError(null);
    setLoading(true);
    try {
      await requestOtpApi(contact.trim());
      setResendTimer(30);
      toast.success("OTP code resent successfully.");
    } catch (err: any) {
      setCustomError(err.message || "Failed to resend OTP code.");
      toast.error(err.message || "Failed to resend OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Password state
  const [username, setUsername] = useState("aarav@grandpalace.in");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setForgotOtpSent(true);
      toast.success("OTP sent to your email successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: forgotEmail.trim(),
        token: forgotOtp.trim(),
        new_password: newPassword,
      });
      toast.success("Password reset successfully. You can now log in.");
      setForgotOpen(false);
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setForgotOtpSent(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Async UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      nav({ to: "/one" });
    }
  }, [isAuthenticated, nav]);

  const errorMsg = useMemo(() => {
    if (customError) return customError;
    switch (error) {
      case "credentials":
        return "Invalid credentials. Please check your username and password.";
      case "otp_expired":
        return "OTP expired. Please request a new code.";
      case "network":
        return "Network issue. Check your connection and try again.";
      default:
        return null;
    }
  }, [error, customError]);

  const fakeDelay = () => new Promise<void>((r) => setTimeout(r, 700));

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCustomError(null);
    if (!username.trim() || !password) {
      setError("credentials");
      return;
    }
    setLoading(true);
    try {
      await loginWithPassword(username.trim(), password);
      setLoading(false);
      nav({ to: "/one" });
    } catch (err: any) {
      setLoading(false);
      setCustomError(err.message || "Invalid credentials.");
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setCustomError("Provide a valid email or phone number.");
      return;
    }
    setError(null);
    setCustomError(null);
    setLoading(true);
    try {
      await requestOtpApi(contact.trim());
      setLoading(false);
      setOtpSent(true);
      setResendTimer(30);
    } catch (err: any) {
      setLoading(false);
      setCustomError(err.message || "Failed to send OTP code.");
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCustomError(null);
    if (otp.length < 4) {
      setError("otp_expired");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtpApi(contact.trim(), otp);
      setLoading(false);
      if (data && data.status === "pending_confirmation") {
        setPendingConfirmationId(data.confirmation_id);
        setConfirmationStatus("pending");
      } else {
        nav({ to: "/one" });
      }
    } catch (err: any) {
      setLoading(false);
      setCustomError(err.message || "Invalid OTP code.");
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.9fr_1fr] bg-background">
      {/* LEFT — Premium branding command center */}
      <BloombergDashboard lang={currentLang} />

      {/* RIGHT — Compact sign-in form */}
      <div className="relative flex flex-col bg-[oklch(0.985_0.003_240)]">
        <div className="absolute right-6 top-6 flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-[11.5px] text-text-secondary shadow-sm hover:text-text-primary transition"
            >
              <Globe className="h-3.5 w-3.5" /> {currentLang}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 top-9 z-10 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {languages.length === 0 ? (
                  <div className="px-3 py-2 text-[11px] text-text-disabled italic">
                    No active languages
                  </div>
                ) : (
                  languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setCurrentLang(lang.code.toUpperCase());
                        setShowLangDropdown(false);
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left text-[11.5px] text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                    >
                      {lang.name} ({lang.code.toUpperCase()})
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-sm hover:text-text-primary transition"
            aria-label="Theme"
          >
            {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center px-5 py-12">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
            {t("welcomeBack")}
          </div>
          <h2 className="mt-2 font-display text-[30px] font-semibold leading-tight text-text-primary">
            {t("signInToRetrod")}
          </h2>
          <p className="mt-2 text-[13px] text-text-secondary">
            {t("useCredentials")}
          </p>

          {pendingConfirmationId ? (
            <div className="mt-8 text-center space-y-6 animate-fade-in bg-surface p-6 rounded-2xl border border-border/80 shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-text-primary">{t("confirmIdentity")}</h3>
                <p className="mt-2 text-[12.5px] text-text-secondary leading-relaxed">
                  {t("sentVerificationLink")}<br />
                  Please click <b>"Yes, it's me"</b> to authorize access.
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-[12px] font-medium text-text-secondary">{t("waitingAuth")}</span>
              </div>

              <div className="border-t border-border/60 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingConfirmationId(null);
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-[12.5px] text-primary hover:underline font-semibold"
                >
                  {t("cancelBack")}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode toggle */}
              <div className="mt-6 grid grid-cols-2 rounded-full border border-border bg-surface p-1 shadow-sm">
                {(["otp", "password"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    className={`h-9 rounded-full text-[12.5px] font-medium transition-all ${
                      mode === m
                        ? "bg-gradient-to-r from-primary to-[oklch(0.55_0.22_295)] text-primary-foreground shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {m === "otp" ? t("otpLogin") : t("passwordLogin")}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive animate-fade-in">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* OTP FORM */}
              {mode === "otp" && (
                <form onSubmit={otpSent ? verifyOtp : sendOtp} className="mt-5 space-y-4">
                  <Field label={t("phoneOrEmail")}>
                    <div className="relative">
                      <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={t("enterPhoneOrEmail")}
                        disabled={otpSent}
                        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-[13.5px] text-text-primary placeholder:text-text-disabled shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-muted/50 transition-all"
                      />
                    </div>
                  </Field>

                  {otpSent && (
                    <Field label={t("enterOtpCode")}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-center text-[16px] tracking-[0.5em] text-text-primary placeholder:text-text-disabled shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                      <div className="mt-1.5 flex justify-between text-[11.5px] text-text-secondary">
                        <span>
                          {currentLang === "HI" ? "कोड भेजा गया " : "Code sent to "} <b className="text-text-primary">{contact}</b>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                          }}
                          className="font-medium text-primary hover:underline"
                        >
                          {t("change")}
                        </button>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11.5px] border-t border-border/40 pt-2">
                        <button
                          type="button"
                          disabled={resendTimer > 0}
                          onClick={resendOtp}
                          className={`font-semibold transition-all ${
                            resendTimer > 0 
                              ? "text-text-disabled cursor-not-allowed" 
                              : "text-primary hover:underline"
                          }`}
                        >
                          {resendTimer > 0 ? `${t("resendOtpIn")}${resendTimer}s` : t("resendOtpBtn")}
                        </button>
                      </div>
                    </Field>
                  )}

                  <PrimaryButton loading={loading}>
                    {otpSent ? t("verifySignIn") : t("continueWithOtp")}
                  </PrimaryButton>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <button
                      type="button"
                      onClick={() => {
                        setMode("password");
                        setError(null);
                      }}
                      className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-text-secondary hover:text-primary transition"
                    >
                      {t("orLoginWithPassword")}
                    </button>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                </form>
              )}

              {/* PASSWORD FORM */}
              {mode === "password" && (
                <form onSubmit={submitPassword} className="mt-5 space-y-4">
                  <Field label={t("username")}>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="aarav_admin"
                        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-[13.5px] text-text-primary placeholder:text-text-disabled shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </Field>

                  <Field label={t("password")}>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("enterPassword")}
                        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-[13.5px] text-text-primary placeholder:text-text-disabled shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary transition"
                        aria-label="Toggle password"
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-text-secondary select-none">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                      {t("rememberMe")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-[12.5px] font-medium text-primary hover:underline transition"
                    >
                      {t("forgotPassword")}
                    </button>
                  </div>

                  <PrimaryButton loading={loading}>{t("signIn")}</PrimaryButton>
                </form>
              )}
            </>
          )}

        </div>
      </div>
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-display text-[18px] font-semibold text-text-primary">
                Reset Password
              </h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="text-text-secondary hover:text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!forgotOtpSent ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <p className="text-[12.5px] text-text-secondary">
                  Enter your registered email address below. We will send you a 6-digit OTP code to verify your identity.
                </p>
                <Field label="Email Address">
                  <input
                    type="email"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13.5px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                    placeholder="e.g. jdoe@grandpalace.in"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="h-9 rounded-lg border border-border bg-surface px-4 text-[12.5px] text-text-secondary hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-9 rounded-lg bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:bg-primary-pressed transition disabled:opacity-70"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-[12.5px] text-text-secondary">
                  Provide the 6-digit verification code and configure your new secure account password.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="OTP Verification Code">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13.5px] text-text-primary text-center tracking-[0.2em] font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                      placeholder="000000"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </Field>
                  <div className="flex flex-col justify-end text-[11.5px] text-text-secondary pb-1">
                    <span>Code sent to:</span>
                    <span className="font-semibold text-text-primary truncate">{forgotEmail}</span>
                  </div>
                </div>
                <Field label="New Password">
                  <input
                    type="password"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13.5px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>
                <Field label="Confirm Password">
                  <input
                    type="password"
                    required
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[13.5px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Field>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    className="text-[12px] font-medium text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="h-9 rounded-lg border border-border bg-surface px-4 text-[12.5px] text-text-secondary hover:bg-surface-2 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-9 rounded-lg bg-primary px-4 text-[12.5px] font-medium text-primary-foreground hover:bg-primary-pressed transition disabled:opacity-70"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PrimaryButton({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.55_0.22_295)] text-[13.5px] font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:shadow-md hover:shadow-primary/35 disabled:opacity-70 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {children}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-text-primary">{label}</label>
      {children}
    </div>
  );
}
export default LoginPageFeature;
