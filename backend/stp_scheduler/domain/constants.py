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

CORE_CLASSES = ["english", "math", "asl"]
NON_CORE_CLASSES = ["college readiness", "social emotional learning", "financial literacy", "presentations", "digital literacy"]

SUBJECT_LIMIT_DICT = {
    "english": 8,
    "math": 8,
    "asl": 8,
    "college readiness": 12,
    "social emotional learning": 12,
    "financial literacy": 17,
    "presentations": 17,
    "digital literacy": 17,
}

SUBJECT_DAYS_DICT = {
    "english": "MWTRF",
    "math": "MWTRF",
    "asl": "MWTRF",
    "college readiness": "MWF",
    "social emotional learning": "MWF",
    "financial literacy": "TR",
    "presentations": "TR",
    "digital literacy": "TR"
}

def get_level(score: int):
    return 0 if score <= 3 else 2 if score > 6 else 1