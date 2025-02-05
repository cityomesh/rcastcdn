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
  Alert,
} from "@mantine/core";
import {
  IconServer,
  IconNetwork,
  IconUser,
  IconLock,
  IconNumbers,
  IconAlertCircle,
} from "@tabler/icons-react";

interface ServerFormData {
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
  originIpWithPort: string;
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
      originIpWithPort: "",
    },
    validate: {
      displayName: (value: string) => {
        if (!value) return "Display name is required";
        if (value.length < 3)
          return "Display name must be at least 3 characters";
        if (value.length > 50)
          return "Display name must be at most 50 characters";
        return null;
      },
      ipAddress: (value: string) => {
        if (!value) return "IP address is required";
        // Validate IP address format
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(value)) return "Invalid IP address format";
        // Validate each octet
        const octets = value.split(".").map(Number);
        if (!octets.every((octet) => octet >= 0 && octet <= 255)) {
          return "IP address octets must be between 0 and 255";
        }
        return null;
      },
      sshUsername: (value: string) => {
        if (!value) return "SSH username is required";
        if (value.length < 3)
          return "SSH username must be at least 3 characters";
        if (value.length > 32)
          return "SSH username must be at most 32 characters";
        if (!/^[a-z_][a-z0-9_-]*[$]?$/.test(value)) {
          return "Invalid SSH username format";
        }
        return null;
      },
      sshPassword: (value: string) => {
        if (!value) return "SSH password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value.length > 128)
          return "Password must be at most 128 characters";
        // Check for at least one uppercase, one lowercase, one number
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        return null;
      },
      port: (value: number) => {
        if (!value) return "Port is required";
        if (value < 1 || value > 65535)
          return "Port must be between 1 and 65535";
        return null;
      },
      originIpWithPort: (value: string) => {
        if (!value) return "Origin IP with port is required";
        // Validate IP:Port format (e.g., 192.168.1.1:8080)
        const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
        if (!ipPortRegex.test(value)) {
          return "Invalid format. Expected: IP:Port (e.g., 192.168.1.1:8080)";
        }
        // Validate IP part
        const [ipPart, portPart] = value.split(":");
        const ipOctets = ipPart.split(".").map(Number);
        if (!ipOctets.every((octet) => octet >= 0 && octet <= 255)) {
          return "Origin IP address octets must be between 0 and 255";
        }
        // Validate port part
        const port = parseInt(portPart);
        if (port < 1 || port > 65535) {
          return "Origin port must be between 1 and 65535";
        }
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
                  placeholder="e.g., Edge-London-01"
                  leftSection={<IconServer size={16} />}
                  {...form.getInputProps("displayName")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      A descriptive name including location or purpose
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
                      The edge server&apos;s IP address
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
                      Edge server&apos;s listening port
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
                  label={<Text fw={500}>Origin IP with Port</Text>}
                  placeholder="192.168.1.1:8080"
                  leftSection={<IconNetwork size={16} />}
                  {...form.getInputProps("originIpWithPort")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      The origin server&apos;s IP and port (e.g.,
                      192.168.1.1:8080)
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
                      Strong password for SSH authentication
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

                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  <Text size="sm" mb={8} fw={500}>
                    Security Best Practices
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Use strong passwords with mixed case, numbers & symbols
                    <br />
                    • Regularly rotate SSH credentials
                    <br />• Consider using SSH keys for enhanced security
                  </Text>
                </Alert>
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
