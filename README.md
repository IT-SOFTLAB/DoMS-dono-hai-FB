# DOMS – Document Management System

The project has two sibling applications:

- `doms/` – Spring Boot 3 / Java 17 backend
- `frontend/` – React + Vite frontend

## Start

1. Copy `doms/.env.example` to `doms/.env`, then configure PostgreSQL, JWT, and your Cloudinary cloud name, API key, and API secret.
2. In `doms`, run `./mvnw spring-boot:run` (`mvnw.cmd spring-boot:run` on Windows).
3. In `frontend`, run `npm install`, then `npm run dev`.

Frontend: `http://localhost:5173` · API: `http://localhost:8080/api`

Demo accounts are created automatically:

- Admin: `admin@gmail.com` / `Admin@123`
- User: `user@gmail.com` / `User@123`

New files and document versions are stored as raw assets in Cloudinary under `doms/documents` (configurable with `CLOUDINARY_FOLDER`). Metadata, generated document numbers, users, and permissions are stored in PostgreSQL. The Cloudinary API secret is used only by the backend and must never be exposed through the frontend.

Existing records that point to files in `doms/uploads` remain readable and are removed locally when permanently deleted. All new uploads use Cloudinary.

Authentication is browser-session scoped: closing the browser removes the frontend credentials and requires a new login. Explicit logout also revokes previously issued tokens for that account on the server. JWTs expire after 30 minutes by default; configure `JWT_EXPIRATION` in milliseconds if a different short lifetime is required.
