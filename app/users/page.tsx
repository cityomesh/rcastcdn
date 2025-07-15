"use client";

import { UserManagement } from "../components/UserManagement/user-management";
import { ProtectedRoute } from "../components/ProtectedRoute/protected-route";

export default function UsersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div style={{ padding: "20px" }}>
        <UserManagement />
      </div>
    </ProtectedRoute>
  );
}
