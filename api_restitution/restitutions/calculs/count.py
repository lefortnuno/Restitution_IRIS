from typing import List, Dict, Union, Optional
from collections import defaultdict

def count_postgres_style(
    data: List[Dict],
    column: Optional[str] = None,
    group_by: Optional[Union[str, List[str]]] = None,
    count_distinct: bool = False
) -> Union[int, Dict, List[Dict]]:
    """
    Réplique le comportement de COUNT() façon PostgreSQL.

    :param data: Liste de dicts
    :param column: Colonne à compter (None = toutes les lignes non nulles)
    :param group_by: str ou list de str
    :param count_distinct: Si True, compte les distincts
    :return: dict ou List[dict]
    """
    if group_by:
        grouped = defaultdict(set if count_distinct else list)

        for row in data:
            key = (
                tuple((k, row.get(k)) for k in group_by)
                if isinstance(group_by, list)
                else ((group_by, row.get(group_by)),)
            )

            value = row.get(column) if column else row
            if value is not None:
                if count_distinct:
                    grouped[key].add(value)
                else:
                    grouped[key].append(value)

        result = []
        for key, values in grouped.items():
            entry = {k: v for k, v in key}
            entry["count"] = len(values)
            result.append(entry)
        return result

    # Compteur global
    values = [row.get(column) if column else row for row in data]
    values = [v for v in values if v is not None]
    count_value = len(set(values)) if count_distinct else len(values)
    return [{column: count_value}]
