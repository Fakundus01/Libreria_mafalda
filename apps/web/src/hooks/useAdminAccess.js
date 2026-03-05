import { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { apiGet } from '../lib/api';

export function useAdminAccess() {
  const { adminToken, adminUser, applyAdminSession, logoutAdmin } = useShop();
  const [checkingAccess, setCheckingAccess] = useState(Boolean(adminToken));
  const [accessError, setAccessError] = useState('');

  const refreshAccess = async (tokenToUse = adminToken) => {
    if (!tokenToUse) {
      setCheckingAccess(false);
      return null;
    }

    setCheckingAccess(true);
    setAccessError('');

    try {
      const response = await apiGet('/api/admin/me', { token: tokenToUse });
      applyAdminSession({ nextAdminToken: tokenToUse, nextAdminUser: response.user });
      return response.user;
    } catch (requestError) {
      logoutAdmin();
      setAccessError(requestError.message || 'No se pudo validar la sesion admin.');
      return null;
    } finally {
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      refreshAccess(adminToken);
    } else {
      setCheckingAccess(false);
    }
  }, [adminToken]);

  return {
    adminToken,
    adminUser,
    checkingAccess,
    accessError,
    refreshAccess,
  };
}
