/**
 * Supported client list for the clients section
 */

export interface Client {
  name: string;
  url: string;
}

export const clients: Client[] = [
  { name: "HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
  { name: "PostgreSQL", url: "https://www.postgresql.org/" },
  { name: "MySQL", url: "https://www.mysql.com/" },
  { name: "SQLite", url: "https://www.sqlite.org/" },
  { name: "DuckDB", url: "https://duckdb.org/" },
  { name: "gRPC", url: "https://grpc.io/" },
  { name: "ConnectRPC", url: "https://connectrpc.com/" },
  { name: "GraphQL", url: "https://graphql.org/" },
  { name: "Redis", url: "https://redis.io/" },
  { name: "MongoDB", url: "https://www.mongodb.com/" },
  { name: "Deno KV", url: "https://docs.deno.com/deploy/kv/manual/" },
  { name: "RabbitMQ", url: "https://www.rabbitmq.com/" },
  { name: "SQS", url: "https://aws.amazon.com/sqs/" },
];
