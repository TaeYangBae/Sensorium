#!/usr/bin/env python3
# Sensorium landing page server (single-process HTTP server).

from __future__ import annotations

import argparse
import ipaddress
import ssl
import json
import threading
import uuid
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, List


ROOT_DIR = Path(__file__).resolve().parent
DATA_FILE = ROOT_DIR / "workspace_data.json"
TEMPLATES = ROOT_DIR / "templates"
STATIC_DIR = ROOT_DIR / "static"


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


class WorkspaceStore:
    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()
        self._data = self._load()

    def _default(self) -> Dict[str, List[Dict]]:
        return {"pages": []}

    def _load(self) -> Dict[str, List[Dict]]:
        if not self.path.exists():
            return self._default()
        try:
            loaded = json.loads(self.path.read_text(encoding="utf-8"))
            if isinstance(loaded, dict) and isinstance(loaded.get("pages"), list):
                return loaded
        except (json.JSONDecodeError, OSError):
            pass
        return self._default()

    def _normalize(self, data: Dict[str, List[Dict]]) -> Dict[str, List[Dict]]:
        if not isinstance(data, dict):
            return self._default()
        pages = data.get("pages", [])
        if not isinstance(pages, list):
            pages = []
        normalized_pages = []
        for page in pages:
            if not isinstance(page, dict):
                continue
            pid = page.get("id") or str(uuid.uuid4())
            normalized_pages.append(
                {
                    "id": str(pid),
                    "title": str(page.get("title", "새 페이지") or "새 페이지"),
                    "blocks": [
                        {
                            "id": str(block.get("id", uuid.uuid4())),
                            "type": block.get("type", "paragraph"),
                            "content": str(block.get("content", "")),
                            "checked": bool(block.get("checked", False)),
                        }
                        for block in (page.get("blocks") or [])
                        if isinstance(block, dict)
                    ],
                    "created_at": page.get("created_at", now_iso()),
                    "updated_at": page.get("updated_at", now_iso()),
                }
            )
        return {"pages": normalized_pages}

    def save(self):
        with self._lock:
            self.path.write_text(
                json.dumps(self._data, ensure_ascii=False, indent=2), encoding="utf-8"
            )

    def all_pages(self):
        with self._lock:
            return [dict(page) for page in self._data.get("pages", [])]

    def get_page(self, page_id: str):
        with self._lock:
            for page in self._data.get("pages", []):
                if page["id"] == page_id:
                    return page
        return None

    def create_page(self, title: str):
        title = (title or "새 페이지").strip() or "새 페이지"
        page = {
            "id": str(uuid.uuid4()),
            "title": title,
            "blocks": [],
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        with self._lock:
            self._data["pages"].append(page)
            self.save()
        return page

    def update_page(self, page_id: str, title: str):
        with self._lock:
            page = self.get_page(page_id)
            if not page:
                return None
            page["title"] = (title or "새 페이지").strip() or "새 페이지"
            page["updated_at"] = now_iso()
            self.save()
        return page

    def delete_page(self, page_id: str):
        with self._lock:
            pages = self._data.get("pages", [])
            for idx, page in enumerate(pages):
                if page["id"] == page_id:
                    del pages[idx]
                    self.save()
                    return True
        return False

    def create_block(self, page_id: str, block_type: str, content: str = "", checked: bool = False):
        page = self.get_page(page_id)
        if not page:
            return None
        block = {
            "id": str(uuid.uuid4()),
            "type": block_type,
            "content": content,
            "checked": bool(checked),
        }
        with self._lock:
            page["blocks"].append(block)
            page["updated_at"] = now_iso()
            self.save()
        return block

    def update_block(self, page_id: str, block_id: str, patch: Dict):
        page = self.get_page(page_id)
        if not page:
            return None
        for block in page["blocks"]:
            if block["id"] != block_id:
                continue
            if "type" in patch:
                block["type"] = patch["type"]
            if "content" in patch:
                block["content"] = str(patch["content"])
            if "checked" in patch:
                block["checked"] = bool(patch["checked"])
            page["updated_at"] = now_iso()
            self.save()
            return block
        return None

    def delete_block(self, page_id: str, block_id: str):
        page = self.get_page(page_id)
        if not page:
            return False
        for idx, block in enumerate(page["blocks"]):
            if block["id"] == block_id:
                del page["blocks"][idx]
                page["updated_at"] = now_iso()
                self.save()
                return True
        return False

    def pages_list_response(self):
        pages = self.all_pages()
        return [
            {k: page[k] for k in ("id", "title", "created_at", "updated_at")}
            for page in pages
        ]

    def normalize(self):
        with self._lock:
            self._data = self._normalize(self._data)
            self.save()


store: WorkspaceStore
ALLOW_NETWORKS: List[ipaddress._BaseNetwork] = []


def parse_networks(values: List[str]):
    networks = []
    for item in values:
        item = item.strip()
        if not item:
            continue
        network = ipaddress.ip_network(item, strict=False)
        networks.append(network)
    return networks


def read_request_json(handler):
    length = int(handler.headers.get("Content-Length", "0") or 0)
    if length <= 0:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def create_tls_context(cert_file: str, key_file: str) -> ssl.SSLContext:
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=cert_file, keyfile=key_file)
    return context


def json_response(handler, status: int, payload: Dict):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.end_headers()
    handler.wfile.write(body)


def text_response(handler, status: int, payload: bytes, content_type: str):
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(payload)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(payload)


def deny(handler, reason: str = "forbidden"):
    json_response(handler, 403, {"error": reason})


def not_found(handler):
    json_response(handler, 404, {"error": "not_found"})


def parse_path(path: str):
    return [seg for seg in path.split("/") if seg]


def load_file(file_path: Path, fallback: bytes = b"") -> bytes:
    try:
        return file_path.read_bytes()
    except OSError:
        return fallback


class SensoriumHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _client_ip(self):
        ip = self.headers.get("X-Forwarded-For", "").split(",")[0].strip()
        if not ip:
            ip = self.headers.get("X-Real-IP", "").strip()
        if not ip:
            ip = self.client_address[0]
        return ip

    def _is_allowed(self):
        if not ALLOW_NETWORKS:
            return True
        if self._client_ip() in {"127.0.0.1", "::1"}:
            return True
        try:
            ip = ipaddress.ip_address(self._client_ip())
        except ValueError:
            return False
        return any(ip in network for network in ALLOW_NETWORKS)

    def _ensure_allowed(self):
        if self._is_allowed():
            return True
        deny(self, "요청한 IP가 허용되지 않습니다.")
        return False

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if not self._ensure_allowed():
            return
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/":
            html = load_file(TEMPLATES / "index.html")
            if not html:
                not_found(self)
                return
            text_response(self, 200, html, "text/html; charset=utf-8")
            return

        if path.startswith("/static/"):
            file_path = (ROOT_DIR / path.lstrip("/")).resolve()
            safe_root = STATIC_DIR.resolve()
            if not str(file_path).startswith(str(safe_root)) or not file_path.is_file():
                not_found(self)
                return
            data = load_file(file_path)
            text_response(self, 200, data, "text/css; charset=utf-8" if file_path.suffix == ".css" else "application/javascript; charset=utf-8")
            return

        segments = parse_path(path)
        if segments[:2] != ["api", "pages"]:
            not_found(self)
            return

        if len(segments) == 2:
            json_response(self, 200, {"pages": store.pages_list_response()})
            return

        if len(segments) == 3:
            page = store.get_page(segments[2])
            if not page:
                json_response(self, 404, {"error": "page_not_found"})
                return
            json_response(self, 200, page)
            return

        not_found(self)

    def do_POST(self):
        if not self._ensure_allowed():
            return
        parsed = urlparse(self.path)
        segments = parse_path(parsed.path)
        if segments[:2] != ["api", "pages"]:
            not_found(self)
            return

        body = read_request_json(self)
        if len(segments) == 2:
            title = str(body.get("title", "새 페이지")).strip()
            page = store.create_page(title)
            json_response(self, 201, page)
            return

        if len(segments) == 4 and segments[3] == "blocks":
            page_id = segments[2]
            block_type = str(body.get("type", "paragraph"))
            block = store.create_block(
                page_id,
                block_type,
                str(body.get("content", "")),
                bool(body.get("checked", False)),
            )
            if not block:
                json_response(self, 404, {"error": "page_not_found"})
                return
            json_response(self, 201, block)
            return

        not_found(self)

    def do_PATCH(self):
        if not self._ensure_allowed():
            return
        parsed = urlparse(self.path)
        segments = parse_path(parsed.path)
        if segments[:2] != ["api", "pages"]:
            not_found(self)
            return

        body = read_request_json(self)
        if len(segments) == 3:
            page = store.update_page(segments[2], str(body.get("title", "")))
            if not page:
                json_response(self, 404, {"error": "page_not_found"})
                return
            json_response(self, 200, page)
            return

        if len(segments) == 5 and segments[3] == "blocks":
            block = store.update_block(segments[2], segments[4], body)
            if not block:
                json_response(self, 404, {"error": "page_or_block_not_found"})
                return
            json_response(self, 200, block)
            return

        not_found(self)

    def do_DELETE(self):
        if not self._ensure_allowed():
            return
        segments = parse_path(urlparse(self.path).path)
        if segments[:2] != ["api", "pages"]:
            not_found(self)
            return
        if len(segments) == 3:
            if store.delete_page(segments[2]):
                json_response(self, 200, {"ok": True})
            else:
                json_response(self, 404, {"error": "page_not_found"})
            return
        if len(segments) == 5 and segments[3] == "blocks":
            if store.delete_block(segments[2], segments[4]):
                json_response(self, 200, {"ok": True})
            else:
                json_response(self, 404, {"error": "page_or_block_not_found"})
            return
        not_found(self)


def main():
    global store, ALLOW_NETWORKS, DATA_FILE

    default_data_file = str(DATA_FILE)
    parser = argparse.ArgumentParser(description="센서리움 랜딩 페이지 서버")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8081)
    parser.add_argument("--data-file", default=default_data_file)
    parser.add_argument(
        "--allow",
        action="append",
        default=["192.168.0.0/24"],
        help="허용할 클라이언트 대역대 (CIDR). 기본: 192.168.0.0/24",
    )
    parser.add_argument(
        "--tls-cert",
        default="",
        help="HTTPS 사용 시 인증서 경로. 예: /home/.../deploy/certs/sensorium.crt",
    )
    parser.add_argument(
        "--tls-key",
        default="",
        help="HTTPS 사용 시 키 경로. 예: /home/.../deploy/certs/sensorium.key",
    )
    args = parser.parse_args()

    if bool(args.tls_cert) != bool(args.tls_key):
        parser.error("--tls-cert와 --tls-key는 함께 지정해야 합니다.")

    DATA_FILE = Path(args.data_file).resolve()
    ALLOW_NETWORKS = parse_networks(args.allow)
    store = WorkspaceStore(DATA_FILE)
    store._data = store._normalize(store._data)
    store.save()

    server = ThreadingHTTPServer((args.host, args.port), SensoriumHandler)
    if args.tls_cert:
        server.socket = create_tls_context(args.tls_cert, args.tls_key).wrap_socket(
            server.socket, server_side=True
        )
        scheme = "https"
    else:
        scheme = "http"

    print(
        f"[sensorium] running on {scheme}://{args.host}:{args.port} "
        f"(allow networks: {', '.join(args.allow)})"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
