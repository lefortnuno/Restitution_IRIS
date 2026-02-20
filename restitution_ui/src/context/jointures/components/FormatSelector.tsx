import { useEffect, useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { StructTableType } from "@/components/queries/useStructTable";

type Props = {
  format: string;
  attributes: StructTableType[];
  selected: StructTableType | null;
  onSelect: (attr: StructTableType) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDisabled: (attr: number) => boolean;
};

export const FormatSelector = ({
  format,
  attributes,
  selected,
  onSelect,
  searchTerm,
  onSearchChange,
  isExpanded,
  onToggleExpand,
  isDisabled,
}: Props) => {
  const filtered = useMemo(
    () =>
      attributes.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [attributes, searchTerm]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // 💡 useEffect pour détecter les clics à l’extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Ferme si on clique à l'extérieur
        if (isExpanded) {
          onToggleExpand();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, onToggleExpand]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-[250px] max-w-full rounded border border-gray-300 bg-white p-4 shadow-sm"
    >
      <Label
        className="text-sm font-semibold mb-2 block truncate"
        title={format}
      >
        {format}
      </Label>

      <Input
        type="text"
        placeholder="Rechercher un attribut..."
        value={
          isExpanded
            ? searchTerm
            : selected
            ? `${selected.name} ( ${selected.type} )`
            : ""
        }
        onClick={(e) => {
          if (!isExpanded) {
            e.stopPropagation();
            onToggleExpand();
          }
        }}
        onChange={(e) => {
          if (!isExpanded) onToggleExpand();
          onSearchChange(e.target.value);
        }}
        readOnly={!isExpanded}
        className="w-full text-sm px-3 py-2 mb-3 rounded-md border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
      />

      {isExpanded && (
        <div className="absolute z-20 top-full left-0 w-full bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-40 overflow-y-auto">
          <div className="flex flex-col gap-1.5 p-2">
            {filtered.map((attr: StructTableType) => {
              const checked = selected?.id === attr.id;
              const disabled = !checked && isDisabled(attr.id);

              return (
                <label
                  key={attr.id}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border transition-colors duration-200 ${
                    checked
                      ? "bg-teal-100 text-teal-900 border-teal-400"
                      : disabled
                      ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                      : "hover:bg-teal-50 hover:border-teal-300 cursor-pointer border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => {
                      if (!disabled) onSelect(attr);
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      title={attr.name}
                      className="font-medium text-gray-800"
                    >
                      <span className="truncate">{attr.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ( {attr.type} )
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
