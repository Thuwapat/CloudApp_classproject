// components/ui/input.tsx
import React, { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: FC<InputProps> = (props) => {
  return (
    <input
      className="w-full rounded border border-gray-300 px-3 py-2 text-sm 
                 text-black placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-black placeholder:font-normal"
      {...props}
    />
  );
};

export default Input;