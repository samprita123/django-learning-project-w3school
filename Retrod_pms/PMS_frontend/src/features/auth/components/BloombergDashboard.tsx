import { useMemo } from "react";
import logo from "@/assets/PPF.png";
import {
  Sparkles,
  ShieldCheck,
  Globe,
  BedDouble,
  Building2,
  BarChart3,
  Brain,
  Users,
  Wallet,
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Quote,
  ArrowUpRight,
} from "lucide-react";

const dashboardTranslations: Record<string, Record<string, string>> = {
  EN: {
    smartHospitality: "Smart hospitality",
    startsWith: "starts with ",
    unifiedSystem: "The unified operating system for modern hotels — reservations, front office, housekeeping, billing and revenue, orchestrated by AI-powered hospitality workflows across every property you run.",
    reservationOs: "Reservation OS",
    realTimeInventory: "Real-time inventory across all channels.",
    multiProperty: "Multi-property",
    operateEveryProperty: "Operate every property from one cockpit.",
    revenueOpt: "Revenue optimization",
    dynamicRates: "Dynamic rates, RevPAR you can defend.",
    aiInsights: "AI hospitality insights",
    anticipateDemand: "Anticipate demand, automate decisions.",
    guestExp: "Guest experience",
    personalizedStays: "Personalized stays at every touchpoint.",
    centralizedBilling: "Centralized billing",
    foliosUnified: "Folios, POS and payouts — unified.",
    viewCalendar: "View calendar",
  },
  HI: {
    smartHospitality: "स्मार्ट हॉस्पिटैलिटी",
    startsWith: "की शुरुआत ",
    unifiedSystem: "आधुनिक होटलों के लिए एकीकृत ऑपरेटिंग सिस्टम - आरक्षण, फ्रंट ऑफिस, हाउसकीपिंग, बिलिंग और राजस्व, आपके द्वारा संचालित प्रत्येक संपत्ति में एआई-संचालित हॉस्पिटैलिटी वर्कफ़्लो द्वारा समन्वित।",
    reservationOs: "आरक्षण ओएस",
    realTimeInventory: "सभी चैनलों पर रीयल-टाइम इन्वेंट्री।",
    multiProperty: "मल्टी-प्रॉपर्टी",
    operateEveryProperty: "एक ही कॉकपिट से हर प्रॉपर्टी को संचालित करें।",
    revenueOpt: "राजस्व अनुकूलन",
    dynamicRates: "गतिशील दरें, RevPAR जिसे आप डिफेंड कर सकें।",
    aiInsights: "एआई हॉस्पिटैलिटी अंतर्दृष्टि",
    anticipateDemand: "मांग का अनुमान लगाएं, निर्णय स्वचालित करें।",
    guestExp: "अतिथि अनुभव",
    personalizedStays: "हर टचपॉइंट पर व्यक्तिगत ठहराव।",
    centralizedBilling: "केंद्रीकृत बिलिंग",
    foliosUnified: "फ़ोलियो, पीओएस और भुगतान — एकीकृत।",
    viewCalendar: "कैलेंडर देखें",
  },
  OR: {
    smartHospitality: "ସ୍ମାର୍ଟ ହସ୍ପିଟାଲିଟି",
    startsWith: "ରେଟ୍ରୋଡ୍ ସହିତ ଆରମ୍ଭ ହୁଏ",
    unifiedSystem: "ଆଧୁନିକ ହୋଟେଲଗୁଡିକ ପାଇଁ ଏକୀକୃତ ଅପରେଟିଂ ସିଷ୍ଟମ୍ - ସଂରକ୍ଷଣ, ଫ୍ରଣ୍ଟ ଅଫିସ୍, ହାଉସକିପିଂ, ବିଲିଂ ଏବଂ ରାଜସ୍ୱ, ଆପଣ ଚଳାଉଥିବା ପ୍ରତ୍ୟେକ ପ୍ରପର୍ଟିରେ ଏଆଇ-ଚାଳିତ ହସ୍ପିଟାଲିଟି ୱର୍କଫ୍ଲୋ ଦ୍ୱାରା ସଂଯୋଜିତ।",
    reservationOs: "ରିଜର୍ଭେସନ୍ ଓଏସ୍",
    realTimeInventory: "ସମସ୍ତ ଚ୍ୟାନେଲରେ ରୀୟଲ୍-ଟାଇମ୍ ଇନଭେଣ୍ଟ୍ରି।",
    multiProperty: "ମଲ୍ଟି-ପ୍ରପର୍ଟି",
    operateEveryProperty: "ଗୋଟିଏ କକ୍‌ପିଟ୍‌ରୁ ପ୍ରତ୍ୟେକ ପ୍ରପର୍ଟିକୁ ସଞ୍ଚାଳନ କରନ୍ତୁ।",
    revenueOpt: "ରାଜସ୍ୱ ଅପ୍ଟିମାଇଜେସନ୍",
    dynamicRates: "ଡାଇନାମିକ୍ ରେଟ୍ସ, RevPAR ଆପଣ ରକ୍ଷା କରିପାରିବେ।",
    aiInsights: "ଏଆଇ ହସ୍ପିଟାଲିଟି ଅନ୍ତର୍ଦୃଷ୍ଟି",
    anticipateDemand: "ଚାହିଦା ଆକଳନ କରନ୍ତୁ, ନିଷ୍ପତ୍ତି ସ୍ୱୟଂଚାଳିତ କରନ୍ତୁ।",
    guestExp: "ଅତିଥି ଅନୁଭୂତି",
    personalizedStays: "ପ୍ରତ୍ୟେକ ଟଚ୍‌ପଏଣ୍ଟ୍‌ରେ ବ୍ୟକ୍ତିଗତ ରହଣି।",
    centralizedBilling: "କେନ୍ଦ୍ରୀକୃତ ବିଲିଂ",
    foliosUnified: "ଫୋଲିଓ, ପିଓଏସ୍ ଏବଂ ଦେୟ - ଏକୀକୃତ।",
    viewCalendar: "କ୍ୟାଲେଣ୍ଡର ଦେଖନ୍ତୁ",
  }
};

export function BloombergDashboard({ lang = "EN" }: { lang?: string }) {
  const code = lang.toUpperCase() === "OD" ? "OR" : lang.toUpperCase();
  const t = (key: string) => dashboardTranslations[code]?.[key] ?? dashboardTranslations.EN[key];

  return (
    <div
      className="relative hidden lg:flex flex-col overflow-hidden text-white
                    bg-[radial-gradient(120%_90%_at_0%_0%,oklch(0.22_0.10_285)_0%,oklch(0.13_0.05_270)_45%,oklch(0.10_0.03_265)_100%)]"
    >
      {/* Decorative gradients */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full
                      bg-[radial-gradient(circle,oklch(0.55_0.22_295/.45),transparent_60%)] blur-3xl"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full
                      bg-[radial-gradient(circle,oklch(0.65_0.18_55/.25),transparent_60%)] blur-3xl"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full
                      bg-[radial-gradient(circle,oklch(0.45_0.20_265/.35),transparent_60%)] blur-3xl"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]
                      bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
                      bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-12 pt-10">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Retrod Logo" className="h-9 w-auto object-contain" />
          <span className="ml-1 rounded-sm bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
            ONE
          </span>
        </div>
      </div>

      {/* Body grid */}
      <div className="relative grid flex-1 grid-cols-12 gap-8 px-12 pt-12 pb-10">
        {/* Left col: hero + benefits + trust */}
        <div className="col-span-7 flex flex-col">

          <h1 className="mt-5 font-display text-[52px] leading-[1.02] tracking-tight">
            {t("smartHospitality")}
            <br />
            {t("startsWith")}{" "}
            <span className="bg-gradient-to-r from-[oklch(0.78_0.14_85)] via-[oklch(0.72_0.18_310)] to-primary bg-clip-text text-transparent">
              Retrod.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white/60">
            {t("unifiedSystem")}
          </p>

          {/* Benefits */}
          <div className="mt-9 grid grid-cols-2 gap-3">
            {[
              {
                icon: BedDouble,
                title: t("reservationOs"),
                body: t("realTimeInventory"),
              },
              {
                icon: Building2,
                title: t("multiProperty"),
                body: t("operateEveryProperty"),
              },
              {
                icon: BarChart3,
                title: t("revenueOpt"),
                body: t("dynamicRates"),
              },
              {
                icon: Brain,
                title: t("aiInsights"),
                body: t("anticipateDemand"),
              },
              {
                icon: Users,
                title: t("guestExp"),
                body: t("personalizedStays"),
              },
              {
                icon: Wallet,
                title: t("centralizedBilling"),
                body: t("foliosUnified"),
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-xl border border-white/8 bg-white/[0.03] p-3.5 backdrop-blur transition-colors hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/25 to-[oklch(0.55_0.22_295)]/20 text-[oklch(0.85_0.10_290)] ring-1 ring-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[13px] font-medium text-white">{title}</div>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-white/55">{body}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right col: KPI + calendar + testimonial */}
        <div className="col-span-5 flex flex-col gap-4">
          <CalendarCard />
        </div>
      </div>
    </div>
  );
}

function Trust({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] text-white/55">
      <Icon className="h-3.5 w-3.5 text-[oklch(0.78_0.14_85)]" />
      <span>{label}</span>
    </div>
  );
}

function KPIRow() {
  const kpis = [
    { label: "Occupancy", value: "82%", delta: "+4.2%", tone: "emerald" },
    { label: "ADR", value: "₹9,240", delta: "+1.8%", tone: "emerald" },
    { label: "RevPAR", value: "₹7,580", delta: "+6.1%", tone: "emerald" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-white/8 bg-white/[0.03] p-3 backdrop-blur"
        >
          <div className="text-[10.5px] font-medium uppercase tracking-wider text-white/45">
            {k.label}
          </div>
          <div className="mt-1.5 font-display text-[18px] font-semibold text-white">{k.value}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-emerald-300/90">
            <TrendingUp className="h-3 w-3" />
            {k.delta}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarCard({ lang = "EN" }: { lang?: string }) {
  const code = lang.toUpperCase() === "OD" ? "OR" : lang.toUpperCase();
  const t = (key: string) => dashboardTranslations[code]?.[key] ?? dashboardTranslations.EN[key];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayDate = currentDate.getDate();

  const monthName = currentDate.toLocaleString(code === "HI" ? "hi-IN" : code === "OR" ? "or-IN" : "en-US", { month: "long" });

  // Map 0 (Sunday) to index 6, and 1-6 (Monday-Saturday) to index 0-5
  const firstDay = new Date(year, month, 1).getDay();
  const emptyCount = firstDay === 0 ? 6 : firstDay - 1;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const empty = Array.from({ length: emptyCount }, () => null);
    const cur = Array.from({ length: totalDays }, (_, i) => i + 1);
    return [...empty, ...cur];
  }, [emptyCount, totalDays]);

  const arrivals = new Set([3, 7, 10, 14, 18, 22, 27]);
  const checkouts = new Set([5, 9, 13, 17, 21, 25, 30]);

  const weekHeaders = code === "HI" 
    ? ["सोम", "मंग", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
    : code === "OR"
    ? ["ସୋମ", "ମଙ୍ଗ", "ବୁଧ", "ଗୁରୁ", "ଶୁକ୍ର", "ଶନି", "ରବି"]
    : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-white/70" />
          <div className="text-[13px] font-medium text-white/90 capitalize">
            {monthName} {year}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded text-white/60 hover:bg-white/5">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded text-white/60 hover:bg-white/5">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {weekHeaders.map((d, i) => (
          <div key={i} className="text-[9.5px] font-medium tracking-wider text-white/35">
            {d}
          </div>
        ))}
        {days.map((d, idx) => {
          const isToday = d === todayDate;
          const isArr = d !== null && arrivals.has(d);
          const isOut = d !== null && checkouts.has(d);
          return (
            <div key={idx} className="flex items-center justify-center">
              {d !== null ? (
                <div
                  className={[
                    "relative flex h-7 w-7 items-center justify-center rounded-full text-[11px]",
                    isToday
                      ? "bg-gradient-to-br from-primary to-[oklch(0.55_0.22_295)] font-semibold text-white shadow-md shadow-primary/40"
                      : "text-white/75 hover:bg-white/5",
                  ].join(" ")}
                >
                  {d}
                  {!isToday && (isArr || isOut) && (
                    <span
                      className={[
                        "absolute -bottom-0.5 h-1 w-1 rounded-full",
                        isArr ? "bg-emerald-400" : "bg-[oklch(0.78_0.14_85)]",
                      ].join(" ")}
                    />
                  )}
                </div>
              ) : (
                <div className="h-7 w-7" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OccupancyCard() {
  const bars = [62, 71, 58, 80, 74, 88, 82];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-wider text-white/45">
            Occupancy · This week
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="font-display text-[20px] font-semibold text-white">73.8%</div>
            <div className="text-[11px] text-emerald-300/90">▲ 5.2 vs last week</div>
          </div>
        </div>
        <CircleCheck className="h-4 w-4 text-emerald-400/80" />
      </div>
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-gradient-to-t from-primary/40 to-[oklch(0.72_0.18_310)]/80"
              style={{ height: `${b}%` }}
            />
            <div className="text-[9px] text-white/40">{labels[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4">
      <Quote className="h-4 w-4 text-[oklch(0.78_0.14_85)]" />
      <p className="mt-2 text-[12.5px] leading-relaxed text-white/80">
        "Retrod transformed our operations across 14 properties. RevPAR is up 18% and our teams
        finally work from a single source of truth."
      </p>
      <div className="mt-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.22_295)] text-[11px] font-semibold text-white">
          AV
        </div>
        <div>
          <div className="text-[12px] font-medium text-white">Aman Verma</div>
          <div className="text-[10.5px] text-white/45">VP Operations · Palace Hotels Group</div>
        </div>
      </div>
      <Sparkles className="absolute -right-2 -bottom-2 h-20 w-20 text-white/[0.04]" />
    </div>
  );
}
export default BloombergDashboard;
