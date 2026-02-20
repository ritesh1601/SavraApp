import { useState, useEffect, useRef } from "react";

const BASE = import.meta.env.VITE_API_BASE;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function HomePage() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const loginDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target)) {
        setShowLoginDropdown(false);
      }
    };
    if (showLoginDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginDropdown]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --ink: #0f0e17;
          --cream: #faf9f6;
          --violet: #6d28d9;
          --violet-light: #8b5cf6;
          --violet-pale: #ede9fe;
          --accent: #f97316;
          --muted: #6b7280;
          --border: rgba(15,14,23,0.1);
        }

        body { background: var(--cream); }

        .page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          width: 100%;
          max-width: 100%;
        }

        /* Animated radial spotlight following mouse */
        .spotlight {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          transition: opacity 0.3s;
          background: radial-gradient(
            600px circle at var(--mx, 50%) var(--my, 50%),
            rgba(109,40,217,0.06),
            transparent 60%
          );
        }

        /* Subtle grain overlay */
        .grain::after {
          content: '';
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.35;
          z-index: 1;
        }

        /* Grid lines background */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(109,40,217,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(109,40,217,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        nav.scrolled {
          background: rgba(250,249,246,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 14px 48px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          background: var(--ink);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .logo-mark::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--violet), #4f46e5);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .logo:hover .logo-mark::before { opacity: 1; }

        .logo-mark span {
          font-family: 'Instrument Serif', serif;
          font-size: 18px;
          color: white;
          position: relative;
          z-index: 1;
        }

        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 20px;
          color: var(--ink);
          letter-spacing: 0.05em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(15,14,23,0.06);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 6px 8px;
        }

        .nav-link {
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 400;
          color: var(--ink);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link:hover { background: white; color: var(--ink); }
        .nav-link.active { background: var(--ink); color: white; }

        .nav-link svg {
          width: 12px;
          height: 12px;
          transition: transform 0.2s;
        }

        .nav-link:hover svg { transform: rotate(180deg); }

        .product-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          color: var(--ink);
          text-decoration: none;
          transition: background 0.15s;
        }

        .dropdown-item:hover { background: var(--violet-pale); }

        .dropdown-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        .login-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 8px;
          min-width: 220px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          animation: dropIn 0.15s ease;
          z-index: 1000;
        }

        .login-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          color: var(--ink);
          text-decoration: none;
          transition: background 0.15s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .login-dropdown-item:hover { 
          background: var(--violet-pale); 
        }

        .login-dropdown-item svg {
          flex-shrink: 0;
        }

        .btn {
          padding: 10px 22px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-ghost {
          background: none;
          border: 1px solid var(--border);
          color: var(--ink);
        }

        .btn-ghost:hover { background: rgba(15,14,23,0.05); }

        .btn-primary {
          background: var(--ink);
          border: 1px solid var(--ink);
          color: white;
        }

        .btn-primary:hover {
          background: var(--violet);
          border-color: var(--violet);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(109,40,217,0.3);
        }

        /* HERO */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 48px 80px;
          text-align: center;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--violet-pale);
          border: 1px solid rgba(109,40,217,0.2);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--violet);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: fadeUp 0.6s ease both;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          background: var(--violet);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(52px, 8vw, 96px);
          line-height: 1.0;
          color: var(--ink);
          letter-spacing: -0.02em;
          animation: fadeUp 0.6s 0.1s ease both;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title em {
          font-style: italic;
          background: linear-gradient(135deg, var(--violet-light), #4f46e5, var(--violet));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: var(--muted);
          max-width: 520px;
          line-height: 1.7;
          font-weight: 300;
          margin-top: 24px;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-subtitle strong {
          color: var(--ink);
          font-weight: 500;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
          animation: fadeUp 0.6s 0.3s ease both;
        }

        .btn-hero {
          padding: 14px 32px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.25s;
          text-decoration: none;
        }

        .btn-hero-primary {
          background: var(--ink);
          color: white;
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .btn-hero-primary:hover {
          background: var(--violet);
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(109,40,217,0.35);
        }

        .btn-hero-secondary {
          background: white;
          color: var(--ink);
          border: 1px solid var(--border);
        }

        .btn-hero-secondary:hover {
          border-color: var(--violet);
          color: var(--violet);
          transform: translateY(-2px);
        }

        /* Social proof */
        .social-proof {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 48px;
          animation: fadeUp 0.6s 0.4s ease both;
        }

        .avatars {
          display: flex;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--cream);
          margin-left: -8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .avatar:first-child { margin-left: 0; }

        .social-text {
          font-size: 13px;
          color: var(--muted);
        }

        .social-text strong { color: var(--ink); }

        /* Floating feature cards */
        .float-card {
          position: absolute;
          background: white;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          pointer-events: none;
          animation: float 6s ease-in-out infinite;
        }

        .float-card-1 {
          top: 20%;
          left: 8%;
          width: 180px;
          animation-delay: 0s;
        }

        .float-card-2 {
          bottom: 28%;
          left: 6%;
          width: 196px;
          animation-delay: -2s;
        }

        .float-card-3 {
          top: 22%;
          right: 8%;
          width: 196px;
          animation-delay: -1s;
        }

        .float-card-4 {
          bottom: 26%;
          right: 6%;
          width: 176px;
          animation-delay: -3s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .card-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .card-label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }

        .card-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
        }

        /* Stats bar */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: white;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px 40px;
          margin-top: 80px;
          max-width: 800px;
          width: 100%;
          animation: fadeUp 0.6s 0.5s ease both;
          margin-left: auto;
          margin-right: auto;
        }

        .stat-item {
          flex: 1;
          text-align: center;
          position: relative;
        }

        .stat-item + .stat-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 40px;
          width: 1px;
          background: var(--border);
        }

        .stat-number {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: var(--ink);
        }

        .stat-label {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Relative wrapper for dropdown */
        .nav-item-wrapper {
          position: relative;
        }
      `}</style>

      <div
        className="page grain"
        style={{ '--mx': mousePos.x + 'px', '--my': mousePos.y + 'px' }}
      >
        <div className="spotlight" style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(109,40,217,0.07), transparent 60%)`
        }} />

        {/* Nav */}
        <nav className={scrolled ? 'scrolled' : ''}>
          <a href="#" className="logo">
            <div className="logo-mark">
              <span>S</span>
            </div>
            <span className="logo-text">SAVRA</span>
          </a>

          <div className="nav-actions" ref={loginDropdownRef}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setShowLoginDropdown(!showLoginDropdown)}
            >
              Log In
            </button>
            {showLoginDropdown && (
              <div className="login-dropdown">
                <button
                  className="login-dropdown-item"
                  onClick={() => {
                    window.location.href = `${BASE}/auth/google`;
                  }}
                >
                  <GoogleIcon />
                  <span>Login with Google</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="grid-bg" />

          {/* Floating cards */}
          <div className="float-card float-card-1">
            <div className="card-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>📊</div>
            <div className="card-label" style={{ color: '#2563eb' }}>Student Analytics</div>
            <div className="card-desc">Track progress with smart dashboards</div>
          </div>

          <div className="float-card float-card-2">
            <div className="card-icon" style={{ background: '#fce7f3', color: '#db2777' }}>🎮</div>
            <div className="card-label" style={{ color: '#db2777' }}>Gamified Quizzes</div>
            <div className="card-desc">Engage every student</div>
          </div>

          <div className="float-card float-card-3">
            <div className="card-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>📋</div>
            <div className="card-label" style={{ color: '#7c3aed' }}>NEP Lesson Plans</div>
            <div className="card-desc">Aligned curriculum, instantly</div>
          </div>

          <div className="float-card float-card-4">
            <div className="card-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>📝</div>
            <div className="card-label" style={{ color: '#ea580c' }}>Question Papers</div>
            <div className="card-desc">Auto-generated in seconds</div>
          </div>

          {/* Hero content */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="hero-eyebrow">
              <div className="eyebrow-dot" />
              Built for Indian Classrooms
            </div>

            <h1 className="hero-title">
              Your AI<br />
              <em>Teaching</em><br />
              Companion
            </h1>

            {/* Stats */}
            <div className="stats-bar">
              {[
                { number: '50K+', label: 'Lessons Generated' },
                { number: '98%', label: 'CBSE Aligned' },
                { number: '2,000+', label: 'Active Teachers' },
                { number: '4.9★', label: 'Teacher Rating' },
              ].map(s => (
                <div key={s.label} className="stat-item">
                  <div className="stat-number">{s.number}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}