import { fireEvent, render, screen } from "@testing-library/react";

import TopBar from "../TopBar";
import { useOpportunityFilters } from "@/app/opportunities/_hooks/useOpportunityFilters";

jest.mock("@/app/opportunities/_hooks/useOpportunityFilters");

const useOpportunityFiltersMock = jest.mocked(useOpportunityFilters);

describe("TopBar search input", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defers search updates until Enter is pressed", () => {
    const setSearch = jest.fn();

    useOpportunityFiltersMock.mockReturnValue({
      filters: {
        search: "",
        page: 1,
        pageSize: 12,
        sortBy: "updated_at",
        sortDirection: "desc",
        locations: [],
        themes: [],
      },
      isPending: false,
      setSearch,
      setLocations: jest.fn(),
      setThemes: jest.fn(),
      setPage: jest.fn(),
      setPageSize: jest.fn(),
      setSort: jest.fn(),
      resetFilters: jest.fn(),
    });

    render(<TopBar />);

    const input = screen.getByPlaceholderText("Search opportunities...");

    fireEvent.change(input, {
      target: { value: "community service " },
    });

    expect(setSearch).not.toHaveBeenCalled();
    expect(input).toHaveValue("community service ");

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(setSearch).toHaveBeenCalledWith("community service ");
  });
});
