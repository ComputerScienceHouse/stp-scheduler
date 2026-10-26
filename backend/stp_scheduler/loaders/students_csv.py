"""Parse uploaded student CSV (same shape as data/students.csv)."""

import csv
import io
from dataclasses import dataclass


@dataclass
class ParsedStudentRow:
    name: str
    english: int
    math: int
    asl: int


def parse_students_csv(content: bytes) -> list[ParsedStudentRow]:
    """Parse uploaded student CSV using Python's built-in csv module."""
    text_stream = io.StringIO(content.decode("utf-8-sig"))  # Handles UTF-8 BOM
    reader = csv.DictReader(text_stream)

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or missing headers")

    field_map = {name.strip(): name for name in reader.fieldnames}
    clean_fields = list(field_map.keys())

    def find_col(*needles: str) -> str | None:
        for field in clean_fields:
            if all(n in field.lower() for n in needles):
                return field_map[field]
        return None

    name_col = find_col("student", "name") or find_col("name")
    eng_col = find_col("reading", "ability") or find_col("english")
    math_col = find_col("math", "ability") or find_col("math")
    asl_col = find_col("asl", "ability") or find_col("asl")

    if not name_col:
        raise ValueError("CSV must contain a student name column")
    if not all([eng_col, math_col, asl_col]):
        raise ValueError(
            "CSV must contain reading/english, math, and ASL ability columns"
        )

    def parse_int(value: str | None, default: int = 0) -> int:
        if not value:
            return default
        try:
            return int(float(value.strip()))
        except (ValueError, TypeError):
            return default

    out: list[ParsedStudentRow] = []
    for row in reader:
        raw_name = (row.get(name_col) or "").strip()
        name = raw_name if raw_name and raw_name.lower() != "nan" else "Unknown"

        out.append(
            ParsedStudentRow(
                name=name,
                english=parse_int(row.get(eng_col)),
                math=parse_int(row.get(math_col)),
                asl=parse_int(row.get(asl_col)),
            )
        )

    return out
