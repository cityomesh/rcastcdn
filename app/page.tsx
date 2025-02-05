"use client";

// import { useEffect } from "react";
import { NimbleHomeContent } from "./components/NimbleHomeContent/nimble-home-content";

// const fetchRules = async () => {
//   try {
//     const response = await fetch("/api/rules");
//     const data = await response.json();
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
