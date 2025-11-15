# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class OpportunityItem(scrapy.Item):
    """Structured representation of an opportunity scraped from NYC Service."""

    sid = scrapy.Field()
    title = scrapy.Field()
    organization_name = scrapy.Field()
    organization_url = scrapy.Field()
    occurrence_url = scrapy.Field()

    location_text = scrapy.Field()
    location_type = scrapy.Field()
    distance_label = scrapy.Field()
    time_label = scrapy.Field()

    start_datetime = scrapy.Field()
    end_datetime = scrapy.Field()
    timezone = scrapy.Field()

    description = scrapy.Field()
    description_html = scrapy.Field()
    detail_location = scrapy.Field()
    issue_areas = scrapy.Field()
    population_served = scrapy.Field()
    requirements = scrapy.Field()
    occurrence_day = scrapy.Field()
    occurrence_time = scrapy.Field()
    occurrence_end_date = scrapy.Field()
    occurrence_start_iso = scrapy.Field()
    occurrence_end_iso = scrapy.Field()
    org_contact_email = scrapy.Field()

    raw_listing = scrapy.Field()
