import { cache, use } from "react";
import { notFound } from "next/navigation";

export type OpportunityResponse = {
  id: string;
  org_id: string;
  title: string;
  description: string;
  community_hours: number | null;
  slug: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location: string;
  address: string | null;
  zip_code: string | null;
  themes: string[] | null;
  signup_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type Opportunity = {
  id: string;
  orgId: string;
  title: string;
  description: string;
  communityHours: number | null;
  slug: string;
  startAt: string;
  endAt: string;
  timezone: string;
  location: string;
  address: string | null;
  zipCode: string | null;
  themes: string[];
  signupUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

function assertBackendConfigured(baseUrl: string | undefined): string {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }
  return baseUrl.replace(/\/$/, "");
}

function mapOpportunity(data: OpportunityResponse): Opportunity {
  return {
    id: data.id,
    orgId: data.org_id,
    title: data.title,
    description: data.description,
    communityHours: data.community_hours,
    slug: data.slug,
    startAt: data.start_at,
    endAt: data.end_at,
    timezone: data.timezone,
    location: data.location,
    address: data.address,
    zipCode: data.zip_code,
    themes: data.themes ?? [],
    signupUrl: data.signup_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    isActive: data.is_active,
  };
}

const fetchOpportunity = cache(async (slug: string): Promise<Opportunity> => {
  const baseUrl = assertBackendConfigured(process.env.NEXT_PUBLIC_BACKEND_URL);
  const response = await fetch(`${baseUrl}/opportunities/slug/${slug}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to load opportunity (${response.status})`);
  }

  const data: OpportunityResponse = await response.json();
  return mapOpportunity(data);
});

export function useOpportunity(slug: string): Opportunity {
  return use(fetchOpportunity(slug));
}

export async function getOpportunity(slug: string): Promise<Opportunity> {
  return fetchOpportunity(slug);
}
