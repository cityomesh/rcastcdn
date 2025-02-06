import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Modal,
  Switch,
  Text,
  Select,
} from "@mantine/core";
import { Route, Server } from "@/app/types/server";

interface RouteFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<Route, "id">) => void;
  initialValues?: Route;
  title: string;
  servers: Server[];
  selectedServerId: string;
  onServerChange: (serverId: string) => void;
}

export function RouteForm({
  opened,
  onClose,
  initialValues,
  onSubmit,
  title,
  servers,
  selectedServerId,
  onServerChange,
}: RouteFormProps) {
  const form = useForm<Omit<Route, "id">>({
    initialValues: initialValues || {
      path: "",
      origin: "",
      origin_path: "",
      use_ssl: false,
      playlist_caching_interval: "2",
    },
    validate: {
      path: (value) => {
        if (!value) return "Path is required";
        if (!value.startsWith("/")) return "Path must start with /";
        return null;
      },
      origin_path: (value) => {
        if (!value) return "Origin path is required";
        if (!value.startsWith("/")) return "Origin path must start with /";
        return null;
      },
      playlist_caching_interval: (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          return "Caching interval must be a positive number";
        }
        return null;
      },
    },
  });

  const selectedServer = servers.find((s) => s.id === selectedServerId);
  const originIp = selectedServer
    ? selectedServer.originIpWithPort.split(":")[0]
    : "";

  const handleSubmit = form.onSubmit((values) => {
    // Auto-set origin based on selected server
    const updatedValues = {
      ...values,
      origin: `rtmp://${originIp}:1935`,
    };
    onSubmit(updatedValues);
    form.reset();
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="xl">
          {title}
        </Text>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Server"
            placeholder="Select a server"
            data={servers.map((server) => ({
              value: server.id,
              label: server.displayName,
            }))}
            value={selectedServerId}
            onChange={(value) => value && onServerChange(value)}
            required
          />

          <TextInput
            required
            label="Path"
            placeholder="/live/stream1"
            {...form.getInputProps("path")}
          />

          <TextInput
            label="Origin"
            value={`rtmp://${originIp}:1935`}
            disabled
            description="Automatically set based on selected server"
          />

          <TextInput
            required
            label="Origin Path"
            placeholder="/live/stream1"
            {...form.getInputProps("origin_path")}
          />

          <Switch
            label="Use SSL"
            {...form.getInputProps("use_ssl", { type: "checkbox" })}
          />

          <TextInput
            required
            label="Playlist Caching Interval (seconds)"
            placeholder="2"
            {...form.getInputProps("playlist_caching_interval")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
