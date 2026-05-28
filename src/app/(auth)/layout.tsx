export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ── Animated background orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main indigo orb */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'orb-float 14s ease-in-out infinite',
          }}
        />
        {/* Purple orb */}
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'orb-float 18s ease-in-out infinite reverse',
          }}
        />
        {/* Sky accent */}
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'orb-float 22s ease-in-out infinite',
            animationDelay: '-7s',
          }}
        />
      </div>

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Top gradient line ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* ── Content ── */}
      <div className="relative w-full max-w-md px-4 animate-fade-up">
        {children}
      </div>
    </div>
  );
}
