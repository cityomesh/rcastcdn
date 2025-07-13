"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  Table,
  Text,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Alert,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconTrash,
  IconUser,
  IconUserPlus,
  IconAlertCircle,
  IconKey,
} from "@tabler/icons-react";
import { User, CreateUserRequest } from "../../types/auth";
import { api } from "../../utils/api";

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateUserRequest>({
    initialValues: {
      username: "",
      password: "",
      role: "user",
    },
    validate: {
      username: (value) =>
        value.length < 3 ? "Username must be at least 3 characters" : null,
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      role: (value) =>
        !value || !["admin", "user"].includes(value)
          ? "Role is required"
          : null,
    },
  });

  const resetPasswordForm = useForm({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      newPassword: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Passwords do not match" : null,
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("api/auth/users");
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch users",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (values: CreateUserRequest) => {
    try {
      setSubmitting(true);
      const response = await api.post("api/auth/users", values);
      if (response.success) {
        notifications.show({
          title: "Success",
          message: "User created successfully",
          color: "green",
        });
        setCreateModalOpen(false);
        form.reset();
        fetchUsers();
      }
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to create user",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to deactivate user "${username}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`api/auth/users/${userId}`);
      if (response.success) {
        notifications.show({
          title: "Success",
          message: "User deactivated successfully",
          color: "green",
        });
        fetchUsers();
      }
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to deactivate user",
        color: "red",
      });
    }
  };

  const resetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        username: selectedUser.username,
        newPassword: values.newPassword,
      });

      notifications.show({
        title: "Success",
        message: `Password reset successfully for ${selectedUser.username}`,
        color: "green",
      });

      setResetPasswordModalOpen(false);
      setSelectedUser(null);
      resetPasswordForm.reset();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message:
          (error as { response?: { data?: { error?: string } } }).response?.data
            ?.error || "Failed to reset password",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPasswordModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <Group>
          <IconUser size="1.5rem" />
          <Title order={2}>User Management</Title>
        </Group>
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create User
        </Button>
      </Group>

      {loading ? (
        <Text>Loading users...</Text>
      ) : (
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>
                  <Badge color={user.role === "admin" ? "red" : "blue"}>
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>{formatDate(user.createdAt)}</Table.Td>
                <Table.Td>
                  <Badge color={user.isActive ? "green" : "gray"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Reset Password">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => openResetPasswordModal(user)}
                      >
                        <IconKey size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Deactivate User">
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => deleteUser(user.id, user.username)}
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Create User Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          form.reset();
        }}
        title={
          <Group>
            <IconUserPlus size="1.2rem" />
            <Text>Create New User</Text>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(createUser)}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Enter username"
              required
              {...form.getInputProps("username")}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              required
              {...form.getInputProps("password")}
            />

            <Select
              label="Role"
              placeholder="Select role"
              required
              data={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
              ]}
              {...form.getInputProps("role")}
            />

            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="blue"
              title="Note"
            >
              Users will be able to log in with these credentials and access the
              CDN management system.
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setCreateModalOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        opened={resetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setSelectedUser(null);
          resetPasswordForm.reset();
        }}
        title={
          <Group>
            <IconKey size="1.2rem" />
            <Text>Reset Password for {selectedUser?.username}</Text>
          </Group>
        }
      >
        <form onSubmit={resetPasswordForm.onSubmit(resetPassword)}>
          <Stack>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              required
              {...resetPasswordForm.getInputProps("newPassword")}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              required
              {...resetPasswordForm.getInputProps("confirmPassword")}
            />

            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="yellow"
              title="Important"
            >
              The user will need to use this new password to log in. Make sure
              to securely share the new password with them.
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => {
                  setResetPasswordModalOpen(false);
                  setSelectedUser(null);
                  resetPasswordForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting} color="blue">
                Reset Password
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
};
