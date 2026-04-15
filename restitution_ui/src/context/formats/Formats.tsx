import {
  fetchStructTable,
  startTaskGetStructTable,
  StructTableType,
} from "@/components/queries/useStructTable";
import {
  divForm,
  divResultForm,
  inputSearcForm,
  labelForm,
  placeholder2Form,
  spanResultForm,
  xForm,
} from "@/components/ui/styles";
import { useFormContext, useController } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  FormatOption,
  FormatSelectFieldProps,
  FormatZod,
} from "@/context/formats/formatType";

export default function FormatSelectField({
  name,
  options,
  label,
  isLoading,
  error,
}: FormatSelectFieldProps) {
  const { control, getValues, setValue } = useFormContext();
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Ref pour dédupliquer les appels structures() — évite les appels concurrents
  // sur le même id_structure (Add: toggleFormat + useEffect, Edit/Dup: reset async)
  const fetchingIds = useRef<Set<number>>(new Set());

  const {
    field: { value = [], onChange },
  } = useController({
    name,
    control,
  });

  const filteredOptions = useMemo(() => {
    return options.filter((format) =>
      format.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const structures = async (id_structure: number, name_structure: string) => {
    // Guard 1 : déjà en cours de chargement
    if (fetchingIds.current.has(id_structure)) return;

    // Guard 2 : déjà présent dans attributs_map
    const currentMap = getValues("attributs_map") || [];
    const alreadyExists = currentMap.some((entry: any) => entry[id_structure]);
    if (alreadyExists) return;

    fetchingIds.current.add(id_structure);
    try {
      const { struct_table_check_task_id } = await startTaskGetStructTable(id_structure);

      // Guard 3 : taskId invalide (évite le spam check-task-status/undefined/)
      if (!struct_table_check_task_id) {
        console.error("[Formats] struct_table_check_task_id undefined pour", id_structure);
        fetchingIds.current.delete(id_structure);
        return;
      }

      let status = "PENDING";
      while (status === "PENDING") {
        const response = await fetchStructTable(struct_table_check_task_id);
        status = response.status;
        if (status === "SUCCESS") {
          const newEntry: Record<number, Record<string, StructTableType[] | null>> = {
            [id_structure]: { [name_structure]: response.result },
          };
          // Relire currentMap au moment de l'écriture pour éviter les overwrites
          const freshMap = getValues("attributs_map") || [];
          const alreadyInMap = freshMap.some((entry: any) => entry[id_structure]);
          if (!alreadyInMap) {
            setValue("attributs_map", [...freshMap, newEntry]);
          }
        } else if (status !== "PENDING") {
          console.warn("[Formats] Tâche échouée pour", id_structure, status);
        } else {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la structure :", error);
    } finally {
      fetchingIds.current.delete(id_structure);
    }
  };

  const toggleFormat = (format: FormatOption) => {
    setSearch("");
    const formatZod = { id_structure: format.id, name_structure: format.name };
    const exists = value.some((f: FormatZod) => f.id_structure === format.id);
    const newValue = exists
      ? value.filter((f: FormatZod) => f.id_structure !== format.id)
      : [...value, formatZod];
    onChange(newValue);

    if (exists) {
      // Suppression : retirer de attributs_map et libérer le guard
      fetchingIds.current.delete(format.id);
      const currentMap: Array<Record<number, Record<string, StructTableType[] | null>>> =
        getValues("attributs_map") || [];
      setValue(
        "attributs_map",
        currentMap.filter((entry) => !Object.prototype.hasOwnProperty.call(entry, format.id))
      );
    }
    // L'ajout : géré par useEffect([value]) ci-dessous
  };

  // Charge les structures à chaque changement de value :
  // - en Add : quand l'utilisateur sélectionne un format
  // - en Edit/Duplicate : quand reset() peuple le formulaire après le fetch API
  useEffect(() => {
    (value as FormatZod[]).forEach((f) => {
      structures(f.id_structure, f.name_structure);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative mt-4 min-h-[48px] min-w-[282px]">
      <div
        className={`${divForm} ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        }`}
      >
        {label && (
          <label htmlFor={name} className={labelForm}>
            {label}
          </label>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement des formats...</p>
        ) : options.length > 0 ? (
          <div className="relative">
            <div className="flex flex-wrap gap-2 mt-0 ">
              {value.length > 0 && (
                <>
                  {value.map((format: FormatZod) => (
                    <div key={format.id_structure} className={divResultForm}>
                      <span
                        className={spanResultForm}
                        title={format.name_structure}
                      >
                        {format.name_structure}
                      </span>
                      <X
                        type="button"
                        onClick={() =>
                          toggleFormat({
                            id: format.id_structure,
                            name: format.name_structure,
                          })
                        }
                        className={xForm}
                        aria-label={`Supprimer ${format.name_structure}`}
                      />
                    </div>
                  ))}
                </>
              )}

              <input
                id={name}
                name={`${name}_search`}
                type="text"
                placeholder="Ex: Format..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => requestAnimationFrame(() => setIsFocused(false))}
                className={`${
                  value.length > 0 ? "max-w-[30%]" : "max-w-[100%]"
                } ${inputSearcForm} truncate`}
              />
            </div>

            {isFocused && (
              <div className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto flex flex-col border border-gray-400 rounded-md bg-white shadow-lg z-50">
                {filteredOptions.map((format) => {
                  const isChecked = value.some(
                    (f: FormatZod) => f.id_structure === format.id
                  );
                  return (
                    <label
                      key={format.id}
                      htmlFor={`${format.name}${format.id}`}
                      className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 hover:bg-gray-200"
                      onMouseDown={() => toggleFormat(format)}
                    >
                      <input
                        id={`${format.name}${format.id}`}
                        name={`${format.name}${format.id}__`}
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded accent-blue-600"
                      />
                      <span className="text-gray-800 truncate w-full">
                        {format.name}
                      </span>
                    </label>
                  );
                })}
                {filteredOptions.length === 0 && (
                  <div className={`${placeholder2Form}`}>
                    Aucun format trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`${placeholder2Form}`}>Aucun format disponible</div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
