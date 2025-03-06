// components/ui/button.tsx
import React, { FC, ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className=" bg-[#221d42] py-2 text-sm font-semibold text-white "
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;