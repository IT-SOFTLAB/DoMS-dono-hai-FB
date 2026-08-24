# DOMS Frontend

React and Vite frontend for the DOMS Spring Boot API.

## Source structure

```text
src/
├── api/client.js                 Shared authenticated API client
├── config/plans.js               Subscription plan configuration
├── features/documents/
│   ├── UploadPage.jsx            Document catalogue workflow
│   └── SearchPage.jsx            Real-time search, download and delete
├── App.jsx                       Authentication and dashboard shell
├── main.jsx                      React application entry point
└── styles.css                    Responsive application theme
```

Upload metadata includes name, type, category, department, owner,
confidentiality, document date, storage location, tags, and description.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:5173. The backend must be running on port 8080.

## Build

```powershell
npm run build
```
