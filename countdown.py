"""Countdown timer to the next October 21st."""

from __future__ import annotations

import datetime as dt
import time


def get_next_october_21(reference: dt.datetime | None = None) -> dt.datetime:
    """Return the next occurrence of October 21st at midnight local time.

    Args:
        reference: Optional datetime used as the current moment. When omitted the
            current local time is used.

    Returns:
        A datetime representing October 21st in the current year if it is still
        upcoming, otherwise October 21st in the following year.
    """

    if reference is None:
        reference = dt.datetime.now()

    target_year = reference.year
    target = reference.replace(month=10, day=21, hour=0, minute=0, second=0, microsecond=0)

    if reference >= target:
        target_year += 1
        target = target.replace(year=target_year)

    return target


def format_time_delta(delta: dt.timedelta) -> str:
    """Format a timedelta into a human-readable string."""

    total_seconds = int(delta.total_seconds())
    if total_seconds < 0:
        total_seconds = 0

    days, remainder = divmod(total_seconds, 24 * 3600)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)

    parts: list[str] = []
    if days:
        parts.append(f"{days:02d}d")
    parts.append(f"{hours:02d}h")
    parts.append(f"{minutes:02d}m")
    parts.append(f"{seconds:02d}s")

    return " ".join(parts)


def countdown_to_october_21() -> None:
    """Continuously print the time remaining until October 21st."""

    target = get_next_october_21()
    print(f"Counting down to: {target:%B %d, %Y %H:%M:%S}")

    try:
        while True:
            now = dt.datetime.now()
            remaining = target - now
            if remaining.total_seconds() <= 0:
                print("\n🎉 It's October 21st! 🎉")
                break

            formatted = format_time_delta(remaining)
            print(f"\rTime remaining: {formatted}", end="", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nCountdown interrupted.")


if __name__ == "__main__":
    countdown_to_october_21()
