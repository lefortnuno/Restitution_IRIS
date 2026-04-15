import {
  divForm,
  divPackForm,
  divResultForm,
  inputSearcForm,
  labelForm,
  placeholder2Form,
  spanResultForm,
  xForm,
} from "@/components/ui/styles";
import { X } from "lucide-react";
import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import {
  Props,
  Option,
  affichageOptions,
} from "@/context/affichages/affichageType";
import { ChampsAVC } from "@/context/champs/champType";

export default function AffichageSelector({ name, placeholder, error }: Props) {
  const { control, getValues, setValue } = useFormContext();
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    field: { value = [], onChange },
  } = useController({
    name,
    control,
    rules: { required: "L'affichage doit être choisi obligatoirement" },
  });

  const currentAffichage = value[0]?.nom_affichage ?? "";

  // Groupes compatibles : changer d'affichage à l'intérieur d'un groupe conserve les champs
  const COMPATIBLE_GROUPS: string[][] = [
    ["Tableau simple", "Tableau croisée dynamique"],
    ["Graphique linéaire", "Histogramme"],
  ];

  const isSameGroup = (a: string, b: string) =>
    COMPATIBLE_GROUPS.some((group) => group.includes(a) && group.includes(b));

  const toggleFormat = (format: Option) => {
    setSearch("");
    const newValue = [{ nom_affichage: format.label }];
    onChange(newValue);
    setValue("affichages", newValue);

    if (!isSameGroup(currentAffichage, format.label)) {
      const currentChamps = getValues("champs") || [];
      const filteredChamps = currentChamps.filter((champ: ChampsAVC) =>
        champ.transformation?.type === "op_" || champ.type === "op_"
      );
      setValue("champs", filteredChamps);
    }
    setIsFocused(false);
    setIsEditing(false);
  };

  const filteredOptions = affichageOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`${divPackForm} min-w-[250px]`}>
      <div
        className={`${divForm} ${
          error
            ? "border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:ring-blue-300"
        }`}
      >
        <label htmlFor="affichages" className={labelForm}>
          Affichage :
        </label>

        <div className="relative">
          <div className="flex flex-wrap gap-2 mt-0 items-center">
            {currentAffichage && (
              <div
                className={`flex items-center p-2 mt-0 text-sm border rounded shadow-sm min-w-0 transition-colors ${
                  isEditing
                    ? "bg-teal-50 border-teal-400"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <span
                  className={`${spanResultForm} cursor-pointer hover:text-teal-700`}
                  title={isEditing ? "Modification en cours…" : "Cliquer pour modifier"}
                  onClick={() => { setIsEditing(true); setIsFocused(true); }}
                >
                  {currentAffichage}
                </span>
                <X
                  type="button"
                  onClick={() => { setValue(name, []); setIsEditing(false); }}
                  className={xForm}
                  aria-label="Supprimer affichage"
                />
              </div>
            )}
            {(!currentAffichage ) && (
              <input
                id={name}
                name={`${name}_search`}
                type="text"
                placeholder={isEditing ? "Rechercher un affichage…" : placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => requestAnimationFrame(() => { setIsFocused(false); setIsEditing(false); setSearch(""); })}
                autoFocus={isEditing}
                className={`max-w-[100%] ${inputSearcForm} truncate`}
                autoComplete="off"
              />
            )}
          </div>

          {isFocused && (
            <div className="absolute top-full mt-1 w-full max-h-60 overflow-y-auto flex flex-col border border-gray-400 rounded-md bg-white shadow-lg z-50">
              {filteredOptions.map((format) => {
                const isChecked = value === format.label;

                return (
                  <label
                    key={format.value}
                    htmlFor={`${format.value}${format.label}`}
                    className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 hover:bg-gray-200"
                    onMouseDown={() => toggleFormat(format)}
                  >
                    <input
                      id={`${format.value}${format.label}`}
                      name={`${format.value}${format.label}__`}
                      type="checkbox"
                      checked={isChecked}
                      hidden
                      readOnly
                      className="shrink-0 h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-gray-800 truncate w-full">
                      {format.label}
                    </span>
                  </label>
                );
              })}
              {filteredOptions.length === 0 && (
                <div className={`${placeholder2Form}`}>
                  Nom d'affichage non trouvé
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
