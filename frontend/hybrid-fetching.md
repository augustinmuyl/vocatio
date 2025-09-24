# Hybrid fetching implementation

1. Fetch on the server based on the incoming URL.
    - In your route file (app/opportunities/page.tsx) read the search params, map them to the filter DTO, call a server helper (e.g. getOpportunities(filters)), and get back the first page plus metadata.
2. Render the shell as a server component.
    - Pass the server-fetched payload down into a client component as props (initialItems, initialSummary, initialFilters). The shell pre-renders with real data, so the first paint is SEO-friendly and fast.
3. Hydrate into a client component that keeps the current behavior.
    - Update Results (or create a wrapper) so it accepts the initial data for hydration and then falls back to the existing client hook for user-driven changes. You can tweak useOpportunities to accept an optional initialState and only perform the fetch effect when the filters deviate from what was preloaded.
4. Keep client interactivity.
    - When users adjust filters/search params, the hook detects the difference, hits the API client-side, and updates state just like today. Navigations via router/search params trigger the client code, so we avoid a full round-trip to the server on every change.
5. Cache and resilience.
    - On the server helper, you can add caching (Next’s cache, revalidate options) to avoid refetching identical combinations too often.
