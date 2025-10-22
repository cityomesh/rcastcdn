// "use client";

// import { useState, useEffect } from "react";
// import {
//   Button,
//   MultiSelect,
//   Paper,
//   Group,
//   Skeleton,
//   Text,
//   Stack,
//   Alert,
//   Box,
//   Title,
//   TagsInput,
// } from "@mantine/core";
// import { v4 as uuidv4 } from "uuid";
// import { useData } from "@/app/contexts/DataContext";
// import { IconAlertCircle } from "@tabler/icons-react";
// import { StreamType } from "@/app/types/server";

// interface RouteServerAssignment {
//   id?: string;
//   priority: number;
//   route_kind: string;
//   from: string;
//   to: string;
//   servers: Array<{
//     id: string;
//     displayName: string;
//     ipAddress: string;
//     port: number;
//     originIpWithPort: string;
//   }>;
// }

// interface RouteServerFormProps {
//   onSubmit: (values: RouteServerAssignment) => Promise<void>;
// }

// interface ValidationErrors {
//   originUrl?: string;
//   servers?: string;
//   route_kind?: string;
//   general?: string;
// }

// export default function RouteServerForm({ onSubmit }: RouteServerFormProps) {
//   const { servers, loading } = useData();
//   const [originUrls, setOriginUrls] = useState<string[]>([]);
//   const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
//   const [selectedRouteKind, setSelectedRouteKind] = useState<string>(
//     StreamType.HLS
//   );
//   const [edgeStreamExample, setEdgeStreamExample] = useState<string>("");
//   const [submitting, setSubmitting] = useState(false);
//   const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
//     {}
//   );

//   // 🔹 Generate example when URLs or servers change
//   useEffect(() => {
//     if (originUrls.length > 0 && selectedServerIds.length > 0) {
//       try {
//         const firstUrl = originUrls[0];
//         const url = new URL(firstUrl);
//         const path = url.pathname;

//         const firstServerId = selectedServerIds[0];
//         const firstServer = servers.find((s) => s.id === firstServerId);

//         if (path && firstServer) {
//           const serverUrl = `http://${firstServer.ipAddress}:${firstServer.port}`;
//           setEdgeStreamExample(`${serverUrl}${path}`);
//         } else {
//           setEdgeStreamExample("");
//         }
//       } catch {
//         setEdgeStreamExample("");
//       }
//     } else {
//       setEdgeStreamExample("");
//     }
//   }, [originUrls, selectedServerIds, servers]);

//   const handleOriginUrlsChange = (values: string[]) => {
//     setOriginUrls(values.slice(0, 1000)); // ✅ up to 1000 URLs
//     setValidationErrors({});
//   };

//   const handleServerChange = (values: string[]) => {
//     setSelectedServerIds(values);
//     setValidationErrors({});
//   };

//   const validateRouteAssignment = (): ValidationErrors => {
//     const errors: ValidationErrors = {};

//     if (originUrls.length === 0) {
//       errors.originUrl = "At least one origin URL is required";
//       return errors;
//     }

//     for (const url of originUrls) {
//       try {
//         new URL(url);
//       } catch {
//         errors.originUrl = `Invalid URL: ${url}`;
//         return errors;
//       }
//     }

//     if (selectedServerIds.length === 0) {
//       errors.servers = "At least one server must be selected";
//       return errors;
//     }

//     if (!Object.values(StreamType).includes(selectedRouteKind as StreamType)) {
//       errors.route_kind = "Invalid stream type selected";
//       return errors;
//     }

//     return errors;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const errors = validateRouteAssignment();
//     if (Object.keys(errors).length > 0) {
//       setValidationErrors(errors);
//       return;
//     }

//     try {
//       setSubmitting(true);

//       // 🔹 Collect selected servers
//       const selectedServers = selectedServerIds.map((id) => {
//         const server = servers.find((s) => s.id === id);
//         if (!server) throw new Error(`Server not found: ${id}`);
//         return {
//           id,
//           displayName: server.displayName,
//           ipAddress: server.ipAddress,
//           port: server.port,
//           originIpWithPort: server.originIpWithPort,
//         };
//       });

//       // 🔹 Prepare one object per URL
//       const formattedDataList = originUrls.map((url) => {
//         const parsedUrl = new URL(url);
//         return {
//           id: uuidv4(),
//           priority: 0,
//           route_kind: selectedRouteKind,
//           from: parsedUrl.pathname,
//           to: url,
//           servers: selectedServers,
//         };
//       });

//       // 🔹 Submit all (1, 5, or 1000 URLs)
//       for (const data of formattedDataList) {
//         await onSubmit(data);
//       }

//       // 🔹 Reset form
//       setOriginUrls([]);
//       setSelectedServerIds([]);
//       setEdgeStreamExample("");
//       setValidationErrors({});
//     } catch (error) {
//       setValidationErrors({
//         general: error instanceof Error ? error.message : "An error occurred",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading || !servers) {
//     return (
//       <Paper p="md" withBorder>
//         <Skeleton height={70} mb="md" />
//         <Skeleton height={4} width="30%" mb="xl" />
//         <Skeleton height={70} mb="md" />
//         <Skeleton height={4} width="30%" mb="xl" />
//         <Group justify="flex-end">
//           <Skeleton height={36} width={120} />
//         </Group>
//       </Paper>
//     );
//   }

//   const serverOptions = servers.map((server) => ({
//     value: server.id,
//     label: `${server.displayName} (${server.serverType})`,
//     description: `${server.ipAddress}:${server.port}`,
//   }));

//   return (
//     <form onSubmit={handleSubmit}>
//       <Stack gap="xl">
//         <Title order={3}>Re-streaming setup wizard</Title>

//         {validationErrors.general && (
//           <Alert icon={<IconAlertCircle size={16} />} color="red">
//             {validationErrors.general}
//           </Alert>
//         )}

//         {/* 🔹 Multi-URL Input */}
//         <Box>
//           <Title order={4}>1. Origin stream URLs:</Title>
//           <TagsInput
//             placeholder="Enter URLs (press Enter or comma)"
//             value={originUrls}
//             onChange={handleOriginUrlsChange}
//             splitChars={[",", " "]}
//             error={validationErrors.originUrl}
//             maxTags={1000} // ✅ allows up to 1000
//             mt="xs"
//           />
//           <Text size="sm" c="dimmed" mt="xs">
//             Example: http://10.10.148.25:8081/AILocal2/AILocal2/manifest.mpd
//           </Text>
//         </Box>

//         {/* 🔹 Server Selection */}
//         <Box>
//           <Title order={4}>2. Select servers:</Title>
//           <MultiSelect
//             placeholder="Choose servers"
//             data={serverOptions}
//             value={selectedServerIds}
//             onChange={handleServerChange}
//             searchable
//             required
//             clearable
//             maxDropdownHeight={400}
//             nothingFoundMessage="No servers found"
//             error={validationErrors.servers}
//             mt="xs"
//           />
//         </Box>

//         {/* 🔹 Example URL */}
//         {/* <Box>
//           <Title order={4}>3. Stream URL example:</Title>
//           {edgeStreamExample ? (
//             <div>
//               <Text mt="xs">{edgeStreamExample}</Text>
//               {selectedServerIds.length > 1 && (
//                 <Text size="sm" c="dimmed" mt="xs">
//                   Similar URLs will be available on all{" "}
//                   {selectedServerIds.length} selected servers
//                 </Text>
//               )}
//             </div>
//           ) : (
//             <Text mt="xs" c="dimmed">
//               Please enter valid origin URLs and select at least one server to
//               see an example.
//             </Text>
//           )}
//         </Box> */}

//         {/* 🔹 Buttons */}
//         <Group justify="space-between" mt="xl">
//           <Button variant="outline" onClick={() => window.history.back()}>
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             loading={submitting}
//             disabled={originUrls.length === 0 || selectedServerIds.length === 0}
//           >
//             Create {originUrls.length > 1 ? `${originUrls.length} routes` : "route"}
//           </Button>
//         </Group>
//       </Stack>
//     </form>
//   );
// }

"use client";

import { useState } from "react";
import {
  Button,
  MultiSelect,
  Paper,
  Group,
  Skeleton,
  Text,
  Stack,
  Alert,
  Box,
  Title,
  TagsInput,
} from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import { useData } from "@/app/contexts/DataContext";
import { IconAlertCircle } from "@tabler/icons-react";
import { StreamType } from "@/app/types/server";

interface RouteServerAssignment {
  id?: string;
  priority: number;
  route_kind: string;
  from: string;
  to: string;
  servers: Array<{
    id: string;
    displayName: string;
    ipAddress: string;
    port: number;
    originIpWithPort: string;
  }>;
}

interface RouteServerFormProps {
  onSubmit: (values: RouteServerAssignment) => Promise<void>;
}

interface ValidationErrors {
  originUrl?: string;
  servers?: string;
  general?: string;
}

export default function RouteServerForm({ onSubmit }: RouteServerFormProps) {
  const { servers, loading } = useData();
  const [originUrls, setOriginUrls] = useState<string[]>([]);
  const [selectedServerIds, setSelectedServerIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleOriginUrlsChange = (values: string[]) => {
    setOriginUrls(values.slice(0, 1000));
    setValidationErrors({});
  };

  const handleServerChange = (values: string[]) => {
    setSelectedServerIds(values);
    setValidationErrors({});
  };

  const validateRouteAssignment = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (originUrls.length === 0) errors.originUrl = "At least one origin URL is required";

    for (const url of originUrls) {
      try {
        new URL(url);
      } catch {
        errors.originUrl = `Invalid URL: ${url}`;
        return errors;
      }
    }

    if (selectedServerIds.length === 0) errors.servers = "At least one server must be selected";

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateRouteAssignment();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      const selectedServers = selectedServerIds.map((id) => {
        const server = servers.find((s) => s.id === id);
        if (!server) throw new Error(`Server not found: ${id}`);
        return {
          id,
          displayName: server.displayName,
          ipAddress: server.ipAddress,
          port: server.port,
          originIpWithPort: server.originIpWithPort,
        };
      });

      const formattedDataList = originUrls.map((url) => {
        const parsedUrl = new URL(url);
        return {
          id: uuidv4(),
          priority: 0,
          route_kind: StreamType.HLS,
          from: parsedUrl.pathname,
          to: url,
          servers: selectedServers,
        };
      });

      for (const data of formattedDataList) {
        await onSubmit(data);
      }

      setOriginUrls([]);
      setSelectedServerIds([]);
      setValidationErrors({});
    } catch (error: unknown) {
      setValidationErrors({
        general: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !servers) {
    return (
      <Paper p="md" withBorder>
        <Skeleton height={70} mb="md" />
        <Skeleton height={4} width="30%" mb="xl" />
        <Skeleton height={70} mb="md" />
        <Skeleton height={4} width="30%" mb="xl" />
        <Group justify="flex-end">
          <Skeleton height={36} width={120} />
        </Group>
      </Paper>
    );
  }

  const serverOptions = servers.map((server) => ({
    value: server.id,
    label: `${server.displayName} (${server.serverType})`,
    description: `${server.ipAddress}:${server.port}`,
  }));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="xl">
        <Title order={3}>Re-streaming setup wizard</Title>

        {validationErrors.general && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {validationErrors.general}
          </Alert>
        )}

        <Box>
          <Title order={4}>1. Origin stream URLs:</Title>
          <TagsInput
            placeholder="Enter URLs (press Enter or comma)"
            value={originUrls}
            onChange={handleOriginUrlsChange}
            splitChars={[",", " "]}
            error={validationErrors.originUrl}
            maxTags={1000}
            mt="xs"
          />
          <Text size="sm" c="dimmed" mt="xs">
            Example: http://10.10.148.25:8081/AILocal2/AILocal2/manifest.mpd
          </Text>
        </Box>

        <Box>
          <Title order={4}>2. Select servers:</Title>
          <MultiSelect
            placeholder="Choose servers"
            data={serverOptions}
            value={selectedServerIds}
            onChange={handleServerChange}
            searchable
            required
            clearable
            maxDropdownHeight={400}
            nothingFoundMessage="No servers found"
            error={validationErrors.servers}
            mt="xs"
          />
        </Box>

        <Group justify="space-between" mt="xl">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={originUrls.length === 0 || selectedServerIds.length === 0}
          >
            Create {originUrls.length > 1 ? `${originUrls.length} routes` : "route"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
