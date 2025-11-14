import json
from typing import Dict, Iterable, List, Optional, Set

import scrapy


class NycServiceSpider(scrapy.Spider):
    name = "nyc_service"
    start_urls = [
        "https://www.nycservice.org/search",
    ]

    retrieve_url = "https://www.nycservice.org/search/RetrieveFirstLoadForListingInSearch"
    paginate_url = "https://www.nycservice.org/search/GetOpportunitiesSearchResultBlockListing"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._seen_sids: Set[str] = set()

    def parse(self, response):
        block_id = (
            response.css("#system-default-search-searchresultblock::attr(data-block-id)").get()
            or ""
        )
        base_formdata = {
            "blockId": block_id,
            "parameters[searchResultId]": response.css(
                "#system-default-search-searchresultblock input[name='searchResultId']::attr(value)"
            ).get()
            or "",
            "parameters[siteHOCId]": response.css(
                "#system-default-search-searchresultblock input[name='siteHOCId']::attr(value)"
            ).get()
            or "",
            "parameters[listingFormat]": response.css(
                "#system-default-search-searchresultblock input[name='listingFormat']::attr(value)"
            ).get()
            or "",
        }

        yield scrapy.FormRequest(
            url=self.retrieve_url,
            formdata=base_formdata,
            callback=self.parse_listing,
            cb_kwargs={"base_formdata": base_formdata, "current_rows": 0},
        )

    def parse_listing(self, response, base_formdata, current_rows: int):
        payload = json.loads(response.text)
        opportunities = json.loads(payload.get("listingOpportunities", "[]"))

        yield from self._schedule_occurrence_requests(opportunities)

        total = int(payload.get("totalOccurrences", 0))
        current_rows += len(opportunities)

        if current_rows < total:
            next_formdata = dict(base_formdata)
            next_formdata.update({"currentRows": str(current_rows), "isViewMore": "true"})

            yield scrapy.FormRequest(
                url=self.paginate_url,
                formdata=next_formdata,
                callback=self.parse_more,
                cb_kwargs={"base_formdata": base_formdata, "current_rows": current_rows},
            )

    def parse_more(self, response, base_formdata, current_rows: int):
        payload = json.loads(response.text)
        opportunities = payload.get("opportunities", [])

        yield from self._schedule_occurrence_requests(opportunities)

        total = int(payload.get("total", payload.get("totalOccurrences", 0)))
        current_rows += len(opportunities)

        if current_rows < total:
            next_formdata = dict(base_formdata)
            next_formdata.update({"currentRows": str(current_rows), "isViewMore": "true"})

            yield scrapy.FormRequest(
                url=self.paginate_url,
                formdata=next_formdata,
                callback=self.parse_more,
                cb_kwargs={"base_formdata": base_formdata, "current_rows": current_rows},
            )

    def _schedule_occurrence_requests(self, opportunities: Iterable[Dict[str, str]]):
        for opp in opportunities:
            sid = opp.get("SID")
            if not sid or sid in self._seen_sids:
                continue
            self._seen_sids.add(sid)

            summary = {
                "sid": sid,
                "title": opp.get("Title"),
                "organization": opp.get("OrganizationName"),
                "organization_url": opp.get("OrganizationUrl"),
                "location": opp.get("Location"),
                "occurrence_url": opp.get("OccurrenceUrl"),
                "time": opp.get("TimeColumnData"),
                "distance": opp.get("Distance"),
            }

            occurrence_url = opp.get("OccurrenceUrl")
            if not occurrence_url:
                continue

            yield scrapy.Request(
                url=occurrence_url,
                callback=self.parse_occurrence,
                cb_kwargs={"summary": summary},
            )

    def parse_occurrence(self, response, summary: Dict[str, str]):
        def clean_text(texts: List[str]) -> Optional[str]:
            cleaned = " ".join(t.strip() for t in texts if t and t.strip())
            return cleaned or None

        description = clean_text(response.css("#opportunity-detail-description ::text").getall())
        issue_areas = response.css(".issueAreasSOppDetatils span.issue-areas::text").get()
        population_served = response.css(
            ".populationServedSOppDetatils span.population-served::text"
        ).get()
        requirements = clean_text(
            response.css(".requirementsSOppDetatils p.requirements ::text").getall()
        )
        location_hidden = response.css(
            ".opportunity-detail-content input.occurrence-location-name::attr(value)"
        ).get()

        yield {
            **summary,
            "detail_url": response.url,
            "description": description,
            "issue_areas": issue_areas,
            "population_served": population_served,
            "requirements": requirements,
            "detail_location": location_hidden or summary.get("location"),
        }
