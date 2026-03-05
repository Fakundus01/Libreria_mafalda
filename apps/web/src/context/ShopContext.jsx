import { createContext, useContext, useEffect, useState } from 'react';
import { testProfile } from '../config/site';

const ShopContext = createContext(null);

const STORAGE_KEYS = {
  cart: 'mafalda_cart',
  token: 'mafalda_token',
  user: 'mafalda_user',
  adminToken: 'mafalda_admin_token',
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => readJson(STORAGE_KEYS.cart, []));
  const [user, setUser] = useState(() => readJson(STORAGE_KEYS.user, null));
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || '');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(STORAGE_KEYS.adminToken) || '');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }
  }, [token]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem(STORAGE_KEYS.adminToken, adminToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.adminToken);
    }
  }, [adminToken]);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const customerProfile = {
    name: user?.full_name || testProfile.name,
    email: user?.email || testProfile.email,
    phone: user?.phone || testProfile.phone,
    area: testProfile.area,
    street: testProfile.street,
    number: testProfile.number,
    refs: testProfile.refs,
  };

  const addToCart = (product, qty = 1) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => (
          item.productId === product.id
            ? { ...item, qty: Math.min(item.qty + safeQty, product.stock || item.qty + safeQty) }
            : item
        ));
      }

      return [
        ...current,
        {
          productId: product.id,
          title: product.title,
          price: Number(product.effective_price || product.price || 0),
          qty: safeQty,
          stock: product.stock || 0,
          image: product.images?.[0]?.url || product.image_url || '',
        },
      ];
    });
  };

  const updateQty = (productId, nextQty) => {
    const safeQty = Number(nextQty) || 0;
    setCart((current) => current
      .map((item) => (item.productId === productId ? { ...item, qty: safeQty } : item))
      .filter((item) => item.qty > 0));
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const applySession = ({ nextUser, nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
  };

  const logoutAdmin = () => setAdminToken('');

  const value = {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    user,
    token,
    isAuthenticated: Boolean(token && user),
    applySession,
    logout,
    adminToken,
    setAdminToken,
    logoutAdmin,
    customerProfile,
    testProfile,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used inside ShopProvider');
  }
  return context;
}
