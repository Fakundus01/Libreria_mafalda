import { Navigate, Route, Routes } from 'react-router-dom';
import { ecommerceEnabled } from './config/site';
import AdminPage from './pages/AdminPage';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import UnavailablePage from './pages/UnavailablePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogo" element={ecommerceEnabled ? <Navigate to="/shop" replace /> : <UnavailablePage />} />
      <Route path="/shop" element={ecommerceEnabled ? <ShopPage /> : <UnavailablePage />} />
      <Route path="/checkout" element={ecommerceEnabled ? <CheckoutPage /> : <UnavailablePage />} />
      <Route path="/admin" element={ecommerceEnabled ? <AdminPage /> : <UnavailablePage />} />
      <Route path="*" element={<CatalogPage />} />
    </Routes>
  );
}

export default App;
