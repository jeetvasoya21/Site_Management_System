/**
 * Card Component
 * Reusable card container with consistent styling
 * Applies: bg-slate-900, rounded-xl, p-6, border-slate-800
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
      className={`bg-slate-900 rounded-xl border border-slate-800 shadow-lg ${className}`}
      {...props}
    >
      {title && (
        <div className={`px-6 py-4 border-b border-slate-800 ${headerClassName}`}>
          <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
