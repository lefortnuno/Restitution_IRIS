import { flexRender, HeaderGroup } from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";

type TableHeaderProps = {
  headerGroups: HeaderGroup<any>[];
};

export default function TableHeader({ headerGroups }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b-2 border-gray-300">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id} className="text-left">
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="py-3.5 px-4 text-left text-xs font-semibold text-gray-900 sm:px-6"
              onClick={header.column.getToggleSortingHandler()}
            >
              {header.isPlaceholder ? null : (
                <div className="flex items-center space-x-2 cursor-pointer">
                  <span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </span>

                  {/* Icônes de tri */}
                  {header.column.getIsSorted() === "asc" ? (
                    <ArrowUp size={16} className="text-gray-600 cursor-pointer" />
                  ) : header.column.getIsSorted() === "desc" ? (
                    <ArrowDown size={16} className="text-gray-600 cursor-pointer" />
                  ) : null}
                </div>
              )}
            </th>
          ))}
          <th className="py-3.5 px-4 text-left text-xs font-semibold text-gray-900 sm:px-6">
            Action
          </th>
        </tr>
      ))}
    </thead>
  );
}
