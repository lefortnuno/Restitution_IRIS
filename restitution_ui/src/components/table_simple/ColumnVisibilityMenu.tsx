import { MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ColumnVisibilityMenuProps = {
  table: any;
};

export default function ColumnVisibilityMenu({ table }: ColumnVisibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleColumnsCount = table
    .getAllColumns()
    .filter((col: any) => col.getIsVisible() && col.id !== "select").length;

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition"
        onClick={() => setIsOpen(!isOpen)}
        title="Afficher/Masquer les colonnes"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="p-3 space-y-1 max-h-32 overflow-y-auto">
            {table
              .getAllColumns()
              .filter((column: any) => column.id !== "select")
              .map((column: any) => {
                const isLastVisible =
                  visibleColumnsCount === 1 && column.getIsVisible();

                return (
                  <label
                    key={column.id}
                    className="flex items-center space-x-3 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      disabled={isLastVisible}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className={`select-none text-gray-800 text-sm ${isLastVisible ? "opacity-50" : ""}`}>
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.columnDef.header()}
                    </span>
                  </label>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
