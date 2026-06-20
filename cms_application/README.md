# Atlas Construct CMS

## Backend

`cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt`

`./.venv/bin/python manage.py migrate && ./.venv/bin/python manage.py createsuperuser && ./.venv/bin/python manage.py runserver`

Optionally add starter content with `python manage.py seed_cms`.

The API runs at `http://localhost:8000/api/`; Django administration is at `/django-admin/`.

## Frontend

`cd frontend && npm install && npm run dev`

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` when the backend is not on the default address.

## Environment

`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `DB_ENGINE`, `DB_NAME`, `EMAIL_BACKEND`, `DEFAULT_FROM_EMAIL`, and `ADMIN_NOTIFICATION_EMAIL` are supported. PostgreSQL uses `DB_ENGINE=django.db.backends.postgresql` and a PostgreSQL `DB_NAME` configuration (extend database credentials in `config/settings.py` for your deployment secret manager).

Public content is sourced from DRF. Create site settings, hero, services, projects, team, and statistics through the custom `/admin` application or Django admin. Staff users authenticate using JWT. Visitor enquiry carts persist in browser storage; submissions create an enquiry and item snapshots, then optionally notify `ADMIN_NOTIFICATION_EMAIL`.
