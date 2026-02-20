from typing import List, Dict, Union, Optional
import pandas as pd

def variance_postgres_style(
    data: List[Dict],
    column: str,
    sample: bool = True,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[Optional[float], List[Dict]]:
    """
    Calcule la variance façon PostgreSQL (VAR_SAMP ou VAR_POP) avec support GROUP BY.

    :param data: Liste de dicts
    :param column: Colonne numérique
    :param sample: True pour VAR_SAMP (n-1), False pour VAR_POP (n)
    :param group_by: str ou list[str] pour le groupement
    :return: float ou List[Dict]
    """
    df = pd.DataFrame(data)
    if df.empty or column not in df:
        return [{column: 0.0}]   # <- retour 0 si pas de données

    ddof = 1 if sample else 0

    if group_by:
        if isinstance(group_by, str):
            group_by = [group_by]

        for col in group_by:
            if col not in df.columns:
                return [{column: 0.0}]   # <- retour 0 si group_by invalide

        # Grouped calculation
        result = (
            df.groupby(group_by)[column]
            .apply(lambda x: round(x.var(ddof=ddof), 2) if len(x) >= 2 else 0.0)  # <- met 0 au lieu de None
            .reset_index()
        )

        return [
            {**{k: row[k] for k in group_by}, column: row[column]}
            for _, row in result.iterrows()
        ]

    # Global calculation
    values = df[column].dropna()
    if len(values) < 2:
        return [{column: 0.0}]   # <- retourne 0 si pas assez de valeurs
    return [{column: round(float(values.var(ddof=ddof)), 2)}]
