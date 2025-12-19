import React, { useEffect, useState } from "react";
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
  Select,
} from "@mantine/core";
import {
  IconServer,
  IconNetwork,
  IconUser,
  IconLock,
  IconNumbers,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Server } from "@/app/types/server";
import { api } from "@/app/utils/api";

interface ServerFormData {
  displayName: string;
  ipAddress: string;
  sshUsername: string;
  sshPassword: string;
  port: number;
  originIpWithPort: string;
  serverType: "origin" | "edge";
  parentServerId?: string;
}

interface ServerFormProps {
  opened: boolean;
  onClose: () => void;
  initialValues?: Server | ServerFormData;
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
  const [availableServers, setAvailableServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServerFormData>({
    initialValues: {
      displayName: "",
      ipAddress: "",
      sshUsername: "",
      sshPassword: "",
      port: 22,
      originIpWithPort: "",
      serverType: "origin",
      parentServerId: undefined,
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
        return null;
      },
      port: (value: number) => {
        if (!value) return "Port is required";
        if (value < 1 || value > 65535)
          return "Port must be between 1 and 65535";
        return null;
      },
      originIpWithPort: (value: string) => {
        if (!value)
          return "Output IP with port is required (e.g., 192.168.1.1:8080)";
        // Validate IP:Port format (e.g., 192.168.1.1:8080)
        const ipPortRegex = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
        if (!ipPortRegex.test(value)) {
          return "Invalid format. Expected: IP:Port (e.g., 192.168.1.1:8080)";
        }
        // Validate IP part
        const [ipPart, portPart] = value.split(":");
        const ipOctets = ipPart.split(".").map(Number);
        if (!ipOctets.every((octet) => octet >= 0 && octet <= 255)) {
          return "Output IP address octets must be between 0 and 255";
        }
        // Validate port part
        const port = parseInt(portPart);
        if (port < 1 || port > 65535) {
          return "Origin port must be between 1 and 65535";
        }
        return null;
      },
      parentServerId: (value, values) => {
        if (values.serverType === "edge" && !value) {
          return "Parent server is required for edge servers";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    // Reset the form when modal is closed
    if (!opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  useEffect(() => {
    // Update form values when initialValues change and modal is open
    if (initialValues && opened) {
      form.setValues({
        displayName: initialValues.displayName || "",
        ipAddress: initialValues.ipAddress || "",
        sshUsername: initialValues.sshUsername || "",
        sshPassword: initialValues.sshPassword || "",
        port: initialValues.port || 22,
        originIpWithPort: initialValues.originIpWithPort || "",
        serverType: initialValues.serverType || "origin",
        parentServerId: initialValues.parentServerId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, opened]);


  // useEffect(() => {
  //   if (initialValues && opened) {
  //     form.setValues({
  //       displayName: initialValues.displayName || "",
  //       ipAddress: initialValues.ipAddress || "",
  //       sshUsername: initialValues.sshUsername || "",
  //       sshPassword: "", // ✅ Always blank — never pre-fill
  //       port: initialValues.port || 22,
  //       originIpWithPort: initialValues.originIpWithPort || "",
  //       serverType: initialValues.serverType || "origin",
  //       parentServerId: initialValues.parentServerId,
  //     });
  //   }
  // }, [initialValues, opened]);


  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true);
      try {
        const data = await api.get("api/servers");
        setAvailableServers(data.data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (opened) {
      fetchServers();
    }
  }, [opened]);

  const handleSubmit = form.onSubmit((values: ServerFormData) => {
    onSubmit(values);
    form.reset();
    onClose();
  });

  const showParentSelection = form.values.serverType === "edge";

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

                {/* <Select
                  required
                  label={<Text fw={500}>Server Type</Text>}
                  placeholder="Select server type"
                  data={[
                    { value: "origin", label: "Origin Server" },
                    { value: "edge", label: "Edge Server" },
                  ]}
                  {...form.getInputProps("serverType")}
                  description={
                    <Text component="span" size="xs" c="dimmed">
                      Origin servers hold original content, edge servers
                      distribute content
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
                  onChange={(value) => {
                    form.setFieldValue(
                      "serverType",
                      value as "origin" | "edge"
                    );
                    // Clear parent server if type is origin
                    if (value === "origin") {
                      form.setFieldValue("parentServerId", undefined);
                    }
                  }}
                /> */}

                {showParentSelection && (
                  <Select
                    label={<Text fw={500}>Parent Server</Text>}
                    placeholder="Select parent server"
                    data={availableServers.map((server) => ({
                      value: server.id,
                      label: `${server.displayName} (${server.ipAddress})`,
                    }))}
                    {...form.getInputProps("parentServerId")}
                    description={
                      <Text component="span" size="xs" c="dimmed">
                        The server that will act as an origin for this edge
                        server
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
                    disabled={isLoading || availableServers.length === 0}
                    onChange={(value) => {
                      form.setFieldValue("parentServerId", value || undefined);

                      if (value) {
                        const parent = availableServers.find(
                          (server) => server.id === value
                        );
                        if (parent) {
                          form.setFieldValue(
                            "originIpWithPort",
                            `${parent.ipAddress}:${parent.port}`
                          );
                        }
                      }
                    }}
                  />
                )}

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
                  label={<Text fw={500}>Output IP with Port</Text>}
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

                {/* <PasswordInput
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
                /> */}


                {/* <PasswordInput
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
                  visibilityToggleIcon={() => null} // ✅ hides the eye icon completely
                  styles={{
                    input: {
                      "&:focus": {
                        boxShadow: "0 0 0 2px rgba(0, 122, 255, 0.1)", // focus shadow
                      },
                      fontSize: "0.95rem",
                      "&::selection": {
                        background: "rgba(0,0,0,0.1)", // subtle selection
                      },
                    },
                    label: {
                      marginBottom: 4,
                    },
                  }}
                /> */}


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
                visibilityToggleIcon={() => null} // ✅ hides the "eye" icon
                visibilityToggleButtonProps={{
                  style: { display: "none" }, // ✅ completely removes visibility toggle button
                }}
                type="password" // ✅ ensures it always shows dots (masked)
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
                    Security Information
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Enter the password for your SSH server
                    <br />
                    • Ensure you have the correct credentials for authentication
                    <br />• Contact your system administrator if you need
                    assistance
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
