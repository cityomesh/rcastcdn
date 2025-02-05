"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface Server {
  id: string;
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
  originIpWithPort: string;
  createdAt: string;
}

export interface Route {
  host: string;
  path: string;
  origin: string;
  origin_path: string;
  use_ssl: string;
  geo: string;
  range: string;
  playlist_caching_interval: string;
}

interface DataContextType {
  routes: Route[];
  servers: Server[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const rulesResponse = await fetch("/api/rules");
      const rulesData = await rulesResponse.json();
      if (rulesData.success && rulesData.data?.SyncResponse?.Routes) {
        setRoutes(rulesData.data.SyncResponse.Routes);
      }

      const serversResponse = await fetch("/api/servers");
      const serversData = await serversResponse.json();
      setServers(serversData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        routes,
        servers,
        loading,
        error,
        refreshData: fetchData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
