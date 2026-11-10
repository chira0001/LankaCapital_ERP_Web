import { useEffect, useState } from "react";
import axiosAPI from "@/api/axiosAPI";
import { ADMIN_MENU_ITEMS } from "@/lib/adminMenuItems";
import { AdminMenuAccessContext } from "@/lib/adminMenuAccess";

export const AdminMenuAccessProvider = ({ children }) => {
  const [access, setAccess] = useState({
    isLoading: true,
    isSuperAdmin: false,
    permissions: [],
  });

  useEffect(() => {
    let active = true;
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
      })
      .catch((error) => {
        console.error("Failed to load admin menu permissions:", error);
        if (active) setAccess({ isLoading: false, isSuperAdmin: false, permissions: [] });
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