import { fireEvent, render, screen } from "@testing-library/react";

import Results from "../Results";
import { useOpportunityFilters } from "@/app/opportunities/_hooks/useOpportunityFilters";
import { useOpportunities } from "@/app/opportunities/_hooks/useOpportunities";

jest.mock("@/app/opportunities/_hooks/useOpportunityFilters");
jest.mock("@/app/opportunities/_hooks/useOpportunities");

const useOpportunityFiltersMock = jest.mocked(useOpportunityFilters);
const useOpportunitiesMock = jest.mocked(useOpportunities);

describe("Results pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows navigating backward when the total pages shrink below the current page", () => {
    const setPage = jest.fn();

    useOpportunityFiltersMock.mockReturnValue({
      filters: {
        search: "",
        page: 5,
        pageSize: 5,
        sortBy: "updated_at",
        sortDirection: "desc",
        locations: [],
        themes: [],
      },
      isPending: false,
      setSearch: jest.fn(),
      setPage,
      setLocations: jest.fn(),
      setThemes: jest.fn(),
      setPageSize: jest.fn(),
      setSort: jest.fn(),
      resetFilters: jest.fn(),
    });

    useOpportunitiesMock.mockReturnValue({
      opportunities: [],
      total: 10,
      isLoading: false,
      error: null,
    });

    render(<Results />);

    const previousLink = screen.getByRole("link", {
      name: /go to previous page/i,
    });
    fireEvent.click(previousLink);

    expect(setPage).toHaveBeenCalledWith(4);
  });

  it("continues to allow advancing when additional pages exist", () => {
    const setPage = jest.fn();

    useOpportunityFiltersMock.mockReturnValue({
      filters: {
        search: "",
        page: 1,
        pageSize: 5,
        sortBy: "updated_at",
        sortDirection: "desc",
        locations: [],
        themes: [],
      },
      isPending: false,
      setSearch: jest.fn(),
      setPage,
      setLocations: jest.fn(),
      setThemes: jest.fn(),
      setPageSize: jest.fn(),
      setSort: jest.fn(),
      resetFilters: jest.fn(),
    });

    useOpportunitiesMock.mockReturnValue({
      opportunities: [
        {
          id: "1",
          slug: "opportunity-1",
          title: "Opportunity 1",
          preview: "Preview",
          communityHours: 10,
          approved: true,
        },
      ],
      total: 25,
      isLoading: false,
      error: null,
    });

    render(<Results />);

    const nextLink = screen.getByRole("link", {
      name: /go to next page/i,
    });
    fireEvent.click(nextLink);

    expect(setPage).toHaveBeenCalledWith(2);
  });
});
