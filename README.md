# SERÈNEA

SERÈNEA is a mental health foundation website with a React landing page and a Django API for support inquiries.

## Run the website

In one terminal, start the Django API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

In a second terminal, start the React app:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The contact form prepares a message to the SERÈNEA WhatsApp number (+254 741 148 048); the visitor reviews the message in WhatsApp and taps Send. The form does not send or store the note on the website. The Django contact API is available separately at `http://127.0.0.1:8000/api/contact/`.

The website records anonymous page views, section visits, and button clicks for its metrics dashboard. It does not record IP addresses, visitor identities, or form contents. WhatsApp metrics count opens of a prepared message, not messages sent.

Staff can sign in at `http://127.0.0.1:8000/admin/metrics/` to view the dashboard. It uses Django's existing staff login and is not shown as a login step to website visitors. Only trusted staff accounts should have access. Contact inquiries submitted directly to the Django API, if used, are available in the admin.

Set `VITE_API_URL` to the Django API origin when the frontend and backend are on different hosts. Set `CORS_ALLOWED_ORIGINS` and `DJANGO_ALLOWED_HOSTS` for the deployment environment. Before deploying, set a private `DJANGO_SECRET_KEY` and set `DJANGO_DEBUG=0`.

## Deploy to Vercel and Render

The repository includes a Render Blueprint at `render.yaml` and Vercel settings in `frontend/vercel.json`.

1. In Render, create a Blueprint from this GitHub repository and apply `render.yaml`. This creates the Django API and a free PostgreSQL database. The free database is temporary and its data expires, so do not use it for information that must be retained.
2. In Vercel, import the same repository and set the project root directory to `frontend`.
3. After the Render service is live, set `VITE_API_URL` in the Vercel project to the Render service URL (for example, `https://serenea-api.onrender.com`) and redeploy.
4. Set the Render service's `CORS_ALLOWED_ORIGINS` to the exact Vercel production origin shown in the Vercel project settings. The Blueprint contains a starter value that may need changing if Vercel assigns a different domain.
5. Create a Django staff account from the Render service shell with `cd backend && python manage.py createsuperuser`. Use a strong password and share staff access only with trusted operators.

The Vercel build runs `npm ci` and `npm run build`. Render runs Django migrations at service startup and serves collected static files with WhiteNoise. Set production secrets only in the hosting dashboards; do not commit them.

## Run backend tests

From `backend`:

```powershell
python manage.py test
```
