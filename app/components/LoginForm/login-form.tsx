"use client";

import { useState } from "react";
import Image from "next/image";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Alert,
  Stack,
  Center,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { useAuth } from "../../contexts/AuthContext";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value.length < 1 ? "Username is required" : null),
      password: (value) => (value.length < 1 ? "Password is required" : null),
    },
  });

  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await login(values.username, values.password);
      if (!result.success) {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" style={{ height: "100vh" }}>
      <Center style={{ height: "100%" }}>
        <Box style={{ width: "100%", maxWidth: "480px" }}>
          <Paper shadow="xl" p="2rem" radius="lg" withBorder>
            <Stack gap="xl">
              <Center>
                <Box mb="lg">
                  <Image
                    src="/rcast_logo.jpg"
                    alt="RCast Logo"
                    width={320}
                    height={120}
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </Box>
              </Center>
              <Title order={3} ta="center" mb="lg" c="dimmed" fw={400}>
                Please sign in to continue
              </Title>

              {error && (
                <Alert
                  icon={<IconAlertCircle size="1rem" />}
                  color="red"
                  title="Login Error"
                  mb="md"
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="lg">
                  <TextInput
                    label="Username"
                    placeholder="Enter your username"
                    required
                    size="md"
                    {...form.getInputProps("username")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    required
                    size="md"
                    {...form.getInputProps("password")}
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    leftSection={<IconLogin size="1rem" />}
                    fullWidth
                    mt="md"
                    size="md"
                    radius="md"
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>
        </Box>
      </Center>
    </Container>
  );
};
