"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Server, Route } from "../types/server";

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

      // Fetch servers and routes in parallel
      const [serversResponse, rulesResponse] = await Promise.all([
        fetch("/api/servers"),
        fetch("/api/rules"),
      ]);

      if (!rulesResponse.ok) {
        throw new Error("Failed to fetch routes from SSH server");
      }

      const [serversData, rulesData] = await Promise.all([
        serversResponse.json(),
        rulesResponse.json(),
      ]);

      console.log("Rules data received:", rulesData);

      if (!rulesData.success) {
        throw new Error(rulesData.error || "Failed to fetch routes");
      }

      setServers(serversData.data);

      // Extract routes from the SSH response
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
