# DOMS – Document Management System

The project has two sibling applications:

- `doms/` – Spring Boot 3 / Java 21 backend
- `frontend/` – React + Vite frontend

## Start

1. Create a MySQL database named `doms` and set database credentials in `doms/src/main/resources/application.properties` (or environment overrides).
2. In `doms`, run `./mvnw spring-boot:run` (`mvnw.cmd spring-boot:run` on Windows).
3. In `frontend`, run `npm install`, then `npm run dev`.

Frontend: `http://localhost:5173` · API: `http://localhost:8080/api`

Demo accounts are created automatically:

- Admin: `admin@gmail.com` / `Admin@123`
- User: `user@gmail.com` / `User@123`

Uploaded files are stored in `doms/uploads`; metadata, generated document numbers, users, quotas, and subscriptions are stored in MySQL.
