from dataclasses import dataclass
from datetime import time

@dataclass
class TimeBlock:
    start: time
    end: time

    def __eq__(self, other):
        if isinstance(other, TimeBlock):
            return self.start == other.start and self.end == other.end
        return False

    def __str__(self):
        return "Start: " + str(self.start) + " End: "+ str(self.end)
