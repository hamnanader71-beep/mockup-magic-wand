import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/mockup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const incoming = await request.formData();
        const image = incoming.get("image");
        const prompt = incoming.get("prompt");
        if (!(image instanceof File) || typeof prompt !== "string") {
          return new Response("image and prompt are required", { status: 400 });
        }

        const form = new FormData();
        form.append("model", "openai/gpt-image-2");
        form.append("image", image, image.name || "source.png");
        form.append("prompt", prompt);
        form.append("quality", "low");
        form.append("size", "1024x1024");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/edits", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: form,
        });

        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
