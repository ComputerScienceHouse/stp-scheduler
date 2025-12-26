from dataclasses import dataclass

@dataclass
class TimeBlock:
    """
    A class to represent a block of time with a start and end time.
    
    Times should be in military format without colons. 
    For example:
        1:30 PM would be represented as 1330.
        8:00 AM would be represented as 800.
    """
    start: int
    end: int
    
    def to_json(self, id: int) -> dict:
        """Returns a JSON representation of the TimeBlock

        id should be taken from the constant TIME_BLOCKS list index."""
        return {
            "id": id,
            "start": self.start,
            "end": self.end
        }

    def __eq__(self, other):
        if isinstance(other, TimeBlock):
            return self.start == other.start and self.end == other.end
        return False

    def __str__(self):
        return "Start: " + str(self.start) + " End: "+ str(self.end)
    
    def __hash__(self):
        return hash((self.start, self.end))
