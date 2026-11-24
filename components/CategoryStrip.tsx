"use client";

import React, { useState, useEffect } from "react";
import { getCategories } from "@/lib/supabaseService";

interface CategoryStripProps {
  onSelectCategory: (category: string) => void;
}

export function CategoryStrip({ onSelectCategory }: CategoryStripProps) {
  const defaultCategories = [
    {
      id: "battery",
      title: "All Two-Wheeler Batteries",
      img: "/images/battery.jpg",
      alt: "All Batteries",
    },
    {
      id: "commuter",
      title: "Commuter (2.5Ah - 4Ah)",
      img: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      alt: "Commuter Series",
    },
    {
      id: "performance",
      title: "Sports & Performance (5Ah - 7Ah)",
      img: "https://ik.imagekit.io/lv0h5ou9z/products/battery-5ah.jpg",
      alt: "Performance Series",
    },
    {
      id: "cruiser",
      title: "Cruisers & Royal Enfield (9Ah - 14Ah)",
      img: "https://ik.imagekit.io/lv0h5ou9z/products/battery.jpg",
      alt: "Cruiser Series",
    },
  ];

  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    getCategories().then((dbCats) => {
      if (dbCats && dbCats.length > 0) {
        setCategories(
          dbCats.map((c) => ({
            id: c.slug || c.id,
            title: c.name,
            img: c.image || "/images/battery.jpg",
            alt: c.name,
          }))
        );
      }
    });
  }, []);

  return (
    <div className="cat-strip-section">
      <div className="container">
        <div className="cat-scroll-container">
          {categories.map((cat, idx) => (
            <a
              key={idx}
              href="#catalog"
              className="cat-card-item"
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="cat-img-wrap">
                <img src={cat.img} alt={cat.alt} />
              </div>
              <span className="cat-title">{cat.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

