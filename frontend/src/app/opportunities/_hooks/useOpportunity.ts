import { cache, use } from "react";
import { notFound } from "next/navigation";

import {
  type OpportunityDetail,
  type OpportunityDetailResponse,
  type OpportunityOrganization,
  type OpportunityOrganizationResponse,
} from "@/app/opportunities/_types";

function assertBackendConfigured(baseUrl: string | undefined): string {
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }
  return baseUrl.replace(/\/$/, "");
}

function mapOrganization(
  organization: OpportunityOrganizationResponse | null | undefined,
): OpportunityOrganization | null {
  if (!organization) {
    return null;
  }

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    contactEmail: organization.contact_email,
    contactPhone: organization.contact_phone,
    logoUrl: organization.logo_url,
  };
}

function mapOpportunity(data: OpportunityDetailResponse): OpportunityDetail {
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
    organization: mapOrganization(data.organization),
  };
}

const fetchOpportunity = cache(
  async (slug: string): Promise<OpportunityDetail> => {
    const baseUrl = assertBackendConfigured(process.env.BACKEND_INTERNAL_URL);
    const response = await fetch(`${baseUrl}/opportunities/slug/${slug}`, {
      next: { revalidate: 300 },
    });

    if (response.status === 404) {
      notFound();
    }

    if (!response.ok) {
      throw new Error(`Failed to load opportunity (${response.status})`);
    }

    const data: OpportunityDetailResponse = await response.json();
    return mapOpportunity(data);
  },
);

export function useOpportunity(slug: string): OpportunityDetail {
  return use(fetchOpportunity(slug));
}

export async function getOpportunity(slug: string): Promise<OpportunityDetail> {
  return fetchOpportunity(slug);
}
