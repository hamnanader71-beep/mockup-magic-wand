import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, ImagePlus, Loader2, RefreshCw, Sparkles } from "lucide-react";
import JSZip from "jszip";
import { SCENES } from "@/lib/mockup-scenes";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mockup Studio — 10 AI Product Mockups from One Photo" },
      {
        name: "description",
        content:
          "Upload one product photo and instantly generate 10 styled lifestyle mockups: flat lays, studio shots, listing covers and more.",
      },
      { property: "og:title", content: "Mockup Studio — 10 AI Product Mockups from One Photo" },
      {
        property: "og:description",
        content:
          "Upload one product photo and instantly generate 10 styled lifestyle mockups for your shop listings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Result = {
  id: string;
  label: string;
  status: "pending" | "loading" | "done" | "error";
  src?: string | undefined;
  error?: string | undefined;
};

const initialResults = (): Result[] =>
  SCENES.map((s) => ({ id: s.id, label: s.label, status: "pending" as const }));

async function shrink(f: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(f);
    const max = 1024;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && f.size < 1_500_000) return f;
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return f;
    ctx.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!blob) return f;
    return new File([blob], "source.png", { type: "image/png" });
  } catch {
    return f;
  }
}

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>(initialResults);
  const [running, setRunning] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [batch, setBatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(f: File | null) {
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    setResults(initialResults());
    setBatch(0);
    setFile(await shrink(f));
  }

  async function downloadAll() {
    const ready = results.filter((r) => r.src);
    if (!ready.length || zipping) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      ready.forEach((r, i) => {
        const b64 = (r.src as string).split(",")[1] ?? "";
        zip.file(`${String(i + 1).padStart(2, "0")}-${r.id}.png`, b64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mockups.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setZipping(false);
    }
  }


  async function generateOne(source: File, index: number) {
    const scene = SCENES[index];
    if (!scene) return;
    setResults((r) => r.map((x, i) => (i === index ? { ...x, status: "loading", error: undefined } : x)));
    try {
      const fd = new FormData();
      fd.append("image", source);
      fd.append("prompt", scene.prompt);
      const res = await fetch("/api/mockup", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
      const json = (await res.json()) as { data?: { b64_json?: string }[] };
      const b64 = json.data?.[0]?.b64_json;
      if (!b64) throw new Error("No image returned");
      setResults((r) =>
        r.map((x, i) =>
          i === index ? { ...x, status: "done", src: `data:image/png;base64,${b64}` } : x,
        ),
      );
    } catch (e) {
      setResults((r) =>
        r.map((x, i) =>
          i === index
            ? { ...x, status: "error", error: e instanceof Error ? e.message : "Failed" }
            : x,
        ),
      );
    }
  }

  async function runAll(indices: number[]) {
    if (!file || running) return;
    setRunning(true);
    const queue = [...indices];
    const workers = Array.from({ length: Math.min(6, queue.length) }, async () => {
      while (queue.length) {
        const i = queue.shift();
        if (i === undefined) break;
        await generateOne(file, i);
      }
    });
    await Promise.all(workers);
    setRunning(false);
    setBatch((b) => b + 1);
  }

  const doneCount = results.filter((r) => r.status === "done").length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-16">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Handmade studio</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-foreground md:text-6xl">
            Mockup Studio
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
            Upload one product photo and generate 10 styled mockups — flat lays, studio shots,
            listing covers and model shots.
          </p>

        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-[320px_1fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="group flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary"
            >
              {preview ? (
                <img src={preview} alt="Uploaded product" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-7 w-7" />
                  <span className="text-sm">Upload product image</span>
                </span>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                disabled={!file || running}
                onClick={() => runAll(SCENES.map((_, i) => i))}
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {batch > 0 ? "Generate 10 more" : "Generate 10 mockups"}
              </Button>
              {preview ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={running}
                  onClick={() => inputRef.current?.click()}
                >
                  Change image
                </Button>
              ) : null}
              <Button
                variant="secondary"
                className="w-full"
                disabled={doneCount === 0 || zipping}
                onClick={downloadAll}
              >
                {zipping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download all images
              </Button>
              <p className="pt-1 text-center text-xs text-muted-foreground">
                {doneCount}/10 ready{batch > 0 ? ` · batch ${batch}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {results.map((r, i) => (
              <figure
                key={r.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative flex aspect-square items-center justify-center bg-muted/40">
                  {r.src ? (
                    <img src={r.src} alt={r.label} className="h-full w-full object-cover" />
                  ) : r.status === "loading" ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : r.status === "error" ? (
                    <span className="px-3 text-center text-[11px] text-destructive">{r.error}</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Waiting</span>
                  )}
                </div>
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">{r.label}</span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Regenerate"
                      disabled={!file || running}
                      onClick={() => runAll([i])}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    {r.src ? (
                      <a
                        href={r.src}
                        download={`${r.id}.png`}
                        title="Download"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
