import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <section className="bg-card text-card-foreground relative isolate">
        <div className="mx-auto w-full max-w-7xl px-6 pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Shopping Assistant
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Research products with AI, live web results, and shareable
                threads. Built on the Modern Stack: Convex, OpenAI, Better‑Auth,
                Firecrawl, and Autumn.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/thread">Start a thread</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View pricing</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/sign-up">Create account</Link>
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Built for the Modern Stack Hackathon. This is a demo experience.
              </p>
            </div>
            <div className="order-first md:order-last">
              <div
                role="img"
                aria-label="Product preview placeholder"
                className="bg-muted relative aspect-video w-full rounded-xl border shadow-md"
              >
                <div className="absolute inset-0 m-3 grid grid-cols-3 gap-2">
                  <Image
                    className="rounded-md"
                    src="/showcase/chat.png"
                    alt="Product preview"
                    fill
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
              <CardDescription>
                Explore products, compare options, and capture decisions in
                shareable threads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Realtime</CardTitle>
              <CardDescription>
                Convex keeps UI in sync; messages and reasoning stream live
                across sessions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Better‑Auth with email verification via Resend. OAuth-ready
                integrations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Independent, modular TypeScript building blocks for your
                backend.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open source & Local</CardTitle>
              <CardDescription>
                Run locally with hot reload. Deploy to Vercel + Convex in
                minutes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Coding</CardTitle>
              <CardDescription>
                Generate high‑quality Convex code with AI. Strict validators for
                safety.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="bg-card text-card-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Web results, citations, and reasoning
              </h2>
              <p className="text-muted-foreground">
                Get up‑to‑date results with realtime search. Transparent
                reasoning explains recommendations so you can decide faster with
                confidence.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/thread">Try a search</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">See plans</Link>
                </Button>
              </div>
            </div>
            <div>
              <div
                role="img"
                aria-label="Web results preview placeholder"
                className="bg-muted relative aspect-[780/1060] w-full rounded-xl border shadow-md"
              >
                <div className="absolute inset-0 m-3 grid grid-rows-3 gap-2">
                  <Image
                    className="rounded-md"
                    src="/showcase/lipstick2.png"
                    alt="Product preview"
                    fill
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t">
        <div className="text-muted-foreground mx-auto w-full max-w-7xl px-6 py-10 text-xs">
          Built for the Modern Stack Hackathon • Shopping Assistant
        </div>
      </div>
    </div>
  );
}
