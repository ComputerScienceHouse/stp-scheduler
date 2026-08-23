"""Pytest configuration: make the ``stp_scheduler`` package importable and give
tests a clean, isolated in-memory state for each run."""

import os
import sys

import pytest

# Ensure the backend package root is on the path when running pytest from either
# the repo root or the backend directory.
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from stp_scheduler.api import state  # noqa: E402


@pytest.fixture(autouse=True)
def clean_state():
    """Reset the module-level scheduler state before and after every test."""
    state.students.clear()
    state.instructors.clear()
    state.sections.clear()
    yield
    state.students.clear()
    state.instructors.clear()
    state.sections.clear()
