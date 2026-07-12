const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-3xl bg-white border border-slate-200 shadow-sm p-6 text-slate-900 ${className}`}>
      {children}
    </div>
  );
};

export default Card;