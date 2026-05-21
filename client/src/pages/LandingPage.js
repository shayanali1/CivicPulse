import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const heroTextRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      if (heroTextRef.current) {
        heroTextRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-[#0b1326] text-gray-900 dark:text-[#dae2fd] transition-colors duration-300">

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
          .glass-card { background: rgba(30,41,59,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(51,65,85,0.5); }
          .glass-card-light { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(200,200,200,0.5); }
          .hero-gradient-dark { background: radial-gradient(circle at 50% 50%, rgba(173,198,255,0.05) 0%, rgba(11,19,38,1) 70%); }
          .hero-gradient-light { background: radial-gradient(circle at 50% 50%, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0.95) 70%); }
          .text-glow { text-shadow: 0 0 20px rgba(173,198,255,0.3); }
          .hover-glow:hover { box-shadow: 0 0 15px rgba(59,130,246,0.15); }
          body { font-family: 'Inter', sans-serif; }
        `}</style>

        {/* NAVBAR */}
        <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0b1326]/80 border-b border-gray-200 dark:border-[#424754] backdrop-blur-md">
          <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">location_city</span>
              </div>
              <span className="font-bold text-xl text-blue-500" style={{ fontFamily: 'Hanken Grotesk' }}>CivicPulse</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {['Dashboard', 'Impact', 'Legislation', 'Community'].map((item, i) => (
                <a key={item} href="#" className={`text-sm font-medium transition-colors duration-200 ${i === 0 ? 'text-blue-500 border-b-2 border-blue-500 pb-1' : 'text-gray-500 dark:text-[#c2c6d6] hover:text-blue-500'}`}>
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-gray-200 dark:border-[#424754] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-[#c2c6d6] text-[20px]">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
              <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-[#c2c6d6] hover:text-blue-500 transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all">
                Register
              </Link>
            </div>
          </nav>
        </header>

        {/* HERO SECTION */}
        <main className="pt-20 overflow-hidden">
          <section className="relative min-h-screen flex items-center justify-center py-20">
            <div className="absolute inset-0 z-0 opacity-20 grayscale brightness-50"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className={`absolute inset-0 z-10 ${isDark ? 'hero-gradient-dark' : 'hero-gradient-light'}`} />

            <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
              <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-[#222a3d] border border-gray-200 dark:border-[#424754] px-4 py-2 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs text-gray-500 dark:text-[#c2c6d6] tracking-widest uppercase" style={{ fontFamily: 'JetBrains Mono' }}>
                  Institutional Governance Portal v4.0
                </span>
              </div>

              <h1 ref={heroTextRef} className="text-glow transition-transform duration-100"
                style={{ fontFamily: 'Hanken Grotesk', fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px' }}>
                Report. Track. <span className="text-blue-500">Resolve.</span>
              </h1>

              <p className="text-lg text-gray-500 dark:text-[#c2c6d6] max-w-2xl mx-auto mb-12">
                The modern operating system for civic engagement. Transforming municipal oversight through real-time data transparency and accountability.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/map" className="w-full sm:w-auto bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-lg shadow-blue-500/20">
                  Launch Dashboard
                </Link>
                <Link to="/map" className="w-full sm:w-auto border border-gray-300 dark:border-[#424754] bg-white/50 dark:bg-[#0b1326]/50 backdrop-blur-md text-blue-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-all">
                  View Public Map
                </Link>
              </div>

              <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '98.2%', label: 'Resolution Rate' },
                  { value: '4.2h', label: 'Response Time' },
                  { value: '12.4k', label: 'Active Reports' },
                  { value: '$2.1M', label: 'Savings Found' },
                ].map((stat) => (
                  <div key={stat.label} className={`animate-on-scroll p-6 rounded-xl text-left hover-glow transition-all ${isDark ? 'glass-card' : 'glass-card-light shadow-sm'}`}>
                    <div className="text-blue-500 text-3xl font-bold mb-1" style={{ fontFamily: 'Hanken Grotesk' }}>{stat.value}</div>
                    <div className="text-xs text-gray-500 dark:text-[#c2c6d6] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section className="py-24 bg-gray-50 dark:bg-[#060e20]">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-[#dae2fd] mb-3" style={{ fontFamily: 'Hanken Grotesk' }}>
                    Governance built for the digital age.
                  </h2>
                  <p className="text-gray-500 dark:text-[#c2c6d6] text-lg">Every issue reported is a step toward a more efficient city infrastructure.</p>
                </div>
                <a href="#" className="text-blue-500 font-bold flex items-center gap-1 hover:underline">
                  Explore all tools <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 group relative overflow-hidden rounded-xl border border-gray-200 dark:border-[#424754] bg-gray-100 dark:bg-[#171f33] h-[400px]">
                  <img alt="Analytics" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-10">
                    <span className="material-symbols-outlined text-blue-500 text-[40px] mb-4 block">analytics</span>
                    <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Hanken Grotesk' }}>Real-time Analytics Engine</h3>
                    <p className="text-gray-300 max-w-md">Our proprietary engine tracks infrastructure decay and public safety markers before they become critical failures.</p>
                  </div>
                </div>

                <div className={`md:col-span-4 p-8 rounded-xl flex flex-col justify-between hover-glow group ${isDark ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-[#3e495d] flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-blue-500 group-hover:text-white">groups</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#dae2fd] mb-2" style={{ fontFamily: 'Hanken Grotesk' }}>Community Synergy</h3>
                    <p className="text-gray-500 dark:text-[#c2c6d6]">Connect directly with local representatives and community leaders in verified discussion forums.</p>
                  </div>
                </div>

                <div className="animate-on-scroll md:col-span-4 border border-gray-200 dark:border-[#424754] bg-white dark:bg-[#171f33] p-8 rounded-xl flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#222a3d] transition-colors group">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-[#3e495d] flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-blue-500 group-hover:text-white">verified</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#dae2fd] mb-2" style={{ fontFamily: 'Hanken Grotesk' }}>Verified Identity</h3>
                    <p className="text-gray-500 dark:text-[#c2c6d6]">Secure, government-backed authentication ensures every report is from a verified resident.</p>
                  </div>
                </div>

                <div className="animate-on-scroll md:col-span-8 relative overflow-hidden rounded-xl border border-gray-200 dark:border-[#424754] bg-white dark:bg-[#171f33]">
                  <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    <div className="p-10 flex flex-col justify-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-[#dae2fd] mb-3" style={{ fontFamily: 'Hanken Grotesk' }}>Automated Workflow Resolution</h3>
                      <p className="text-gray-500 dark:text-[#c2c6d6]">Reports are automatically triaged and assigned to the relevant department based on AI-categorization.</p>
                      <button className="mt-6 text-blue-500 font-bold flex items-center gap-1">
                        Learn about AI Triage <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-[#1e293b]/30 flex items-center justify-center p-6">
                      <div className="w-full space-y-3">
                        {[
                          { color: 'bg-blue-500', width: 'w-32', bg: 'bg-blue-100 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-500/30', opacity: '' },
                          { color: 'bg-gray-400', width: 'w-24', bg: 'bg-gray-100 dark:bg-gray-800/20', border: 'border-gray-300 dark:border-gray-600', opacity: '' },
                          { color: 'bg-gray-300', width: 'w-40', bg: 'bg-gray-50 dark:bg-gray-900/10', border: 'border-gray-200 dark:border-gray-700', opacity: 'opacity-50' },
                        ].map((item, i) => (
                          <div key={i} className={`h-10 ${item.bg} rounded-lg border ${item.border} flex items-center px-4 gap-3 ${item.opacity}`}>
                            <div className={`h-2 w-2 rounded-full ${item.color}`}></div>
                            <div className={`h-2 ${item.width} ${item.color} opacity-40 rounded`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-24 bg-white dark:bg-[#0b1326]">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Hanken Grotesk' }}>How It Works</h2>
              <p className="text-gray-500 dark:text-[#c2c6d6] mb-16">Three simple steps to make your city better</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { icon: 'add_location', step: '01', title: 'Report', desc: 'Pin an issue on the map, add a photo and description. Takes less than 60 seconds.' },
                  { icon: 'track_changes', step: '02', title: 'Track', desc: 'Get real-time updates as your report moves through the system to the right authority.' },
                  { icon: 'check_circle', step: '03', title: 'Resolve', desc: 'Issues that go unresolved automatically escalate to higher authorities for accountability.' },
                ].map((item) => (
                  <div key={item.step} className="animate-on-scroll flex flex-col items-center">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-blue-500 text-[32px]">{item.icon}</span>
                    </div>
                    <div className="text-xs text-blue-500 mb-2 tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>{item.step}</div>
                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Hanken Grotesk' }}>{item.title}</h3>
                    <p className="text-gray-500 dark:text-[#c2c6d6]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="py-24 bg-gray-50 dark:bg-[#060e20]">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/30 p-16 rounded-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Hanken Grotesk' }}>Ready to pulse with your city?</h2>
                <p className="text-gray-500 dark:text-[#c2c6d6] text-lg mb-10">Join 200,000+ citizens shaping the future of civic infrastructure.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    className="flex-grow bg-white dark:bg-[#0b1326] border border-gray-300 dark:border-[#424754] rounded-xl px-6 py-4 focus:border-blue-500 outline-none text-gray-900 dark:text-[#dae2fd]"
                    placeholder="Enter your email" type="email"
                  />
                  <Link to="/register" className="bg-blue-500 text-white px-6 py-4 rounded-xl font-bold hover:scale-105 transition-all whitespace-nowrap">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-50 dark:bg-[#060e20] border-t border-gray-200 dark:border-[#424754]">
          <div className="flex flex-col md:flex-row justify-between items-center px-6 py-12 max-w-7xl mx-auto gap-8">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center opacity-70">
                <span className="material-symbols-outlined text-white text-[14px]">location_city</span>
              </div>
              <span className="text-sm text-gray-400">© 2026 CivicPulse Authority. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {['Transparency Report', 'Accessibility', 'Terms of Service', 'Contact Support'].map((link) => (
                <a key={link} href="#" className="text-sm text-gray-500 dark:text-[#c2c6d6] hover:text-blue-500 underline transition-all">{link}</a>
              ))}
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-500 transition-colors">language</span>
              <span className="material-symbols-outlined cursor-pointer hover:text-blue-500 transition-colors">share</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}