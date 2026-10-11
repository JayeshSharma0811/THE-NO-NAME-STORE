"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
};

type AddToCartOptions = {
  size?: string;
  color?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (
    productId: number,
    options?: AddToCartOptions
  ) => void;
  removeFromCart: (
    productId: number,
    size?: string,
    color?: string
  ) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
  getCartCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

const CART_STORAGE_KEY = "no-name-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /*
   * LOAD CART
   */
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * SAVE CART
   */
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cartItems, isLoaded]);

  /*
   * ADD TO CART
   */
  const addToCart = (
    productId: number,
    options: AddToCartOptions = {}
  ) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.productId === productId &&
          item.size === options.size &&
          item.color === options.color
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === productId &&
          item.size === options.size &&
          item.color === options.color
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId,
          quantity: 1,
          size: options.size,
          color: options.color,
        },
      ];
    });
  };

  /*
   * REMOVE FROM CART
   */
  const removeFromCart = (
    productId: number,
    size?: string,
    color?: string
  ) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  /*
   * UPDATE QUANTITY
   */
  const updateQuantity = (
    productId: number,
    quantity: number,
    size?: string,
    color?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  /*
   * CLEAR CART
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /*
   * CART COUNT
   */
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const getCartCount = () => {
    return cartCount;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside a CartProvider"
    );
  }

  return context;
}

