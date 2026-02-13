#!/bin/bash
set -e

if [ -x "./venv/bin/python3" ]; then
    ./venv/bin/python3 BACKEND/app.py
else
    echo "INFO: venv not found at ./venv. Starting backend with system python3."
    echo "INFO: If dependencies are missing, install with: pip3 install -r requirements.txt"
    python3 BACKEND/app.py
fi
