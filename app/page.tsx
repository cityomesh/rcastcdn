"use client";

import { useEffect } from "react";
import { UlkaTable } from "./components/UlkaTable/ulka-table";

const fetchRules = async () => {
  try {
    const response = await fetch("/api/rules");
    const data = await response.json();
    console.log("Rules response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching rules:", error);
  }
};

export default function Home() {
  const mockData = [
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },
    {
      requestPath: "/Zee_Ganga/Zee_Ganga/",
      redirectPath: "10.10.148.25:8081/Zee_Ganga/Zee_Ganga/",
      assignedServer: "Ulka Test",
    },

    // Add more mock data as needed
  ];

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <UlkaTable data={mockData} />
    </div>
  );
}
