import { Navigate, Route, Routes } from 'react-router-dom';
import { ecommerceEnabled } from './config/site';
import AdminPage from './pages/AdminPage';
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

function EcommerceRoute({ element }) {
  return ecommerceEnabled ? element : <UnavailablePage />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogo" element={ecommerceEnabled ? <Navigate to="/shop" replace /> : <UnavailablePage />} />
      <Route path="/shop" element={<EcommerceRoute element={<ShopPage />} />} />
      <Route path="/product/:id" element={<EcommerceRoute element={<ProductDetailPage />} />} />
      <Route path="/cart" element={<EcommerceRoute element={<CartPage />} />} />
      <Route path="/checkout" element={<EcommerceRoute element={<CheckoutPage />} />} />
      <Route path="/checkout/success" element={<EcommerceRoute element={<CheckoutSuccessPage />} />} />
      <Route path="/checkout/failure" element={<EcommerceRoute element={<CheckoutFailurePage />} />} />
      <Route path="/transfer/:orderCode" element={<EcommerceRoute element={<TransferPage />} />} />
      <Route path="/prints" element={<EcommerceRoute element={<PrintsPage />} />} />
      <Route path="/prints/:printCode" element={<EcommerceRoute element={<PrintTrackingPage />} />} />
      <Route path="/login" element={<EcommerceRoute element={<LoginPage />} />} />
      <Route path="/signup" element={<EcommerceRoute element={<SignupPage />} />} />
      <Route path="/profile" element={<EcommerceRoute element={<ProfilePage />} />} />
      <Route path="/admin" element={<EcommerceRoute element={<AdminPage />} />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/legacy-catalog" element={<CatalogPage />} />
    </Routes>
  );
}

export default App;
