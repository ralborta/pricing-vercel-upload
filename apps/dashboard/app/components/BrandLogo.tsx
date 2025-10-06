"use client";
export function BrandLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes:any = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };
  return (
    <div className={`font-extrabold tracking-tight ${sizes[size]} flex items-center gap-1`}>
      <span>Empliad</span>
      <span className="relative inline-block">
        <span className="px-1 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] text-white">os</span>
      </span>
      <span>.net</span>
    </div>
  );
}


