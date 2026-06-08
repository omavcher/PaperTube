export interface FAQ {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface Breadcrumb {
  name: string;
  item: string;
}

export interface SchemaBlogPost {
  title: string;
  subtitle?: string;
  slug: string;
  coverImage?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  description?: string;
}

const domain = "https://paperxify.com";

// 1. Organization Schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "Paperxify",
    "url": domain,
    "logo": {
      "@type": "ImageObject",
      "url": `${domain}/logo.png`,
      "width": 512,
      "height": 512
    },
    "sameAs": [
      "https://github.com/omavcher/PaperTube",
      "https://twitter.com/omAvcher"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@paperxify.com",
      "contactType": "customer service"
    }
  };
}

// 2. SoftwareApplication Schema
export function generateSoftwareApplicationSchema(
  toolName: string,
  description: string,
  ratingValue = "4.9",
  ratingCount = "8420"
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolName,
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "ratingCount": ratingCount
    }
  };
}

// 3. FAQ Schema
export function generateFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// 4. HowTo Schema
export function generateHowToSchema(title: string, steps: HowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url || `${domain}/youtube-to-notes#step-${index + 1}`,
      "image": step.image || `${domain}/og-image.jpg`
    }))
  };
}

// 5. VideoObject Schema
export function generateVideoObjectSchema(
  videoUrl: string,
  title: string,
  description = "Tutorial on how to use Paperxify AI Note Taker.",
  thumbnail = `${domain}/og-image.jpg`
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": [thumbnail],
    "uploadDate": "2026-04-01T08:00:00Z",
    "contentUrl": videoUrl,
    "embedUrl": videoUrl.includes("youtube.com/watch") 
      ? videoUrl.replace("watch?v=", "embed/") 
      : videoUrl
  };
}

// 6. Breadcrumb Schema
export function generateBreadcrumbSchema(breadcrumbs: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item.startsWith("http") ? crumb.item : `${domain}${crumb.item}`
    }))
  };
}

// 7. BlogPosting Schema
export function generateBlogPostingSchema(post: SchemaBlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "alternativeHeadline": post.subtitle || "",
    "image": post.coverImage ? [post.coverImage] : [`${domain}/og-image.jpg`],
    "datePublished": post.datePublished,
    "dateModified": post.dateModified || post.datePublished,
    "author": {
      "@type": "Person",
      "name": post.authorName,
      "jobTitle": post.authorRole || "Contributor"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Paperxify",
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/logo.png`
      }
    },
    "description": post.description || post.subtitle || post.title,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${domain}/blog/${post.slug}`
    }
  };
}

// 8. LocalBusiness Schema
export function generateLocalBusinessSchema(region: string) {
  const regionNames: Record<string, string> = {
    us: "United States",
    uk: "United Kingdom",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    eu: "Europe"
  };

  const name = `Paperxify ${regionNames[region.toLowerCase()] || "Global"}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "image": `${domain}/logo.png`,
    "@id": `${domain}/${region.toLowerCase()}/#localbusiness`,
    "url": `${domain}/${region.toLowerCase()}`,
    "telephone": "+1-800-555-0199",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Virtual Academic Suite 100",
      "addressLocality": region.toLowerCase() === "de" ? "Munich" : "New York",
      "addressRegion": region.toLowerCase() === "de" ? "BY" : "NY",
      "postalCode": region.toLowerCase() === "de" ? "80331" : "10001",
      "addressCountry": region.toUpperCase() === "EU" ? "BE" : region.toUpperCase()
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": regionNames[region.toLowerCase()] || "Global"
    }
  };
}
