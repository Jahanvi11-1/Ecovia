from typing import Optional


class EcoStageMachine:
    """State machine governing ECO stage transitions."""

    VALID_TRANSITIONS = {
        "Open": ["Open", "Validated", "Rejected"],
        "Validated": ["Applied", "Rejected"],
        "Applied": [],   # terminal
        "Rejected": [],  # terminal
    }

    def can_transition(self, current_status: str, target_status: str) -> bool:
        """Return True if transitioning from current_status to target_status is allowed."""
        return target_status in self.VALID_TRANSITIONS.get(current_status, [])

    def is_terminal(self, status: str) -> bool:
        """Return True if the status is a terminal state (no further transitions)."""
        return self.VALID_TRANSITIONS.get(status, None) == []

    def next_stage(self, current_stage_id: int, stages: list) -> Optional[object]:
        """
        Return the next EcoStage by sequence_order after current_stage_id.
        Returns None if current stage is the last one.
        """
        sorted_stages = sorted(stages, key=lambda s: s.sequence_order)
        for i, stage in enumerate(sorted_stages):
            if stage.stage_id == current_stage_id:
                if i + 1 < len(sorted_stages):
                    return sorted_stages[i + 1]
                return None
        return None


stage_machine = EcoStageMachine()
