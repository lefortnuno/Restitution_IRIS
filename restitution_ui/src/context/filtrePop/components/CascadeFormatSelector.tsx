import { useState, useMemo, useRef, useEffect } from "react";
import { StructTableType } from "@/components/queries/useStructTable";
import {
  divPackForm,
  divForm,
  inputSearcForm,
  labelForm,
} from "@/components/ui/styles";

type Props = {
  formats: Record<string, StructTableType[]>; // Exemple : { formatName: attributs[] }
  selectedFormat: string | null;
  onFormatChange: (format: string) => void;
  selectedAttribute: StructTableType | null;
  onAttributeChange: (attr: StructTableType) => void;
};

export const CascadeFormatSelector = ({
  formats,
  selectedFormat,
  onFormatChange,
  selectedAttribute,
  onAttributeChange,
}: Props) => {
  const [formatSearch, setFormatSearch] = useState("");
  const [attributeSearch, setAttributeSearch] = useState("");
  const [showFormatList, setShowFormatList] = useState(false);
  const [showAttributeList, setShowAttributeList] = useState(false);

  const formatRef = useRef<HTMLDivElement>(null);
  const attributeRef = useRef<HTMLDivElement>(null);

  const filteredFormats = useMemo(() => {
    return Object.keys(formats).filter((format) =>
      format.toLowerCase().includes(formatSearch.toLowerCase())
    );
  }, [formats, formatSearch]);

  const attributs = selectedFormat ? formats[selectedFormat] || [] : [];

  const filteredAttributes = useMemo(() => {
    return attributs.filter((attr) =>
      attr.name.toLowerCase().includes(attributeSearch.toLowerCase())
    );
  }, [attributs, attributeSearch]);

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) {
        setShowFormatList(false);
      }
      if (
        attributeRef.current &&
        !attributeRef.current.contains(e.target as Node)
      ) {
        setShowAttributeList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${divPackForm} w-full md:w-[calc(40%-20px)]`}>
      {/* FORMAT */}
      <div className={`${divForm}`} ref={formatRef}>
        <label className={labelForm}>Format</label>
        <input
          type="text"
          placeholder="Rechercher un format..."
          className={inputSearcForm}
          value={formatSearch}
          onFocus={() => setShowFormatList(true)}
          onChange={(e) => {
            setFormatSearch(e.target.value);
            setShowFormatList(true);
          }}
        />
        {showFormatList && (
          <div className="absolute left-3 top-full mt-[-10px] w-[90%] max-h-40 overflow-y-auto border border-gray-500 bg-white z-50 shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-sm">
            {filteredFormats.map((format) => (
              <button
                key={format}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-200 focus:outline-none"
                onClick={() => {
                  onFormatChange(format);
                  setFormatSearch(format);
                  setShowFormatList(false);
                  setAttributeSearch("");
                }}
              >
                <span title={format} className="truncate block text-gray-800">
                  {format}
                </span>
              </button>
            ))}
            {filteredFormats.length === 0 && (
              <div className="text-gray-400 italic text-sm px-3 py-2">
                Aucun format trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATTRIBUT */}
      {selectedFormat && (
        <div className={`${divForm} mt-4`} ref={attributeRef}>
          <label className={labelForm}>Attribut</label>
          <input
            type="text"
            placeholder="Rechercher un attribut..."
            className={inputSearcForm}
            value={attributeSearch}
            onFocus={() => setShowAttributeList(true)}
            onChange={(e) => {
              setAttributeSearch(e.target.value);
              setShowAttributeList(true);
            }}
          />
          {showAttributeList && (
            <div className="absolute left-3 top-full mt-[-10px] w-[90%] max-h-40 overflow-y-auto border border-gray-500 bg-white z-50 shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-sm">
              {filteredAttributes.map((attr) => (
                <button
                  key={attr.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-200 focus:outline-none"
                  onClick={() => {
                    onAttributeChange(attr);
                    setAttributeSearch(attr.name);
                    setShowAttributeList(false);
                  }}
                >
                  <div
                    title={attr.name}
                    className="flex justify-between items-center w-full"
                  >
                    <span className="truncate font-medium text-gray-700">
                      {attr.name}
                    </span>
                    <span className="ml-4 text-sm text-gray-400 whitespace-nowrap">
                      ({attr.type})
                    </span>
                  </div>
                </button>
              ))}
              {filteredAttributes.length === 0 && (
                <div className="text-gray-400 italic text-sm py-2 px-3">
                  Aucun attribut trouvé
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
