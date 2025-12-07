/**
 * Feature list for the features section
 */

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: "📝",
    title: "Scenario-based Testing",
    description:
      "Define tests as readable scenarios with resources, setup, and steps. Perfect for integration and E2E testing.",
  },
  {
    icon: "📡",
    title: "Built-in Clients",
    description:
      "HTTP, gRPC, GraphQL, SQL databases, Redis, MongoDB, and message queues - all with consistent APIs.",
  },
  {
    icon: "⚡",
    title: "Fluent Assertions",
    description:
      "Unified expect() auto-detects response type. HTTP, SQL, gRPC, GraphQL - each with specialized chainable assertions.",
  },
  {
    icon: "🔄",
    title: "Resource Management",
    description:
      "Define resources once, use everywhere. Setup returns cleanup functions automatically executed after tests.",
  },
  {
    icon: "📦",
    title: "Batteries Included",
    description:
      "faker, FakeTime, spy, stub, outdent - commonly needed utilities re-exported for convenience.",
  },
  {
    icon: "🛡️",
    title: "Full Type Safety",
    description:
      "Resources are fully typed. Autocomplete guides you through the API - no guessing, no runtime surprises.",
  },
];
