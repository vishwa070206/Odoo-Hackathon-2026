const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 text-slate-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;