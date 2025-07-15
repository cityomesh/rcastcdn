"use client";

import { useState } from "react";
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
    <Container size="xs" style={{ height: "100vh" }}>
      <Center style={{ height: "100%" }}>
        <Box style={{ width: "100%" }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack>
              <Center>
                <Title order={2} ta="center" mb="md">
                  ULKA CDN
                </Title>
              </Center>
              <Title order={3} ta="center" mb="xl" c="dimmed">
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
                <Stack>
                  <TextInput
                    label="Username"
                    placeholder="Enter your username"
                    required
                    {...form.getInputProps("username")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    required
                    {...form.getInputProps("password")}
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    leftSection={<IconLogin size="1rem" />}
                    fullWidth
                    mt="md"
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
