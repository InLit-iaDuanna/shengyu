#!/usr/bin/env python3
import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = "127.0.0.1"
PORT = int(os.environ.get("GAME_SETTINGS_PORT", "8787"))
PASSWORD = os.environ.get("GAME_SETTINGS_PASSWORD", "seeinglab")
STATE_PATH = os.environ.get("GAME_SETTINGS_STATE", "/var/lib/game-settings/state.json")
STATE_LOCK = threading.Lock()


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def default_state():
    return {"showMinimap": True, "updatedAt": now_iso(), "version": 1}


def ensure_state_dir():
    directory = os.path.dirname(STATE_PATH)
    if directory:
        os.makedirs(directory, exist_ok=True)


def normalize_state(data):
    return {
        "showMinimap": bool(data.get("showMinimap", True)),
        "updatedAt": data.get("updatedAt") or now_iso(),
        "version": int(data.get("version", 1)),
    }


def write_state_unlocked(data):
    ensure_state_dir()
    temp_path = f"{STATE_PATH}.tmp"
    with open(temp_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False)
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temp_path, STATE_PATH)


def read_state_unlocked():
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except FileNotFoundError:
        data = default_state()
        write_state_unlocked(data)
    except json.JSONDecodeError:
        data = default_state()
        write_state_unlocked(data)
    return normalize_state(data)


def read_state():
    with STATE_LOCK:
        return read_state_unlocked()


class Handler(BaseHTTPRequestHandler):
    server_version = "GameSettingsAPI/1.0"

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_common_headers()
        self.end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] != "/api/game-settings":
            self.respond_json({"error": "not_found"}, 404)
            return
        self.respond_json(read_state())

    def do_POST(self):
        route = self.path.split("?", 1)[0]
        if route not in {"/api/game-settings", "/api/game-settings/auth"}:
            self.respond_json({"error": "not_found"}, 404)
            return

        body = self.read_json_body()
        if body is None:
            self.respond_json({"error": "bad_request"}, 400)
            return

        if body.get("password") != PASSWORD:
            self.respond_json({"error": "unauthorized"}, 401)
            return

        if route == "/api/game-settings/auth":
            self.respond_json({"ok": True})
            return

        with STATE_LOCK:
            previous = read_state_unlocked()
            next_state = {
                "showMinimap": bool(body.get("showMinimap", True)),
                "updatedAt": now_iso(),
                "version": previous["version"] + 1,
            }
            write_state_unlocked(next_state)
        self.respond_json(next_state)

    def read_json_body(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            return json.loads(raw_body or "{}")
        except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
            return None

    def respond_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_common_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_common_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Game settings API listening on http://{HOST}:{PORT}", flush=True)
    server.serve_forever()
