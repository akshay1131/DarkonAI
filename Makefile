.PHONY: run backend frontend help

help:
	@echo "Available commands:"
	@echo "  make run        - Run both Backend and Frontend concurrently"
	@echo "  make backend    - Run Flask Backend on port 5001"
	@echo "  make frontend   - Run Vite Frontend on port 5173"

run:
	./run.sh

backend:
	cd backend && ../venv/bin/python app.py

frontend:
	cd frontend && npm run dev
