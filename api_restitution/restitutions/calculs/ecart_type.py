from typing import List, Dict, Union, Optional
from collections import defaultdict
import statistics

def stddev_postgres_style(
    data: List[Dict],
    column: str,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[Optional[float], List[Dict]]:
    """
    Calcule l'écart-type façon PostgreSQL, avec ou sans GROUP BY.

    :param data: Liste de dicts
    :param column: Colonne cible
    :param group_by: str ou list[str]
    :return: float (global) ou List[Dict] (groupé)
    """
    def compute_std(values: List[float]) -> Optional[float]:
        return round(statistics.stdev(values), 2) if len(values) >= 2 else 0.0

    if group_by:
        grouped = defaultdict(list)

        for row in data:
            key = (
                tuple(row.get(k) for k in group_by)
                if isinstance(group_by, list)
                else (row.get(group_by),)
            )
            value = row.get(column)
            if value is not None:
                grouped[key].append(value)

        result = []
        for key_tuple, values in grouped.items():
            std_val = compute_std(values)
            group_keys = (
                dict(zip(group_by, key_tuple))
                if isinstance(group_by, list)
                else {group_by: key_tuple[0]}
            )
            group_keys[column] = std_val
            result.append(group_keys)

        return result

    # Global stddev
    values = [row.get(column) for row in data if row.get(column) is not None]
    return [{column: compute_std(values)}]