"use client";

import {
  Title,
  Group,
  Text,
  Button,
  Menu,
  Badge,
  Container,
  Flex,
  Box,
  rem,
  UnstyledButton,
} from "@mantine/core";
import {
  IconUser,
  IconLogout,
  IconUsers,
  IconChevronDown,
  IconServer,
  IconRoute,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export const NimbleServerHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Don't render header on login page
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      label: "Servers",
      href: "/servers",
      icon: IconServer,
    },
    {
      label: "Route-Server Assignments",
      href: "/route-servers",
      icon: IconRoute,
    },
    ...(user?.role === "admin"
      ? [
          {
            label: "User Management",
            href: "/users",
            icon: IconSettings,
          },
        ]
      : []),
  ];

  return (
    <Box
      style={{
        backgroundColor: "#8B0000",
        borderBottom: "1px solid #6B0000",
        minHeight: rem(60),
      }}
    >
      <Container size="xl" px="md">
        <Flex
          justify="space-between"
          align="center"
          style={{ minHeight: rem(60) }}
        >
          {/* Left: Logo/Title */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Group gap="sm">
              <Title order={2} c="white" fw={600}>
                ULKA CDN
              </Title>
              <Text c="rgba(255,255,255,0.8)" size="sm" fw={500}>
                Management System
              </Text>
            </Group>
          </Link>

          {/* Center: Navigation */}
          <Group gap="lg" visibleFrom="sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ textDecoration: "none" }}
                >
                  <UnstyledButton
                    style={{
                      padding: `${rem(8)} ${rem(16)}`,
                      borderRadius: rem(6),
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(255,255,255,0.2)"
                        : "none",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                      },
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isActive
                        ? "rgba(255,255,255,0.1)"
                        : "transparent";
                    }}
                  >
                    <Group gap="xs">
                      <Icon size="1rem" color="white" />
                      <Text c="white" size="sm" fw={500}>
                        {item.label}
                      </Text>
                    </Group>
                  </UnstyledButton>
                </Link>
              );
            })}
          </Group>

          {/* Right: User Menu */}
          <Group gap="sm">
            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  color="white"
                  leftSection={<IconUser size="1rem" />}
                  rightSection={<IconChevronDown size="1rem" />}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  <Group gap="xs">
                    <Text c="white" size="sm" fw={500}>
                      {user?.username}
                    </Text>
                    <Badge
                      color={user?.role === "admin" ? "yellow" : "blue"}
                      size="xs"
                      variant="light"
                    >
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </Group>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size="1rem" />} disabled>
                  <Text size="sm">
                    Signed in as <strong>{user?.username}</strong>
                  </Text>
                </Menu.Item>

                <Menu.Divider />

                {user?.role === "admin" && (
                  <>
                    <Menu.Label>Administration</Menu.Label>
                    <Menu.Item
                      leftSection={<IconUsers size="1rem" />}
                      onClick={() => router.push("/users")}
                    >
                      Manage Users
                    </Menu.Item>
                    <Menu.Divider />
                  </>
                )}

                <Menu.Item
                  leftSection={<IconLogout size="1rem" />}
                  color="red"
                  onClick={handleLogout}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Flex>
      </Container>
    </Box>
  );
};
