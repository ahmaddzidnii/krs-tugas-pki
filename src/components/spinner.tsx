import { Loader2Icon } from "lucide-react";

interface SpinnerProps {
  text?: string;
}

export const Spinner = ({ text }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2Icon className="h-5 w-5 animate-spin text-gray-600" />
      {text && <span className="text-gray-600 ms-3">{text}</span>}
    </div>
  );
};
