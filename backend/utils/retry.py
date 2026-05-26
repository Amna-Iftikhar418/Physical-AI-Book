import asyncio
from typing import Callable, Any

from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

_DELAYS = [2, 4, 8]  # seconds between attempts 1→2, 2→3, 3→4


async def with_retry(fn: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
    """Call fn with exponential backoff on transient Google API errors (max 4 attempts)."""
    last_exc: Exception | None = None
    for attempt, delay in enumerate([0] + _DELAYS):
        if delay:
            await asyncio.sleep(delay)
        try:
            return await fn(*args, **kwargs)
        except (ResourceExhausted, ServiceUnavailable) as exc:
            last_exc = exc
    raise last_exc
