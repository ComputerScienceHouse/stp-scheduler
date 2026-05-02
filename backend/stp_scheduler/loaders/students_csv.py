"""Parse uploaded student CSV (same shape as data/students.csv)."""

import io
from dataclasses import dataclass

import pandas as pd


@dataclass
class ParsedStudentRow:
    name: str
    english: int
    math: int
    asl: int


def parse_students_csv(content: bytes) -> list[ParsedStudentRow]:
    """
    Expected headers include:
    Student Name, Reading Ability Level, Math Ability Level, ASL Ability Level
    """
    df = pd.read_csv(io.BytesIO(content))
    df.columns = [str(c).strip() for c in df.columns]

    name_col = next(
        (c for c in df.columns if "name" in c.lower() and "student" in c.lower()),
        None,
    )
    if name_col is None:
        name_col = next((c for c in df.columns if "name" in c.lower()), None)
    if name_col is None:
        raise ValueError("CSV must contain a student name column")

    def col(*needles: str) -> str | None:
        for c in df.columns:
            low = c.lower()
            if all(n in low for n in needles):
                return c
        return None

    eng = col("reading", "ability") or col("english")
    math_c = col("math", "ability") or col("math")
    asl_c = col("asl", "ability") or col("asl")
    if not all([eng, math_c, asl_c]):
        raise ValueError(
            "CSV must contain reading/english, math, and ASL ability columns"
        )

    out: list[ParsedStudentRow] = []
    for _, row in df.iterrows():
        name = str(row[name_col]).strip() if pd.notna(row[name_col]) else "Unknown"
        if not name or name.lower() == "nan":
            name = "Unknown"

        def to_int(v, default=0) -> int:
            if pd.isna(v) or v == "":
                return default
            return int(float(v))

        out.append(
            ParsedStudentRow(
                name=name,
                english=to_int(row[eng]),
                math=to_int(row[math_c]),
                asl=to_int(row[asl_c]),
            )
        )
    return out
