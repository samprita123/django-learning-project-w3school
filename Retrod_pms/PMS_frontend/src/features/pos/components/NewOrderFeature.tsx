import { useState, useEffect } from "react";
import { Search, Barcode, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { CartFeature, CartItem } from "./CartFeature";
import { ModifierModal } from "./ModifierModal";

// Mock Product Database
const CATEGORIES = ["All", "Foods", "Drinks", "Snacks", "Desserts"];
const PRODUCTS = [
  { id: "p1", name: "Butter Chicken", category: "Foods", price: 450, image: "🍲" },
  { id: "p2", name: "Garlic Naan", category: "Foods", price: 60, image: "🫓" },
  { id: "p3", name: "Paneer Tikka", category: "Snacks", price: 320, image: "🍢" },
  { id: "p4", name: "Cold Coffee", category: "Drinks", price: 180, image: "🥤" },
  { id: "p5", name: "Masala Chai", category: "Drinks", price: 50, image: "☕" },
  { id: "p6", name: "Gulab Jamun", category: "Desserts", price: 120, image: "🧁" },
  { id: "p7", name: "French Fries", category: "Snacks", price: 150, image: "🍟" },
  { id: "p8", name: "Veg Burger", category: "Snacks", price: 190, image: "🍔" },
  { id: "p9", name: "Chicken Biryani", category: "Foods", price: 380, image: "🍛" },
  { id: "p10", name: "Chocolate Brownie", category: "Desserts", price: 200, image: "🍰" },
];

export function NewOrderFeature() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modifierProduct, setModifierProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  useEffect(() => {
    if (sessionStorage.getItem("edit_pos_order") === "true") {
      try {
        const data = localStorage.getItem("pos_latest_order");
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.items && Array.isArray(parsed.items)) {
            setCart(parsed.items);
          }
        }
      } catch (e) {
        // ignore
      }
      sessionStorage.removeItem("edit_pos_order");
    }
  }, []);

  // Derived State
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Cart Actions
  const addToCart = (product: typeof PRODUCTS[0]) => {
    if (product.category === "Foods" || product.category === "Drinks") {
      setModifierProduct(product);
      return;
    }
    
    commitToCart(product.id, product.name, product.price);
  };

  const commitToCart = (id: string, name: string, price: number, variant?: string) => {
    setCart((prev) => {
      const matchIndex = prev.findIndex((item) => item.id === id && item.variant === variant);
      if (matchIndex >= 0) {
        const next = [...prev];
        next[matchIndex].qty += 1;
        return next;
      }
      return [...prev, { id, name, price, qty: 1, variant }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-surface-2 overflow-hidden relative">
      {/* Left Panel: Products */}
      <div className={`flex-1 flex-col min-w-0 ${isMobileCartOpen ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Top Toolbar */}
        <div className="p-4 bg-surface border-b border-border flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="h-9 w-9 flex items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary">
            <Barcode className="h-4 w-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 border-b border-border bg-surface-2/30 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "bg-surface border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-e2 transition-all group flex flex-col active:scale-95 text-left"
              >
                <div className="aspect-square bg-surface-2 flex items-center justify-center text-4xl w-full">
                  {p.image}
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <h3 className="text-[12px] font-medium leading-tight text-text-primary line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="mt-1.5 font-mono text-[13px] font-semibold text-primary">
                    ₹{p.price}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View Cart Button */}
        {cart.length > 0 && (
          <div className="lg:hidden p-4 bg-surface border-t border-border mt-auto shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
             <Button variant="primary" className="w-full h-12 text-[15px] flex justify-between px-4" onClick={() => setIsMobileCartOpen(true)}>
               <div className="flex items-center gap-2">
                 <ShoppingCart className="h-4 w-4" />
                 <span>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
               </div>
               <span className="font-bold flex items-center">
                 View Cart (₹{cartTotal}) <ArrowRight className="h-4 w-4 ml-2" />
               </span>
             </Button>
          </div>
        )}
      </div>

      {/* Right Panel: Cart */}
      <CartFeature 
        items={cart} 
        updateQty={updateQty} 
        removeItem={removeItem}
        clearCart={clearCart}
        isMobileOpen={isMobileCartOpen}
        onCloseMobile={() => setIsMobileCartOpen(false)}
      />

      {/* Modals */}
      {modifierProduct && (
        <ModifierModal
          productName={modifierProduct.name}
          basePrice={modifierProduct.price}
          onClose={() => setModifierProduct(null)}
          onSave={(variant, modPrice) => {
            commitToCart(
              modifierProduct.id, 
              modifierProduct.name, 
              modifierProduct.price + modPrice,
              variant
            );
            setModifierProduct(null);
          }}
        />
      )}
    </div>
  );
}
