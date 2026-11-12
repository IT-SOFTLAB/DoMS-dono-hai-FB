# DOMS – Document Management System

The project has two sibling applications:

- `doms/` – Spring Boot 3 / Java 17 backend
- `frontend/` – React + Vite frontend

## Start

1. Copy `doms/.env.example` to `doms/.env`, then configure PostgreSQL, JWT, SMTP, and your Cloudinary cloud name, API key, and API secret.
2. Copy `frontend/.env.example` to `frontend/.env`, then configure `VITE_API_URL` if your backend is not running on the default local URL.
3. In `doms`, run `./mvnw spring-boot:run` (`mvnw.cmd spring-boot:run` on Windows).
4. In `frontend`, run `npm install`, then `npm run dev`.

Frontend: `http://localhost:5173` · API: `http://localhost:8080/api`

Demo accounts are created automatically:

- Admin: `admin@gmail.com` / `Admin@123`
- User: `user@gmail.com` / `User@123`

New files and document versions are stored as raw assets in Cloudinary under `doms/documents` (configurable with `CLOUDINARY_FOLDER`). Metadata, generated document numbers, users, and permissions are stored in PostgreSQL. The Cloudinary API secret is used only by the backend and must never be exposed through the frontend.

Existing records that point to files in `doms/uploads` remain readable and are removed locally when permanently deleted. All new uploads use Cloudinary.

Authentication is browser-session scoped: closing the browser removes the frontend credentials and requires a new login. Explicit logout also revokes previously issued tokens for that account on the server. JWTs expire after 30 minutes by default; configure `JWT_EXPIRATION` in milliseconds if a different short lifetime is required.

## Public provisioning APIs

Only these two creation endpoints are intentionally unauthenticated. They are limited per source IP by `PUBLIC_CREATE_RATE_LIMIT_PER_MINUTE` (default `20`). Organization and plan listings, user administration, and every document endpoint remain authenticated.

Create an organization:

```bash
curl -i -X POST http://localhost:8080/api/public/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme India"}'
```

Success (`201`): `{"id":1,"name":"Acme India","slug":"acme-india"}`. Invalid requests return `400`, duplicates return `409`, and unexpected failures return `500`.

Create a normal user (role-like and privileged fields in the JSON are ignored):

```bash
curl -i -X POST http://localhost:8080/api/public/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Asha Rao","email":"asha@example.com","password":"ChangeMe123!","contactNumber":"9876543210","jobTitle":"Analyst","department":"Operations","address":"Bengaluru","startDate":"2026-09-11","endDate":"2027-09-10","orgId":1,"planId":1}'
```

Success is `201` and returns a sanitized user/profile representation without credentials or storage details. Invalid references or dates return `400`; duplicate email returns `409`.

Plans are seeded by Flyway using binary gigabytes (`1 GB = 1024^3 bytes`): Silver 5 GB, Gold 8 GB, and Diamond 15 GB. Billing months are anchored to `startDate`; the final period is truncated at `endDate`. Successful initial and version uploads consume their server-observed bytes. Deleting a document does not reclaim usage from that billing period.
