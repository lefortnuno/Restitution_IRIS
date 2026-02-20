from typing import List, Optional, Union, Dict
from collections import defaultdict

def min_postgres_style(
    data: List[Dict],
    column: str,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[float, List[Dict]]:
    """
    Calcule le minimum façon PostgreSQL, avec support du GROUP BY.

    :param data: Liste de dicts (données API)
    :param column: Colonne cible pour le MIN
    :param group_by: Champ(s) pour grouper (str ou list)
    :return: float si pas de group_by, sinon List[Dict]
    """
    if group_by:
        grouped = defaultdict(list)
        for row in data:
            key = tuple(row.get(k) for k in group_by) if isinstance(group_by, list) else (row.get(group_by),)
            value = row.get(column)
            if value is not None:
                grouped[key].append(value)

        result = []
        for key_tuple, values in grouped.items():
            min_val = min(values) if values else None
            key_dict = (
                dict(zip(group_by, key_tuple)) if isinstance(group_by, list)
                else {group_by: key_tuple[0]}
            )
            result.append({**key_dict, column: min_val})
        return result

    # MIN global
    values = [row[column] for row in data if row.get(column) is not None]
    min_val = min(values) if values else None
    return [{column: min_val}]
