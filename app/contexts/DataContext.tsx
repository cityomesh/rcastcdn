"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Server, Route } from "../types/server";
import { api } from "../utils/api";
import { useAuth } from "./AuthContext";

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
  const { user, loading: authLoading } = useAuth();

  const refreshData = async () => {
    // Don't fetch data if user is not authenticated
    if (!user) {
      console.log("User not authenticated, skipping data fetch");
      setLoading(false);
      return;
    }

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
    if (!authLoading) {
      if (user) {
        console.log("User authenticated, fetching data");
        refreshData();
      } else {
        console.log("User not authenticated, clearing data");
        setServers([]);
        setRoutes([]);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  return (
    <DataContext.Provider value={{ servers, routes, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
export type { Server };
