"use client";

// import { useEffect } from "react";
// import { api } from "./utils/api";
import { NimbleHomeContent } from "./components/NimbleHomeContent/nimble-home-content";

// const fetchRules = async () => {
//   try {
//     const data = await api.get("api/rules");
//     console.log("Rules response:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching rules:", error);
//   }
// };

export default function Home() {
  // useEffect(() => {
  //   fetchRules();
  // }, []);

  return (
    <div style={{ padding: "20px" }}>
      <NimbleHomeContent />
    </div>
  );
}
