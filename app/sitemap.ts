import { MetadataRoute } from 'next';
import { getAllDocSlugs } from '@/content/docs/manifest';
import { getAllInsightsSlugs, getInsightsEntry } from '@/content/insights/manifest';
import { SITE_URL } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
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
      url: `${baseUrl}/walcert`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/walcert/developers`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/top-10-agents`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/public-api`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
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
    {
      url: `${baseUrl}/insights`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...getAllInsightsSlugs().map((slug) => {
      const entry = getInsightsEntry(slug);
      return {
        url: `${baseUrl}/insights/${slug}`,
        lastModified: entry ? new Date(`${entry.date}T00:00:00.000Z`) : now,
        changeFrequency: 'monthly' as const,
        priority: entry?.status === 'published' ? 0.8 : 0.65,
      };
    }),
  ];
}
