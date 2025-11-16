<!-- markdownlint-disable MD034 -->
# URLs

- https://www.nycservice.org/search
  - eg: https://www.nycservice.org/opportunity/a0TQq00000npwvNMAQ/volunteer-english-class-facilitator

## Key Insight

- The HTML in backend/app/crawler/service-www.nycservice.org.html:1020 shows that the “results” block is only a skeleton (empty table, “Load more” link) plus a pile of hidden inputs such as searchResultId=764, siteHOCId=0303, listingFormat=LISTING_WITHOUT_TILES, etc. Those values are what the front-end uses as parameters when it asks the real API for data; no opportunity rows ever ship in the initial markup.

## API You Need To Hit

- The bundled JS (backend/app/crawler/service-www.nycservice.org.js:94462-94535) calls POST /search/RetrieveFirstLoadForListingInSearch with blockId=<div data-block-id> (49951 on this page) and a serialized copy of the form fields (parameters[...]). That response contains listingOpportunities, a JSON string with the first 50 opportunities plus metadata like totalOccurrences and occurrencesMore.
- When the user clicks “Load more”, the JS issues POST /search/GetOpportunitiesSearchResultBlockListing with the same parameters[...], the current row count, and flags such as isViewMore=true (backend/app/crawler/service-www.nycservice.org.js:95604-95666 and 99380-99420). The response has an opportunities array and total, so you can paginate until currentRows >= total.
- Other listing formats (tiles, calendar, etc.) hit closely related endpoints, but because this block’s listingFormat is LISTING_WITHOUT_TILES, the two endpoints above are all you need.

## Example Request

```bash
curl -X POST 'https://www.nycservice.org/search/RetrieveFirstLoadForListingInSearch' \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data 'blockId=49951&parameters[searchResultId]=764&parameters[siteHOCId]=0303&parameters[listingFormat]=LISTING_WITHOUT_TILES'
```

That returns JSON like:

```json
{
  "totalOccurrences": 227,
  "occurrencesMore": 177,
  "listingOpportunities": "[{...}, ...]",
  ...
}
```

  Each listing inside listingOpportunities (after json.loads) already carries the SID, title, description, location, organization name/URL, occurrence URL, dates, availability, etc., so you can
  persist directly or follow OccurrenceUrl for extra details.

  Crawler Outline

  - Request /search once to read searchResultId, siteHOCId, listingFormat, and blockId from the HTML (all the hidden inputs near system-default-search-searchresultblock).
  - Issue a scrapy.FormRequest to /search/RetrieveFirstLoadForListingInSearch with those values (empty strings for unused filters are fine). Parse totalOccurrences, load listingOpportunities, and
    yield items.
  - If occurrencesMore > 0, keep track of how many rows you’ve emitted and repeatedly call /search/GetOpportunitiesSearchResultBlockListing with parameters[...], currentRows=<rows already processed>,    and isViewMore=true until you reach total.
  - Optional: follow each OccurrenceUrl (it’s a normal HTML page) if you need full descriptions or attachments beyond what the JSON already includes.

  Once you mimic those AJAX calls, you don’t need Playwright or HTML parsing at all—the API already gives you clean JSON. Natural next step: adapt backend/app/crawler/crawler/spiders/nyc_service.py
  to build those FormRequests and normalize the JSON into your pipeline, then add pagination logic that stops when currentRows >= total.
