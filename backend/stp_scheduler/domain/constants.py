from stp_scheduler.domain.time_block import TimeBlock

BEGINNER = 0
INTERMEDIATE = 1
ADVANCED = 2
CLASS_LIMIT = 7
BLOCK_ONE = TimeBlock(800, 900)
BLOCK_TWO = TimeBlock(915, 1015)
BLOCK_THREE = TimeBlock(1045, 1145)
LUNCH_TIME = TimeBlock(1145, 1245)
BLOCK_FOUR = TimeBlock(1245, 1345)
BLOCK_FIVE = TimeBlock(1400, 1500)
BLOCK_SIX = TimeBlock(1530, 1630)
LEVEL_DICT = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
}

TIME_BLOCKS = [BLOCK_ONE, BLOCK_TWO, BLOCK_THREE, BLOCK_FOUR, BLOCK_FIVE, BLOCK_SIX]

# Placement-tested classes. These are leveled (beginner/intermediate/advanced)
# based on a student's placement score and run five days per week.
CORE_CLASSES = ["english", "math", "asl"]

# Additional classes that every student takes. These are not placement tested,
# so they are not leveled, and they only run on either "MWF" or "TR".
NON_CORE_CLASSES = [
    "college readiness",
    "digital lit",
    "financial lit",
    "presentations",
    "social emotional learning",
]

# Every class the scheduler must produce a schedule for.
ALL_CLASSES = CORE_CLASSES + NON_CORE_CLASSES

# Day patterns.
CORE_DAYS = "MTWRF"
NON_CORE_DAY_OPTIONS = ["MWF", "TR"]


def is_core(subject: str) -> bool:
    return subject.lower() in CORE_CLASSES


def days_overlap(days_a: str | None, days_b: str | None) -> bool:
    """Return True if two day strings share at least one day."""
    if not days_a or not days_b:
        # Unknown day patterns are treated as potentially overlapping so that
        # conflict detection stays conservative.
        return True
    return bool(set(days_a) & set(days_b))


def get_level(score: int):
    return 0 if score <= 3 else 2 if score > 6 else 1
