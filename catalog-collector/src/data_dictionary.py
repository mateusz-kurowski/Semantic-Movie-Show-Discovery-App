from attrs import define


@define
class DataDictionary:
    tags: dict
    companies: dict
    countries: dict
    genres: dict
    keywords: dict
    language: dict
