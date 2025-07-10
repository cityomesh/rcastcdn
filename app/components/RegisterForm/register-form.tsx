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
import { IconAlertCircle, IconUserPlus } from "@tabler/icons-react";
import { useAuth } from "../../contexts/AuthContext";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const result = await register(username, email, password);
    if (!result.success) {
      setError(result.error || "Registration failed");
    } else {
      // Redirect to home page after successful registration
      console.log("Registration successful, redirecting to home...");
      router.push("/");
    }
  };

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <Title order={2} ta="center" mb="md">
        Create Account
      </Title>
      <Text ta="center" c="dimmed" mb="xl">
        Set up your CDN management account
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
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            required
            size="md"
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            size="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            size="md"
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            required
            size="md"
          />

          <Button
            type="submit"
            fullWidth
            size="md"
            mt="md"
            loading={loading}
            leftSection={<IconUserPlus size={18} />}
          >
            Create Account
          </Button>

          <Text ta="center" size="sm" c="dimmed">
            Already have an account?{" "}
            <Anchor
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              size="sm"
            >
              Sign in here
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
