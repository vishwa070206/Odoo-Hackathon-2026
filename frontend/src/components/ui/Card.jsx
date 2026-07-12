const Card = ({ children }) => {
  return (
    <div className="rounded-3xl bg-white shadow-xl p-8 border border-gray-200">
      {children}
    </div>
  );
};

export default Card;