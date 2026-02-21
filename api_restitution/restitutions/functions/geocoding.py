import os
import geopandas as gpd
from shapely.geometry import Point
from shapely.errors import ShapelyError


# === Chargement sécurisé des fichiers ===
BASE_DIR = os.path.dirname(__file__)

DATA_FILES = {
    "world": ("natural_earth", "ne_50m_admin_0_countries.json"),
    "world_coord": ("natural_earth", "ne_10m_admin_0_map_subunits.json"),
    "states": ("natural_earth", "ne_10m_admin_1_states_provinces.json"),
    "states_coord": ("natural_earth", "ne_10m_populated_places_simple.json"),
}

def _safe_load_geojson(path_parts: tuple) -> gpd.GeoDataFrame:
    """Charge un fichier GeoJSON et renvoie un GeoDataFrame sécurisé."""
    try:
        file_path = os.path.join(BASE_DIR, *path_parts)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Fichier introuvable : {file_path}")
        gdf = gpd.read_file(file_path)
        if gdf.empty:
            raise ValueError(f"Fichier vide ou illisible : {file_path}")
        return gdf
    except Exception as e:
        raise RuntimeError(f"Erreur lors du chargement de {path_parts[-1]} : {e}")

# Chargement des données
gdf_world = _safe_load_geojson(DATA_FILES["world"])
gdf_world_coordinate = _safe_load_geojson(DATA_FILES["world_coord"])
gdf_states = _safe_load_geojson(DATA_FILES["states"])
gdf_states_coordinate = _safe_load_geojson(DATA_FILES["states_coord"])


# === Fonctions utilitaires ===
def _create_point(lat: float, lon: float) -> Point | None:
    """Crée un objet Point valide à partir d'une latitude et longitude."""
    try:
        return Point(float(lon), float(lat))
    except (ValueError, TypeError, ShapelyError):
        return None


# === Fonctions principales ===
def get_country(lat: float, lon: float) -> str | None:
    """
    Retourne le nom du pays correspondant à une paire (lat, lon).
    Recherche dans `ne_50m_admin_0_countries.json`.
    """
    point = _create_point(lat, lon)
    if not point:
        return None

    try:
        possible_matches = gdf_world.sindex.query(point, predicate="intersects")
        for idx in possible_matches:
            if gdf_world.loc[idx, "geometry"].contains(point):
                row = gdf_world.loc[idx]
                return row.get("NAME") or row.get("ADMIN")
    except Exception:
        return None
    return None


def get_country_coordinates(name: str) -> dict[str, float] | None:
    """
    Retourne les coordonnées (lat, lon) du centroïde d’un pays.
    Recherche dans `ne_10m_admin_0_map_subunits.json`.
    """
    if not isinstance(name, str) or not name.strip():
        return None

    try:
        row = gdf_world_coordinate[gdf_world_coordinate["NAME"].str.lower() == name.lower()]
        if row.empty:
            row = gdf_world_coordinate[gdf_world_coordinate["ADMIN"].str.lower() == name.lower()]
        if not row.empty:
            centroid = row.geometry.iloc[0].centroid
            r = {"lat": centroid.y, "lon": centroid.x} 
            return {"lat": centroid.y, "lon": centroid.x}
    except Exception:
        return None
    return None


def get_state(lat: float, lon: float, field: str = "name") -> str | None:
    """
    Retourne la valeur d’un champ (par défaut 'name') de l'État/Province
    contenant le point donné.
    Recherche dans `ne_10m_admin_1_states_provinces.json`.
    """
    if not isinstance(field, str) or field not in gdf_states.columns:
        return None

    point = _create_point(lat, lon)
    if not point:
        return None

    try:
        possible_matches = gdf_states.sindex.query(point, predicate="intersects")
        for idx in possible_matches:
            if gdf_states.loc[idx, "geometry"].contains(point):
                return gdf_states.loc[idx, field]
    except Exception:
        return None
    return None


def get_state_coordinates(name: str, field: str = "name") -> dict[str, float] | None:
    """
    Retourne les coordonnées (lat, lon) du centroïde d’un État ou région.
    Recherche dans `ne_10m_populated_places_simple.json`.
    """
    if not isinstance(name, str) or not name.strip():
        return None
    if field not in gdf_states.columns:
        return None

    try:
        row = gdf_states[gdf_states[field].str.lower() == name.lower()]
        if not row.empty:
            centroid = row.geometry.iloc[0].centroid
            return {"lat": centroid.y, "lon": centroid.x}
    except Exception:
        return None
    return None

# print("v=",get_country_coordinates("United States of America"))