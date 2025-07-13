"use client";

import { Title, Group, Text } from "@mantine/core";
import Link from "next/link";

export const NimbleServerHeader = () => {
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
      <Group gap="sm">
        <Link
          href="/servers"
          style={{ color: "white", textDecoration: "none" }}
        >
          Servers
        </Link>
        {/* <Text c="white">•</Text>
        <Link href="/routes" style={{ color: "white", textDecoration: "none" }}>
          Routes
        </Link> */}
        <Text c="white">•</Text>
        <Link
          href="/route-servers"
          style={{ color: "white", textDecoration: "none" }}
        >
          Route-Server Assignments
        </Link>
      </Group>
    </Group>
  );
};
