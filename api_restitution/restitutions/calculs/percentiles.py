from typing import List, Dict, Union, Optional
from collections import defaultdict
import numpy as np
import pandas as pd


def cast_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: cast_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [cast_numpy_types(x) for x in obj]
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    else:
        return obj
    

def percentile_postgres_style(
    data: List[Dict],
    column: str,
    percentile: float,
    group_by: Optional[Union[str, List[str]]] = None
) -> Union[Optional[float], List[Dict]]:
    """
    Calcule le percentile (type PERCENTILE_CONT) avec ou sans GROUP BY.

    :param data: Liste de dictionnaires
    :param column: Nom de la colonne à analyser
    :param percentile: Float entre 0 et 1 (ex: 0.5 pour médiane)
    :param group_by: str ou list[str] pour le groupement
    :return: float (global) ou List[Dict] pour groupé
    """
    if not (0 <= percentile <= 1):
        raise ValueError("Le percentile doit être entre 0 et 1")

    def compute_percentile(values: List[float]) -> Optional[float]:
        return round(float(np.percentile(values, percentile * 100)), 2) if values else 0.0

    df = pd.DataFrame(data)
    if df.empty or column not in df:
        return 0.0

    df = df.dropna(subset=[column])

    if group_by:
        if isinstance(group_by, str):
            group_by = [group_by]

        for col in group_by:
            if col not in df.columns:
                return 0.0

        result = (
            df.groupby(group_by)[column]
            .apply(lambda x: round(compute_percentile(x.tolist()), 2))
            .reset_index()
        )
 
        return cast_numpy_types([
            {**{k: row[k] for k in group_by}, column: row[column]}
             for _, row in result.iterrows()
        ])


    # Percentile global
    values = df[column].tolist()
    return [{column: compute_percentile(values)}]
