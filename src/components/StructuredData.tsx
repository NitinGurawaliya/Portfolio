interface StructuredDataProps {
  type: 'Person' | 'ProfilePage'
  data: {
    name: string
    jobTitle?: string
    bio?: string
    image?: string
    url?: string
    sameAs?: string[] // Social media links
    worksFor?: {
      name: string
      url?: string
    }
    location?: string
    skills?: string[]
  }
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = type === 'Person' ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": data.name,
    ...(data.jobTitle && { "jobTitle": data.jobTitle }),
    ...(data.bio && { "description": data.bio }),
    ...(data.image && { "image": data.image }),
    ...(data.url && { "url": data.url }),
    ...(data.sameAs && data.sameAs.length > 0 && { "sameAs": data.sameAs }),
    ...(data.worksFor && {
      "worksFor": {
        "@type": "Organization",
        "name": data.worksFor.name,
        ...(data.worksFor.url && { "url": data.worksFor.url })
      }
    }),
    ...(data.location && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": data.location
      }
    }),
    ...(data.skills && data.skills.length > 0 && {
      "knowsAbout": data.skills
    })
  } : {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": `${data.name}'s Portfolio`,
    "description": data.bio || `${data.name}'s developer portfolio`,
    ...(data.url && { "url": data.url }),
    ...(data.image && { "image": data.image }),
    "mainEntity": {
      "@type": "Person",
      "name": data.name,
      ...(data.jobTitle && { "jobTitle": data.jobTitle }),
      ...(data.image && { "image": data.image }),
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
