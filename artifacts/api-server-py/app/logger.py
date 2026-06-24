"""Structured logging, configured once and imported everywhere.

Plain stdlib `logging` with a JSON-ish formatter — keeps parity with the
Node side's pino (structured, one line per event) without adding a
dependency for something this small.
"""

import json
import logging
import sys


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname.lower(),
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["err"] = self.formatException(record.exc_info)
        extra = getattr(record, "extra_fields", None)
        if extra:
            payload.update(extra)
        return json.dumps(payload, default=str)


def _build_logger() -> logging.Logger:
    log = logging.getLogger("corcodusa-api")
    log.setLevel(logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JsonFormatter())
    log.addHandler(handler)
    log.propagate = False
    return log


logger = _build_logger()


def log_error(msg: str, **fields) -> None:
    logger.error(msg, extra={"extra_fields": fields})


def log_warn(msg: str, **fields) -> None:
    logger.warning(msg, extra={"extra_fields": fields})


def log_info(msg: str, **fields) -> None:
    logger.info(msg, extra={"extra_fields": fields})
