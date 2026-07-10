// components/product/ProductGallery.tsx
"use client";

import { useState } from "react";

type ProductGalleryProps = {
  images: { id: string; url: string }[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
        Tidak ada gambar
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.url}
          alt={productName}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                index === activeIndex ? "border-black" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`${productName} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}