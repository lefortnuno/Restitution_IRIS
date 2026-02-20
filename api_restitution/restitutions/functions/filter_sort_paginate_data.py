from django.core.paginator import Paginator
import operator
from functools import cmp_to_key
from datetime import datetime, date
import re

OPERATORS = {
    "==": operator.eq,
    "!=": operator.ne,
    ">": operator.gt,
    "<": operator.lt,
    ">=": operator.ge,
    "<=": operator.le, 
    "Égal à": operator.eq,
    "Différent de": operator.ne,
    "Supérieur à": operator.gt,
    "Inférieur à": operator.lt, 
}

def parse_date(value):
    """
    Essaie de convertir une chaîne en datetime.
    Gère:
      - '2025-07-23'
      - 'Le 22/07/2025 à 14:44'
    """
    
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day)
    if not isinstance(value, str):
        return None

    # Format HTML5 <input type="date">
    try:
        return datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        pass

    # Format 'Le 22/07/2025 à 14:44'
    match = re.search(r"(\d{2})/(\d{2})/(\d{4})(?:\s+à\s+(\d{2}):(\d{2}))?", value)
    if match:
        day, month, year, hour, minute = match.groups()
        hour = int(hour) if hour else 0
        minute = int(minute) if minute else 0
        return datetime(int(year), int(month), int(day), hour, minute)

    return None

def normalize_date(val):
    """Convertit en date (YYYY-MM-DD) pour ignorer l'heure lors des comparaisons."""
    dt = parse_date(val)
    return dt.date() if dt else None

def convert_value(value, type_attr, normalize=False):
    """Conversion selon typeAttribut."""
    if type_attr == "date":
        return normalize_date(value) if normalize else parse_date(value)
    if type_attr in ("Integer", "integer"):
        try:
            return int(value)
        except (ValueError, TypeError):
            return value
    if type_attr and type_attr.upper() == "VARCHAR":
        return str(value)
    # fallback
    return value

def filter_sort_paginate_data(data, page, page_size, ordering, search, searchable_fields, advanced_filters=None):
    """
    Filtre, trie et pagine une liste de dictionnaires (version avancée).

    Cette version permet en plus d’appliquer des filtres complexes
    basés sur des opérateurs (>, <, ==, etc.).

    Args:
        data (list[dict]): Liste des enregistrements à traiter.
        page (int): Numéro de page à retourner.
        page_size (int): Nombre d’éléments par page.
        ordering (str): Champ pour le tri, préfixé de '-' pour un tri décroissant.
        search (str): Terme de recherche rapide.
        searchable_fields (list[str]): Champs sur lesquels appliquer la recherche.
        advanced_filters (list[dict], optional): Liste de filtres avancés avec :
            - column (str) : Champ ciblé.
            - operator (str) : Opérateur (ex : '==', '>', '<', etc.).
            - value (Any) : Valeur à comparer.

    Returns:
        dict: Informations paginées avec clés :
            - count (int) : Nombre total d’éléments après filtrage.
            - total_pages (int) : Nombre total de pages.
            - page (int) : Page actuelle.
            - results (list[dict]) : Liste des éléments de la page courante.
    """
    
    # === Filtres avancés ===
    if advanced_filters:
        for filt in advanced_filters:
            field = filt.get("column")
            op = filt.get("operator")
            type_attr = filt.get("typeAttribut")
            val = filt.get("value")
            val2 = filt.get("value2") 
            
            # Ignore si champ ou opérateur manquant
            if not field or not op:
                continue

            # On normalise si c'est une date pour éviter les problèmes d'heure
            normalize = type_attr == "date" 
            v1 = convert_value(val, type_attr, normalize=normalize)
            v2 = convert_value(val2, type_attr, normalize=normalize) if val2 else None

            # Gestion Between
            if op == "Entre" and v1 is not None and v2 is not None: 
                data = [
                    row for row in data
                    if field in row and v1 <= convert_value(row[field], type_attr, normalize=normalize) <= v2
                ]
                continue

            # Gestion Contains / Starts with / Ends with pour VARCHAR
            if type_attr and type_attr.upper() == "VARCHAR":
                if op == "Contient":
                    data = [
                        row for row in data
                        if field in row and v1.lower() in str(row[field]).lower()
                    ]
                    continue
                elif op == "Commence par":
                    data = [
                        row for row in data
                        if field in row and str(row[field]).lower().startswith(v1.lower())
                    ]
                    continue
                elif op == "Finit par":
                    data = [
                        row for row in data
                        if field in row and str(row[field]).lower().endswith(v1.lower())
                    ]
                    continue

            compare = OPERATORS.get(op)
            if not compare:
                continue

            data = [
                row for row in data
                if field in row and compare(convert_value(row[field], type_attr, normalize=normalize), v1)
            ]

    # === Recherche rapide ===
    if search:
        data = [
            row for row in data
            if any(search.lower() in str(row.get(field, '')).lower() for field in searchable_fields)
        ]

    # === Tri ===
    if ordering:
        reverse = ordering.startswith('-')
        sort_key = ordering.lstrip('-')

        def sort_func(a, b):
            va, vb = a.get(sort_key), b.get(sort_key)

            # Cas None : on décide que None < tout
            if va is None and vb is None:
                return 0
            if va is None:
                return -1
            if vb is None:
                return 1

            return (va > vb) - (va < vb)

        data.sort(key=cmp_to_key(sort_func), reverse=reverse)


    # === Pagination ===
    paginator = Paginator(data, page_size)
    page_obj = paginator.get_page(page)

    return {
        "count": paginator.count,
        "total_pages": paginator.num_pages,
        "page": page_obj.number,
        "results": list(page_obj),
    }
