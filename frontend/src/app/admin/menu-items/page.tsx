"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, UploadCloud } from "lucide-react";
import { api } from "@/lib/axios";
import { MenuItem, Category } from "@/types";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminMenuItemsPage() {
  const [activeTab, setActiveTab] = useState<"menu" | "categories">("menu");
  
  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get("/menu-items?limit=100"), // Fetch all for admin simple view
        api.get("/categories")
      ]);
      setMenuItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetItemForm = () => {
    setItemForm({ name: "", price: "", categoryId: "", description: "", available: true });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
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
    try {
      const formData = new FormData();
      formData.append("name", itemForm.name);
      formData.append("price", itemForm.price);
      formData.append("categoryId", itemForm.categoryId);
      formData.append("description", itemForm.description);
      formData.append("available", String(itemForm.available));
      if (imageFile) formData.append("image", imageFile);

      if (editingItem) {
        await api.patch(`/menu-items/${editingItem.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Menu item updated");
      } else {
        await api.post("/menu-items", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Menu item created");
      }
      
      setIsItemModalOpen(false);
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to save item");
      } else {
        toast.error("Failed to save item");
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/menu-items/${id}`);
      toast.success("Item deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await api.post("/categories", { name: categoryName });
      toast.success("Category created");
      setIsCategoryModalOpen(false);
      setCategoryName("");
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create category");
      } else {
        toast.error("Failed to create category");
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will fail if items exist in this category.")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Category cannot be deleted");
      } else {
        toast.error("Category cannot be deleted");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-foreground/50">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-foreground/10">
        <h1 className="font-serif text-3xl font-bold text-primary">Menu Items</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-[#F2EFE9] p-1 rounded-2xl border border-foreground/10">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "menu" ? "bg-white text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "categories" ? "bg-white text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === "menu" ? (
          <button
            onClick={() => handleOpenItemModal()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[56px] font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        ) : (
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-[56px] font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        )}
      </div>

      {/* Tables Container */}
      <div className="bg-white rounded-2xl border border-foreground/10 overflow-hidden shadow-sm">
        {activeTab === "menu" && (
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="bg-[#FBFAF8] text-foreground font-semibold border-b border-foreground/10">
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
                <tr key={item.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                  <td className="px-6 py-4">{item.category?.name}</td>
                  <td className="px-6 py-4">${Number(item.price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenItemModal(item)} className="text-foreground/50 hover:text-primary transition-colors">
                      <Edit2 className="h-4 w-4 inline" />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-foreground/50 hover:text-red-500 transition-colors">
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
        )}

        {activeTab === "categories" && (
          <table className="w-full text-left text-sm text-foreground/80">
            <thead className="bg-[#FBFAF8] text-foreground font-semibold border-b border-foreground/10">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-foreground/[0.02]">
                  <td className="px-6 py-4 font-medium text-foreground">{cat.name}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-foreground/50 hover:text-red-500 transition-colors">
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
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-foreground/5">
              <h2 className="text-xl font-bold text-primary">{editingItem ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-foreground/40 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/80">Name</label>
                  <input
                    required
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground/80">Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Category</label>
                <select
                  required
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Description</label>
                <textarea
                  required
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Image</label>
                <div 
                  className="border-2 border-dashed border-foreground/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-foreground/5 transition-colors"
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
                  <p className="text-sm font-medium text-foreground">Drag or click <span className="font-bold">here</span> to upload</p>
                  <p className="text-xs text-foreground/50 mt-1">Size must be maximum 2mb. Supported formats: PNG & JPEG</p>
                  
                  {imagePreview && (
                    <div className="mt-4 px-4 py-2 bg-secondary rounded-lg flex items-center justify-between w-full">
                      <span className="text-sm truncate max-w-[200px]">{imageFile?.name || "current_image.png"}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="text-foreground/50 hover:text-red-500">
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${itemForm.available ? 'bg-primary' : 'bg-foreground/20'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${itemForm.available ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-foreground">Available for Order</span>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-hover transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-foreground/5">
              <h2 className="text-xl font-bold text-primary">Add Category</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-foreground/40 hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground/80">Category Name</label>
                <input
                  required
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Beverages"
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-hover transition-colors">
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
