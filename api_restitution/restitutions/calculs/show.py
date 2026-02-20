from typing import List, Dict, Union, Optional
import pandas as pd

def show_postgres_style(
    data: List[Dict],
    champ: str,
    champ_groupe: Optional[Union[str, List[str]]] = None
) -> Union[float, int, List[tuple]]:
    """
    Calcule la somme façon PostgreSQL, avec groupement possible.

    :param data: Liste de dictionnaires
    :param column: Colonne cible a afficher
    :param group_by: str ou list[str] : autre colonne a afficher
    :return: Liste colonne et leur donnee
    """
    df = pd.DataFrame(data)
    champs_valides = [champ]
    
    if champ_groupe:
        if isinstance(champ_groupe, str):
            champs_valides.append(champ_groupe)
        elif isinstance(champ_groupe, list):
            champs_valides.extend(champ_groupe)
    
    champs = [c for c in champs_valides if c in df.columns]
    
    return df[champs].to_dict(orient="records")
         