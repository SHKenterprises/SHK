import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, Product } from "@/data/products";
import { getProductBySlug, getProducts } from "@/lib/supabaseService";
import { ProductPageClient } from "./ProductPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const allProds = await getProducts();
  return allProds.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found | S.H.K ENTERPRISES",
    };
  }

  return {
    title: `${product.title} - Price ₹${product.price} | S.H.K ENTERPRISES`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = (await getProductBySlug(slug)) || PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const allProds = await getProducts();

  // Related products from same category or complementary, topped up to 4 items
  const sameBrandOrCat = allProds.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand)
  );
  const otherPopular = allProds.filter(
    (p) => p.id !== product.id && p.category !== product.category && p.brand !== product.brand
  );
  const relatedProducts = [...sameBrandOrCat, ...otherPopular].slice(0, 4);

  return (
    <ProductPageClient product={product} relatedProducts={relatedProducts} />
  );
}

