import { useId } from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  inputClassName?: string;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  inputClassName = "",
}: TextInputProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-body text-xs text-muted uppercase tracking-[2px]"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`bg-surface border border-border font-body text-xs text-foreground px-3 py-2.5 outline-none focus:border-accent placeholder:text-muted ${inputClassName}`}
      />
    </div>
  );
}
