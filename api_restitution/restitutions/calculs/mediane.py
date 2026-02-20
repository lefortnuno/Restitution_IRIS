from typing import List, Dict, Union, Optional
from collections import defaultdict

def median_postgres_style(
    data: List[Dict],
    column: str,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[float, List[Dict]]:
    """
    Calcule la médiane comme PostgreSQL avec support GROUP BY.

    :param data: Liste de dicts
    :param column: Nom de la colonne
    :param group_by: str ou list de str pour le groupement
    :return: float (global) ou List[Dict] (groupé + médiane)
    """
    def compute_median(values: List[float]) -> Optional[float]:
        n = len(values)
        if n == 0:
            return None
        values.sort()
        mid = n // 2
        return values[mid] if n % 2 else (values[mid - 1] + values[mid]) / 2

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
            med_val = compute_median(values)
            key_dict = (
                dict(zip(group_by, key_tuple)) if isinstance(group_by, list)
                else {group_by: key_tuple[0]}
            )
            result.append({**key_dict, column: med_val})
        return result

    # Médiane globale
    values = [row.get(column) for row in data if row.get(column) is not None]
    return [{column: compute_median(values)}]
