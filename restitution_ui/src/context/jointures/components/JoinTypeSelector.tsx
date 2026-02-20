const joinTypes = ["FULL JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN"];

// Utilitaire pour extraire les initiales : "FULL JOIN" → "fj"
const getInitials = (label: string) =>
  label
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");

type Props = {
  joinType: string; // ici ce sera les initiales, ex: "fj"
  onChange: (value: string) => void;
};

export const JoinTypeSelector = ({ joinType, onChange }: Props) => (
  <div className="relative">
    <select
      value={joinType}
      onChange={(e) => onChange(e.target.value)}
      className="w-[140px] text-sm rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer transition"
    >
      {joinTypes.map((label) => {
        const value = getInitials(label); // ex: "fj"
        return (
          <option key={value} value={value}>
            {label.charAt(0) + label.slice(1).toLowerCase()}
          </option>
        );
      })}
    </select>
  </div>
);
