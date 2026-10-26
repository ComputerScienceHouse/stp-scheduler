"""Parse uploaded instructor CSV (``Teacher``, ``Class``, ``Weight``).

One row per instructor per class. ``Weight`` is scheduler qualification (-1 / 0 / 1).
Rows for any of the supported classes (core and non-core) populate the matching
entry in ``subject_weights``. ``max_sections`` is always **6** (no column for it
in this format).
"""

import csv
import io
import uuid
from dataclasses import dataclass

from stp_scheduler.domain.constants import ALL_CLASSES

# Map the class label from the CSV (lower-cased/stripped) to the canonical
# subject key used throughout the domain. The CSV uses "English" for the core
# reading/english class.
_PIVOT_CLASS_TO_SUBJECT: dict[str, str] = {c.lower(): c for c in ALL_CLASSES}
_PIVOT_CLASS_TO_SUBJECT["english"] = "english"
_PIVOT_CLASS_TO_SUBJECT["reading"] = "english"

# Default weight for every supported class is -1 (not qualified).
_DEFAULT_WEIGHTS: dict[str, int] = {c: -1 for c in ALL_CLASSES}

_MAX_SECTIONS_DEFAULT = 6


def _parse_weight(cell: str | None) -> int:
    """Safely convert weight cell content to integer qualification level."""
    if not cell:
        return -1
    try:
        return int(float(cell.strip()))
    except (ValueError, TypeError):
        return -1


@dataclass
class ParsedInstructorRow:
    id: str
    name: str
    max_sections: int
    is_mentor: bool
    subject_weights: dict[str, int]


def parse_instructors_csv(content: bytes) -> list[ParsedInstructorRow]:
    """Parse uploaded instructor CSV into a list of ParsedInstructorRow objects."""
    # utf-8-sig automatically strips any leading Byte Order Mark (BOM)
    text_stream = io.StringIO(content.decode("utf-8-sig"))
    reader = csv.DictReader(text_stream)

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or missing headers")

    # Normalize header mapping (strip whitespace and lower-case)
    field_map = {name.strip().lower(): name for name in reader.fieldnames if name}

    required_cols = {"teacher", "class", "weight"}
    if not required_cols.issubset(field_map.keys()):
        raise ValueError("Instructors CSV must have columns: Teacher, Class, Weight")

    t_col = field_map["teacher"]
    c_col = field_map["class"]
    w_col = field_map["weight"]

    merged: dict[str, dict[str, int]] = {}

    for row in reader:
        raw_name = row.get(t_col)
        if not raw_name or not raw_name.strip():
            continue

        name = raw_name.strip()
        if name not in merged:
            merged[name] = dict(_DEFAULT_WEIGHTS)

        class_raw = row.get(c_col) or ""
        class_key = class_raw.strip().lower()

        weight = _parse_weight(row.get(w_col))
        subject = _PIVOT_CLASS_TO_SUBJECT.get(class_key)

        if subject:
            merged[name][subject] = weight

    return [
        ParsedInstructorRow(
            id=str(uuid.uuid4()),
            name=name,
            max_sections=_MAX_SECTIONS_DEFAULT,
            is_mentor=False,
            subject_weights=weights,
        )
        for name, weights in merged.items()
    ]
