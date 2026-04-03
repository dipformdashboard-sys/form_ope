import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSearchableSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

const MultiSearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  id,
  className,
}: MultiSearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(opt)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="mt-1 flex flex-wrap gap-1 rounded-md border border-input bg-background px-3 py-2 min-h-[40px] cursor-text" onClick={() => setOpen(true)}>
        {value.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 text-xs">
            {v}
            <X className="h-3 w-3 cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); remove(v); }} />
          </Badge>
        ))}
        <input
          id={id}
          value={search}
          placeholder={value.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover shadow-md text-sm">
          {filtered.map((opt) => (
            <li
              key={opt}
              className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => {
                onChange([...value, opt]);
                setSearch("");
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSearchableSelect;
