import { Link } from 'react-router-dom';
import ThreeScene from '../components/landing/ThreeScene';
import { ArrowRight, ShieldCheck, Palette, FileText, Sparkles, FolderHeart, Shield, Compass, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ColorThemeKey = 'clay' | 'sand' | 'blue' | 'sage' | 'lavender';

export default function LandingPage() {
  const [activePolicyTab, setActivePolicyTab] = useState<'privacy' | 'terms' | 'sovereignty'>('privacy');
  const [previewColor, setPreviewColor] = useState<ColorThemeKey>('clay');

  const notebookText = `Creative Sanctuary Charter:

1. No tracking. Your thoughts are fully yours.
2. Daylight clarity. No noisy popups or feeds.
3. Safe containment. Workspaces run securely.`;

  const [typedNotebook, setTypedNotebook] = useState('');
  const [isWriting, setIsWriting] = useState(true);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;
    let timer: any;

    function tick() {
      if (!isDeleting) {
        setTypedNotebook(notebookText.slice(0, index + 1));
        index++;
        setIsWriting(true);

        if (index >= notebookText.length) {
          setIsWriting(false);
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 8000);
          return;
        }
        timer = setTimeout(tick, 45);
      } else {
        setTypedNotebook(notebookText.slice(0, index - 1));
        index--;
        setIsWriting(true);

        if (index <= 0) {
          isDeleting = false;
          setIsWriting(false);
          timer = setTimeout(tick, 1000);
          return;
        }
        timer = setTimeout(tick, 20);
      }
    }

    tick();
    return () => clearTimeout(timer);
  }, []);

  const colorThemes = {
    clay: { 
      bg: 'bg-[#E76F51]', 
      text: 'text-white', 
      border: 'border-[#E76F51]/20',
      shadow: 'shadow-[#E76F51]/10',
      name: 'Terracotta Clay', 
      description: 'Grounded thoughts, raw brainstorms, and foundational concepts.', 
      tag: 'Urgent Idea' 
    },
    sand: { 
      bg: 'bg-[#E9C46A]', 
      text: 'text-gray-950', 
      border: 'border-[#E9C46A]/20',
      shadow: 'shadow-[#E9C46A]/10',
      name: 'Golden Sand', 
      description: 'Sunny aspirations, daily highlights, and sparks of optimism.', 
      tag: 'Daily Spark' 
    },
    blue: { 
      bg: 'bg-[#264653]', 
      text: 'text-white', 
      border: 'border-[#264653]/20',
      shadow: 'shadow-[#264653]/10',
      name: 'Deep Sea Blue', 
      description: 'Structured strategies, product specs, and technical designs.', 
      tag: 'Structure' 
    },
    sage: { 
      bg: 'bg-[#2A9D8F]', 
      text: 'text-white', 
      border: 'border-[#2A9D8F]/20',
      shadow: 'shadow-[#2A9D8F]/10',
      name: 'Sage Garden', 
      description: 'Nature logs, wellness reflections, and balanced checklists.', 
      tag: 'Mindfulness' 
    },
    lavender: { 
      bg: 'bg-[#A89FDF]', 
      text: 'text-gray-950', 
      border: 'border-[#A89FDF]/20',
      shadow: 'shadow-[#A89FDF]/10',
      name: 'Pastel Lavender', 
      description: 'Creative dreams, artistic reviews, and personal journals.', 
      tag: 'Creative' 
    },
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-gray-950 overflow-x-hidden selection:bg-[#264653]/10 selection:text-[#264653]">
      {/* Immersive 3D scene in fixed background */}
      <ThreeScene />

      {/* Front-end layer overlays */}
      <div className="relative z-10">
        
        {/* Section 1: Hero */}
        <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto pt-24 relative">
          <div className="max-w-2xl mt-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Fully Immersive 3D Light-Theme Space
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight font-serif text-gray-900 leading-[1.1] mb-6">
              Your thoughts, <br />
              <span className="text-[#264653] font-serif italic font-normal">sculpted in depth</span>.
            </h1>
            
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-10 max-w-lg">
              Experience notes with spatial presence. Grounded in a highly secure, private Express backend, wrapped in a beautiful daylight tactile studio.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Link
                to="/auth"
                state={{ mode: 'register' }}
                className="w-full sm:w-auto px-8 py-4 bg-[#264653] hover:bg-[#1a303a] text-white font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-[#264653]/10 hover:shadow-2xl hover:scale-[1.01]"
              >
                Create Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                state={{ mode: 'login' }}
                className="w-full sm:w-auto px-8 py-4 bg-white/70 hover:bg-white text-gray-800 font-semibold rounded-2xl border border-gray-200/80 flex items-center justify-center transition-all duration-300 backdrop-blur-md"
              >
                Sign In to Studio
              </Link>
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
            <span className="text-xs font-semibold tracking-widest uppercase">Scroll to transition space</span>
            <div className="w-5 h-9 rounded-full border-2 border-gray-300 flex justify-center p-1.5">
              <div className="w-1.5 h-1.5 bg-[#264653] rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Policy & Terms of Service Center */}
        <section className="min-h-screen flex items-center px-6 max-w-7xl mx-auto py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
            <div className="lg:col-span-5 max-w-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center justify-center mb-6 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-serif mb-5">
                Privacy-First Mindspace
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium mb-6">
                We believe your notes are direct extensions of your mind. Explore our interactive Privacy & Terms Center to understand how your creative workspaces remain fully yours.
              </p>
              
              {/* Interactive Policy Tabs selectors */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setActivePolicyTab('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                    activePolicyTab === 'privacy' 
                      ? 'bg-[#264653]/5 border-[#264653]/20 text-[#264653] font-bold pl-5' 
                      : 'bg-white/40 hover:bg-white/70 border-gray-200/60 text-gray-600 font-medium'
                  }`}
                >
                  <span className="text-sm">1. Privacy Policy</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${activePolicyTab === 'privacy' ? 'bg-[#264653]' : 'bg-transparent'}`} />
                </button>

                <button
                  onClick={() => setActivePolicyTab('terms')}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                    activePolicyTab === 'terms' 
                      ? 'bg-[#264653]/5 border-[#264653]/20 text-[#264653] font-bold pl-5' 
                      : 'bg-white/40 hover:bg-white/70 border-gray-200/60 text-gray-600 font-medium'
                  }`}
                >
                  <span className="text-sm">2. Terms of Service</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${activePolicyTab === 'terms' ? 'bg-[#264653]' : 'bg-transparent'}`} />
                </button>

                <button
                  onClick={() => setActivePolicyTab('sovereignty')}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                    activePolicyTab === 'sovereignty' 
                      ? 'bg-[#264653]/5 border-[#264653]/20 text-[#264653] font-bold pl-5' 
                      : 'bg-white/40 hover:bg-white/70 border-gray-200/60 text-gray-600 font-medium'
                  }`}
                >
                  <span className="text-sm">3. Sovereignty Promise</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${activePolicyTab === 'sovereignty' ? 'bg-[#264653]' : 'bg-transparent'}`} />
                </button>
              </div>
            </div>
            
            {/* Visual Policy Detail Card */}
            <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/80 p-8 shadow-xl shadow-gray-100/50 min-h-[360px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePolicyTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  {activePolicyTab === 'privacy' && (
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Policy Charter</span>
                        <span className="text-xs text-gray-400 font-mono">Last updated: July 2026</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif mb-2.5">
                        "Your mind is your own. We keep it that way."
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                        All thoughts, plans, and brainstorms captured in 3D Notes are stored with strict isolated containment. We do not sell, scan, index, or parse any text or color codes you choose.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">Zero Tracker Policy</h4>
                          <p className="text-[11px] text-gray-500 font-medium">No cookie streams or analytics pixels track your workspace activity.</p>
                        </div>
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">Functional Cookies</h4>
                          <p className="text-[11px] text-gray-500 font-medium">HTTP-only cookie tokens are solely utilized to secure your session identity.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePolicyTab === 'terms' && (
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-700">Tactile Utility Pact</span>
                        <span className="text-xs text-gray-400 font-mono">Section 12.1 License</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif mb-2.5">
                        Fair Use & Absolute Creator Sovereignty
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                        You hold exclusive Intellectual Property rights and full copyright to all content sculpted in this studio. We grant you a direct tactile utility license to run workspaces.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">100% Data Portability</h4>
                          <p className="text-[11px] text-gray-500 font-medium">Export, download, or clear your complete canvas index instantly from the workspace panel.</p>
                        </div>
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">No Locked Archives</h4>
                          <p className="text-[11px] text-gray-500 font-medium">Your data remains accessible as JSON formatted arrays with zero proprietary encoding.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePolicyTab === 'sovereignty' && (
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">Aesthetic Integrity</span>
                        <span className="text-xs text-gray-400 font-mono">Verified Ad-Free</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-serif mb-2.5">
                        The Quiet tactile workspace pledge
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">
                        Attention is a scarce resource. We promise never to implement attention-traps, dark pattern notifications, commercial feeds, or popups that disrupt your creative workflow.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">Anti-Feeds Promise</h4>
                          <p className="text-[11px] text-gray-500 font-medium">No infinity loops. Your workspace remains a focused, peaceful, starting canvas.</p>
                        </div>
                        <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-bold text-[#264653] uppercase tracking-wide mb-1">Silent Execution</h4>
                          <p className="text-[11px] text-gray-500 font-medium">Operations run silently without nagging prompts, email spam, or upgrades.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Palette Sandbox */}
        <section className="min-h-screen flex items-center px-6 max-w-7xl mx-auto py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
            
            {/* Left: Palette Selection Controls */}
            <div className="order-last lg:order-first lg:col-span-6 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/80 p-8 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Interactive Palette Simulator</span>
                <span className="px-2.5 py-1 text-xs font-bold bg-[#264653]/10 text-[#264653] border border-[#264653]/10 rounded-full flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  Tactile Colors
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 font-serif mb-4">
                Calibrate Your Thoughts
              </h3>
              
              <p className="text-sm text-gray-600 mb-6 font-medium">
                Categorize your tasks and archives using earthy, eye-safe tones. Try selecting a shade below to preview its design and purpose:
              </p>

              <div className="grid grid-cols-5 gap-3.5 max-w-xs mb-8">
                {(['clay', 'sand', 'blue', 'sage', 'lavender'] as ColorThemeKey[]).map((themeName) => {
                  const isActive = previewColor === themeName;
                  let colorClass = '';
                  if (themeName === 'clay') colorClass = 'bg-[#E76F51]';
                  else if (themeName === 'sand') colorClass = 'bg-[#E9C46A]';
                  else if (themeName === 'blue') colorClass = 'bg-[#264653]';
                  else if (themeName === 'sage') colorClass = 'bg-[#2A9D8F]';
                  else if (themeName === 'lavender') colorClass = 'bg-[#A89FDF]';

                  return (
                    <button
                      key={themeName}
                      onClick={() => setPreviewColor(themeName)}
                      className={`w-12 h-12 rounded-full cursor-pointer transition-all ${colorClass} ${
                        isActive 
                          ? 'ring-4 ring-offset-2 ring-[#264653]/30 scale-110 shadow-lg' 
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={themeName}
                    />
                  );
                })}
              </div>

              {/* Helpful Tips */}
              <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-xl flex items-start gap-3">
                <Compass className="w-5 h-5 text-[#264653] mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-500 font-medium leading-relaxed">
                  <strong className="text-gray-700 block mb-0.5">Physical Note Pinning</strong>
                  Pinned notes float at the very foreground layer in the workspace to bypass visual noise and keep you focused.
                </div>
              </div>
            </div>

            {/* Right: Simulated Preview Card */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="max-w-md">
                <div className="w-12 h-12 rounded-xl bg-[#264653]/5 text-[#264653] flex items-center justify-center mb-6 shadow-sm">
                  <Palette className="w-6 h-6" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight font-serif mb-5">
                  Expressive Sculpting
                </h2>
                <p className="text-gray-600 leading-relaxed font-medium mb-8">
                  Ditch monochrome list items. Your thoughts deserve beautiful daylight physical contrast, tailored color sorting, and responsive interactions.
                </p>

                {/* Animated Simulated Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewColor}
                    initial={{ opacity: 0, rotateY: 15, scale: 0.95 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    exit={{ opacity: 0, rotateY: -15, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`p-6 rounded-2xl border ${colorThemes[previewColor].bg} ${colorThemes[previewColor].text} ${colorThemes[previewColor].border} ${colorThemes[previewColor].shadow} shadow-2xl relative min-h-[180px] flex flex-col justify-between overflow-hidden cursor-default`}
                  >
                    {/* Glossy shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/20 rounded backdrop-blur-sm">
                        {colorThemes[previewColor].tag}
                      </span>
                      <span className="text-[11px] font-mono opacity-60">
                        {colorThemes[previewColor].name}
                      </span>
                    </div>

                    <div className="my-4">
                      <h4 className="font-bold text-base tracking-tight font-serif mb-1">
                        Workspace Sample note
                      </h4>
                      <p className="text-xs opacity-90 leading-relaxed font-medium">
                        {colorThemes[previewColor].description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-60 mt-1">
                      <Heart className="w-3 h-3 fill-current" />
                      Saved & Synchronized
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </section>

        {/* Section 4: Lined Notebook Pen Writing Sanctuary */}
        <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto py-24 relative">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');
            .font-handwriting {
              font-family: 'Caveat', cursive, sans-serif;
            }
          `}</style>

          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sanctuary Charter
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight">
                Crafted in Creative Peace
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mt-3 font-medium">
                Our code respects your workspace focus. Every thought remains protected, sandboxed, and fully owned by you.
              </p>
            </div>

            {/* Immersive Binder Notebook Mockup */}
            <div className="relative w-full max-w-2xl mx-auto bg-[#FDFBF7] rounded-3xl shadow-2xl border border-amber-900/10 p-8 pt-10 pb-12 overflow-hidden min-h-[340px]">
              {/* Lined notebook paper backdrop (32px vertical stripes) */}
              <div 
                className="absolute inset-0 bg-[repeating-linear-gradient(#FDFBF7,#FDFBF7_31px,#E4E2DC_31px,#E4E2DC_32px)] opacity-70 pointer-events-none" 
                style={{ backgroundPosition: '0 8px' }}
              />

              {/* Vertical Margin Red Rule Line */}
              <div className="absolute left-20 top-0 bottom-0 w-[1px] bg-rose-400/50 pointer-events-none" />

              {/* Binder Spiral Rings on the Left margin */}
              <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between py-10 w-8 z-20 pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {/* Dark punched ring hole */}
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200/90 shadow-inner border border-gray-300" />
                    {/* Highly-detailed dimensional metallic spiral ring clip */}
                    <div className="w-9 h-3.5 rounded-full bg-gradient-to-r from-gray-400 via-gray-100 to-gray-500 border border-gray-400/80 shadow-md transform -translate-x-1.5" />
                  </div>
                ))}
              </div>

              {/* Notebook Handwriting content area */}
              <div className="relative z-10 pl-16 sm:pl-20 pr-4 font-handwriting text-2xl sm:text-3xl text-gray-800 leading-[32px] tracking-wide pt-2 min-h-[240px]">
                {typedNotebook.split('\n').map((line, idx, arr) => {
                  const isLastLine = idx === arr.length - 1;
                  return (
                    <div key={idx} className="min-h-[32px] flex flex-wrap items-center relative">
                      <span>{line}</span>
                      {isLastLine && (
                        <span className="relative inline-block w-0 h-0 ml-1">
                          {/* Floating Pen drawing animation that wiggles when writing */}
                          <motion.div
                            animate={isWriting ? {
                              y: [0, -2, 2, -1, 1, 0],
                              x: [0, 1.5, -1, 0.5, 0, 0],
                              rotate: [-15, -12, -18, -14, -16, -15],
                            } : {
                              y: 0,
                              x: 0,
                              rotate: -15,
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.5,
                              ease: 'easeInOut',
                            }}
                            className="absolute left-0 top-[-36px] pointer-events-none z-30 flex items-center justify-center"
                            style={{ transformOrigin: '2px 22px' }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="w-12 h-12 text-gray-700 select-none pointer-events-none drop-shadow-[3px_5px_7px_rgba(0,0,0,0.22)]"
                            >
                              {/* Sleek golden-accented fountain drawing pen. Tip is anchored perfectly at coordinate (2, 22) */}
                              <path
                                d="M 2 22 L 6 18 L 8 19 L 3 23 Z"
                                fill="#1E293B"
                              />
                              <path
                                d="M 6 18 L 20 4 C 21 3 22 3 23 4 C 24 5 24 6 23 7 L 9 21 L 6 18 Z"
                                fill="#475569"
                              />
                              {/* Fountain pen gold accent ring */}
                              <path
                                d="M 8 16 L 10 14 L 11 15 L 9 17 Z"
                                fill="#EAB308"
                              />
                            </svg>
                          </motion.div>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: CTA Footer */}
        <footer className="border-t border-gray-200/50 bg-[#FAFAF8]/95 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#264653] flex items-center justify-center">
                <FolderHeart className="w-4 h-4 text-white" />
              </div>
              <span className="text-md font-bold tracking-tight text-[#264653] font-serif">
                3D Notes Workspace
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              © 2026 3D Notes Studio. Crafted with absolute spatial precision.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
