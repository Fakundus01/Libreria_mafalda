import { useShop } from '../context/ShopContext';

export function useAdminAccess() {
  const { adminUser, adminReady, refreshAdminSession, logoutAdmin } = useShop();

  return {
    adminUser,
    checkingAccess: !adminReady,
    accessError: '',
    refreshAccess: refreshAdminSession,
    logoutAdmin,
  };
}
