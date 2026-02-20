from typing import List, Dict, Union, Optional
import pandas as pd

def sum_postgres_style(
    data: List[Dict],
    champ_somme: str,
    champ_groupe: Optional[Union[str, List[str]]] = None
) -> Union[float, int, List[tuple]]:
    """
    Calcule la somme façon PostgreSQL, avec groupement possible.

    :param data: Liste de dictionnaires
    :param column: Colonne cible pour le calcul
    :param group_by: str ou list[str] pour groupement
    :return: Somme globale (float) ou list[tuple] pour somme groupée
    """
    df = pd.DataFrame(data)

    if champ_groupe:
        result_df = df.groupby(champ_groupe)[champ_somme].sum(min_count=1).reset_index()
        return result_df.to_dict(orient="records")
    else:
        total = df[champ_somme].sum(min_count=1)
        total = total.item() if hasattr(total, "item") else total
        return [{champ_somme: total}]
          