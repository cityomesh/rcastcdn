"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    } else {
      // Redirect to home page after successful login
      console.log("Login successful, redirecting to home...");
      router.push("/");
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <Title order={2} ta="center" mb="md">
        Welcome to Ulka CDN
      </Title>
      <Text ta="center" c="dimmed" mb="xl">
        Sign in to manage your CDN infrastructure
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
            size="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            size="md"
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            mt="md"
            loading={loading}
            leftSection={<IconLogin size={18} />}
          >
            Sign In
          </Button>

          <Text ta="center" size="sm" c="dimmed">
            Don&apos;t have an account?{" "}
            <Anchor
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              size="sm"
            >
              Create one here
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
