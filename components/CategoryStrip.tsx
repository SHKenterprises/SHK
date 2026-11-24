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
      title: "Batteries & Power Systems",
      img: "/images/battery.jpg",
      alt: "Batteries",
    },
    {
      id: "piston",
      title: "Forged & Cast Pistons",
      img: "/images/piston-conrod.jpg",
      alt: "Pistons",
    },
    {
      id: "liner",
      title: "Centrifugal Cylinder Liners",
      img: "/images/cylinder-liner.jpg",
      alt: "Cylinder Liners",
    },
    {
      id: "valves",
      title: "Precision Valve Sets",
      img: "/images/valves.jpg",
      alt: "Engine Valves",
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
            img: c.image || "/images/piston.png",
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

