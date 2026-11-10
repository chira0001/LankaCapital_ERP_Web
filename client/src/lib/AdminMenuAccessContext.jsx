import { useEffect, useState } from "react";
import axiosAPI from "@/api/axiosAPI";
import { ADMIN_MENU_ITEMS } from "@/lib/adminMenuItems";
import { AdminMenuAccessContext } from "@/lib/adminMenuAccess";

const CACHE_DURATION_MS = 5 * 60 * 1000;

const getCacheKey = () => {
  const username = localStorage.getItem("username");
  return username ? `adminMenuAccess:${username}` : null;
};

const readCachedAccess = () => {
  const key = getCacheKey();
  if (!key) return null;

  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      cached?.expiresAt > Date.now() &&
      Array.isArray(cached.permissions)
    ) {
      return {
        isLoading: false,
        isSuperAdmin: Boolean(cached.isSuperAdmin),
        permissions: cached.permissions,
      };
    }

    sessionStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to read cached admin menu permissions:", error);
    sessionStorage.removeItem(key);
  }

  return null;
};

const cacheAccess = (key, isSuperAdmin, permissions) => {
  if (!key) return;

  try {
    sessionStorage.setItem(key, JSON.stringify({
      isSuperAdmin,
      permissions,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    }));
  } catch (error) {
    console.error("Failed to cache admin menu permissions:", error);
  }
};

export const AdminMenuAccessProvider = ({ children }) => {
  const [access, setAccess] = useState(
    () => readCachedAccess() || {
      isLoading: true,
      isSuperAdmin: false,
      permissions: [],
    }
  );

  useEffect(() => {
    let active = true;
    const cacheKey = getCacheKey();
    axiosAPI
      .get("/admin/menu-permissions")
      .then(({ data }) => {
        if (!active) return;
        const permissions = data?.superAdmin
          ? ADMIN_MENU_ITEMS.map((item) => item.id)
          : Array.isArray(data?.permissions)
            ? data.permissions
            : [];
        setAccess({
          isLoading: false,
          isSuperAdmin: Boolean(data?.superAdmin),
          permissions,
        });
        cacheAccess(cacheKey, Boolean(data?.superAdmin), permissions);
      })
      .catch((error) => {
        console.error("Failed to load admin menu permissions:", error);
        if (active) {
          setAccess((currentAccess) => currentAccess.isLoading
            ? { isLoading: false, isSuperAdmin: false, permissions: [] }
            : currentAccess);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminMenuAccessContext.Provider value={access}>
      {children}
    </AdminMenuAccessContext.Provider>
  );
};