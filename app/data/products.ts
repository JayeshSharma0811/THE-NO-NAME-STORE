export type Product = {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Essential Oversized Tee",
    slug: "essential-oversized-tee",
    category: "Men",
    price: 1299,
    originalPrice: 1599,
    description:
      "A clean everyday oversized tee designed with a relaxed silhouette and minimal aesthetic.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    featured: true,
    isNew: true,
    inStock: true,
  },

  {
    id: 2,
    name: "Minimal Everyday Shirt",
    slug: "minimal-everyday-shirt",
    category: "Men",
    price: 1899,
    originalPrice: 2299,
    description:
      "A refined everyday shirt with a simple silhouette made for effortless styling.",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Beige"],
    featured: true,
    isNew: true,
    inStock: true,
  },

  {
    id: 3,
    name: "Classic Women's Top",
    slug: "classic-womens-top",
    category: "Women",
    price: 1499,
    originalPrice: 1799,
    description:
      "A versatile women's top designed around clean lines and an understated modern look.",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Black"],
    featured: true,
    isNew: false,
    inStock: true,
  },

  {
    id: 4,
    name: "Everyday Crossbody Bag",
    slug: "everyday-crossbody-bag",
    category: "Accessories",
    price: 2199,
    originalPrice: 2599,
    description:
      "A compact everyday crossbody bag combining practical storage with a minimal aesthetic.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Black", "Brown"],
    featured: true,
    isNew: true,
    inStock: true,
  },

  {
    id: 5,
    name: "Relaxed Linen Shirt",
    slug: "relaxed-linen-shirt",
    category: "Men",
    price: 2099,
    originalPrice: 2499,
    description:
      "A lightweight relaxed shirt with a timeless silhouette for warm everyday styling.",
    image:
      "https://images.unsplash.com/photo-1626497760585-6f9e3f5e8b5b?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1626497760585-6f9e3f5e8b5b?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Black"],
    featured: false,
    isNew: true,
    inStock: true,
  },

  {
    id: 6,
    name: "Structured Shoulder Bag",
    slug: "structured-shoulder-bag",
    category: "Accessories",
    price: 2499,
    originalPrice: 2999,
    description:
      "A structured shoulder bag designed to add a refined finishing touch to everyday looks.",
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Black", "Tan"],
    featured: false,
    isNew: false,
    inStock: true,
  },

  {
    id: 7,
    name: "Essential Relaxed Pants",
    slug: "essential-relaxed-pants",
    category: "Men",
    price: 2299,
    originalPrice: 2799,
    description:
      "Relaxed everyday pants with a clean profile and comfortable modern fit.",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Grey"],
    featured: false,
    isNew: false,
    inStock: true,
  },

  {
    id: 8,
    name: "Minimal Everyday Tote",
    slug: "minimal-everyday-tote",
    category: "Accessories",
    price: 1799,
    originalPrice: 2199,
    description:
      "A spacious minimalist tote designed for everyday use.",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Black", "Cream"],
    featured: false,
    isNew: true,
    inStock: true,
  },
];

export const featuredProducts = products.filter(
  (product) => product.featured
);

export const newProducts = products.filter(
  (product) => product.isNew
);

export function getProductById(id: number) {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}