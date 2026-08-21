# Mechanic Shop — Inventory Management System

A full-stack inventory management system for a mechanic shop. Manage stock across multiple item categories through a browser dashboard, and control inventory via WhatsApp text or voice notes.

---

## Features

- **Dynamic charts** — add or delete inventory charts per category (tires, oils, oil filters, lightbulbs, headlights, brake lines, or any custom category) from the browser
- **Per-category thresholds** — set a low-stock alert threshold for each chart; a reference line is drawn on the chart and items crossing the threshold are highlighted
- **Real-time updates** — WebSocket broadcasts keep all open browser tabs in sync instantly
- **WhatsApp control** — send text or voice note commands to create items, update quantities, set thresholds, and query stock levels
- **Voice transcription** — voice notes are transcribed locally using `faster-whisper` (no cloud transcription required)
- **LLM command parsing** — Claude Haiku interprets natural-language commands, handles category inference, and fuzzy-resolves category names (e.g. "light bulbs" → `lightbulbs`)
- **Sender allowlist** — restrict WhatsApp command access to approved phone numbers via `.env`
- **Audit log** — every create, update, and delete action is logged; logs are downloadable as CSV from the browser

---

## Project Structure

```
mechanic-shop/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                 # Root component; fetches categories, renders charts
│   │   └── main.jsx                # React entry point
│   └── inventory/
│       ├── api/
│       │   ├── itemsApi.jsx        # CRUD + threshold API calls for items
│       │   └── categoriesApi.jsx   # Create / list / delete category charts
│       ├── components/
│       │   └── itemChart.jsx       # Generic bar chart component (all categories)
│       └── modals/
│           └── itemEditModal.jsx   # Edit item quantities modal
│
├── server/                         # FastAPI backend
│   ├── main.py                     # App entry point; registers all routers
│   ├── config.py                   # Pydantic settings (reads .env)
│   ├── db.py                       # SQLAlchemy engine + session
│   ├── models.py                   # ORM models: Item, Category, Threshold, Log
│   ├── schemas.py                  # Pydantic request/response schemas
│   ├── websocket_manager.py        # WebSocket connection manager + broadcast
│   ├── routers/
│   │   ├── items.py                # GET/POST/PUT/DELETE /items/
│   │   ├── categories.py           # GET/POST/DELETE /categories/
│   │   ├── threshold.py            # GET/PUT /items/threshold/?category=
│   │   ├── logs.py                 # GET/POST /logs/
│   │   ├── whatsapp.py             # POST /whatsapp/webhook (Twilio)
│   │   └── tires.py                # Legacy tire router (kept for compatibility)
│   ├── services/
│   │   ├── command_parser.py       # Claude Haiku tool-use NLP parser
│   │   ├── command_dispatcher.py   # Routes parsed commands to services
│   │   ├── items_service.py        # Item business logic (create/add/delete)
│   │   └── threshold_service.py    # Threshold business logic + WS broadcast
│   ├── alembic/                    # Database migrations
│   │   └── versions/
│   │       ├── add_category_to_threshold.py
│   │       └── create_categories_table.py
│   ├── injectData/                 # One-off seed scripts
│   │   ├── inject_tires.py
│   │   └── inject_items.py
│   └── requirements.txt
│
├── docker-compose.yml
├── Makefile                        # Start / stop helpers
└── README.md
```

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Twilio](https://twilio.com) account with a WhatsApp sandbox or number
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone and create virtual environment

```bash
git clone <repo-url>
cd mechanic-shop
python3 -m venv server/venv
```

### 2. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL=sqlite:///./my_database.db
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SID=your_twilio_account_sid
ANTHROPIC_KEY=your_anthropic_api_key

# Comma-separated E.164 numbers allowed to send WhatsApp commands
# Leave empty to allow all numbers (sandbox / testing)
ALLOWED_NUMBERS=+15551234567,+447911123456
```

### 3. Install backend dependencies

```bash
source server/venv/bin/activate
pip install -r server/requirements.txt
```

### 4. Run database migrations

```bash
cd server
alembic upgrade head
```

### 5. Install frontend dependencies

```bash
cd client
npm install
```

---

## Running

### Using Make (recommended)

```bash
make run          # start both backend and frontend
make stop         # stop both
make run-backend  # backend only
make run-frontend # frontend only
```

### Manually

```bash
# Backend (from project root)
source server/venv/bin/activate
cd server
uvicorn main:app --reload

# Frontend (from project root)
cd client
npm run dev -- --host 0.0.0.0
```

Production backend:
```bash
server/venv/bin/gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

---

## WhatsApp Integration

### Twilio setup

1. Set up the [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Expose your local server with [ngrok](https://ngrok.com):
   ```bash
   ngrok http 8000
   ```
3. In the Twilio console, set the webhook URL to:
   ```
   https://your-ngrok-url/whatsapp/webhook
   ```
   Set this in **both**:
   - Messaging → Try it out → Send a WhatsApp message → Sandbox Settings → *When a message comes in*
   - Conversations → Services → Default Service → Webhooks → *onMessageAdded*

### Supported commands

| Intent | Example phrases |
|---|---|
| Create a new chart | `"Create a table for brakes"` |
| Add a new item | `"Add michelin to tires"` |
| Add stock | `"Add 5 new and 2 used michelin tires"` |
| Set threshold | `"Set tires threshold to 50"` |
| Get threshold | `"What is the threshold for lightbulbs"` |
| List items above threshold | `"List all items above the threshold in tires"` |
| List items below threshold | `"What oils need restocking"` |
| Delete an item | `"Delete michelin from tires"` |

- Commands can be sent as **text or voice note**
- Category names are fuzzy-matched — `"light bulbs"`, `"lightbulb"`, and `"lightbulbs"` all resolve to the same chart
- Chart deletion must be done from the browser

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories/` | List all categories |
| `POST` | `/categories/` | Create a category |
| `DELETE` | `/categories/{name}` | Delete a category |
| `GET` | `/items/?category=` | List items for a category |
| `POST` | `/items/create` | Create an item |
| `POST` | `/items/add` | Add quantity to an item |
| `PUT` | `/items/update` | Set exact quantities |
| `DELETE` | `/items/` | Delete an item |
| `GET` | `/items/threshold/?category=` | Get threshold for a category |
| `PUT` | `/items/threshold/?category=` | Set threshold for a category |
| `GET` | `/logs/` | Get last 1000 action logs |
| `POST` | `/whatsapp/webhook` | Twilio webhook receiver |
| `WS` | `/ws` | WebSocket for real-time updates |
