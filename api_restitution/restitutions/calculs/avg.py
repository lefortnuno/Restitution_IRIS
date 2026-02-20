from typing import List, Optional, Union, Dict
from collections import defaultdict

def avg_postgres_style(
    data: List[Dict],
    column: str,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[Dict, List[Dict]]:
    """
    Calcule la moyenne façon PostgreSQL, avec groupement possible.

    :param data: Liste de dictionnaires
    :param column: Colonne cible pour le calcul
    :param group_by: str ou list[str] pour groupement
    :return: Moyenne globale (dict) ou list[dict] pour moyenne groupée
    """
    if group_by:
        grouped = defaultdict(list)
        for row in data:
            # Supporte group_by string ou liste
            if isinstance(group_by, list):
                key = tuple((k, row.get(k)) for k in group_by)
            else:
                key = ((group_by, row.get(group_by)),)

            value = row.get(column)
            if value is not None:
                grouped[key].append(value)

        results = []
        for key, values in grouped.items():
            result = {k: v for k, v in key}
            result[column] = round(sum(values) / len(values), 2) if values else 0.0
            results.append(result)
        return results

    # Moyenne simple sans groupement
    values = [row[column] for row in data if row.get(column) is not None]
    return [{column: round(sum(values) / len(values), 2)} if values else {column: 0.0}]
