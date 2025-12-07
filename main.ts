import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { HomePage } from "./templates/home.tsx";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", async (c) => c.html(await HomePage()));

Deno.serve(app.fetch);
