/**
 * Table Component
 * Professional Dark Theme
 */

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  className = '',
  ...props
}) => {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50 ${className}`}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse" {...props}>
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p>No data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="bg-transparent hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap"
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
    </div>
  );
};

export default Table;
