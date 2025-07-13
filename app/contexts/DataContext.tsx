"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Server, Route } from "../types/server";
import { api } from "../utils/api";

interface DataContextType {
  servers: Server[];
  routes: Route[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  servers: [],
  routes: [],
  loading: true,
  refreshData: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [servers, setServers] = useState<Server[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);
      console.log("Fetching data...");

      // Fetch servers and rules in parallel using the API utility
      const [serversData, rulesData] = await Promise.all([
        api.get("api/servers"),
        api.get("api/rules"),
      ]);

      console.log("Rules data received:", rulesData);

      if (!rulesData.success) {
        throw new Error(rulesData.error || "Failed to fetch routes");
      }

      setServers(serversData.data);

      // Extract routes from the API response
      const routes = rulesData.data?.SyncResponse?.Routes || [];
      console.log("Extracted routes:", routes);

      setRoutes(routes);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRoutes([]); // Reset routes on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ servers, routes, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
export type { Server };
