"use client";

import { Title, Group, Button, Text, Anchor, Stack } from "@mantine/core";

export const NimbleServerHeader = () => {
  return (
    <Stack gap="md">
      <Group
        justify="space-between"
        align="center"
        style={{ backgroundColor: "#3498db", padding: "1rem" }}
      >
        <Title order={2} c="white">
          Nimble Server Routes
        </Title>
        <Group gap="sm">
          <Anchor href="#" c="white">
            Add VOD streaming route
          </Anchor>
          <Text c="white">•</Text>
          <Anchor href="#" c="white">
            Add re-streaming route
          </Anchor>
          <Text c="white">•</Text>
          <Anchor href="#" c="white">
            Add progressive download route
          </Anchor>
          <Text c="white">•</Text>
          <Anchor href="#" c="white">
            Add geo redirect
          </Anchor>
        </Group>
      </Group>

      {/* Action Buttons */}
      <Group>
        <Button variant="filled" color="blue">
          Re-streaming setup wizard
        </Button>
        <Button variant="filled" color="blue">
          VOD streaming setup wizard
        </Button>
        <Button variant="filled" color="blue">
          Multiple edit
        </Button>
      </Group>

      <Text>
        This is a page for managing Nimble Streamer routes. Here you can control
        Nimble behaviour for HLS and MPEG-DASH VOD streaming, re-streaming of
        HLS / Smooth Streaming / HDS / MPEG-DASH and progressive download.
      </Text>

      <Text>
        You can read the following docs to get familiar with the set up:
      </Text>
      <Stack gap="xs" ml="md">
        <Text>
          • Set up <Anchor href="#">HLS VOD streaming</Anchor> as origin. Also
          check <Anchor href="#">ABR SMIL files</Anchor> support setup and{" "}
          <Anchor href="#">
            real-life example of VOD streaming with Nimble Streamer
          </Anchor>
          .
        </Text>
        <Text>
          • Set up <Anchor href="#">MPEG-DASH VOD streaming</Anchor> and{" "}
          <Anchor href="#">progressive download pseudo-streaming</Anchor>.
        </Text>
        <Text>
          • Set up <Anchor href="#">HLS, HDS and Smooth re-streaming</Anchor>{" "}
          routes for edge servers.
        </Text>
      </Stack>

      <Text>
        You may start setting up these scenarios by clicking on &ldquo;Add ...
        &ldquo; links above.
      </Text>
      <Text>
        For <strong>live streaming definition</strong> go to{" "}
        <Anchor href="#">Live streams set up</Anchor> page. Nimble may take
        RTMP, MPEG-TS and Icecast to transmux them to HLS, make RTMP to DASH
        transmuxing and also perform Icecast re-streaming. If you need to run
        3rd-party tools, check{" "}
        <Anchor href="#">Server-side streaming tasks management</Anchor> via
        WMSPanel.
      </Text>
      <Text>
        To <strong>apply existing routes</strong> to a{" "}
        <strong>new server</strong>, click on the server name and then on server
        details page click on &quot;Assign to Routes&quot; to select which of
        the routes below to apply.
      </Text>
    </Stack>
  );
};
