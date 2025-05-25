import {
  Text,
  Stack,
  Group,
  Loader,
  Paper,
  Title,
  TextInput,
  Select,
  Badge,
  Flex,
  Divider,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { useEffect, useState, useCallback } from "react";
import { UlkaTable } from "../UlkaTable/ulka-table";
import { ClientOnly } from "../ClientOnly/client-only";
import { api } from "@/app/utils/api";
import { IconSearch, IconRefresh, IconFilter } from "@tabler/icons-react";
import { StreamType, RouteServerAssignment } from "@/app/types/server";

export const NimbleHomeContent = () => {
  const [routeServers, setRouteServers] = useState<RouteServerAssignment[]>([]);
  const [filteredData, setFilteredData] = useState<RouteServerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRouteServers = useCallback(async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const result = await api.get("api/route-servers");
      if (result.success) {
        setRouteServers(result.data);
        setFilteredData(result.data);
      }
    } catch (error) {
      console.error("Error fetching route servers:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRouteServers();
  }, [fetchRouteServers]);

  useEffect(() => {
    // Apply filters when searchTerm or filterType changes
    let filtered = [...routeServers];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.servers.some((server) =>
            server.displayName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (filterType) {
      filtered = filtered.filter((item) => item.route_kind === filterType);
    }

    setFilteredData(filtered);
  }, [searchTerm, filterType, routeServers]);

  const handleRefresh = () => {
    fetchRouteServers();
  };

  // Get count of each stream type
  const streamTypeCounts = routeServers.reduce((acc, item) => {
    acc[item.route_kind] = (acc[item.route_kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Stack gap="lg">
      <Paper p="md" radius="md" withBorder shadow="xs">
        <Flex justify="space-between" align="center" mb="md">
          <Title order={3}>Route Server Assignments</Title>
        </Flex>

        <Divider my="sm" />

        <Group grow mb="md">
          <TextInput
            placeholder="Search routes or servers..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
          />
          <Group>
            <Select
              placeholder="Filter by stream type"
              leftSection={<IconFilter size={16} />}
              data={Object.values(StreamType).map((type) => ({
                value: type,
                label: type,
              }))}
              value={filterType}
              onChange={setFilterType}
              clearable
              style={{ flex: 1 }}
            />
            <Tooltip label="Refresh data">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={handleRefresh}
                loading={isRefreshing}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <ClientOnly fallback={<Group mb="md" />}>
          <Group mb="md">
            {Object.entries(streamTypeCounts).map(([type, count]) => (
              <Badge
                key={type}
                color={
                  type === StreamType.DASH
                    ? "blue"
                    : type === StreamType.HLS
                    ? "green"
                    : "violet"
                }
                size="lg"
                variant={filterType === type ? "filled" : "light"}
                style={{ cursor: "pointer" }}
                onClick={() => setFilterType(filterType === type ? null : type)}
              >
                {type}: {count}
              </Badge>
            ))}
          </Group>
        </ClientOnly>
      </Paper>

      <Paper p="md" radius="md" withBorder shadow="xs">
        {loading ? (
          <Flex justify="center" align="center" h={300}>
            <Stack align="center" gap="xs">
              <Loader size="md" />
              <Text c="dimmed" size="sm">
                Loading assignments...
              </Text>
            </Stack>
          </Flex>
        ) : filteredData.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            direction="column"
            h={300}
            gap="md"
          >
            <Text size="lg" fw={500} c="dimmed">
              No assignments found
            </Text>
            {searchTerm || filterType ? (
              <Text size="sm" c="dimmed">
                Try adjusting your search or filters
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                Routes will appear here once created
              </Text>
            )}
          </Flex>
        ) : (
          <Box>
            <Text
              size="sm"
              fw={500}
              c="dimmed"
              mb="xs"
              suppressHydrationWarning
            >
              Showing {filteredData.length} of {routeServers.length} assignments
            </Text>
            <UlkaTable data={filteredData} onDataChange={fetchRouteServers} />
          </Box>
        )}
      </Paper>
    </Stack>
  );
};
