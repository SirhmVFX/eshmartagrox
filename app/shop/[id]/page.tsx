"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { getProduct, getSiteSettings, getRecommendedAddons, FirestoreProduct } from "@/lib/firestore";
import { useCurrency } from "@/lib/currency";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const cart = useCart();

    const [product, setProduct] = useState<FirestoreProduct | null>(null);
    const [addons, setAddons] = useState<FirestoreProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [activeImg, setActiveImg] = useState(0);
    const [addedAddonId, setAddedAddonId] = useState<string | null>(null);
    const { format } = useCurrency();

    useEffect(() => {
        if (!id) return;
        Promise.all([getProduct(id), getSiteSettings()])
            .then(([data, settings]) => {
                if (!data) return;
                setProduct(data);
                if (data.sizes?.length) setSelectedSize(data.sizes[0]);
                if (data.colors?.length) setSelectedColor(data.colors[0]);
            })
            .finally(() => setLoading(false));

        // Load recommended addons separately — non-blocking
        getRecommendedAddons(id).then(setAddons).catch(() => { });
    }, [id]);

    if (loading) {
        return <div className="w-[90%] mx-auto py-20 text-center text-gray-400">Loading…</div>;
    }

    if (!product) {
        return (
            <div className="w-[90%] mx-auto py-12 md:py-20 text-center">
                <h1 className="text-xl md:text-2xl font-bold">Product not found</h1>
                <Link href="/shop" className="mt-4 inline-block text-green-900 hover:underline">← Back to shop</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        cart.add({ id: product.id!, name: product.name, price: product.price, quantity });
        router.push("/cart");
    };

    const handleAddAddonToCart = (addon: FirestoreProduct) => {
        cart.add({ id: addon.id!, name: addon.name, price: addon.price, quantity: 1 });
        setAddedAddonId(addon.id!);
        setTimeout(() => setAddedAddonId(null), 1800);
    };

    const images = product.images?.length ? product.images : ["/assets/6.jpg"];

    return (
        <div className="w-[90%] mx-auto py-8 md:py-20">
            <Link href="/shop" className="text-green-900 hover:underline text-sm mb-4 inline-block">← Back to shop</Link>

            <div className="flex flex-col lg:flex-row gap-6 md:gap-12">
                {/* Images */}
                <div className="w-full lg:w-1/2 space-y-3">
                    <div className="relative w-full h-80 lg:h-[450px] bg-gray-100 overflow-hidden">
                        <Image src={images[activeImg] || images[0]} alt={product.name} fill className="object-cover" priority />
                        {product.isNew && <span className="absolute top-3 left-3 bg-green-900 text-white text-xs px-2 py-1">NEW</span>}
                        {product.isBestSeller && <span className="absolute top-3 right-3 bg-orange-600 text-white text-xs px-2 py-1">BEST SELLER</span>}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)} className={`relative w-16 h-16 border-2 overflow-hidden ${activeImg === i ? "border-green-900" : "border-gray-200"}`}>
                                    <Image src={img} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="w-full lg:w-1/2 space-y-5">
                    <div>
                        <span className="text-green-600 text-sm font-medium">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ""}</span>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-2xl md:text-3xl font-bold text-green-600">
                            {format(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                                {format(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {product.description && <p className="text-gray-600 text-sm md:text-base">{product.description}</p>}

                    {/* Sizes */}
                    {product.sizes?.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-2">Size</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((s) => (
                                    <button key={s} onClick={() => setSelectedSize(s)}
                                        className={`px-3 py-1 border text-sm ${selectedSize === s ? "bg-green-900 text-white border-green-900" : "border-gray-300 text-gray-700"}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Colors */}
                    {product.colors?.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold mb-2">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((c) => (
                                    <button key={c} onClick={() => setSelectedColor(c)}
                                        className={`px-3 py-1 border text-sm ${selectedColor === c ? "bg-green-900 text-white border-green-900" : "border-gray-300 text-gray-700"}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    {product.details?.length > 0 && (
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            {product.details.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    )}

                    {/* Stock */}
                    <p className={`text-sm font-medium ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                    </p>

                    {/* Qty + Add to Cart */}
                    {product.inStock && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center border border-gray-300 w-fit">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100" disabled={quantity <= 1}>-</button>
                                <span className="px-4 py-2 font-medium min-w-10 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100">+</button>
                            </div>
                            <button onClick={handleAddToCart} className="flex-1 bg-green-900 text-white px-6 py-3 hover:bg-green-800 transition-colors font-medium text-sm md:text-base">
                                Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Recommended Add-ons ── */}
            {addons.length > 0 && (
                <div className="mt-16 border-t border-gray-100 pt-12">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Customers Also Buy</h2>
                    <p className="text-sm text-gray-500 mb-6">Frequently ordered together with {product.name}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {addons.map((addon) => {
                            const justAdded = addedAddonId === addon.id;
                            const addonImg = addon.images?.[0] ?? "/assets/6.jpg";
                            return (
                                <div key={addon.id} className="border border-gray-200 group hover:border-green-900 transition-colors">
                                    <Link href={`/shop/${addon.id}`}>
                                        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                                            <Image
                                                src={addonImg}
                                                alt={addon.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {addon.isNew && (
                                                <span className="absolute top-2 left-2 bg-green-900 text-white text-[10px] px-1.5 py-0.5">NEW</span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-3 space-y-2">
                                        <Link href={`/shop/${addon.id}`}>
                                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-green-900 transition-colors">
                                                {addon.name}
                                            </p>
                                        </Link>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-green-700 font-bold text-sm">
                                                {format(addon.price)}
                                            </span>
                                            {addon.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {format(addon.originalPrice)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddAddonToCart(addon)}
                                            className={`w-full py-2 text-xs font-semibold transition-colors ${justAdded
                                                ? "bg-green-700 text-white"
                                                : "bg-gray-900 text-white hover:bg-green-900"
                                                }`}
                                        >
                                            {justAdded ? "✓ Added!" : "+ Add to Cart"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
