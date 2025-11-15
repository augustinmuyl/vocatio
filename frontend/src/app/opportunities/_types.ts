export const OPPORTUNITY_LOCATIONS = [
  "NYC",
  "MIAMI",
  "REMOTE",
  "OTHER",
] as const;

export type OpportunityLocation = (typeof OPPORTUNITY_LOCATIONS)[number];

export const OPPORTUNITY_LOCATION_LABELS: Record<OpportunityLocation, string> =
  {
    NYC: "New York City",
    MIAMI: "Miami",
    REMOTE: "Remote",
    OTHER: "Other",
  };

export const OPPORTUNITY_THEMES = [
  "COMMUNITY_SERVICE",
  "ENVIRONMENT",
  "EDUCATION",
  "HEALTH",
  "ARTS",
  "STEM",
  "SPORTS",
  "ADVOCACY",
  "ANIMAL_WELFARE",
  "FOOD_SECURITY",
  "ECONOMIC_EMPOWERMENT",
  "EMERGENCY_RESPONSE",
  "SOCIAL_JUSTICE",
  "WORKFORCE_DEVELOPMENT",
] as const;

export type OpportunityTheme = (typeof OPPORTUNITY_THEMES)[number];

export const OPPORTUNITY_THEME_LABELS: Record<OpportunityTheme, string> = {
  COMMUNITY_SERVICE: "Community Service",
  ENVIRONMENT: "Environment",
  EDUCATION: "Education",
  HEALTH: "Health",
  ARTS: "Arts & Culture",
  STEM: "STEM",
  SPORTS: "Sports",
  ADVOCACY: "Advocacy",
  ANIMAL_WELFARE: "Animal Welfare",
  FOOD_SECURITY: "Food Security",
  ECONOMIC_EMPOWERMENT: "Economic Empowerment",
  EMERGENCY_RESPONSE: "Emergency Response",
  SOCIAL_JUSTICE: "Social Justice",
  WORKFORCE_DEVELOPMENT: "Workforce Development",
};

export const OPPORTUNITY_SORT_FIELDS = ["updated_at", "created_at"] as const;

export type OpportunitySortField = (typeof OPPORTUNITY_SORT_FIELDS)[number];

export const OPPORTUNITY_SORT_DIRECTIONS = ["asc", "desc"] as const;

export type OpportunitySortDirection =
  (typeof OPPORTUNITY_SORT_DIRECTIONS)[number];

export type OpportunityListItemResponse = {
  id: string;
  title: string;
  slug: string;
  community_hours: number | null;
  themes: OpportunityTheme[] | null;
  start_at: string;
  end_at: string;
  timezone: string;
  preview: string;
};

export type OpportunityListResponse = {
  items: OpportunityListItemResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type OpportunityListItem = {
  id: string;
  title: string;
  slug: string;
  preview: string;
  communityHours: number | null;
  approved: boolean;
};

export type OpportunityDetailResponse = {
  id: string;
  org_id: string;
  title: string;
  description: string;
  community_hours: number | null;
  slug: string;
  start_at: string;
  end_at: string;
  timezone: string;
  location: OpportunityLocation;
  address: string | null;
  zip_code: string | null;
  themes: OpportunityTheme[] | null;
  signup_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

export type OpportunityDetail = {
  id: string;
  orgId: string;
  title: string;
  description: string;
  communityHours: number | null;
  slug: string;
  startAt: string;
  endAt: string;
  timezone: string;
  location: OpportunityLocation;
  address: string | null;
  zipCode: string | null;
  themes: OpportunityTheme[];
  signupUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type OpportunityFilters = {
  search: string;
  page: number;
  pageSize: number;
  sortBy: OpportunitySortField;
  sortDirection: OpportunitySortDirection;
  locations: OpportunityLocation[];
  themes: OpportunityTheme[];
};

export type OpportunityFiltersState = OpportunityFilters;
