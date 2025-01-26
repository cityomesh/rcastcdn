import React from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Modal,
  NumberInput,
  PasswordInput,
  Text,
  Divider,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import {
  IconServer,
  IconNetwork,
  IconUser,
  IconLock,
  IconNumbers,
} from "@tabler/icons-react";

interface ServerFormData {
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
}

interface ServerFormProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: ServerFormData;
  onSubmit: (values: ServerFormData) => void;
  title: string;
}

export function ServerForm({
  opened,
  onClose,
  initialValues,
  onSubmit,
  title,
}: ServerFormProps) {
  const form = useForm<ServerFormData>({
    initialValues: initialValues || {
      displayName: "",
      ipAddress: "",
      sshUsername: "",
      sshPassword: "",
      port: 22,
    },
    validate: {
      displayName: (value: string) =>
        !value ? "Display name is required" : null,
      ipAddress: (value: string) => {
        if (!value) return "IP address is required";
        // Basic IP address validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        return !ipRegex.test(value) ? "Invalid IP address format" : null;
      },
      sshUsername: (value: string) =>
        !value ? "SSH username is required" : null,
      sshPassword: (value: string) =>
        !value ? "SSH password is required" : null,
      port: (value: number) => {
        if (!value) return "Port is required";
        if (value < 1 || value > 65535)
          return "Port must be between 1 and 65535";
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit((values: ServerFormData) => {
    onSubmit(values);
    form.reset();
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="xl" style={{ letterSpacing: "-0.01em" }}>
          {title}
        </Text>
      }
      size="xl"
      padding="lg"
      radius="md"
      shadow="xl"
      styles={{
        header: {
          padding: "24px 32px 0",
        },
        body: {
          padding: "24px 32px 32px",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <SimpleGrid cols={2} spacing="lg">
            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Text
                size="sm"
                fw={600}
                mb={12}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: "0.03em" }}
              >
                Server Details
              </Text>
              <Divider mb="md" />
              <Stack gap="md">
                <TextInput
                  required
                  label={<Text fw={500}>Display Name</Text>}
                  placeholder="e.g., Production Server"
                  leftSection={<IconServer size={16} />}
                  {...form.getInputProps("displayName")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      A friendly name to identify your server
                    </Text>
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)",
                      },
                      fontSize: "0.95rem",
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                />

                <TextInput
                  required
                  label={<Text fw={500}>IP Address</Text>}
                  placeholder="192.168.1.1"
                  leftSection={<IconNetwork size={16} />}
                  {...form.getInputProps("ipAddress")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      The IP address of your server
                    </Text>
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)",
                      },
                      fontSize: "0.95rem",
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                />

                <NumberInput
                  required
                  label={<Text fw={500}>Port</Text>}
                  placeholder="22"
                  leftSection={<IconNumbers size={16} />}
                  min={1}
                  max={65535}
                  {...form.getInputProps("port")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      SSH port number (default: 22)
                    </Text>
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)",
                      },
                      fontSize: "0.95rem",
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                />
              </Stack>
            </Paper>

            <Paper shadow="sm" p="xl" radius="md" withBorder>
              <Text
                size="sm"
                fw={600}
                mb={12}
                tt="uppercase"
                c="dimmed"
                style={{ letterSpacing: "0.03em" }}
              >
                SSH Configuration
              </Text>
              <Divider mb="md" />
              <Stack gap="md">
                <TextInput
                  required
                  label={<Text fw={500}>SSH Username</Text>}
                  placeholder="username"
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("sshUsername")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      Username for SSH authentication
                    </Text>
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)",
                      },
                      fontSize: "0.95rem",
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                />

                <PasswordInput
                  required
                  label={<Text fw={500}>SSH Password</Text>}
                  placeholder="Enter SSH password"
                  leftSection={<IconLock size={16} />}
                  {...form.getInputProps("sshPassword")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      Password for SSH authentication
                    </Text>
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)",
                      },
                      fontSize: "0.95rem",
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                />
              </Stack>
            </Paper>
          </SimpleGrid>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="light"
              color="gray"
              onClick={onClose}
              styles={{
                root: {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  fontWeight: 500,
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              styles={{
                root: {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: 500,
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                },
              }}
            >
              {initialValues ? "Update Server" : "Create Server"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
