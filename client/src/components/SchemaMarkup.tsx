import React from "react";
import { generateFAQSchema, generateVideoObjectSchema, FAQ } from "@/lib/schema-generators";

interface SchemaMarkupProps {
  schema: any;
}

export function SchemaMarkup({ schema }: SchemaMarkupProps) {
  if (!schema) return null;
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: FAQ[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = generateFAQSchema(faqs);
  return <SchemaMarkup schema={schema} />;
}

interface VideoSchemaProps {
  videoUrl: string;
  title: string;
  description?: string;
  thumbnail?: string;
}

export function VideoSchema({ videoUrl, title, description, thumbnail }: VideoSchemaProps) {
  const schema = generateVideoObjectSchema(videoUrl, title, description, thumbnail);
  return <SchemaMarkup schema={schema} />;
}
