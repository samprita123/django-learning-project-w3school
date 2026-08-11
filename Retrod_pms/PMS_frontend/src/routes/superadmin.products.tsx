import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, Card, Button, StatusBadge } from "@/components/ui/Primitives";
import { Puzzle, Check, X, ShieldAlert, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { subscriptionApi, type Product, type ProductFeature } from "@/services/api/subscription";
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

export const Route = createFileRoute("/superadmin/products")({
  head: () => ({ meta: [{ title: "Products & Features" }] }),
  component: SuperadminProductsComponent,
});

const inputCls =
  "h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const selectCls =
  "h-9 rounded-md border border-border bg-surface px-2 text-[13px] text-text-primary focus:border-primary focus:outline-none";

const generateCodeFromName = (nameStr: string) => {
  return nameStr
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s_]/g, "")
    .replace(/\s+/g, "_");
};

function SuperadminProductsComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected product for drawer view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals / Editors state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productDraft, setProductDraft] = useState({ id: "", code: "", name: "", description: "", is_active: true });

  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureDraft, setFeatureDraft] = useState({ id: "", product: "", code: "", name: "", description: "", price: 0, is_active: true });

  const [deleteTarget, setDeleteTarget] = useState<{ type: "product" | "feature"; id: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, feats] = await Promise.all([
        subscriptionApi.getProducts(),
        subscriptionApi.getFeatures(),
      ]);
      setProducts(prods);
      setFeatures(feats);
      
      // Update selected product reference if drawer is open to keep features in sync
      if (selectedProduct) {
        const updatedSelected = prods.find(p => p.id === selectedProduct.id);
        if (updatedSelected) {
          setSelectedProduct(updatedSelected);
        } else {
          setSelectedProduct(null);
        }
      }
    } catch (err: any) {
      toast.error("Failed to load products/features: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProduct = async () => {
    if (!productDraft.name || !productDraft.code) {
      toast.error("Please provide a name and code.");
      return;
    }
    try {
      if (productDraft.id) {
        await subscriptionApi.updateProduct(productDraft.id, {
          name: productDraft.name,
          code: productDraft.code,
          description: productDraft.description,
          is_active: productDraft.is_active,
        });
        toast.success("Product updated successfully.");
      } else {
        await subscriptionApi.createProduct({
          name: productDraft.name,
          code: productDraft.code,
          description: productDraft.description,
          is_active: productDraft.is_active,
        });
        toast.success("Product created successfully.");
      }
      setProductModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Error saving product: " + err.message);
    }
  };

  const handleSaveFeature = async () => {
    if (!featureDraft.name || !featureDraft.code || !featureDraft.product) {
      toast.error("Please provide a name, code, and select a product.");
      return;
    }
    try {
      if (featureDraft.id) {
        await subscriptionApi.updateProductFeature(featureDraft.id, {
          name: featureDraft.name,
          code: featureDraft.code,
          description: featureDraft.description,
          price: Number(featureDraft.price || 0),
          is_active: featureDraft.is_active,
          product: featureDraft.product,
        });
        toast.success("Feature updated successfully.");
      } else {
        await subscriptionApi.createProductFeature({
          name: featureDraft.name,
          code: featureDraft.code,
          description: featureDraft.description,
          price: Number(featureDraft.price || 0),
          is_active: featureDraft.is_active,
          product: featureDraft.product,
        });
        toast.success("Feature created successfully.");
      }
      setFeatureModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Error saving feature: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "product") {
        await subscriptionApi.deleteProduct(deleteTarget.id);
        toast.success("Product deleted successfully.");
        if (selectedProduct?.id === deleteTarget.id) {
          setSelectedProduct(null);
        }
      } else {
        await subscriptionApi.deleteProductFeature(deleteTarget.id);
        toast.success("Feature deleted successfully.");
      }
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error("Error deleting: " + err.message);
    }
  };

  const handleToggleProductStatus = async (p: Product) => {
    try {
      await subscriptionApi.updateProduct(p.id, { is_active: !p.is_active });
      toast.success(`${p.name} status updated.`);
      loadData();
    } catch (err: any) {
      toast.error("Error updating status: " + err.message);
    }
  };

  const handleToggleFeatureStatus = async (f: ProductFeature) => {
    try {
      await subscriptionApi.updateProductFeature(f.id, { is_active: !f.is_active });
      toast.success(`${f.name} status updated.`);
      loadData();
    } catch (err: any) {
      toast.error("Error updating status: " + err.message);
    }
  };

  // Helper to check if product is "New" (onboarded < 30 days ago)
  const isProductNew = (p: Product) => {
    if (!p.created_at) return false;
    const createdDate = new Date(p.created_at);
    const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  // Helper to check if product is "Hot" (trending/most used - e.g. code is "pms" or "crm")
  const isProductHot = (p: Product) => {
    const code = p.code.toLowerCase();
    return code === "pms" || code === "crm";
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform Capabilities"
        title="Products & Features"
        description="Configure globally available PMS products, applications, and core features."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setProductDraft({ id: "", code: "", name: "", description: "", is_active: true });
                setProductModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New Product
            </Button>
          </div>
        }
      />

      <div className="responsive-page-x py-6 space-y-6">
        <Card className="p-4 bg-[oklch(0.96_0.06_70)]/30 border border-warning/30 flex gap-3 rounded-lg">
          <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-text-primary">
            <div className="font-semibold text-warning">Global Feature Flag Warning</div>
            <p className="mt-1 text-text-secondary leading-relaxed">
              Disabling a product globally will override tenant configuration overrides and instantly block
              access across all active hotels. Proceed with care.
            </p>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-[13px] text-text-secondary">Loading products and features...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => {
              const productFeatures = features.filter((f) => f.product === p.id);
              const isNew = isProductNew(p);
              const isHot = isProductHot(p);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Glassmorphic/Gradient background highlights */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                  
                  <div>
                    {/* Tags & Actions top bar */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {isHot && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-error/10 text-error animate-pulse">
                            🔥 Hot
                          </span>
                        )}
                        {isNew && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary-tint text-primary-pressed">
                            ✨ New
                          </span>
                        )}
                        <StatusBadge tone={p.is_active ? "success" : "neutral"}>
                          {p.is_active ? "Active" : "Disabled"}
                        </StatusBadge>
                      </div>

                      {/* Small Actions */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setProductDraft({ id: p.id, code: p.code, name: p.name, description: p.description || "", is_active: p.is_active });
                            setProductModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-surface-2 text-text-secondary transition"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "product", id: p.id })}
                          className="p-1 rounded hover:bg-error-tint hover:text-error text-text-secondary transition"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Product Metadata */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-primary-tint text-primary-pressed">
                        <Puzzle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary text-[15px] group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                        <span className="font-mono text-[11px] text-text-secondary block">
                          {p.code}
                        </span>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-text-secondary line-clamp-3 mb-6">
                      {p.description || "No description provided."}
                    </p>
                  </div>

                  {/* Feature count footer */}
                  <div className="border-t border-border-subtle pt-3 mt-auto flex items-center justify-between text-[12px] text-text-secondary">
                    <span className="font-medium">
                      {productFeatures.length} {productFeatures.length === 1 ? 'Feature' : 'Features'}
                    </span>
                    <span className="text-primary font-semibold group-hover:underline text-[12px]">
                      Manage Features &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Slider Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedProduct(null)}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge tone={selectedProduct.is_active ? "success" : "neutral"}>
                      {selectedProduct.is_active ? "Active" : "Disabled"}
                    </StatusBadge>
                    <span className="font-mono text-[11px] text-text-secondary">{selectedProduct.code}</span>
                  </div>
                  <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-primary" />
                    {selectedProduct.name}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {selectedProduct.description || "No description provided."}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-text-secondary">
                    Product Features
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFeatureDraft({
                        id: "",
                        product: selectedProduct.id,
                        code: `${selectedProduct.code.toUpperCase()}.`,
                        name: "",
                        description: "",
                        is_active: true
                      });
                      setFeatureModalOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Feature
                  </Button>
                </div>

                <div className="space-y-3">
                  {features.filter((f) => f.product === selectedProduct.id).length > 0 ? (
                    features
                      .filter((f) => f.product === selectedProduct.id)
                      .map((f) => (
                        <div
                          key={f.id}
                          className="p-3.5 rounded-lg border border-border bg-surface-2/40 hover:bg-surface-2/80 transition flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-[13px] text-text-primary truncate">
                                {f.name}
                              </span>
                              <span className="font-mono text-[10px] text-text-secondary px-1.5 py-0.5 rounded bg-surface border border-border">
                                {f.code}
                              </span>
                              <span className="font-mono text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                ${Number(f.price || 0).toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[12px] text-text-secondary line-clamp-2">
                              {f.description || "—"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant={f.is_active ? "primary" : "outline"}
                              className={f.is_active ? "h-7 text-[11px] px-2.5" : "h-7 text-[11px] px-2.5"}
                              onClick={() => handleToggleFeatureStatus(f)}
                            >
                              {f.is_active ? "Active" : "Disabled"}
                            </Button>
                            <button
                              onClick={() => {
                                setFeatureDraft({
                                  id: f.id,
                                  product: f.product,
                                  code: f.code,
                                  name: f.name,
                                  description: f.description || "",
                                  price: f.price || 0,
                                  is_active: f.is_active
                                });
                                setFeatureModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-surface text-text-secondary transition"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "feature", id: f.id })}
                              className="p-1 rounded hover:bg-error-tint hover:text-error text-text-secondary transition"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 rounded-lg border border-dashed border-border text-text-secondary text-[12.5px]">
                      No features configured. Add features to enable permissions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Product Modal */}
      <AlertDialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{productDraft.id ? "Edit Product" : "Create Product"}</AlertDialogTitle>
            <AlertDialogDescription>Provide the display name, code identifier, and details for the PMS product.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2 flex flex-col">
            <input
              className={inputCls}
              placeholder="Product Display Name"
              value={productDraft.name}
              onChange={(e) => {
                const nameVal = e.target.value;
                setProductDraft((prev) => ({
                  ...prev,
                  name: nameVal,
                  code: generateCodeFromName(nameVal),
                }));
              }}
            />
            <input
              className={inputCls}
              placeholder="Product Code (e.g. CHANNEL_MANAGER)"
              value={productDraft.code}
              onChange={(e) => {
                const codeVal = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
                setProductDraft((prev) => ({ ...prev, code: codeVal }));
              }}
            />
            <textarea
              className="rounded-md border border-border bg-surface p-2.5 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="Product Description"
              rows={3}
              value={productDraft.description}
              onChange={(e) => setProductDraft({ ...productDraft, description: e.target.value })}
            />
            <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary">
              <input
                type="checkbox"
                checked={productDraft.is_active}
                onChange={(e) => setProductDraft({ ...productDraft, is_active: e.target.checked })}
              />
              Globally Active
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProduct}>Save Product</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Feature Modal */}
      <AlertDialog open={featureModalOpen} onOpenChange={setFeatureModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{featureDraft.id ? "Edit Feature" : "Create Feature"}</AlertDialogTitle>
            <AlertDialogDescription>Configure specific features under a parent PMS product.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2 flex flex-col">
            <select
              className={selectCls}
              value={featureDraft.product}
              onChange={(e) => setFeatureDraft({ ...featureDraft, product: e.target.value })}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className={inputCls}
              placeholder="Feature Display Name"
              value={featureDraft.name}
              onChange={(e) => {
                const nameVal = e.target.value;
                setFeatureDraft((prev) => ({
                  ...prev,
                  name: nameVal,
                  code: generateCodeFromName(nameVal),
                }));
              }}
            />
            <input
              className={inputCls}
              placeholder="Feature Code (e.g. RETROD_BOOKING_ENGINE)"
              value={featureDraft.code}
              onChange={(e) => {
                const codeVal = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
                setFeatureDraft((prev) => ({ ...prev, code: codeVal }));
              }}
            />
            <textarea
              className="rounded-md border border-border bg-surface p-2.5 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="Feature Description"
              rows={3}
              value={featureDraft.description}
              onChange={(e) => setFeatureDraft({ ...featureDraft, description: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-text-secondary shrink-0">Feature Base Price ($):</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputCls + " flex-1"}
                placeholder="e.g. 49.00"
                value={featureDraft.price}
                onChange={(e) => setFeatureDraft({ ...featureDraft, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary">
              <input
                type="checkbox"
                checked={featureDraft.is_active}
                onChange={(e) => setFeatureDraft({ ...featureDraft, is_active: e.target.checked })}
              />
              Feature Active
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveFeature}>Save Feature</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {deleteTarget?.type} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default SuperadminProductsComponent;
