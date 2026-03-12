"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/axios";
import { MenuItem, Category } from "@/types";
import { FoodCard } from "@/components/ui/FoodCard";
import { Button } from "@/components/ui/Button";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Client-side filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          api.get('/menu-items?limit=100'), // Large limit to enable smooth client-side filtering
          api.get('/categories')
        ]);
        setItems(itemsRes.data.data);
        setCategories(catsRes.data);
      } catch (error) {
        console.error("Failed to fetch menu data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived state for filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter(item => item.categoryId === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      // newest (default fallback based on array order)
      return 0; 
    });

    return result;
  }, [items, activeCategory, searchQuery, sortBy]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl mb-4">Our Menu</h1>
        <p className="text-foreground/60 max-w-2xl mx-auto">
          Discover a world of flavors with our carefully curated menu featuring the finest ingredients.
        </p>
      </div>

      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-3xl shadow-sm border border-foreground/5">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-colors border ${
              activeCategory === "all"
                ? "bg-primary text-white border-primary shadow-soft"
                : "bg-transparent text-foreground/80 border-foreground/20 hover:border-foreground/40"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-colors border ${
                activeCategory === cat.id
                  ? "bg-primary text-white border-primary shadow-soft"
                  : "bg-transparent text-foreground/80 border-foreground/20 hover:border-foreground/40"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-72">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-foreground/40">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-full border border-foreground/20 bg-transparent px-4 pl-10 text-sm placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="relative shrink-0">
            <select
              title="Sort items"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc")}
              className="h-10 appearance-none rounded-full bg-primary pl-4 pr-10 text-sm font-medium text-white outline-none cursor-pointer border-transparent"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse flex flex-col rounded-2xl bg-white p-4 shadow-soft h-[380px]">
              <div className="h-48 w-full bg-secondary rounded-xl mb-4"></div>
              <div className="h-6 w-3/4 bg-secondary rounded-md mb-2"></div>
              <div className="h-4 w-full bg-secondary rounded-md mb-4"></div>
              <div className="h-10 w-full bg-secondary rounded-xl mt-auto"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
