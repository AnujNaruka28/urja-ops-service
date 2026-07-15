# PROTOCOL.md

This document describes how the Urja Meter Ops portal works internally, as discovered during reverse engineering.

## Authentication

The portal uses **session-based authentication** (cookies) rather than JWT tokens or API keys.

### Login Endpoint

```
POST /login
```

**Request Headers:**
- `Content-Type: application/x-www-form-urlencoded`
- `Origin: https://urja-ops.flockenergy.tech` (required - requests without this are rejected)

**Request Body (form-urlencoded):**
- `email`: The login email
- `password`: The login password

**Response:**
- Sets a session cookie: `__Secure-better-auth.session_token`
- This cookie must be sent with all subsequent authenticated requests

### Session Management

After successful login, the session cookie is automatically stored by the HTTP client (with `withCredentials: true`) and sent with all subsequent requests to the same domain.

## Portal Framework

The portal is built using **SvelteKit**, evidenced by:
- `x-sveltekit-action` headers
- `__data.json` endpoints for structured data
- `x-sveltekit-invalidated` headers

## Data Access Pattern

Instead of scraping HTML, SvelteKit exposes structured page data through endpoints like:

```
GET /meters/:id/__data.json
```

These endpoints return the data required to render pages in a structured JSON format, which is significantly more reliable than HTML parsing.

## SvelteKit Serialization

The `__data.json` responses use indexed references for serialization. For example, instead of:

```json
{
  "meterId": "J100000"
}
```

The response may contain:

```json
{
  "meterId": 1
}
```

Where `1` maps to `"J100000"` in a separate array. The client must resolve these references before consuming the data.

## Discovered Portal Endpoints

### Authentication
- `POST /login` - Authenticate and establish session

### Meter Search
- `GET /portal/meters/search` - Search meters with pagination
  - Query params: `q` (search query), `page` (page number)

### Meter Details
- `GET /meters/:id/__data.json` - Get meter details, installation info, and network hierarchy

### Meter Energy
- `GET /meters/:id/energy/__data.json` - Get energy/consumption information

### Meter Geolocation
- `GET /meters/:id/geolocation/__data.json` - Get meter location information

### Transformers
- `GET /dts/__data.json` - Get distribution transformer information

## Network Hierarchy

Each meter belongs to a hierarchical structure:

```
Zone
  ↓
Circle
  ↓
Division
  ↓
Subdivision
  ↓
Substation
  ↓
Feeder
  ↓
Distribution Transformer (DT)
  ↓
Meter
```

This hierarchy is available through the meter details endpoint.

## Implementation Notes

1. **Cookie Handling**: The HTTP client must be configured with `withCredentials: true` to handle session cookies automatically.

2. **Origin Header**: The login endpoint specifically requires the `Origin` header to match the portal's domain.

3. **Content-Type**: Login requests must use `application/x-www-form-urlencoded` content type.

4. **Session Persistence**: The session cookie persists across requests as long as the HTTP client maintains the cookie jar.

5. **Data Aggregation**: The portal separates different types of data (details, energy, geolocation) into different endpoints. The wrapper API aggregates these into a single response for convenience.
