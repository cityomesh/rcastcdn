"use client";

import { Title, Group, Text, Button, Avatar, Menu } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname } from "next/navigation";

export const NimbleServerHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show header on auth page
  if (pathname === "/auth") {
    return null;
  }

  return (
    <Group
      justify="space-between"
      align="center"
      style={{ backgroundColor: "#8B0000", padding: "1rem" }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Title order={2} c="white">
          CDN Server Routes
        </Title>
      </Link>

      <Group gap="lg">
        <Group gap="sm">
          <Link
            href="/servers"
            style={{ color: "white", textDecoration: "none" }}
          >
            Servers
          </Link>
          <Text c="white">•</Text>
          <Link
            href="/route-servers"
            style={{ color: "white", textDecoration: "none" }}
          >
            Route-Server Assignments
          </Link>
        </Group>

        {user && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="subtle"
                color="white"
                leftSection={
                  <Avatar size="sm" radius="xl" color="white">
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                }
                styles={{
                  root: { color: "white" },
                  section: { color: "white" },
                }}
              >
                {user.username}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item leftSection={<IconUser size={14} />} disabled>
                {user.email}
              </Menu.Item>
              <Menu.Item leftSection={<IconUser size={14} />} disabled>
                Role: {user.role}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={logout}
                color="red"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  );
};
