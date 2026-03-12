"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, Coffee, CakeSlice, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FoodCard } from "@/components/ui/FoodCard";
import { api } from "@/lib/axios";
import { MenuItem } from "@/types";

export default function Home() {
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
         // Sort by some criteria if available, for now just fetch a limit
        const res = await api.get('/menu-items?limit=8');
        setPopularItems(res.data.data);
      } catch (error) {
        console.error("Failed to fetch popular items", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularItems();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8 xl:py-32">
        {/* Giant Figma-style background circle */}
        <div className="absolute right-0 top-0 h-[800px] w-[800px] -translate-y-[10%] translate-x-[20%] rounded-full bg-secondary hidden lg:block" />
        
        <div className="container relative mx-auto max-w-7xl z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 mb-6 text-sm font-semibold text-foreground border border-foreground/5 shadow-sm">
                <FileText className="h-4 w-4" />
                <span>Food Ordering Service</span>
              </div>
              <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-6 leading-[1.1]">
                Where Great Food
                <br />
                Meets <span className="font-serif italic font-normal text-primary">Great Taste.</span>
              </h1>
              <p className="text-lg text-foreground/70 mb-8 max-w-lg leading-relaxed">
                Experience a symphony of flavors crafted with passion. Premium ingredients, exquisite recipes, delivered to your door.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/menu">
                  <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary-hover">
                    View Menu &rarr;
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end lg:pl-10">
              <div className="relative w-[450px] h-[450px] md:w-[600px] md:h-[600px] lg:scale-110 lg:translate-x-12 z-10">
                <Image
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                  alt="Delicious food plate"
                  fill
                  className="object-cover rounded-full shadow-2xl shadow-primary/20"
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <div className="absolute bottom-10 -left-10 inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-xl border border-foreground/5">
                  <div className="p-2 bg-secondary rounded-full text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground/60">Avg. Delivery</span>
                    <span className="text-sm font-bold text-foreground">22 Minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Curated Categories</h2>
            <p className="text-foreground/60">Explore our diverse menu of culinary delights.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/menu?category=starters" className="group flex flex-col items-center p-8 rounded-3xl bg-secondary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all text-center">
              <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-soft">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Starters</h3>
            </Link>
            <Link href="/menu?category=main" className="group flex flex-col items-center p-8 rounded-3xl bg-secondary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all text-center">
              <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-soft">
                <Coffee className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Main Courses</h3>
            </Link>
            <Link href="/menu?category=desserts" className="group flex flex-col items-center p-8 rounded-3xl bg-secondary hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all text-center">
              <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-soft">
                <CakeSlice className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Desserts</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/50 border-t border-foreground/5">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Items</h2>
              <p className="text-foreground/60">Our most ordered and highly rated dishes.</p>
            </div>
            <Link href="/menu" className="shrink-0">
              <Button variant="outline">View Full Menu</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-2xl bg-white p-4 shadow-soft h-[380px]">
                  <div className="h-48 w-full bg-secondary rounded-xl mb-4"></div>
                  <div className="h-6 w-3/4 bg-secondary rounded-md mb-2"></div>
                  <div className="h-4 w-full bg-secondary rounded-md mb-4"></div>
                  <div className="h-10 w-full bg-secondary rounded-xl mt-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
