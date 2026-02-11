# RocketReach API Reference

## Authentication

All requests require the `Api-Key` header:
```
Api-Key: <ROCKETREACH_API_KEY>
```

Also include `User-Agent: curl/8.0` for urllib-based requests.

## Base URL

```
https://api.rocketreach.co
```

## Endpoints

### Account Info

```
GET /api/v2/account
```

Returns: id, name, email, state, credit_usage[], rate_limits[]

### Search People

```
POST /v2/api/search
Content-Type: application/json
```

Body:
```json
{
  "query": {
    "current_employer": ["Company Name"],
    "current_title": ["CEO", "HR Director"],
    "skills": ["Python"],
    "location": ["New York"],
    "country_code": ["US"],
    "company_size": ["1-10", "11-50"],
    "industry": ["Technology"],
    "seniority_level": ["Manager"],
    "years_experience": ["10"]
  },
  "start": 1,
  "page_size": 10,
  "order_by": "relevance"
}
```

All query fields are arrays of strings. Key fields:
- current_employer, company_name, company_website, domain
- current_title, department, seniority_level
- first_name, last_name, name
- location, country_code, state, region
- skills, all_skills
- has_email ("True"), has_phone ("True")
- years_experience, school
- current_company, past_company, past_title

Response:
```json
{
  "pagination": {"start": 1, "next": 11, "total": 100},
  "profiles": [
    {
      "id": 12345,
      "name": "John Doe",
      "current_title": "CEO",
      "current_employer": "Acme Inc",
      "current_employer_domain": "acme.com",
      "location": "New York, NY, US",
      "teaser": {
        "professional_emails": ["acme.com"],
        "personal_emails": ["gmail.com"],
        "phones": [{"number": "212-555-XXXX", "is_premium": true}]
      }
    }
  ]
}
```

Note: Search only returns email domains in teasers. Full emails require a lookup.

### Lookup Person

```
GET /v2/api/lookupProfile?id=<person_id>
```

Can also use: `?name=John+Doe&current_employer=Acme`

Response includes full contact data:
```json
{
  "id": 12345,
  "first_name": "John",
  "last_name": "Doe",
  "current_title": "CEO",
  "current_employer": "Acme Inc",
  "current_work_email": "john.doe@acme.com",
  "recommended_professional_email": "john.doe@acme.com",
  "emails": [
    {
      "email": "john.doe@acme.com",
      "smtp_valid": "valid",
      "type": "professional",
      "grade": "A",
      "last_validation_check": "2025-12-22"
    }
  ],
  "phones": [],
  "job_history": [],
  "education": [],
  "skills": [],
  "linkedin_url": "...",
  "location": "New York, NY, US"
}
```

Email grades: A (best) > A- > B+ > B > B- > ... > F (invalid)
smtp_valid values: "valid", "invalid", "unknown"

### Search Companies

```
POST /v2/api/searchCompanies
Content-Type: application/json
```

Body:
```json
{
  "query": {
    "name": ["Acme"],
    "domain": ["acme.com"],
    "industry": ["Technology"],
    "employees": ["100-500"],
    "geo": ["United States"],
    "techstack": ["React"],
    "revenue": ["10M-50M"]
  },
  "start": 1,
  "page_size": 10,
  "order_by": "relevance"
}
```

### Lookup Company

```
GET /v2/api/lookupCompany?domain=acme.com
```

Also accepts: `?name=Acme` or `?linkedin_url=...`

## Rate Limits

| Action          | Per Minute | Per Hour | Per Day | Per Month |
|-----------------|-----------|----------|---------|-----------|
| API Request     | 10/sec    | -        | -       | -         |
| Person Search   | 15        | 50       | 500     | 10,000    |
| Person Lookup   | 15        | 100      | 500     | 5,000     |
| Company Search  | 15        | 50       | 500     | 10,000    |

When rate limited, the API returns HTTP 429 with a `wait` field (seconds to wait).

## Credit Types

- standard_lookup: Used for person lookups
- person_export: Used for bulk exports
- premium_lookup: Premium contact data
- phone_lookup: Phone number lookups
- company_export: Company data exports
