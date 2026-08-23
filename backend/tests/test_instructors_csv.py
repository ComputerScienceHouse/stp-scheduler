"""Tests for parsing instructor CSVs with all eight classes."""

from stp_scheduler.domain.constants import ALL_CLASSES
from stp_scheduler.loaders.instructors_csv import parse_instructors_csv


def test_parses_core_and_non_core_weights():
    csv = (
        "Teacher,Class,Weight\n"
        "Alice,English,1\n"
        "Alice,Math,0\n"
        "Alice,ASL,-1\n"
        "Alice,College Readiness,1\n"
        "Alice,Digital Lit,0\n"
        "Alice,Financial Lit,1\n"
        "Alice,Presentations,0\n"
        "Alice,Social Emotional Learning,1\n"
    ).encode()

    rows = parse_instructors_csv(csv)
    assert len(rows) == 1
    weights = rows[0].subject_weights

    # Every supported class should appear in the parsed weights.
    assert set(weights.keys()) == set(ALL_CLASSES)
    assert weights["english"] == 1
    assert weights["math"] == 0
    assert weights["asl"] == -1
    assert weights["college readiness"] == 1
    assert weights["digital lit"] == 0
    assert weights["financial lit"] == 1
    assert weights["presentations"] == 0
    assert weights["social emotional learning"] == 1


def test_unspecified_classes_default_to_unqualified():
    csv = "Teacher,Class,Weight\nBob,Math,1\n".encode()
    rows = parse_instructors_csv(csv)
    weights = rows[0].subject_weights
    assert weights["math"] == 1
    for c in ALL_CLASSES:
        if c != "math":
            assert weights[c] == -1
