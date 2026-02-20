from typing import List, Dict, Union, Optional
from collections import defaultdict, Counter

def mode_postgres_style(
    data: List[Dict],
    column: str,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[List, List[Dict]]:
    """
    Calcule le(s) mode(s) comme PostgreSQL, avec support GROUP BY.

    :param data: Liste de dicts
    :param column: Colonne cible
    :param group_by: str ou list[str] pour groupement
    :return: Liste des modes globaux ou List[Dict] groupé
    """
    def compute_mode(values: List) -> List:
        if not values:
            return []
        counter = Counter(values)
        max_freq = max(counter.values())
        return [val for val, freq in counter.items() if freq == max_freq]

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
            mode_vals = compute_mode(values)
            key_dict = (
                dict(zip(group_by, key_tuple)) if isinstance(group_by, list)
                else {group_by: key_tuple[0]}
            )
            result.append({**key_dict, column: mode_vals})
        return result

    # Mode global
    values = [row.get(column) for row in data if row.get(column) is not None]
    return [{column: compute_mode(values)}]
