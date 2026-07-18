"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <SwaggerUI url="/openapi.json" />
    </div>
  );
}
