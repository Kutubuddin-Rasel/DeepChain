"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Utensils,
  ChefHat,
  CakeSlice,
  FileText,
  Flame,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LandingFoodCard } from "@/components/ui/LandingFoodCard";
import {
  landingCategories,
  landingItems,
  LandingCategory,
} from "@/lib/landingFixtures";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>(
    landingCategories[0]?.id ?? "starters"
  );
  const [cardsVisible, setCardsVisible] = useState(true);
  const menuSectionRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = useMemo(() => {
    return landingItems.filter((item) => item.categoryId === activeCategory).slice(0, 4);
  }, [activeCategory]);

  const categoryIcons = [Utensils, ChefHat, CakeSlice];
  const handleCategoryPick = useCallback((categoryId: string) => {
    if (categoryId === activeCategory) return;
    // Fade out
    setCardsVisible(false);
    setTimeout(() => {
      setActiveCategory(categoryId);
      setCardsVisible(true);
    }, 180);
    menuSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeCategory]);

  return (
    <div className="flex flex-col font-landing text-forest bg-white">
      {/* Hero Section — split layout: left white, right cream full-bleed */}
      <section
        className="relative"
        style={{ background: "linear-gradient(to right, #ffffff 50%, #f5f0e0 50%)" }}
      >

        <div className="relative mx-auto w-full max-w-310 px-6 md:px-10">
          <div className="flex flex-col lg:flex-row min-h-120">
            {/* Left — content */}
            <div className="flex w-full flex-col justify-center lg:w-1/2 py-14 lg:py-20 lg:pr-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-md bg-[#ede9df] px-3 py-1.5 text-[11px] font-semibold text-forest">
                <FileText className="h-3 w-3" />
                <span>Food Ordering Service</span>
              </div>
              <h1 className="mt-5 font-serif text-[52px] font-extrabold leading-[1.08] text-forest">
                Where Great Food
                <br />
                Meets <span className="font-serif italic font-normal">Great Taste.</span>
              </h1>
              <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-forest/65">
                Experience a symphony of flavors crafted with passion. Premium ingredients, exquisite recipes, delivered to your door.
              </p>
              <div className="mt-8">
                <Link href="/menu">
                  <Button
                    size="sm"
                    className="h-10 rounded-full px-6 text-[13px] font-semibold bg-primary hover:bg-primary-hover"
                  >
                    View Menu &rarr;
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — hero image on cream bg */}
            <div className="relative flex w-full lg:w-1/2 items-center justify-center py-14 lg:py-0 overflow-visible">
              {/* Circular image frame */}
              <div className="relative h-85 w-85 rounded-full bg-[#e8e0cc] flex items-center justify-center overflow-hidden">
                <Image
                  src="/foodio_design/top-right-corner.png"
                  alt="Foodio hero dish"
                  fill
                  className="object-contain"
                  sizes="340px"
                  priority
                />
              </div>

              {/* Floating badge — Today's Offer (top-right inside cream panel) */}
              <div className="absolute top-10 right-6 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted font-medium leading-none mb-0.5">Today&apos;s Offer</p>
                  <p className="text-forest text-[13px] font-bold leading-tight">Free Delivery</p>
                </div>
              </div>

              {/* Floating badge — Avg. Delivery (bottom-left, overlapping divider) */}
              <div className="absolute bottom-10 -left-4 lg:-left-6 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede9df] text-forest">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted font-medium leading-none mb-0.5">Avg. Delivery</p>
                  <p className="text-forest text-[13px] font-bold leading-tight">22 Minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section ref={menuSectionRef} className="py-25 bg-white">
        <div className="mx-auto w-full max-w-310 px-6 md:px-10">
          <div className="text-center mb-10">
            <h2 className="font-serif font-bold mb-2 text-[clamp(1.7rem,2.6vw,2.3rem)] text-forest">
              Curated Categories
            </h2>
            <p className="text-forest/55 text-[15px]">Explore our diverse menu of culinary delights.</p>
          </div>

          <div className="flex items-stretch justify-center gap-14 max-w-xl mx-auto px-1">
            {landingCategories.map((cat: LandingCategory, index: number) => {
              const Icon = categoryIcons[index] ?? Utensils;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryPick(cat.id)}
                  className={`cursor-pointer flex flex-1 flex-col items-center gap-3 py-7 rounded-2xl border-2 transition-all duration-200 ${isActive
                      ? "bg-[#eae5d6] border-[#c8bc99]"
                      : "bg-[#f6f3ec] border-transparent hover:border-forest/15 hover:bg-[#f0ede4]"
                    }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-forest text-sm font-semibold">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dish Cards */}
      <section className="pb-24 md:px-10 bg-white">
        <div
          className={`grid grid-cols-1 px-5 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-350 mx-auto transition-all duration-180 ${
            cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          {visibleItems.map((item) => (
            <LandingFoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
