# Urja Meter Ops API Service

A clean REST API wrapper around the Urja Meter Ops portal, providing programmatic access to smart meter information without requiring direct interaction with the legacy portal.

## What I Built

This service exposes the Urja Meter Ops portal's data through a clean, well-structured REST API. The portal itself has no API, so this wrapper enables programmatic access for product and data teams.

### Architecture

```
Express API → Route Handlers → Controllers → UrjaClient → Legacy Portal
```

- **UrjaClient**: The only component aware of portal internals (authentication, session cookies, SvelteKit endpoints)
- **Controllers**: Orchestrate requests and format responses
- **Routes**: Define clean REST endpoints
- **Express**: HTTP server and middleware

### Endpoints

- `GET /api/meters?q={query}&page={page}` - Search meters with pagination
- `GET /api/meters/:id` - Get detailed meter information (aggregates details, energy, and geolocation)
- `GET /api/transformers` - Get distribution transformer information

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd urja-ops-svc
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials.

```
URJA_API_BASE_URL=https://urja-ops.flockenergy.tech
URJA_API_USERNAME=operator@urja.local
URJA_API_PASSWORD=urja-ops-2026
PORT=3000
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## Sample Requests

### Search Meters
```bash
curl "http://localhost:3000/api/meters?q=J100&page=1"
```

### Get Meter Details
```bash
curl "http://localhost:3000/api/meters/J100000"
```

### Get Transformers
```bash
curl "http://localhost:3000/api/transformers"
```

## Assumptions

1. **Portal is read-only**: The assignment specifies treating the portal as read-only, so this service only implements GET operations.

2. **Session-based auth is sufficient**: The portal uses session cookies, and I assumed this would work reliably for the expected use case without implementing automatic session refresh.

3. **SvelteKit endpoints are stable**: I assumed the `__data.json` endpoints are stable and won't change without notice.

4. **Single session instance**: The service uses a singleton UrjaClient instance, assuming a single session is sufficient for the expected load.

5. **No caching needed initially**: I omitted caching to keep the implementation simple, assuming the portal can handle the request volume.

## Design Decisions & Trade-offs

### Technology Stack
- **Express.js + TypeScript**: Chosen for simplicity, strong typing, and widespread adoption. Easy to understand and maintain.
- **Axios**: Used as the HTTP client for its robust cookie handling and promise-based API.

### Architecture Decisions
- **No database**: Intentionally omitted. The portal remains the source of truth. Adding a database would complicate the system without clear benefit for this use case.
- **Data aggregation**: The `GET /api/meters/:id` endpoint aggregates data from three portal endpoints (details, energy, geolocation) into a single response. This reduces client complexity but increases server-side latency.
- **Session management**: Implemented a simple boolean flag (`isAuthenticated`) rather than a full session manager. This works but doesn't handle session expiration gracefully.

### Trade-offs
- **Simplicity vs robustness**: Prioritized simplicity over comprehensive error handling, retry logic, and session refresh mechanisms.
- **Performance vs data completeness**: Aggregating data server-side increases latency but provides a cleaner client API.
- **Type safety**: Used TypeScript but didn't implement strict DTO validation (e.g., with Zod) to keep the codebase minimal.

## What I Intentionally Skipped

1. **Automatic session refresh**: The service doesn't detect or handle session expiration. If the session expires, requests will fail until the service is restarted.

2. **Request retry mechanism**: No retry logic for failed requests. Network issues or portal errors will propagate to the client.

3. **Response caching**: No caching layer. Every request hits the portal.

4. **Rate limiting**: No rate limiting implemented. The service relies on the portal's rate limiting.

5. **Structured logging**: Basic console logging only. No structured logging or log levels.

6. **Monitoring and metrics**: No health checks, metrics, or monitoring endpoints.

7. **Comprehensive testing**: No unit or integration tests.

8. **DTO validation**: Input validation is minimal (only checking for required parameters).

9. **Error handling**: Basic error handling only. No custom error types or detailed error responses.

10. **API versioning**: No versioning strategy for the API endpoints.

## What I'd Improve With More Time

1. **Session management**: Implement automatic session refresh and detection of session expiration.

2. **Error handling**: Add comprehensive error handling with custom error types and meaningful error messages.

3. **Retry logic**: Implement exponential backoff for failed requests.

4. **Caching**: Add a caching layer (e.g., Redis) with configurable TTL to reduce portal load.

5. **Testing**: Add unit tests for controllers and integration tests for the full API.

6. **Validation**: Use Zod or similar for request/response validation.

7. **Logging**: Implement structured logging with appropriate log levels.

8. **Monitoring**: Add health check endpoints and basic metrics.

9. **Network hierarchy**: Implement the optional extension to reconstruct and expose the meter network hierarchy.

## Reflection

### What assumptions did you make?

I assumed the portal's session-based authentication would work reliably without implementing automatic refresh. I also assumed the SvelteKit `__data.json` endpoints are stable and won't change. I assumed a single session instance would be sufficient for the expected load, and that the portal can handle the request volume without caching.

### Which part was the most difficult, and how did you get unstuck?

The most difficult part was understanding the portal's authentication mechanism. Initially, login requests were failing without clear error messages. By inspecting the network traffic in the browser, I discovered that the `Origin` header was required and that the portal uses session cookies rather than JWT tokens. Once I understood this, implementing cookie handling with Axios's `withCredentials: true` was straightforward.

### If you had another day, what would you improve?

I would implement automatic session refresh and expiration handling, add comprehensive error handling with retry logic, implement a caching layer to reduce portal load, add unit and integration tests, and serve the OpenAPI specification with Swagger UI for better API documentation.

### What mistake did you make while solving this?

I initially used `username` instead of `email` in the login request body, which caused authentication to fail. I also initially didn't set the `Content-Type` header to `application/x-www-form-urlencoded`, which the portal requires. Both were discovered through trial and error and network inspection.

### If you were reviewing your own submission, what would you criticise?

I would criticise the lack of comprehensive error handling and testing. The service doesn't gracefully handle session expiration, network failures, or malformed responses. There are no tests to verify correctness. The error messages are generic and not helpful for debugging. Additionally, the implementation is minimal and doesn't include production-ready features like monitoring, logging, or rate limiting that would be expected in a real-world service.

## Documentation

- **PROTOCOL.md**: Detailed documentation of how the portal works internally, including authentication, endpoints, and data structures.
- **openapi.json**: OpenAPI 3.x specification of this API's endpoints.

## License

ISC
