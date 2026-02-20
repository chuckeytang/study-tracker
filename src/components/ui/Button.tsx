interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export default function Button({ children, className = "", ...props }: ButtonProps) {
    return (
      <button 
        className={`flex justify-center items-center gap-[10px] rounded-[8px] bg-[#4880FF] hover:bg-[#3668db] transition-colors shadow-md text-white font-bold ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }