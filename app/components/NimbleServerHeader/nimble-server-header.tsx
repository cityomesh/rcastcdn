"use client";

import { Title, Group, Text, Anchor } from "@mantine/core";
import Link from "next/link";

export const NimbleServerHeader = () => {
  return (
    <Group
      justify="space-between"
      align="center"
      style={{ backgroundColor: "#3498db", padding: "1rem" }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Title order={2} c="white">
          Nimble Server Routes
        </Title>
      </Link>
      <Group gap="sm">
        <Link
          href="/servers"
          style={{ color: "white", textDecoration: "none" }}
        >
          Servers
        </Link>
        <Text c="white">•</Text>
        <Anchor href="#" c="white">
          Add re-streaming route
        </Anchor>
        <Text c="white">•</Text>
        <Anchor href="#" c="white">
          Add progressive download route
        </Anchor>
        <Text c="white">•</Text>
        <Anchor href="#" c="white">
          Add geo redirect
        </Anchor>
      </Group>
    </Group>
  );
};
