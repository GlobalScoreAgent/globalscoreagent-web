import { MetadataRoute } from 'next';
import { getAllDocSlugs } from '@/content/docs/manifest';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://globalscoreagent.com';
  const now = new Date();

  const docEntries: MetadataRoute.Sitemap = getAllDocSlugs().map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/humi`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wami`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/waitlist`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs/global-score-agent`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    ...docEntries,
    {
      url: `${baseUrl}/legal`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
