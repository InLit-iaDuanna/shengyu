import http.client
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch


API_PATH = Path(__file__).resolve().parents[1] / "game-settings-api.py"
TEST_PASSWORD = "test-only-password-\u6d4b\u8bd5"


class GameSettingsSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        with patch.dict(os.environ, {
            "GAME_SETTINGS_PASSWORD": TEST_PASSWORD,
            "GAME_SETTINGS_STATE": str(Path(cls.temp.name) / "state.json"),
        }):
            spec = importlib.util.spec_from_file_location("game_settings_api", API_PATH)
            cls.api = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cls.api)
        cls.server = cls.api.ThreadingHTTPServer(("127.0.0.1", 0), cls.api.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        cls.temp.cleanup()

    def request(self, method, path="/api/game-settings", payload=None, headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=2)
        try:
            body = json.dumps(payload) if payload is not None else None
            conn.request(method, path, body=body, headers=headers or {"Content-Type": "application/json"})
            response = conn.getresponse()
            return response.status, dict(response.getheaders()), json.loads(response.read())
        finally:
            conn.close()

    def test_startup_requires_explicit_nonempty_password(self):
        for value in (None, "", "   "):
            with self.subTest(value=value):
                env = os.environ.copy()
                env.pop("GAME_SETTINGS_PASSWORD", None)
                if value is not None:
                    env["GAME_SETTINGS_PASSWORD"] = value
                result = subprocess.run(
                    [sys.executable, str(API_PATH)], env=env,
                    capture_output=True, text=True, timeout=3,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("GAME_SETTINGS_PASSWORD must be configured", result.stderr)

    def test_missing_wrong_and_nonstring_credentials_cannot_write(self):
        initial = self.request("GET")[2]
        for password in (None, "", "wrong", 42, [], {}):
            with self.subTest(password=password):
                status, _, _ = self.request("POST", payload={"password": password, "spatialMode": "natural"})
                self.assertEqual(status, 401)
        self.assertEqual(self.request("GET")[2], initial)

    def test_configured_password_can_authenticate_and_update(self):
        status, _, body = self.request("POST", "/api/game-settings/auth", {"password": TEST_PASSWORD})
        self.assertEqual((status, body), (200, {"ok": True}))
        before = self.request("GET")[2]
        status, _, body = self.request("POST", payload={"password": TEST_PASSWORD, "spatialMode": "natural"})
        self.assertEqual(status, 200)
        self.assertEqual(body["spatialMode"], "natural")
        self.assertEqual(body["version"], before["version"] + 1)

    def test_nonobject_json_is_bad_request(self):
        for payload in ([], "text", 123, True):
            with self.subTest(payload=payload):
                self.assertEqual(self.request("POST", payload=payload)[0], 400)

    def test_negative_and_oversized_content_lengths_are_rejected_before_reading(self):
        for length, expected in (("-1", 400), (str(self.api.MAX_BODY_BYTES + 1), 413)):
            with self.subTest(length=length):
                status, _, _ = self.request("POST", headers={"Content-Length": length})
                self.assertEqual(status, expected)

    def test_settings_remain_public_read_only_without_cross_origin_write_access(self):
        status, headers, body = self.request("GET", headers={"Origin": "https://untrusted.example"})
        self.assertEqual(status, 200)
        self.assertIn("spatialMode", body)
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertNotIn("Access-Control-Allow-Origin", headers)


if __name__ == "__main__":
    unittest.main()
