#Makefile

# --- Paths ---
BACKEND_DIR := server
FRONTEND_DIR := client
BACKEND_PID := $(PWD)/.backend_pid
FRONTEND_PID := $(PWD)/.frontend_pid
FRONTEND_PORT ?= 5173

# --- Load .env from backend ---
# export $(shell sed 's/=.*//' $(BACKEND_DIR)/.env)

# Extract DATABASE_URL from .env
DATABASE_URL=$(shell sed -n 's/^DATABASE_URL=//p' $(BACKEND_DIR)/.env)


# --- Run Backend ---
# run-backend:
# 	@echo "Starting backend..."
# 	@cd $(BACKEND_DIR) && ./venv/bin/uvicorn server.main:app --reload > /dev/null 2>&1 & echo $$! > $(BACKEND_PID)
# 	@echo "Backend PID saved to $(BACKEND_PID)"

# --- Run Frontend ---
# run-frontend:
# 	@echo "Starting frontend..."
# 	@cd $(FRONTEND_DIR) && npm run dev > /dev/null 2>&1 & echo $$! > $(FRONTEND_PID)
# 	@echo "Frontend PID saved to $(FRONTEND_PID)"

# --- Run Backend ---
run-backend:
	@echo "Starting backend..."
	@mkdir -p $(BACKEND_DIR)            # ensure backend dir exists
	@touch $(BACKEND_PID)               # ensure PID file exists
	@cd $(BACKEND_DIR) && \
	(DATABASE_URL=${DATABASE_URL} ./venv/bin/uvicorn main:app --reload > backend.log 2>&1 & echo $$! > $(BACKEND_PID))
	@echo "Backend PID saved to $(BACKEND_PID)"

# --- Run Frontend ---
run-frontend:
	@echo "Starting frontend..."
	@mkdir -p $(FRONTEND_DIR) # ensure folder exists
	
	@port=$(FRONTEND_PORT); \
	while lsof -ti:$$port > /dev/null; do \
	    echo "Port $$port in use, trying next..."; \
	    port=$$((port + 1)); \
	done; \
	echo "Using frontend port $$port"; \
	cd $(FRONTEND_DIR) && nohup npm run dev -- --port $$port > frontend.log 2>&1 & \
	sleep 2; \
	lsof -ti:$$port > $(FRONTEND_PID); \
	echo "Frontend PID saved to $(FRONTEND_PID)"; \
	echo "Frontend running on port $$port"

# --- Run Both ---
run: 
	@echo "Both frontend and backend started."
	$(MAKE) run-backend & 
	$(MAKE) run-frontend &
	wait
# --- Stop Backend ---
stop-backend:
	@echo "Stopping backend..."
	@if [ -f $(BACKEND_PID) ]; then \
		kill $$(cat $(BACKEND_PID)) && rm $(BACKEND_PID); \
		echo "Backend stopped."; \
	else \
		echo "No backend PID found."; \
	fi

# --- Stop Frontend ---
stop-frontend:
	@echo "Stopping frontend..."
	@if [ -f $(FRONTEND_PID) ]; then \
		kill $$(cat $(FRONTEND_PID)) && rm $(FRONTEND_PID); \
		echo "Frontend stopped."; \
	else \
		echo "No frontend PID found."; \
	fi

# --- Stop Both ---
stop: 
	@echo "Both frontend and backend stopped."
	$(MAKE) stop-backend
	$(MAKE) stop-frontend
