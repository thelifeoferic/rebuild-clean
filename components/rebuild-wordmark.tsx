type RebuildWordmarkProps = {
  align?: "left" | "center";
  className?: string;
  showTagline?: boolean;
};

export function RebuildWordmark({ align = "center", className = "", showTagline = true }: RebuildWordmarkProps) {
  return (
    <div className={`${align === "center" ? "items-center text-center" : "items-start text-left"} flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="relative grid h-7 w-8 shrink-0 place-items-center" aria-hidden>
          <span className="absolute left-0 top-1 h-5 w-6 skew-x-[-24deg] border-y-[5px] border-l-[5px] border-porcelain" />
          <span className="absolute bottom-1 right-0 h-4 w-2.5 skew-x-[-24deg] bg-champagne" />
        </span>
        <span className="text-[1.55rem] font-black uppercase leading-none tracking-[0.12em] text-porcelain">
          Rebuild
        </span>
      </div>
      {showTagline ? (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-px w-8 bg-champagne/70" aria-hidden />
          <span className="text-[0.58rem] font-black uppercase tracking-[0.42em] text-champagne">
            Better every day
          </span>
          <span className="h-px w-8 bg-champagne/70" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
