/**
 * Card Component
 * Premium Dark Theme Card
 */
const Card = ({
  title,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden transition-all duration-300 hover:shadow-black/40 hover:border-slate-700 ${className}`}
      {...props}
    >
      {title && (
        <div className={`px-6 py-4 border-b border-slate-800 bg-slate-900/50 ${headerClassName}`}>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
export default Card;
