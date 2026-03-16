"use client";

import { useEffect, useState, useMemo, useDeferredValue, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { menuService } from "@/services/menu.service";
import { categoriesService } from "@/services/categories.service";
import { MenuItem, Category } from "@/types";
import { FoodCard } from "@/components/ui/FoodCard";
import { Button } from "@/components/ui/Button";

// 1. We extract all the logic that uses search parameters into an internal component
function MenuContent() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available">("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          menuService.list({ limit: 100 }),
          categoriesService.list(),
        ]);
        setItems(itemsRes.data);
        setCategories(catsRes);
      } catch (error) {
        console.error("Failed to fetch menu data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (!categoryParam) {
      setActiveCategory("all");
      return;
    }

    const normalized = categoryParam.toLowerCase();
    const byId = categories.find((cat) => cat.id === categoryParam);
    const bySlug = categories.find((cat) =>
      cat.name.toLowerCase().replace(/\s+/g, "-") === normalized
    );

    setActiveCategory(byId?.id ?? bySlug?.id ?? "all");
  }, [searchParams, categories]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (activeCategory !== "all") {
      result = result.filter(item => item.categoryId === activeCategory);
    }

    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }

    if (availabilityFilter === "available") {
      result = result.filter(item => item.available);
    }

    result.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [items, activeCategory, deferredSearchQuery, availabilityFilter, sortBy]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`cursor-pointer whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors border ${activeCategory === "all"
                ? "bg-primary text-white border-primary shadow-soft"
                : "bg-transparent text-foreground/70 border-foreground/25 hover:border-foreground/50 hover:text-foreground"
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors border ${activeCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-soft"
                  : "bg-transparent text-foreground/70 border-foreground/25 hover:border-foreground/50 hover:text-foreground"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search, Availability & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-foreground/40">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-11 w-full rounded-full border border-foreground/20 bg-transparent px-4 pl-10 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-foreground/10 bg-secondary px-2 py-1.5">
            <button
              type="button"
              onClick={() => setAvailabilityFilter("all")}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${availabilityFilter === "all"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter("available")}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${availabilityFilter === "available"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
                }`}
            >
              Available
            </button>
          </div>
          <div className="relative shrink-0">
            <select
              title="Sort items"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc")}
              className="cursor-pointer h-11 appearance-none rounded-full bg-primary pl-5 pr-10 text-sm font-medium text-white outline-none border-transparent"
            >
              <option value="newest">Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <MenuSkeleton />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 pt-12">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-foreground/5">
          <div className="mb-4 rounded-full bg-secondary p-4 text-foreground/40">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-bold text-foreground">No dishes found</h3>
          <p className="text-foreground/60 max-w-sm">
            We couldn&apos;t find any items matching &quot;{searchQuery}&quot;. Try selecting a different category or adjusting your search.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(""); setActiveCategory("all"); setAvailabilityFilter("all"); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
}

// 2. A reusable skeleton component for both the Suspense fallback and the loading state
function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 pt-12">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse flex flex-col rounded-2xl bg-white p-4 shadow-soft h-95">
          <div className="h-48 w-full bg-secondary rounded-xl mb-4"></div>
          <div className="h-6 w-3/4 bg-secondary rounded-md mb-2"></div>
          <div className="h-4 w-full bg-secondary rounded-md mb-4"></div>
          <div className="h-10 w-full bg-secondary rounded-xl mt-auto"></div>
        </div>
      ))}
    </div>
  );
}

// 3. The main page export now safely wraps the dynamic content in a Suspense boundary
export default function MenuPage() {
  return (
    <div className="mx-auto w-full max-w-300 px-6 py-12 flex-1">
      {/* This header is static, so it renders instantly on the server! */}
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-foreground">Our Menu</h1>
        <p className="text-foreground/60 text-base mt-1">
          Discover our selection of premium dishes, crafted with passion.
        </p>
      </div>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuContent />
      </Suspense>
    </div>
  );
}