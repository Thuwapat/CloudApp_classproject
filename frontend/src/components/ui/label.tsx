// components/ui/label.tsx
import React, { FC, LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

const Label: FC<LabelProps> = ({ children, ...props }) => {
  return (
    <label
      className="mb-1 block text-sm font-medium text-gray-700"
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;