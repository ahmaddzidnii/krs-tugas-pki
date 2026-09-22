interface AlertProps {
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
}

export const Alert = ({ children, variant = "default", size = "md" }: AlertProps) => {
  // Variant styles
  const variantStyles = {
    default: "bg-[#d1ecf1] text-[#0c5460] border-[#bee5eb]",
    success: "bg-green-50 text-green-800 border-green-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    error: "bg-[#f8d7da] text-[#721c24] border-[#f5c6cb] ",
    info: "bg-[#fff3cd] text-[#856404] border-[#ffeeba]",
  };

  // Size styles
  const sizeStyles = {
    sm: "p-3 text-sm",
    md: "p-5 text-base",
    lg: "p-6 text-lg",
  };

  const baseStyles = "rounded-[5px] text-start border py-[12px] px-[20px] ";

  return (
    <div
      role="alert"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </div>
  );
};
