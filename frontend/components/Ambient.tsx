"use client";

export default function Ambient() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#E5F5E6]/70 blur-[120px]" />
      <div className="absolute top-[-5%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#FEF9C3]/50 blur-[130px]" />
      <div className="absolute bottom-[-15%] left-[25%] w-[650px] h-[500px] rounded-full bg-[#DCFCE7]/45 blur-[150px]" />
    </div>
  );
}
