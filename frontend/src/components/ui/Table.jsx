/**
 * Table Component
 * Reusable data table with custom column rendering
 * Features: hover states, responsive horizontal scroll
 */

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  className = '',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto scrollbar-thin ${className}`}>
      <table className="w-full" {...props}>
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-semibold text-slate-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-slate-400"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-6 py-4 text-sm text-slate-300"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
