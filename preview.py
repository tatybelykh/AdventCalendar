import os
import re
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


BYTE_RANGE = re.compile(r"bytes=([0-9]{0,20})-([0-9]{0,20})", re.IGNORECASE)
MEDIA_EXTENSIONS = (".mp3", ".mp4")


class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        if self.command in ("GET", "HEAD") and self.translate_path(self.path).lower().endswith(MEDIA_EXTENSIONS):
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        requested = BYTE_RANGE.fullmatch(self.headers.get("Range", "").strip())
        if (
            not path.lower().endswith(MEDIA_EXTENSIONS)
            or not requested
            or not any(requested.groups())
            or "If-Modified-Since" in self.headers
        ):
            return super().do_GET()

        try:
            media = open(path, "rb")
        except OSError:
            return super().do_GET()

        with media:
            info = os.fstat(media.fileno())
            last_modified = self.date_time_string(info.st_mtime)
            if self.headers.get("If-Range", last_modified) != last_modified:
                return super().do_GET()

            first, last = requested.groups()
            if first:
                start = int(first)
                end = min(int(last), info.st_size - 1) if last else info.st_size - 1
            else:
                start = max(0, info.st_size - int(last))
                end = info.st_size - 1

            if start > end:
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{info.st_size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

            remaining = end - start + 1
            media.seek(start)
            self.send_response(HTTPStatus.PARTIAL_CONTENT)
            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Content-Range", f"bytes {start}-{end}/{info.st_size}")
            self.send_header("Content-Length", str(remaining))
            self.send_header("Last-Modified", last_modified)
            self.end_headers()
            try:
                while remaining:
                    chunk = media.read(min(remaining, 64 * 1024))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            except ConnectionError:
                # The browser can cancel a request when it seeks or leaves the page.
                return


if __name__ == "__main__":
    handler = partial(PreviewHandler, directory=str(Path(__file__).resolve().parent))
    with PreviewServer(("127.0.0.1", 8173), handler) as server:
        server.serve_forever()
