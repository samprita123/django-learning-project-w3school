import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Settings, Users, HelpCircle, Layers, CreditCard, Edit, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/Primitives";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/superadmin/manual")({
  head: () => ({ meta: [{ title: "User Manual — Superadmin" }] }),
  component: SuperadminManualComponent,
});

interface ManualPage {
  title: string;
  content: string;
}

interface ManualContent {
  title: string;
  subtitle: string;
  pages: ManualPage[];
}

const defaultPages: ManualPage[] = [
  {
    title: "1. Tenant Onboarding & Management",
    content: "Superadmins can configure multi-tenant environments. When onboarding new clients, assign unique subdomains and default storage options. Monitor resource utilization rates under Tenant Management.",
  },
  {
    title: "2. Subscriptions & Pricing Tiers",
    content: "Set up subscription bundles with localized currencies and pricing structures. Make sure billing gateways match platform-wide rules. Subscriptions determine tenant-level limits (max users, max properties).",
  },
  {
    title: "3. Global User Controls",
    content: "Manage top-level administrative accounts. You can create new platform root users, toggle their active status, or assign them granular security policies. Password updates are sent securely through automated OTP templates.",
  },
  {
    title: "4. System Configurations",
    content: "Modify platform metadata dynamically. This includes currencies, taxes, fee profiles, and supported locales. These parameters feed directly into tenant configurations and billing modules.",
  },
];

const defaultManual: ManualContent = {
  title: "Retrod Superadmin Guide Book",
  subtitle: "Standard Operating Procedures & Guidelines",
  pages: defaultPages,
};

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const textareaCls =
  "w-full rounded-md border border-border bg-surface p-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[80px]";

function SuperadminManualComponent() {
  const [manualData, setManualData] = useState<ManualContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState<ManualContent>({ ...defaultManual });
  
  // Navigation: 0 = closed cover, 1 = pages 1-2, 2 = pages 3-4, etc.
  const [currentSpread, setCurrentSpread] = useState(0);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [pageFlipKey, setPageFlipKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("superadmin_manual_data");
    if (saved) {
      try {
        setManualData(JSON.parse(saved));
      } catch (e) {
        setManualData(null);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("superadmin_manual_data", JSON.stringify(formFields));
    setManualData({ ...formFields });
    setIsModalOpen(false);
    setCurrentSpread(0);
    setFlipDirection('next');
    setPageFlipKey((k) => k + 1);
  };

  const handleOpenForm = () => {
    if (manualData) {
      setFormFields({ ...manualData });
    } else {
      setFormFields({ ...defaultManual });
    }
    setIsModalOpen(true);
  };

  const addPage = () => {
    setFormFields({
      ...formFields,
      pages: [...formFields.pages, { title: "", content: "" }],
    });
  };

  const removePage = (index: number) => {
    if (formFields.pages.length <= 2) return;
    const updated = [...formFields.pages];
    updated.splice(index, 1);
    setFormFields({ ...formFields, pages: updated });
  };

  const updatePageTitle = (index: number, val: string) => {
    const updated = [...formFields.pages];
    updated[index].title = val;
    setFormFields({ ...formFields, pages: updated });
  };

  const updatePageContent = (index: number, val: string) => {
    const updated = [...formFields.pages];
    updated[index].content = val;
    setFormFields({ ...formFields, pages: updated });
  };

  const activeData = manualData || defaultManual;
  const totalPages = activeData.pages.length;
  const totalSpreads = Math.ceil(totalPages / 2) + 1;

  const handleNext = () => {
    if (currentSpread >= totalSpreads - 1) return;
    setFlipDirection('next');
    setCurrentSpread((prev) => prev + 1);
    setPageFlipKey((k) => k + 1);
  };

  const handlePrev = () => {
    if (currentSpread <= 0) return;
    setFlipDirection('prev');
    setCurrentSpread((prev) => prev - 1);
    setPageFlipKey((k) => k + 1);
  };

  const getLeftPageData = (spreadIdx: number) => {
    if (spreadIdx === 0) return { data: null, pageIdx: -1, isCover: false };
    const idx = (spreadIdx - 1) * 2;
    return { data: idx < totalPages ? activeData.pages[idx] : null, pageIdx: idx, isCover: false };
  };

  const getRightPageData = (spreadIdx: number) => {
    if (spreadIdx === 0) return { data: activeData, pageIdx: -1, isCover: true };
    const idx = (spreadIdx - 1) * 2 + 1;
    return { data: idx < totalPages ? activeData.pages[idx] : null, pageIdx: idx, isCover: false };
  };

  const isNext = flipDirection === 'next';
  const leafFront = isNext ? getRightPageData(currentSpread - 1) : getRightPageData(currentSpread);
  const leafBack = isNext ? getLeftPageData(currentSpread) : getLeftPageData(currentSpread + 1);

  // The static page being revealed gets the NEW data, the static page being landed on keeps the OLD data
  const staticLeft = isNext ? getLeftPageData(currentSpread - 1) : getLeftPageData(currentSpread);
  const staticRight = isNext ? getRightPageData(currentSpread) : getRightPageData(currentSpread + 1);

  const initialRotateY = isNext ? 0 : -180;
  const animateRotateY = isNext ? -180 : 0;

  const PageFace = ({ data, pageIdx, isCover, shape }: { data: any, pageIdx: number, isCover: boolean, shape: 'left' | 'right' }) => {
    const wrapperCls = shape === 'left'
      ? "absolute inset-0 bg-gradient-to-r from-[#fdfdfd] via-[#ffffff] to-[#ececec] rounded-l-2xl border-y border-l border-black/10 p-8 flex flex-col justify-between overflow-hidden shadow-2xl"
      : "absolute inset-0 bg-gradient-to-l from-[#fdfdfd] via-[#ffffff] to-[#ececec] rounded-r-2xl border-y border-r border-black/10 p-8 flex flex-col justify-between overflow-hidden shadow-2xl";
      
    const shadowCls = shape === 'left'
      ? "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-black/10 pointer-events-none"
      : "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-black/10 pointer-events-none";

    const coverWrapperCls = shape === 'left'
      ? "absolute inset-0 bg-gradient-to-bl from-[#0d9488] via-[#115e59] to-[#0f172a] rounded-l-2xl border-y border-l border-[#0d9488]/30 p-8 flex flex-col justify-between shadow-2xl overflow-hidden"
      : "absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#115e59] to-[#0f172a] rounded-r-2xl border-y border-r border-[#0d9488]/30 p-8 flex flex-col justify-between shadow-2xl overflow-hidden";

    const coverShadowCls = shape === 'left'
      ? "absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-l from-black/40 to-transparent"
      : "absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 to-transparent";

    if (!data && !isCover) {
      if (pageIdx === -1) return null;
      return (
        <div className={wrapperCls}>
          <div className={shadowCls} />
          <div className="h-full flex items-center justify-center text-text-muted italic text-[12px]">
            End of document.
          </div>
        </div>
      );
    }

    if (isCover) {
      return (
        <div className={coverWrapperCls}>
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#0d9488]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#38bdf8]/10 blur-2xl pointer-events-none" />
          <div className={coverShadowCls} />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase">Retrod Guide Book</span>
          </div>
          <div className="my-auto space-y-3">
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
              {data?.title || activeData.title}
            </h3>
            <p className="text-[12px] text-white/77 font-medium">
              {data?.subtitle || activeData.subtitle}
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-white/40 text-[10px] uppercase font-bold tracking-wider">
            <span>Platform Admin Operations</span>
            <span className="text-white/80 animate-pulse">Click to open &rarr;</span>
          </div>
        </div>
      );
    }

    return (
      <div className={wrapperCls}>
        <div className={shadowCls} />
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#0d9488]">{pageIdx % 2 === 0 ? "Retrod Admin Manual" : "System Directives"}</span>
          <span className="text-[10px] font-mono text-black/40">Section {pageIdx + 1}</span>
        </div>
        <div className="flex-1 py-6">
          <div className="space-y-4">
            <h4 className="text-[14px] font-bold text-neutral-800 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0d9488]" />
              {data.title}
            </h4>
            <p className="text-[12px] text-neutral-600 leading-relaxed pl-3.5 whitespace-pre-wrap">
              {data.content}
            </p>
          </div>
        </div>
        <div className="text-center text-[10px] text-black/40 border-t border-black/5 pt-4">
          Page {pageIdx + 1}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-70px)] flex flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          eyebrow="Platform Help & Guides"
          title="Superadmin User Manual"
          description="Comprehensive guide and operations manual for the Retrod Platform Administration Console."
          actions={
            <Button size="sm" onClick={handleOpenForm} className="flex items-center gap-2 z-30 relative">
              {manualData ? <Edit className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {manualData ? "Edit Manual" : "Create Manual"}
            </Button>
          }
        />
      </div>

      {/* GPU-Accelerated 3D Scene Wrapper (Zero Scroll, Centered) */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-hidden select-none">
        <div 
          style={{ perspective: "2500px" }}
          className="relative w-full max-w-4xl max-h-[calc(100vh-200px)] aspect-[1.6/1] flex items-center justify-center"
        >
          {/* Invisible Click Areas */}
          <div 
            className={`absolute left-0 top-0 w-1/2 h-full z-40 ${currentSpread > 0 ? 'cursor-pointer' : 'pointer-events-none'}`} 
            onClick={handlePrev} 
          />
          <div 
            className={`absolute right-0 top-0 w-1/2 h-full z-40 ${currentSpread < totalSpreads - 1 ? 'cursor-pointer' : 'pointer-events-none'}`} 
            onClick={handleNext} 
          />

          {/* Book Alignment Helper */}
          <motion.div 
            animate={{ x: currentSpread > 0 ? 0 : "-25%" }}
            transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full h-full flex"
          >
            {/* STATIC LEFT PAGE */}
            <div 
              className={`absolute left-0 top-0 w-1/2 h-full z-0 transition-opacity duration-500 ${
                currentSpread > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{ transform: "translateZ(-2px)" }}
            >
              <PageFace data={staticLeft.data} pageIdx={staticLeft.pageIdx} isCover={staticLeft.isCover} shape="left" />
            </div>

            {/* STATIC RIGHT PAGE */}
            <div 
              className="absolute right-0 top-0 w-1/2 h-full z-0"
              style={{ transform: "translateZ(-2px)" }}
            >
              <PageFace data={staticRight.data} pageIdx={staticRight.pageIdx} isCover={staticRight.isCover} shape="right" />
            </div>

            {/* FLIPPING LEAF (Hinged at center) */}
            <motion.div 
              key={pageFlipKey}
              className="absolute right-0 top-0 w-1/2 h-full origin-left z-20 pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
              initial={{ rotateY: initialRotateY }}
              animate={{
                rotateY: animateRotateY,
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 1.1,
                ease: "easeInOut",
              }}
            >
              {/* FRONT OF THE LEAF COVER */}
              <div 
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg) translateZ(1px)" }}
              >
                <PageFace data={leafFront.data} pageIdx={leafFront.pageIdx} isCover={leafFront.isCover} shape="right" />
              </div>

              {/* BACK OF THE LEAF COVER */}
              <div 
                className="absolute inset-0"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }}
              >
                <PageFace data={leafBack.data} pageIdx={leafBack.pageIdx} isCover={leafBack.isCover} shape="left" />
              </div>
            </motion.div>

            {/* CENTER SPINE CREASE DETAIL */}
            <div 
              className={`absolute top-0 bottom-0 w-[12px] bg-gradient-to-r from-black/25 via-transparent to-black/25 pointer-events-none z-30 left-1/2 -ml-[6px] transition-opacity duration-1000 ${
                currentSpread > 0 ? "opacity-100" : "opacity-0"
              }`} 
            />
          </motion.div>
        </div>
      </div>

      {/* Manual Content Creation / Editing Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="sm:max-w-[580px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{manualData ? "Edit Guidebook Manual" : "Create Guidebook Manual"}</AlertDialogTitle>
            <AlertDialogDescription>
              Configure the default handbook contents displayed in the bi-fold brochure template.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Guide Title</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Retrod Superadmin Guide"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Subtitle</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Standard Procedures"
                  value={formFields.subtitle}
                  onChange={(e) => setFormFields({ ...formFields, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Dynamic Pages Forms */}
            <div className="space-y-6">
              {formFields.pages.map((p, idx) => (
                <div key={idx} className="border border-border/80 rounded-xl p-4 bg-surface-2/30 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-extrabold text-primary uppercase tracking-wider">Page {idx + 1}</span>
                    {formFields.pages.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => removePage(idx)}
                        className="text-error hover:text-error-hover p-1 rounded transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      className={inputCls}
                      placeholder={`Page ${idx + 1} Topic Title`}
                      value={p.title}
                      onChange={(e) => updatePageTitle(idx, e.target.value)}
                    />
                    <textarea
                      className={textareaCls}
                      placeholder={`Page ${idx + 1} Content Details`}
                      value={p.content}
                      onChange={(e) => updatePageContent(idx, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Page Button */}
            <button
              type="button"
              onClick={addPage}
              className="w-full py-2.5 border border-dashed border-primary/45 text-primary hover:bg-primary/5 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Page
            </button>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} className="bg-primary hover:bg-primary-hover text-white">
              Save Manual
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// Trigger HMR
