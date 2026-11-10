import { createContext, useContext } from "react";

export const AdminMenuAccessContext = createContext({
  isLoading: true,
  isSuperAdmin: false,
  permissions: [],
});

export const useAdminMenuAccess = () => useContext(AdminMenuAccessContext);