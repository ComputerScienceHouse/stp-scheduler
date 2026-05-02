"""Parse uploaded instructor CSV (``Teacher``, ``Class``, ``Weight``).

One row per instructor per class. ``Weight`` is scheduler qualification (-1 / 0 / 1).
Only ASL, Math, and English rows populate ``asl`` / ``math`` / ``english`` in
``subject_weights``. ``max_sections`` is always **6** (no column for it in this format).
"""

import io
import uuid
from dataclasses import dataclass

import pandas as pd

_PIVOT_CLASS_TO_CORE: dict[str, str] = {
    "asl": "asl",
    "math": "math",
    "english": "english",
}

_DEFAULT_CORE_WEIGHTS: dict[str, int] = {"english": -1, "math": -1, "asl": -1}

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
            merged[name] = dict(_DEFAULT_CORE_WEIGHTS)

        class_raw = row[c_col]
        class_key = (
            "" if pd.isna(class_raw) else str(class_raw).strip().lower()
        )
        weight = _parse_weight(row[w_col])
        core = _PIVOT_CLASS_TO_CORE.get(class_key)
        if core:
            merged[name][core] = weight

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
