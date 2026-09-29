"""Parse uploaded instructor CSV (``Teacher``, ``Class``, ``Weight``).

One row per instructor per class. ``Weight`` is scheduler qualification (-1 / 0 / 1).
Rows for any of the supported classes (core and non-core) populate the matching
entry in ``subject_weights``. ``max_sections`` is always **6** (no column for it
in this format).
"""

import io
import uuid
from dataclasses import dataclass

import pandas as pd

from stp_scheduler.domain.constants import ALL_CLASSES

# Map the class label from the CSV (lower-cased/stripped) to the canonical
# subject key used throughout the domain. The CSV uses "English" for the core
# reading/english class.
_PIVOT_CLASS_TO_SUBJECT: dict[str, str] = {c: c for c in ALL_CLASSES}
_PIVOT_CLASS_TO_SUBJECT["english"] = "english"
_PIVOT_CLASS_TO_SUBJECT["reading"] = "english"

# Default weight for every supported class is -1 (not qualified).
_DEFAULT_WEIGHTS: dict[str, int] = {c: -1 for c in ALL_CLASSES}

_MAX_SECTIONS_DEFAULT = 6


def _norm_cols(df: pd.DataFrame) -> dict[str, str]:
    return {str(c).strip().lower(): c for c in df.columns}


def _parse_weight(cell) -> int:
    if pd.isna(cell) or str(cell).strip() == "":
        return -1
    try:
        return int(float(cell))
    except ValueError:
        return -1


@dataclass
class ParsedInstructorRow:
    id: str
    name: str
    max_sections: int
    is_mentor: bool
    subject_weights: dict[str, int]


def parse_instructors_csv(content: bytes) -> list[ParsedInstructorRow]:
    df = pd.read_csv(io.BytesIO(content))
    colmap = _norm_cols(df)
    if not {"teacher", "class", "weight"}.issubset(colmap.keys()):
        raise ValueError("Instructors CSV must have columns: Teacher, Class, Weight")

    t_col = colmap["teacher"]
    c_col = colmap["class"]
    w_col = colmap["weight"]

    merged: dict[str, dict[str, int]] = {}

    for _, row in df.iterrows():
        raw_name = row[t_col]
        if pd.isna(raw_name) or str(raw_name).strip() == "":
            continue
        name = str(raw_name).strip()
        if name not in merged:
            merged[name] = dict(_DEFAULT_WEIGHTS)

        class_raw = row[c_col]
        class_key = "" if pd.isna(class_raw) else str(class_raw).strip().lower()
        weight = _parse_weight(row[w_col])
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
