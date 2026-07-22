import type { MacroResult } from "@/types";

export default function MacroTable({ result }: { result: MacroResult }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="text-left px-3 sm:px-4 py-3">Item</th>
            <th className="text-right px-3 sm:px-4 py-3">Calories</th>
            <th className="text-right px-3 sm:px-4 py-3">Protein</th>
            <th className="text-right px-3 sm:px-4 py-3">Carbs</th>
            <th className="text-right px-3 sm:px-4 py-3">Fat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {result.items.map((item, i) => (
            <tr key={i} className="bg-white">
              <td className="px-3 sm:px-4 py-3 text-gray-800">
                {item.name}
                <span className="text-gray-400 text-xs ml-1">
                  {item.amount} {item.unit}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-3 text-right text-gray-700">{item.calories}</td>
              <td className="px-3 sm:px-4 py-3 text-right text-gray-700">{item.protein_g}g</td>
              <td className="px-3 sm:px-4 py-3 text-right text-gray-700">{item.carbs_g}g</td>
              <td className="px-3 sm:px-4 py-3 text-right text-gray-700">{item.fat_g}g</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold text-gray-900">
            <td className="px-3 sm:px-4 py-3">Total</td>
            <td className="px-3 sm:px-4 py-3 text-right">{result.totals.calories}</td>
            <td className="px-3 sm:px-4 py-3 text-right">{result.totals.protein_g}g</td>
            <td className="px-3 sm:px-4 py-3 text-right">{result.totals.carbs_g}g</td>
            <td className="px-3 sm:px-4 py-3 text-right">{result.totals.fat_g}g</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
