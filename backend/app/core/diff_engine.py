from dataclasses import dataclass
from typing import Any, List


@dataclass
class DiffField:
    field: str
    old_value: Any
    new_value: Any
    change_type: str  # "added" | "removed" | "increased" | "decreased" | "unchanged"


def compute_diff(current: dict, proposed: dict) -> List[DiffField]:
    """
    Compare current active data with proposed changes.
    Returns a list of DiffField objects with change_type classification.
    Every key from both dicts appears exactly once in the result.
    """
    result = []
    all_keys = set(current.keys()) | set(proposed.keys())

    for key in sorted(all_keys):
        old_val = current.get(key)
        new_val = proposed.get(key)

        if old_val is None and new_val is not None:
            change_type = "added"
        elif old_val is not None and new_val is None:
            change_type = "removed"
        elif isinstance(old_val, (int, float)) and isinstance(new_val, (int, float)):
            if new_val > old_val:
                change_type = "increased"
            elif new_val < old_val:
                change_type = "decreased"
            else:
                change_type = "unchanged"
        elif old_val != new_val:
            # Non-numeric value changed — treat as added (new value replaces old)
            change_type = "added"
        else:
            change_type = "unchanged"

        result.append(DiffField(field=key, old_value=old_val, new_value=new_val, change_type=change_type))

    return result
