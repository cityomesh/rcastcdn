"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader, Center, Stack, Text } from "@mantine/core";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're already on the auth page
    if (pathname === "/auth") {
      return;
    }

    // Only redirect if we're done loading and definitely have no user
    if (!loading && !user) {
      console.log("Redirecting to auth page - no user found");
      router.push("/auth");
    }
  }, [user, loading, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Verifying authentication...</Text>
        </Stack>
      </Center>
    );
  }

  // If on auth page, always show content
  if (pathname === "/auth") {
    return <>{children}</>;
  }

  // If authenticated, show protected content
  if (user) {
    return <>{children}</>;
  }

  // If not authenticated and not on auth page, show loading (redirect will happen)
  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text c="dimmed">Redirecting to login...</Text>
      </Stack>
    </Center>
  );
}
