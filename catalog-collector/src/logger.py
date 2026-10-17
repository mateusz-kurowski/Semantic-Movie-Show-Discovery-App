"""Structured logging for catalog-collector.

Outputs to stdout (captured by Docker).
Set STRUCTLOG_FORMAT=json for JSON output (machine parsing) or omit for human-readable console.
Set LOG_LEVEL (default INFO) to change verbosity.
"""

import logging
import os
import sys
from typing import Any

import structlog


def _build_processors() -> list[Any]:
    """Build the structlog processor chain."""
    shared = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
    ]

    if os.environ.get("STRUCTLOG_FORMAT", "").lower() == "json":
        return [
            *shared,
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]

    return [*shared, structlog.dev.ConsoleRenderer(colors=sys.stdout.isatty())]


structlog.configure(
    processors=_build_processors(),
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.getLevelNamesMapping().get(
            os.environ.get("LOG_LEVEL", "INFO").upper(), logging.INFO
        )
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

log: structlog.BoundLogger = structlog.get_logger(service="catalog-collector")
