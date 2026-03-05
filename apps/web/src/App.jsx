import { Navigate, Route, Routes } from 'react-router-dom';
import { ecommerceEnabled } from './config/site';
import { useShop } from './context/ShopContext';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminPage from './pages/AdminPage';
import AdminProductsPage from './pages/AdminProductsPage';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import CheckoutFailurePage from './pages/CheckoutFailurePage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PrintTrackingPage from './pages/PrintTrackingPage';
import PrintsPage from './pages/PrintsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import SignupPage from './pages/SignupPage';
import TransferPage from './pages/TransferPage';
import UnavailablePage from './pages/UnavailablePage';

function EcommerceRoute({ children }) {
  return ecommerceEnabled ? children : <UnavailablePage />;
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useShop();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { isAuthenticated } = useShop();
  return isAuthenticated ? <Navigate to="/profile" replace /> : children;
}

function RequireCart({ children }) {
  const { cart } = useShop();
  return cart.length ? children : <Navigate to="/cart" replace />;
}

function RequireAdmin({ children }) {
  const { isAdminAuthenticated } = useShop();
  return isAdminAuthenticated ? children : <Navigate to="/admin" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogo" element={ecommerceEnabled ? <Navigate to="/shop" replace /> : <UnavailablePage />} />
      <Route path="/shop" element={<EcommerceRoute><ShopPage /></EcommerceRoute>} />
      <Route path="/products" element={<EcommerceRoute><Navigate to="/admin/products" replace /></EcommerceRoute>} />
      <Route path="/product/:id" element={<EcommerceRoute><ProductDetailPage /></EcommerceRoute>} />
      <Route path="/cart" element={<EcommerceRoute><CartPage /></EcommerceRoute>} />
      <Route path="/checkout" element={<EcommerceRoute><RequireCart><CheckoutPage /></RequireCart></EcommerceRoute>} />
      <Route path="/checkout/success" element={<EcommerceRoute><CheckoutSuccessPage /></EcommerceRoute>} />
      <Route path="/checkout/failure" element={<EcommerceRoute><CheckoutFailurePage /></EcommerceRoute>} />
      <Route path="/transfer/:orderCode" element={<EcommerceRoute><TransferPage /></EcommerceRoute>} />
      <Route path="/prints" element={<EcommerceRoute><PrintsPage /></EcommerceRoute>} />
      <Route path="/prints/:printCode" element={<EcommerceRoute><PrintTrackingPage /></EcommerceRoute>} />
      <Route path="/login" element={<EcommerceRoute><RequireGuest><LoginPage /></RequireGuest></EcommerceRoute>} />
      <Route path="/signup" element={<EcommerceRoute><RequireGuest><SignupPage /></RequireGuest></EcommerceRoute>} />
      <Route path="/profile" element={<EcommerceRoute><RequireAuth><ProfilePage /></RequireAuth></EcommerceRoute>} />
      <Route path="/admin" element={<EcommerceRoute><AdminPage /></EcommerceRoute>} />
      <Route path="/admin/dashboard" element={<EcommerceRoute><RequireAdmin><AdminDashboardPage /></RequireAdmin></EcommerceRoute>} />
      <Route path="/admin/products" element={<EcommerceRoute><RequireAdmin><AdminProductsPage /></RequireAdmin></EcommerceRoute>} />
      <Route path="/admin/orders" element={<EcommerceRoute><RequireAdmin><AdminOrdersPage /></RequireAdmin></EcommerceRoute>} />
      <Route path="/admin/customers" element={<EcommerceRoute><RequireAdmin><AdminCustomersPage /></RequireAdmin></EcommerceRoute>} />
      <Route path="/admin/messages" element={<EcommerceRoute><RequireAdmin><AdminMessagesPage /></RequireAdmin></EcommerceRoute>} />
      <Route path="/legacy-catalog" element={<CatalogPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
