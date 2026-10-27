"use client";

/* eslint-disable @next/next/no-img-element */

import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProductCategories,
  getShopProfile,
  getVendorProducts,
  type ProductAddonGroup,
  type ProductCategory,
  type ProductSubcategory,
  type ShopProfile,
  type VendorProduct,
  type VendorProductCounts,
} from "@/lib/api/vendor";
import { errorMessage } from "@/components/vendor/ui";

// ─── Constants ───────────────────────────────────────────────────────────────

const GROCERY_UNIT_OPTIONS = [
  "kg", "g", "bag", "pack", "piece", "bottle", "crate", "carton", "bunch", "sachet",
  "can", "tuber", "wrap", "basket", "painter", "gallon", "litres", "dozen", "slot",
];

// Restaurants sell by plate/portion, not by weight.
const RESTAURANT_UNIT_OPTIONS = ["Plate", "Portion", "Pack", "Bowl", "Combo"];

const STATUS_TABS = ["all", "approved", "pending", "rejected"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 dark:bg-leaf-tint text-green-600 dark:text-leaf",
  pending: "bg-yellow-100 dark:bg-brand-tint text-yellow-600 dark:text-brand",
  rejected: "bg-red-100 dark:bg-clay-tint text-red-600 dark:text-clay",
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // matches upload-product.php

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-line bg-gray-50 dark:bg-bg px-3.5 py-3 text-sm text-gray-900 dark:text-ink outline-none focus:border-brand";
const labelCls = "mb-1.5 block text-[13px] font-bold text-gray-800 dark:text-ink";
const miniLabelCls = "mb-1 block text-[11px] font-semibold text-gray-400 dark:text-ink-soft";

const naira = (n: number) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;

const DEFAULT_IMAGE = "https://stockedup.africa/uploads/products/default.jpg";
function resolveImage(src?: string | null) {
  if (!src) return DEFAULT_IMAGE;
  if (src.startsWith("http")) return src;
  return `https://stockedup.africa/${src.startsWith("/") ? src.slice(1) : src}`;
}

// ─── Form types ──────────────────────────────────────────────────────────────

interface AddonOptionForm {
  localId: string;
  id?: number;
  name: string;
  price: string;
  maxQuantity: string;
}

interface AddonGroupForm {
  localId: string;
  id?: number;
  name: string;
  isRequired: boolean;
  minSelections: string;
  maxSelections: string;
  allowMultipleQuantity: boolean;
  options: AddonOptionForm[];
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  unit: string;
  categoryId: number | null;
  subcategoryId: number | null;
  extras: string;
  addonGroups: AddonGroupForm[];
}

let addonIdCounter = 0;
function genLocalId(): string {
  addonIdCounter += 1;
  return `local-${Date.now()}-${addonIdCounter}`;
}

const buildEmptyForm = (categories: ProductCategory[], defaultUnit: string): ProductForm => ({
  name: "",
  description: "",
  price: "",
  stock: "",
  unit: defaultUnit,
  categoryId: categories[0]?.id ?? null,
  subcategoryId: null,
  extras: "",
  addonGroups: [],
});

// ─── Addon payload helpers (same rules as mobile) ────────────────────────────

function buildAddonGroupsPayload(groups: AddonGroupForm[]): ProductAddonGroup[] {
  return groups
    .filter((g) => g.name.trim())
    .map((g) => ({
      ...(g.id ? { id: g.id } : {}),
      name: g.name.trim(),
      is_required: g.isRequired,
      min_selections: Number(g.minSelections) || 0,
      max_selections: Number(g.maxSelections) || 1,
      allow_multiple_quantity: g.allowMultipleQuantity,
      options: g.options
        .filter((o) => o.name.trim())
        .map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          name: o.name.trim(),
          price: Number(o.price) || 0,
          max_quantity: Number(o.maxQuantity) || 1,
        })),
    }));
}

function validateAddonGroupsPayload(groups: ProductAddonGroup[]): string | null {
  for (const g of groups) {
    if (!g.name) return "Every addon group needs a name.";
    if (g.options.length === 0) return `"${g.name}" needs at least one option.`;
    if (g.min_selections > g.max_selections)
      return `"${g.name}": minimum selections can't exceed maximum.`;
    if (g.is_required && g.min_selections < 1)
      return `"${g.name}" is marked required but allows a minimum of 0 — set a minimum of at least 1.`;
    for (const o of g.options) {
      if (!o.name) return `"${g.name}" has an option with no name.`;
      if (o.price < 0) return `"${o.name}" price can't be negative.`;
      if (o.max_quantity < 1) return `"${o.name}" max quantity must be at least 1.`;
    }
  }
  return null;
}

// ─── Addon group editor ──────────────────────────────────────────────────────

function AddonGroupsEditor({
  groups,
  onChange,
}: {
  groups: AddonGroupForm[];
  onChange: (groups: AddonGroupForm[]) => void;
}) {
  const addGroup = () =>
    onChange([
      ...groups,
      {
        localId: genLocalId(),
        name: "",
        isRequired: false,
        minSelections: "0",
        maxSelections: "1",
        allowMultipleQuantity: false,
        options: [],
      },
    ]);

  const removeGroup = (gid: string) => onChange(groups.filter((g) => g.localId !== gid));

  const patchGroup = (gid: string, patch: Partial<AddonGroupForm>) =>
    onChange(groups.map((g) => (g.localId === gid ? { ...g, ...patch } : g)));

  const addOption = (gid: string) =>
    onChange(
      groups.map((g) =>
        g.localId === gid
          ? {
              ...g,
              options: [...g.options, { localId: genLocalId(), name: "", price: "0", maxQuantity: "1" }],
            }
          : g,
      ),
    );

  const removeOption = (gid: string, oid: string) =>
    onChange(
      groups.map((g) =>
        g.localId === gid ? { ...g, options: g.options.filter((o) => o.localId !== oid) } : g,
      ),
    );

  const patchOption = (gid: string, oid: string, patch: Partial<AddonOptionForm>) =>
    onChange(
      groups.map((g) =>
        g.localId === gid
          ? { ...g, options: g.options.map((o) => (o.localId === oid ? { ...o, ...patch } : o)) }
          : g,
      ),
    );

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold text-gray-800 dark:text-ink">Addon Groups (optional)</span>
        <button
          type="button"
          onClick={addGroup}
          className="rounded-lg border-[1.5px] border-brand bg-brand/10 px-2.5 py-1.5 text-xs font-bold text-brand-deep"
        >
          + Add Group
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-4.25 text-gray-400 dark:text-ink-soft">
        Group extras customers choose from at checkout — e.g. &ldquo;Choose your protein&rdquo; or
        &ldquo;Add-ons&rdquo;. Each option can carry its own price.
      </p>

      {groups.map((group) => (
        <div key={group.localId} className="mt-2.5 rounded-xl border border-gray-200 dark:border-line bg-gray-50 dark:bg-bg p-3">
          <div className="flex items-center gap-2">
            <input
              className={inputCls}
              placeholder='Group name e.g. "Extra Toppings"'
              value={group.name}
              onChange={(e) => patchGroup(group.localId, { name: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeGroup(group.localId)}
              aria-label="Remove group"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-clay-tint text-sm text-red-600 dark:text-clay"
            >
              🗑
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-600 dark:text-ink-soft">
              <input
                type="checkbox"
                className="size-4 accent-orange-500"
                checked={group.isRequired}
                onChange={(e) => patchGroup(group.localId, { isRequired: e.target.checked })}
              />
              Required
            </label>
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-600 dark:text-ink-soft">
              <input
                type="checkbox"
                className="size-4 accent-orange-500"
                checked={group.allowMultipleQuantity}
                onChange={(e) => patchGroup(group.localId, { allowMultipleQuantity: e.target.checked })}
              />
              Multi-qty per option
            </label>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-3">
            <div>
              <span className={miniLabelCls}>Min selections</span>
              <input
                className={inputCls}
                inputMode="numeric"
                value={group.minSelections}
                onChange={(e) =>
                  patchGroup(group.localId, { minSelections: e.target.value.replace(/[^0-9]/g, "") })
                }
              />
            </div>
            <div>
              <span className={miniLabelCls}>Max selections</span>
              <input
                className={inputCls}
                inputMode="numeric"
                value={group.maxSelections}
                onChange={(e) =>
                  patchGroup(group.localId, { maxSelections: e.target.value.replace(/[^0-9]/g, "") })
                }
              />
            </div>
          </div>

          <p className="mb-1.5 mt-3 text-xs font-bold text-gray-600 dark:text-ink-soft">Options</p>
          <div className="space-y-2">
            {group.options.map((opt) => (
              <div key={opt.localId} className="flex items-center gap-2">
                <input
                  className={`${inputCls} min-w-0 flex-[2]`}
                  placeholder="Option name"
                  value={opt.name}
                  onChange={(e) => patchOption(group.localId, opt.localId, { name: e.target.value })}
                />
                <input
                  className={`${inputCls} min-w-0 flex-1`}
                  placeholder="₦ price"
                  inputMode="decimal"
                  value={opt.price}
                  onChange={(e) =>
                    patchOption(group.localId, opt.localId, { price: e.target.value.replace(/[^0-9.]/g, "") })
                  }
                />
                {group.allowMultipleQuantity && (
                  <input
                    className={`${inputCls} min-w-0 flex-[0.7]`}
                    placeholder="Max qty"
                    inputMode="numeric"
                    value={opt.maxQuantity}
                    onChange={(e) =>
                      patchOption(group.localId, opt.localId, {
                        maxQuantity: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeOption(group.localId, opt.localId)}
                  aria-label="Remove option"
                  className="flex size-7 shrink-0 items-center justify-center rounded-md bg-red-100 dark:bg-clay-tint text-xs text-red-600 dark:text-clay"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addOption(group.localId)}
            className="mt-2 rounded-lg border border-gray-200 dark:border-line bg-white dark:bg-bg-raised px-2.5 py-1.5 text-xs font-bold text-brand-deep"
          >
            + Add Option
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Add / Edit modal ────────────────────────────────────────────────────────

function ProductModal({
  mode,
  isRestaurant,
  form,
  setForm,
  categories,
  catsLoading,
  catsError,
  unitOptions,
  imagePreview,
  onPickImage,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  isRestaurant: boolean;
  form: ProductForm;
  setForm: Dispatch<SetStateAction<ProductForm>>;
  categories: ProductCategory[];
  catsLoading: boolean;
  catsError: string | null;
  unitOptions: string[];
  imagePreview: string | null;
  onPickImage: (file: File | null) => void;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isEdit = mode === "edit";
  const selectedCategory = categories.find((c) => c.id === form.categoryId) ?? null;
  const subcategories: ProductSubcategory[] = selectedCategory?.subcategories ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white dark:bg-bg-raised sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 dark:border-line px-5 py-4">
          <h2 id="product-modal-title" className="text-lg font-extrabold text-gray-900 dark:text-ink">
            {isEdit
              ? isRestaurant ? "Edit Menu Item" : "Edit Product"
              : isRestaurant ? "Add New Menu Item" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center rounded-full bg-gray-100 dark:bg-bg-elevated text-gray-600 dark:text-ink-soft"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Image */}
          <label className="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-[1.5px] border-dashed border-gray-200 dark:border-line bg-gray-50 dark:bg-bg">
            {imagePreview ? (
              <img src={imagePreview} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm font-semibold text-brand-deep">
                <span className="text-3xl">📷</span>
                {isEdit ? "Change Photo" : "Add Photo"}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                onPickImage(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>

          {/* Name */}
          <div>
            <label className={labelCls}>{isRestaurant ? "Dish Name *" : "Product Name *"}</label>
            <input
              className={inputCls}
              placeholder={isRestaurant ? "e.g. Jollof Rice & Chicken" : "e.g. Fresh Tomatoes (1kg)"}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Description (the API rejects an empty one) */}
          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              className={`${inputCls} h-24 resize-none`}
              placeholder={
                isRestaurant
                  ? "Describe the dish — ingredients, how it's served, etc."
                  : "Describe your product..."
              }
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Price + stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price (₦) *</label>
              <input
                className={inputCls}
                placeholder="0.00"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9.]/g, "") }))}
              />
            </div>
            <div>
              <label className={labelCls}>{isRestaurant ? "Available Portions *" : "Stock *"}</label>
              <input
                className={inputCls}
                placeholder="Qty"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value.replace(/[^0-9]/g, "") }))}
              />
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className={labelCls}>{isRestaurant ? "Sold By" : "Unit"}</label>
            <select
              className={inputCls}
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              {/* Keep an existing product's unit selectable even if it isn't in the list */}
              {form.unit && !unitOptions.includes(form.unit) && (
                <option value={form.unit}>{form.unit}</option>
              )}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Category</label>
            {catsLoading ? (
              <p className="py-2 text-[13px] text-gray-500 dark:text-ink-soft">Loading categories…</p>
            ) : catsError ? (
              <p className="py-2 text-[13px] text-red-600 dark:text-clay">Failed to load categories</p>
            ) : (
              <select
                className={inputCls}
                value={form.categoryId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoryId: Number(e.target.value),
                    // A subcategory picked under the old category almost certainly
                    // doesn't belong to the new one.
                    subcategoryId: null,
                  }))
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div>
              <label className={labelCls}>Subcategory</label>
              <select
                className={inputCls}
                value={form.subcategoryId ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    subcategoryId: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
              >
                <option value="">None</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Restaurant-only: extras note + addon groups */}
          {isRestaurant && (
            <>
              <div>
                <label className={labelCls}>Extras / Add-ons Note (optional)</label>
                <textarea
                  className={`${inputCls} h-20 resize-none`}
                  placeholder="e.g. Extra meat +₦500, extra swallow +₦400, extra plantain +₦300"
                  value={form.extras}
                  onChange={(e) => setForm((f) => ({ ...f, extras: e.target.value }))}
                />
                <p className="mt-1.5 text-xs leading-4.25 text-gray-400 dark:text-ink-soft">
                  Free-text note shown on the item — for priced, selectable extras customers actually
                  add to their order, use Addon Groups below instead.
                </p>
              </div>

              <AddonGroupsEditor
                groups={form.addonGroups}
                onChange={(addonGroups) => setForm((f) => ({ ...f, addonGroups }))}
              />
            </>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mx-5 mb-3 shrink-0 rounded-xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-2.5 text-sm font-medium text-red-700 dark:text-clay"
          >
            {error}
          </p>
        )}

        <div className="flex shrink-0 gap-3 border-t border-gray-100 dark:border-line p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border-[1.5px] border-gray-200 dark:border-line py-3.5 text-[15px] font-bold text-gray-600 dark:text-ink-soft disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-[2] rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white disabled:opacity-70"
          >
            {submitting
              ? isEdit ? "Saving..." : "Adding..."
              : isEdit
                ? "Save Changes"
                : isRestaurant ? "Add Menu Item" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Notice = { type: "success" | "error"; text: string };

function ProductsView() {
  const params = useSearchParams();

  // Who is signed in. vendor_id and business_type come from the shop profile endpoint.
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const businessType = profile?.business_type?.trim().toLowerCase() || undefined;
  const vendorId = profile?.vendor_id ?? null;
  const isRestaurant = businessType === "restaurant";
  const unitOptions = isRestaurant ? RESTAURANT_UNIT_OPTIONS : GROCERY_UNIT_OPTIONS;
  const defaultUnit = isRestaurant ? "Plate" : GROCERY_UNIT_OPTIONS[0];

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [counts, setCounts] = useState<VendorProductCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [notice, setNotice] = useState<Notice | null>(null);

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(() => buildEmptyForm([], "kg"));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<VendorProduct | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Data loading ───────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const data = await getVendorProducts();
      setProducts(data.products ?? []);
      setCounts(data.counts ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    getShopProfile()
      .then(setProfile)
      .catch((err) => setProfileError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (!businessType) {
      // Profile finished loading but has no business type — nothing to fetch.
      if (profile || profileError) setCatsLoading(false);
      return;
    }
    let cancelled = false;
    setCatsLoading(true);
    setCatsError(null);
    getProductCategories(businessType)
      .then((c) => {
        if (!cancelled) setCategories(c);
      })
      .catch((err) => {
        if (!cancelled) setCatsError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setCatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessType, profile, profileError]);

  // Once categories arrive, make sure the form isn't sitting on categoryId: null.
  useEffect(() => {
    if (categories.length === 0) return;
    setForm((f) => (f.categoryId === null ? { ...f, categoryId: categories[0].id } : f));
  }, [categories]);

  useEffect(() => {
    if (notice?.type !== "success") return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products;
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, statusFilter, search]);

  // ── Modal open / close ─────────────────────────────────────────────────────
  const revokePreview = (url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    revokePreview(imagePreview);
    setModal(null);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  };

  const requestClose = () => {
    if (!submitting) resetModal();
  };

  const openAdd = useCallback(() => {
    setForm(buildEmptyForm(categories, defaultUnit));
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setModal("add");
  }, [categories, defaultUnit]);

  // ?openAdd=true (from a dashboard / onboarding quick action) opens the Add modal once.
  const openAddRequested = params.get("openAdd") === "true";
  const openedFromParam = useRef(false);
  useEffect(() => {
    if (openAddRequested && !openedFromParam.current && profile && businessType && !catsLoading) {
      openedFromParam.current = true;
      openAdd();
    }
  }, [openAddRequested, profile, businessType, catsLoading, openAdd]);

  const openEdit = (product: VendorProduct) => {
    // Prefer category_id / subcategory_id; fall back to matching the free-text
    // category name against the fetched tree for older products.
    let matchedCategory: ProductCategory | undefined =
      product.category_id != null ? categories.find((c) => c.id === product.category_id) : undefined;
    if (!matchedCategory) {
      matchedCategory = categories.find(
        (c) => c.name === product.category || c.subcategories.some((s) => s.name === product.category),
      );
    }

    let matchedSub: ProductSubcategory | undefined;
    if (matchedCategory) {
      if (product.subcategory_id != null) {
        matchedSub = matchedCategory.subcategories.find((s) => s.id === product.subcategory_id);
      }
      if (!matchedSub) {
        matchedSub = matchedCategory.subcategories.find((s) => s.name === product.category);
      }
    }

    const existingGroups: AddonGroupForm[] = Array.isArray(product.addon_groups)
      ? product.addon_groups.map((g) => ({
          localId: genLocalId(),
          id: g.id,
          name: g.name ?? "",
          isRequired: !!g.is_required,
          minSelections: String(g.min_selections ?? 0),
          maxSelections: String(g.max_selections ?? 1),
          allowMultipleQuantity: !!g.allow_multiple_quantity,
          options: (g.options ?? []).map((o) => ({
            localId: genLocalId(),
            id: o.id,
            name: o.name ?? "",
            price: String(o.price ?? 0),
            maxQuantity: String(o.max_quantity ?? 1),
          })),
        }))
      : [];

    setEditing(product);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      unit: product.unit ?? defaultUnit,
      categoryId: matchedCategory?.id ?? categories[0]?.id ?? null,
      subcategoryId: matchedSub?.id ?? null,
      extras: product.extras ?? "",
      addonGroups: existingGroups,
    });
    setImageFile(null);
    setImagePreview(product.image ? resolveImage(product.image) : null);
    setFormError(null);
    setModal("edit");
  };

  const handlePickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image must be 20MB or smaller.");
      return;
    }
    setFormError(null);
    revokePreview(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Free-text `category` column: subcategory name when chosen, else the category name.
  const resolveCategoryText = (categoryId: number | null, subcategoryId: number | null) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return "";
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    return sub ? sub.name : cat.name;
  };

  // ── Submit (add + edit) ────────────────────────────────────────────────────
  const submit = async () => {
    setFormError(null);

    if (!form.name.trim() || !form.price || !form.stock) {
      setFormError("Name, price and stock are required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (modal === "add" && !imageFile) {
      setFormError("Please select a product image.");
      return;
    }
    if (!form.categoryId) {
      setFormError("Please select a category.");
      return;
    }

    const groupsPayload = buildAddonGroupsPayload(form.addonGroups);
    const addonError = validateAddonGroupsPayload(groupsPayload);
    if (addonError) {
      setFormError(addonError);
      return;
    }

    // Sending addon_groups (even "[]") REPLACES the product's addons server-side. On edit,
    // only send it when the list endpoint actually returned the existing addons (so the form
    // started from the truth) or the vendor added groups — otherwise leave them untouched.
    const includeAddons =
      isRestaurant &&
      (modal === "add" || editing?.addon_groups !== undefined || groupsPayload.length > 0);

    const input = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      stock: form.stock,
      unit: form.unit,
      category: resolveCategoryText(form.categoryId, form.subcategoryId),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      extras: isRestaurant ? form.extras.trim() || null : null,
      addonGroups: includeAddons ? groupsPayload : undefined,
      image: imageFile ?? undefined,
    };

    setSubmitting(true);
    try {
      if (modal === "add") {
        await addProduct(input);
        setNotice({ type: "success", text: "Product added — submitted for approval." });
      } else if (editing) {
        await editProduct({ ...input, productId: editing.id, vendorId });
        setNotice({ type: "success", text: "Changes saved successfully." });
      }
      resetModal();
      await loadProducts();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const product = deleteTarget;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, vendorId);
      setNotice({ type: "success", text: "Product removed successfully." });
      setDeleteTarget(null);
      await loadProducts();
    } catch (err) {
      setNotice({ type: "error", text: errorMessage(err) });
      setDeleteTarget(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Total", value: counts?.total ?? 0, color: "text-indigo-500" },
    { label: "Approved", value: counts?.approved ?? 0, color: "text-green-600 dark:text-leaf" },
    { label: "Pending", value: counts?.pending ?? 0, color: "text-yellow-600 dark:text-brand" },
    { label: "Rejected", value: counts?.rejected ?? 0, color: "text-red-600 dark:text-clay" },
  ];

  const noun = isRestaurant ? "dishes" : "products";
  const canAdd = !!businessType && !catsLoading;

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold">
            {isRestaurant ? "Menu Items" : "Product Catalogue"}
          </h1>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-ink-soft">
            {counts?.total ?? 0} {noun} listed
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadProducts();
            }}
            className="text-sm font-semibold text-brand-deep underline underline-offset-4"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openAdd}
            disabled={!canAdd}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Banners */}
      {profileError && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint px-4 py-3 text-sm font-medium text-red-700 dark:text-clay">
          Couldn&rsquo;t load your shop profile: {profileError}
        </p>
      )}
      {profile && !businessType && (
        <p role="alert" className="mt-4 rounded-xl border border-amber-200 dark:border-brand bg-amber-50 dark:bg-brand-tint px-4 py-3 text-sm font-medium text-amber-800 dark:text-brand">
          Couldn&rsquo;t determine your business type, so adding and editing is disabled.
        </p>
      )}
      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 dark:border-clay bg-red-50 dark:bg-clay-tint text-red-700 dark:text-clay"
              : "border-green-200 dark:border-leaf bg-green-50 dark:bg-leaf-tint text-green-700 dark:text-leaf"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Stats */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised py-2.5 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-gray-400 dark:text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised px-3.5 py-2.5">
        <span className="text-sm text-gray-400 dark:text-ink-soft">🔍</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 dark:text-ink outline-none placeholder:text-gray-400 dark:placeholder:text-ink-soft"
          placeholder={isRestaurant ? "Search menu items..." : "Search products..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-sm text-gray-400 dark:text-ink-soft">
            ✕
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold capitalize ${
              statusFilter === tab
                ? "border-brand bg-brand text-white"
                : "border-gray-200 dark:border-line bg-gray-100 dark:bg-bg-elevated text-gray-600 dark:text-ink-soft"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-gray-500 dark:text-ink-soft">
            {isRestaurant ? "Loading your menu..." : "Loading your products..."}
          </p>
        ) : error ? (
          <p role="alert" className="py-10 text-center font-semibold text-red-600 dark:text-clay">
            Failed to load {isRestaurant ? "menu items" : "products"}
            <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-ink-soft">{error}</span>
          </p>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-5xl">📦</span>
            <p className="text-[17px] font-bold text-gray-800 dark:text-ink">
              {search || statusFilter !== "all"
                ? "No products match"
                : isRestaurant ? "No menu items yet" : "No products yet"}
            </p>
            <p className="text-sm text-gray-400 dark:text-ink-soft">
              {search || statusFilter !== "all"
                ? "Try a different search or filter"
                : `Tap + Add to list your first ${isRestaurant ? "dish" : "product"}`}
            </p>
            {statusFilter === "all" && !search && (
              <button
                type="button"
                onClick={openAdd}
                disabled={!canAdd}
                className="mt-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                + Add {isRestaurant ? "Menu Item" : "Product"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredProducts.map((p) => {
              const status = p.status ?? "pending";
              const isThisDeleting = deletingId === p.id;
              return (
                <div
                  key={p.id}
                  className="flex overflow-hidden rounded-2xl border border-gray-100 dark:border-line bg-white dark:bg-bg-raised shadow-sm"
                >
                  <img
                    src={resolveImage(p.image)}
                    alt=""
                    className="min-h-27.5 w-[100px] shrink-0 self-stretch bg-gray-100 dark:bg-bg-elevated object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-bold text-gray-900 dark:text-ink">{p.name}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            STATUS_STYLES[status] ?? STATUS_STYLES.pending
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 text-base font-extrabold text-brand-deep">{naira(p.price)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <span className="rounded-md bg-gray-100 dark:bg-bg-elevated px-2 py-0.5 text-[11px] text-gray-600 dark:text-ink-soft">
                          {isRestaurant ? "Portions" : "Stock"}: {p.stock}
                        </span>
                        {p.unit && (
                          <span className="rounded-md bg-gray-100 dark:bg-bg-elevated px-2 py-0.5 text-[11px] text-gray-600 dark:text-ink-soft">{p.unit}</span>
                        )}
                        {p.category && (
                          <span className="rounded-md bg-gray-100 dark:bg-bg-elevated px-2 py-0.5 text-[11px] text-gray-600 dark:text-ink-soft">{p.category}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        disabled={catsLoading}
                        className="rounded-lg border-[1.5px] border-brand bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand-deep disabled:opacity-50"
                      >
                        ✎ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        disabled={isThisDeleting}
                        className="rounded-lg border-[1.5px] border-red-600 bg-red-100 dark:bg-clay-tint px-3 py-1.5 text-xs font-bold text-red-600 dark:text-clay disabled:opacity-60"
                      >
                        {isThisDeleting ? "Deleting..." : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <ProductModal
          mode={modal}
          isRestaurant={isRestaurant}
          form={form}
          setForm={setForm}
          categories={categories}
          catsLoading={catsLoading}
          catsError={catsError}
          unitOptions={unitOptions}
          imagePreview={imagePreview}
          onPickImage={handlePickImage}
          submitting={submitting}
          error={formError}
          onClose={requestClose}
          onSubmit={submit}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onClick={() => !deletingId && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-xs rounded-3xl bg-white dark:bg-bg-raised p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center text-xl font-bold">Delete Product</h3>
            <p className="mb-6 mt-2 text-center text-sm text-gray-600 dark:text-ink-soft">
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="min-h-12 flex-1 rounded-xl bg-red-600 font-semibold text-white disabled:opacity-70"
              >
                {deletingId !== null ? "..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="min-h-12 flex-1 rounded-xl border-2 border-gray-200 dark:border-line bg-white dark:bg-bg-raised font-semibold text-gray-600 dark:text-ink-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function MerchantProductsPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}