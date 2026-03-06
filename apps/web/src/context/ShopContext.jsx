import { useEffect, useState } from 'react';
import { testProfile } from '../config/site';
import { apiGet, apiPost } from '../lib/api';
import { ShopContext } from './shop-context';

const STORAGE_KEYS = {
  cart: 'mafalda_cart',
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
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminReady, setAdminReady] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [cart]);

  const clearAdminSession = async () => {
    try {
      await apiPost('/api/admin/auth/logout', {});
    } catch {
      // ignore logout transport failures and clear local admin state anyway
    } finally {
      setAdminUser(null);
      setAdminReady(true);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await apiGet('/api/auth/me');
      setUser(response.user || null);
      return response.user || null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthReady(true);
    }
  };

  const refreshAdminSession = async () => {
    try {
      const response = await apiGet('/api/admin/me');
      setAdminUser(response.user || null);
      return response.user || null;
    } catch {
      setAdminUser(null);
      return null;
    } finally {
      setAdminReady(true);
    }
  };

  useEffect(() => {
    refreshSession();
    refreshAdminSession();
  }, []);

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

  const applySession = ({ nextUser }) => {
    setUser(nextUser);
    setAuthReady(true);
    if (nextUser?.role === 'ADMIN') {
      setAdminUser(nextUser);
      setAdminReady(true);
    } else {
      clearAdminSession();
    }
  };

  const applyAdminSession = ({ nextAdminUser }) => {
    setAdminUser(nextAdminUser);
    setAdminReady(true);
  };

  const logout = async () => {
    try {
      await apiPost('/api/auth/logout', {});
    } catch {
      // ignore logout transport failures and clear local session anyway
    } finally {
      setUser(null);
      setAuthReady(true);
      clearAdminSession();
    }
  };

  const logoutAdmin = clearAdminSession;

  const value = {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    user,
    authReady,
    isAuthenticated: Boolean(user),
    applySession,
    refreshSession,
    logout,
    adminUser,
    adminReady,
    isAdminAuthenticated: Boolean(adminUser?.role === 'ADMIN'),
    applyAdminSession,
    refreshAdminSession,
    logoutAdmin,
    customerProfile,
    testProfile,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

