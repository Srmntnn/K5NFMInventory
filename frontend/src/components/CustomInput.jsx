const CustomInput = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-primary" />
      </div>
      <input
        {...props}
        className="md:max-w-md w-full pl-10 pr-3 py-2 bg-card bg-opacity-50 rounded-lg border h-12 focus:border-primary focus:ring-2 focus:ring-primary placeholder-muted-foreground transition duration-200"
      />
    </div>
  );
};
export default CustomInput;
