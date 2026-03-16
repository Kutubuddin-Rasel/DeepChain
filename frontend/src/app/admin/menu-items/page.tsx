"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus, Edit2, Trash2, X, UploadCloud } from "lucide-react";
import { menuService } from "@/services/menu.service";
import { categoriesService } from "@/services/categories.service";
import { MenuItem, Category, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminMenuItemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  const pageParam = Number(searchParams.get("page"));
  const initialPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const [menuPage, setMenuPage] = useState(initialPage);
  const menuLimit = 12;
  
  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuMeta, setMenuMeta] = useState<PaginatedResponse<MenuItem>["meta"] | null>(null);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State - Item
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Category
  const [categoryName, setCategoryName] = useState("");

  const fetchMenuItems = useCallback(async (pageOverride?: number) => {
    setIsMenuLoading(true);
    try {
      const res = await menuService.list({ page: pageOverride ?? menuPage, limit: menuLimit });
      setMenuItems(res.data);
      setMenuMeta(res.meta);
    } catch {
      toast.error("Failed to fetch menu items");
    } finally {
      setIsMenuLoading(false);
    }
  }, [menuLimit, menuPage]);

  const fetchCategories = useCallback(async () => {
    setIsCategoryLoading(true);
    try {
      const catsRes = await categoriesService.list();
      setCategories(catsRes);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setIsCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setMenuPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    fetchMenuItems(menuPage);
  }, [fetchMenuItems, menuPage]);

  const resetItemForm = () => {
    setItemForm({ name: "", price: "", categoryId: "", description: "", available: true });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
  };

  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsCategoryModalOpen(true);
  };

  const handleOpenItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        price: item.price.toString(),
        categoryId: item.categoryId,
        description: item.description,
        available: item.available,
      });
      setImagePreview(item.image);
    } else {
      resetItemForm();
    }
    setIsItemModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", itemForm.name);
      formData.append("price", itemForm.price);
      formData.append("categoryId", itemForm.categoryId);
      formData.append("description", itemForm.description);
      formData.append("available", String(itemForm.available));
      if (imageFile) formData.append("image", imageFile);

      if (editingItem) {
        await menuService.update(editingItem.id, formData);
        toast.success("Menu item updated");
      } else {
        await menuService.create(formData);
        toast.success("Menu item created");
      }
      
      setIsItemModalOpen(false);
      fetchMenuItems(menuPage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save item");
      } else {
        toast.error("Failed to save item");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await menuService.remove(id);
      toast.success("Item deleted");
      fetchMenuItems(menuPage);
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, categoryName);
        toast.success("Category updated");
      } else {
        await categoriesService.create(categoryName);
        toast.success("Category created");
      }
      setIsCategoryModalOpen(false);
      setCategoryName("");
      setEditingCategory(null);
      fetchCategories();
      fetchMenuItems(menuPage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save category");
      } else {
        toast.error("Failed to save category");
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will fail if items exist in this category.")) return;
    try {
      await categoriesService.remove(id);
      toast.success("Category deleted");
      fetchCategories();
      fetchMenuItems(menuPage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Category cannot be deleted");
      } else {
        toast.error("Category cannot be deleted");
      }
    }
  };

  const handleMenuPageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    setMenuPage(nextPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/admin/menu-items?${params.toString()}`);
  };

  if ((activeTab === "menu" && isMenuLoading) || (activeTab === "categories" && isCategoryLoading)) {
    return <div className="p-8 text-foreground/50">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-250 mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-foreground/10">
        <h1 className="font-serif text-2xl font-bold text-foreground">Menu Items</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-[#F7F4EF] p-1.5 rounded-full border border-foreground/10">
          <button
            onClick={() => setActiveTab("menu")}
            className={`cursor-pointer px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "menu" ? "bg-white text-black shadow-sm" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`cursor-pointer px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === "categories" ? "bg-white text-black shadow-sm" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === "menu" ? (
          <button
            onClick={() => handleOpenItemModal()}
            className="cursor-pointer flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        ) : (
          <button
            onClick={() => handleOpenCategoryModal()}
            className="cursor-pointer flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </button>
        )}
      </div>

      {/* Tables Container */}
      <div className="bg-white rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
        {activeTab === "menu" && (
          <>
            <table className="w-full text-left text-sm text-foreground/80">
              <thead className="bg-[#F7F4EF] text-foreground font-semibold border-b border-foreground/10">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100 text-black">
                    <td className="px-6 py-3 font-medium">{item.name}</td>
                    <td className="px-6 py-3">{item.category?.name}</td>
                    <td className="px-6 py-3">${Number(item.price).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 font-semibold rounded-full ${
                        item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-3">
                      <button onClick={() => handleOpenItemModal(item)} className="cursor-pointer text-foreground/40 hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4 inline" />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="cursor-pointer text-foreground/40 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-foreground/50">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {menuMeta && menuMeta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/10 bg-[#FBFAF8]">
                <span className="text-sm text-foreground/60">
                  Page {menuMeta.page} of {menuMeta.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMenuPageChange(menuPage - 1)}
                    disabled={menuPage <= 1}
                    className="cursor-pointer rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleMenuPageChange(menuPage + 1)}
                    disabled={menuMeta.totalPages === 0 || menuPage >= menuMeta.totalPages}
                    className="rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-foreground/70 hover:text-foreground disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "categories" && (
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="bg-[#F7F4EF] text-foreground font-semibold border-b border-foreground/10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-100 text-black">
                  <td className="px-6 py-3 font-medium">{cat.name}</td>
                  <td className="px-6 py-3 text-right space-x-3">
                    <button onClick={() => handleOpenCategoryModal(cat)} className="cursor-pointer text-foreground/40 hover:text-primary transition-colors">
                      <Edit2 className="h-4 w-4 inline" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="cursor-pointer text-foreground/40 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-foreground/50">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-[#FBF7F2] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-foreground/10">
            <div className="flex justify-between items-center p-6 border-b border-foreground/5">
              <h2 className="text-lg font-bold text-foreground">{editingItem ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="cursor-pointer text-foreground/40 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-5 text-sm text-black">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium">Name</label>
                  <input
                    required
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium">Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium">Category</label>
                <select
                  required
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Image</label>
                <div 
                  className="border-2 border-dashed border-foreground/20 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-foreground/5 transition-colors bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                  />
                  <UploadCloud className="h-8 w-8 text-foreground/40 mb-2" />
                  <p className="text-xs font-medium text-foreground">Drag or click <span className="font-bold">here</span> to upload</p>
                  <p className="text-[10px] text-foreground/50 mt-1">Size must be maximum 2mb. Supported formats: PNG & JPEG</p>
                  
                  {imagePreview && (
                    <div className="mt-4 px-4 py-2 bg-secondary rounded-lg flex items-center justify-between w-full">
                      <span className="text-sm truncate max-w-50">{imageFile?.name || "current_image.png"}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="cursor-pointer text-foreground/50 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemForm({ ...itemForm, available: !itemForm.available })}
                  className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${itemForm.available ? 'bg-primary' : 'bg-foreground/20'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${itemForm.available ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-xs font-medium text-foreground">Available for Order</span>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="cursor-pointer bg-primary text-white px-6 py-2 rounded-full text-xs font-medium hover:bg-primary-hover transition-colors disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    "Save Changes"
                  ) : (
                    "Add Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-[#FBF7F2] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-foreground/10">
            <div className="flex justify-between items-center p-5 border-b border-foreground/10">
              <h2 className="text-xl font-bold text-primary">{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                  setCategoryName("");
                }}
                className="cursor-pointer text-foreground/40 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-sm text-black">
              <div className="space-y-1">
                <label className="font-medium">Name</label>
                <input
                  required
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                  placeholder="e.g. Beverages"
                />
              </div>
              <button type="submit" className="cursor-pointer self-end bg-primary text-white px-6 py-2 rounded-full text-xs font-medium hover:bg-primary-hover transition-colors">
                {editingCategory ? "Save Changes" : "Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
