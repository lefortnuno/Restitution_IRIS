from typing import List, Dict, Optional, Union, Tuple
from collections import defaultdict

def growth_rate_postgres_style(
    data: List[Dict],
    column: str,
    date_key: str,
    group_by: Optional[Union[str, List[str]]] = None,
    global_rate: bool = True
) -> Union[
    Optional[float], 
    List[float], 
    List[Tuple[Union[str, Tuple], Optional[float]]], 
    List[Tuple[Union[str, Tuple], List[Optional[float]]]]
]:
    """
    Calcule le taux de croissance (global ou par période), à la manière PostgreSQL.
    
    :param data: Données sources (list de dicts)
    :param column: Clé contenant la valeur numérique
    :param date_key: Clé temporelle (doit être triable)
    :param group_by: Clé(s) de groupement (optionnel)
    :param global_rate: True pour un taux global, False pour les taux successifs
    :return: float / list[float] / list[tuple(clé, valeur ou liste)]
    """

    def calc_growth(values: List[Tuple]) -> Union[Optional[float], List[Optional[float]]]:
        sorted_vals = sorted([v for v in values if v[1] is not None], key=lambda x: x[0])
        nums = [v[1] for v in sorted_vals]
        if len(nums) < 2:
            return None if global_rate else []

        if global_rate:
            initial, final = nums[0], nums[-1]
            if initial == 0:
                return None
            return round(((final - initial) / abs(initial)) * 100, 2)

        rates = []
        for i in range(1, len(nums)):
            prev = nums[i - 1]
            curr = nums[i]
            if prev == 0:
                rates.append(None)
            else:
                rate = ((curr - prev) / abs(prev)) * 100
                rates.append(round(rate, 2))
        return rates

    if group_by:
        grouped = defaultdict(list)
        for row in data:
            key = tuple(row.get(k) for k in group_by) if isinstance(group_by, list) else (row.get(group_by),)
            grouped[key].append((row.get(date_key), row.get(column)))

        result = []
        for key_tuple, values in grouped.items():
            taux = calc_growth(values)
            key_dict = (
                dict(zip(group_by, key_tuple)) if isinstance(group_by, list)
                else {group_by: key_tuple[0]}
            )
            result.append({**key_dict, column: taux})

        return result

    values = [(row.get(date_key), row.get(column)) for row in data]
    taux = calc_growth(values)
    return [{column: taux}]
