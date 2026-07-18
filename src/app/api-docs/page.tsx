"use client";

import Link from "next/link";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-secondary/30 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              OpenAPI 3.0 · v2.0.0
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              Agent Economy API Reference
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-accent">
              Lightning L402 marketplace, service catalog, reputation router, vendor
              backends, and human bounty endpoints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/"
              className="rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-secondary/50"
            >
              ← Dashboard
            </Link>
            <a
              href="/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-4 py-2 font-medium text-foreground transition hover:bg-secondary/50"
            >
              Raw OpenAPI JSON
            </a>
          </div>
        </div>
      </header>

      <div className="swagger-shell bg-white text-black">
        <SwaggerUI
          url="/openapi.json"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          displayRequestDuration
          tryItOutEnabled
          filter
          persistAuthorization
        />
      </div>
    </div>
  );
}
