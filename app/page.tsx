"use client";

import { NimbleHomeContent } from "./components/NimbleHomeContent/nimble-home-content";
import { ProtectedRoute } from "./components/ProtectedRoute/protected-route";

export default function Home() {
  return (
    <ProtectedRoute>
      <div style={{ padding: "20px" }}>
        <NimbleHomeContent />
      </div>
    </ProtectedRoute>
  );
}
