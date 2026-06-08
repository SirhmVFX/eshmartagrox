"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useSiteContent } from "@/components/ContentProvider";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { shop, settings } = useSiteContent();
    const cart = useCart();

    const product = shop.products.find((p) => p.id === id && p.isPublished);

    if (!product) {
        return (
            <div className="w-[90%] mx-auto py-12 md:py-20 text-center">
                <h1 className="text-xl md:text-2xl font-bold">Product not found</h1>
                <Link href="/shop" className="mt-4 inline-block text-green-900 hover:underline">
                    ← Back to shop
                </Link>
            </div>
        );
    }

    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        cart.add({ id: product.id, name: product.name, price: product.price, quantity });
        router.push("/cart");
    };

    return (
        <div className="w-[90%] mx-auto py-8 md:py-20">
            <Link href="/shop" className="text-green-900 hover:underline text-sm mb-4 inline-block">
                ← Back to shop
            </Link>

            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Product Image */}
                <div className="w-full lg:w-1/2">
                    <div className="relative w-full h-80 lg:h-[400px] xl:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                            src={product.image || "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80"}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="w-full lg:w-1/2">
                    <div className="mb-4">
                        <span className="text-green-600 text-sm font-medium">{product.category}</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
                            {settings.currencySymbol}{product.price.toFixed(2)}
                        </span>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
                        {product.quantity && (
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Quantity:</span> {product.quantity}
                            </p>
                        )}
                        {product.weight && (
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Weight:</span> {product.weight}
                            </p>
                        )}
                        {product.size && (
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Size:</span> {product.size}
                            </p>
                        )}
                        {product.length && (
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Length:</span> {product.length}
                            </p>
                        )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="flex items-center border border-gray-300 rounded-md w-fit">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-2 hover:bg-gray-100 text-gray-600"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-4 py-2 font-medium min-w-10 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-2 hover:bg-gray-100 text-gray-600"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-green-600 text-white px-6 md:px-8 py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-sm md:text-base"
                        >
                            Add to Cart
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
