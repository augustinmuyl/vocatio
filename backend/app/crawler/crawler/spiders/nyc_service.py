import json
from typing import Dict, Iterable, List, Optional, Set

import scrapy

from crawler.items import OpportunityItem


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
        parent_block_id = (
            response.css(
                "#system-default-search-searchresultblock input[name='parentBlockId']::attr(value)"
            ).get()
            or block_id
        )
        form_parameters = self._extract_form_parameters(response)
        base_formdata = {
            "blockId": block_id,
            "parentBlockId": parent_block_id,
        }
        base_formdata.update({f"parameters[{k}]": v for k, v in form_parameters.items()})

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

            occurrence_url = opp.get("OccurrenceUrl")
            if not occurrence_url:
                continue

            yield scrapy.Request(
                url=occurrence_url,
                callback=self.parse_occurrence,
                cb_kwargs={"listing": opp},
            )

    def parse_occurrence(self, response, listing: Dict[str, str]):
        def clean_text(texts: List[str]) -> Optional[str]:
            cleaned = " ".join(t.strip() for t in texts if t and t.strip())
            return cleaned or None

        description_text = clean_text(response.css("#opportunity-detail-description ::text").getall())
        description_html = response.css("#opportunity-detail-description").get()
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

        item = OpportunityItem()
        item["sid"] = listing.get("SID")
        item["title"] = listing.get("Title")
        item["organization_name"] = listing.get("OrganizationName")
        item["organization_url"] = response.urljoin(listing.get("OrganizationUrl") or "")
        item["occurrence_url"] = listing.get("OccurrenceUrl")

        item["location_text"] = location_hidden or listing.get("Location")
        item["location_type"] = listing.get("LocationType")
        item["distance_label"] = listing.get("Distance")
        item["time_label"] = listing.get("TimeColumnData")

        item["start_datetime"] = listing.get("StartDateTimeValue")
        item["end_datetime"] = listing.get("endDate")
        item["timezone"] = listing.get("TimeZone") or "America/New_York"

        item["description"] = description_text
        item["description_html"] = description_html
        item["detail_location"] = location_hidden or listing.get("Location")
        item["issue_areas"] = issue_areas
        item["population_served"] = population_served
        item["requirements"] = requirements

        first_occurrence = response.css(".item-occ").xpath("(//div[contains(@class,'item-occ')])[1]")
        if first_occurrence:
            item["occurrence_day"] = first_occurrence.css(
                "input.occurrence-day-name::attr(value)"
            ).get()
            item["occurrence_time"] = first_occurrence.css(
                "input.occurrence-time-name::attr(value)"
            ).get()
            item["occurrence_end_date"] = first_occurrence.css(".title-IO-date::text").get()

        item["raw_listing"] = listing

        yield item

    def _extract_form_parameters(self, response) -> Dict[str, str]:
        form = response.css("form#opportunities-search-block")
        parameters: Dict[str, str] = {}
        if not form:
            return parameters

        for field in form.css("input[name]"):
            name = field.attrib.get("name")
            if not name:
                continue
            input_type = field.attrib.get("type", "").lower()
            if input_type in {"checkbox", "radio"} and "checked" not in field.attrib:
                continue
            parameters[name] = field.attrib.get("value", "") or ""

        for select in form.css("select[name]"):
            name = select.attrib.get("name")
            if not name:
                continue
            value = select.css("option[selected]::attr(value)").get()
            if value is None:
                value = select.css("option::attr(value)").get()
            parameters[name] = value or ""

        for textarea in form.css("textarea[name]"):
            name = textarea.attrib.get("name")
            if not name:
                continue
            value = textarea.css("::text").get()
            parameters[name] = value or ""

        return parameters
