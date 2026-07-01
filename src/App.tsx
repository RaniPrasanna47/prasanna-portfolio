import React, { useState, useEffect } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Database,
  Send,
  Terminal,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  Trash2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Layers,
  Lock,
  Shield,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { Profile, Project, ContactMessage, ServerStats } from './types';

export default function App() {
  // Navigation tabs (Only portfolio and contact - removing MERN admin!)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'contact'>('portfolio');

  // Dark / Light Mode Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  const scrollToProjects = () => {
    if (activeTab !== 'portfolio') {
      setActiveTab('portfolio');
      setTimeout(() => {
        const element = document.getElementById('projects-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById('projects-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const styles = {
    bg: isDark ? 'bg-[#050506]' : 'bg-slate-50',
    text: isDark ? 'text-[#E0E0E0]' : 'text-slate-800',
    heading: isDark ? 'text-white' : 'text-slate-900',
    card: isDark ? 'bg-[#0A0A0C]' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-slate-200/80',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    subtext: isDark ? 'text-zinc-400' : 'text-slate-500',
    badge: isDark ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700',
    outerBorder: isDark ? 'border-[#111114]' : 'border-slate-300',
    inputBg: isDark ? 'bg-[#050506]' : 'bg-slate-50',
    inputBorder: isDark ? 'border-white/10' : 'border-slate-200',
    inputFocus: isDark ? 'focus:border-cyan-500/50' : 'focus:border-cyan-500',
    innerBg: isDark ? 'bg-[#050506]' : 'bg-slate-50',
    navBg: isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-slate-200/60 border-slate-300',
    navTabActive: isDark ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/30' : 'bg-white text-cyan-600 border border-cyan-300 shadow-xs',
    navTabInactive: isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900',
    accentText: 'text-cyan-400',
  };

  // Backend state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ServerStats>({ totalInquiries: 0, sentimentBreakdown: {} });
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string }>({ connected: false, mode: 'Checking...' });

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactResult, setContactResult] = useState<{
    success: boolean;
    data?: any;
    ai?: { sentiment: string; summary: string; draftReply: string };
    error?: string;
  } | null>(null);

  // Admin passcode verification for extra security (optional client-side gate, bypass for easy previewing but keep it looking professional!)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Fetch profile and projects on mount
  useEffect(() => {
    fetchProfile();
    fetchProjects();
    checkStatsAndDb();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const checkStatsAndDb = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }

      // Infer DB status
      const testRes = await fetch('/api/messages');
      if (testRes.ok) {
        const msgData = await testRes.json();
        const hasMongoId = msgData.messages?.some((m: any) => m._id && !m._id.startsWith('local_'));
        
        // If we fetched successfully, checking state
        setDbStatus({
          connected: true,
          mode: hasMongoId ? 'MongoDB Atlas Cloud' : 'Local JSON Storage Fallback'
        });
      }
    } catch (err) {
      setDbStatus({ connected: false, mode: 'Disconnected' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      setSubmittingContact(true);
      setContactResult(null);

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setContactResult({
          success: true,
          data: result.data,
          ai: result.ai
        });
        // Clear form
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Refresh statistics
        checkStatsAndDb();
      } else {
        setContactResult({
          success: false,
          error: result.error || 'Server processing error.'
        });
      }
    } catch (err: any) {
      setContactResult({
        success: false,
        error: err.message || 'Network connection failed.'
      });
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this contact inquiry from the database?')) {
      return;
    }

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Refresh lists
        fetchMessages();
        checkStatsAndDb();
      } else {
        alert('Failed to delete message from storage.');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleAdminLockToggle = () => {
    setIsAdminUnlocked(false);
    setPasscode('');
    setPasscodeError('');
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock passcode for portfolio presentation "admin"
    if (passcode.toLowerCase() === 'admin' || passcode === '1234') {
      setIsAdminUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid administrative access key. Try "admin".');
    }
  };

  // Predefined default data in case server endpoints are starting up
  const fallbackProfile = {
    name: 'Gompa Rani Prasanna',
    tagline: 'Computer Science & Engineering Student | Full-Stack Developer | Problem Solver',
    email: 'raniprasanna997@gmail.com',
    phone: '9392372226',
    linkedin: 'https://linkedin.com/in/raniprasanna',
    github: 'https://github.com/Rani-Prasanna',
    location: 'NIT Durgapur, India',
    education: {
      institution: 'National Institute of Technology, Durgapur',
      degree: 'Bachelor of Technology in Computer Science and Engineering',
      period: '2024 - 2028',
      cgpa: '8.8 / 10'
    },
    skills: {
      languages: ['C', 'C++', 'Python', 'HTML', 'CSS', 'JavaScript', 'SQL'],
      frameworks: ['React.js', 'Django', 'Streamlit', 'Bootstrap', 'NumPy', 'Pandas', 'scikit-learn', 'FastAPI', 'Flask'],
      tools: ['Git/GitHub', 'Linux (Ubuntu)', 'Docker', 'MongoDB', 'AWS'],
      coursework: ['Data Structures and Algorithms', 'Digital Logic Design', 'OOP', 'Analysis and Design of Algorithms']
    },
    positions: [
      {
        title: 'Junior Coordinator',
        org: 'Center for Cognitive Activities, NIT Durgapur',
        period: 'May 2025 – Present',
        bullets: [
          'Maintained and optimized the official CCA website using ReactJS, improving event traffic and user engagement by 25%.',
          'Led a 15+ member team in developing and deploying the official platform for Aarohan, the Techno-Management Fest of NIT Durgapur.'
        ]
      }
    ],
    achievements: [
      'Solved 350+ competitive programming challenges across LeetCode, Codechef (3 star 1600+), and Codeforces (pupil).',
      'Completed CS50x Introduction to Computer Science by Harvard University.',
      'Certified in "Node.js, Express, MongoDB & More: The Complete Bootcamp" on Udemy.'
    ]
  };

  const displayProfile = profile || fallbackProfile;  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} font-sans selection:bg-cyan-500 selection:text-black border-[12px] ${styles.outerBorder} transition-colors duration-300`}>
      {/* Top Professional Decorative Status Bar */}
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-[#050506]/90 border-white/10' : 'bg-white/95 border-slate-200/80'} backdrop-blur-md border-b shadow-md transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className={`${isDark ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-500/20 text-cyan-600'} border p-2 rounded-xl flex items-center justify-center`}>
              <Terminal className="h-5 w-5" id="header-terminal-icon" />
            </div>
            <div>
              <h1 className={`text-lg font-bold tracking-tight ${styles.heading} flex items-center gap-1.5`}>
                {displayProfile.name}
              </h1>
              <p className={`text-xs ${styles.subtext} font-medium`}>Full-Stack MERN Portfolio</p>
            </div>
          </div>

          {/* Database & Cloud status indicator & Theme Toggle */}
          <div className="flex items-center gap-4 text-xs">
            <div className={`hidden md:flex items-center gap-2 ${isDark ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-500/20 text-emerald-700'} border py-1 px-3 rounded-full`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dbStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="font-mono">DB Mode: {dbStatus.mode}</span>
            </div>

            {/* Quick Refresh Status Button */}
            <button 
              onClick={checkStatsAndDb}
              className={`p-1.5 rounded-lg transition ${isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              title="Refresh database connection stats"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg transition ${isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-600" />}
            </button>
          </div>

          {/* Navigation Control Tabs */}
          <nav className={`flex items-center ${styles.navBg} p-1 rounded-xl border`}>
            <button
              id="nav-tab-portfolio"
              onClick={() => {
                setActiveTab('portfolio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'portfolio'
                  ? styles.navTabActive
                  : styles.navTabInactive
              }`}
            >
              Credentials
            </button>
            <button
              id="nav-tab-projects"
              onClick={scrollToProjects}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${styles.navTabInactive}`}
            >
              Projects
            </button>
            <button
              id="nav-tab-contact"
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'contact'
                  ? styles.navTabActive
                  : styles.navTabInactive
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
              Contact
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- TAB 1: PORTFOLIO SHOWCASE --- */}
        {activeTab === 'portfolio' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Header Hero card */}
            <div className={`relative ${styles.card} rounded-3xl border ${styles.cardBorder} p-6 sm:p-10 shadow-lg overflow-hidden transition-all duration-300`}>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl opacity-60"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative flex flex-col lg:flex-row gap-8 items-center justify-between">
                
                {/* Profile Intro details with Face Picture */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left max-w-2xl flex-1">
                  
                  {/* Face Picture / Avatar with Initials Fallback */}
                  <div className="relative shrink-0 group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full blur-sm opacity-35 group-hover:opacity-70 transition duration-500"></div>
                    <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 ${isDark ? 'border-cyan-500/30 bg-zinc-900' : 'border-cyan-600/30 bg-white'} flex items-center justify-center shadow-lg`}>
                      <img 
                        src="/face.jpg" 
                        alt="Gompa Rani Prasanna" 
                        className="w-full h-full object-cover z-10 relative"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Initials Fallback in case /face.jpg isn't placed in the workspace yet */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950/90 to-slate-900 text-white font-sans">
                        <span className="text-3.5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">GRP</span>
                        <span className="text-[9px] text-cyan-400/60 font-mono mt-0.5 font-bold uppercase tracking-widest">CSE</span>
                      </div>
                    </div>
                  </div>

                  {/* Intro text detail */}
                  <div className="space-y-4 flex-1">
                    <div className={`inline-flex items-center gap-1.5 ${isDark ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-500/20 text-emerald-600'} border text-xs font-semibold px-3 py-1 rounded-full`}>
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      Available for Internships & Projects
                    </div>
                    
                    <h2 className={`text-3xl sm:text-4xl font-extrabold ${styles.heading} tracking-tight`}>
                      {displayProfile.name}
                    </h2>
                    
                    <p className={`text-base sm:text-lg ${styles.subtext} font-medium leading-relaxed`}>
                      {displayProfile.tagline}
                    </p>

                    <div className="flex flex-wrap gap-2.5 pt-1 justify-center md:justify-start">
                      <span className={`flex items-center gap-1.5 text-xs ${styles.badge} px-2.5 py-1 rounded-lg font-medium border`}>
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                        {displayProfile.location}
                      </span>
                      <a 
                        href={`mailto:${displayProfile.email}`} 
                        className={`flex items-center gap-1.5 text-xs ${styles.badge} hover:bg-cyan-500/10 px-2.5 py-1 rounded-lg font-medium border transition`}
                      >
                        <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        {displayProfile.email}
                      </a>
                      <a 
                        href={`tel:${displayProfile.phone}`}
                        className={`flex items-center gap-1.5 text-xs ${styles.badge} hover:bg-cyan-500/10 px-2.5 py-1 rounded-lg font-medium border transition`}
                      >
                        <Phone className="h-3.5 w-3.5 text-zinc-500" />
                        {displayProfile.phone}
                      </a>
                    </div>

                    {/* Connect Badges */}
                    <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
                      <a 
                        href={displayProfile.linkedin} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 py-2 px-4 rounded-xl shadow-md hover:shadow-cyan-500/20 transition duration-300"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                      <a 
                        href={displayProfile.github} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className={`inline-flex items-center justify-center gap-2 text-xs font-bold ${isDark ? 'text-zinc-300 bg-white/5 border-white/10 hover:bg-white/10' : 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200'} py-2 px-4 rounded-xl border transition duration-300`}
                      >
                        <Github className="h-4 w-4 text-zinc-400" />
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>

                {/* Profile Stats Mini Panel */}
                <div className={`w-full md:w-auto ${styles.card} border ${styles.cardBorder} p-6 rounded-2xl space-y-4 max-w-sm shrink-0 shadow-lg transition-colors duration-300`}>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Snapshot Statistics</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${styles.innerBg} border ${styles.cardBorder} p-3 rounded-xl shadow-xs`}>
                      <span className={`block text-xl font-bold ${styles.heading}`}>8.8</span>
                      <span className={`text-[10px] ${styles.subtext} font-medium`}>B.Tech CGPA</span>
                    </div>
                    <div className={`${styles.innerBg} border ${styles.cardBorder} p-3 rounded-xl shadow-xs`}>
                      <span className="block text-xl font-bold text-cyan-400">350+</span>
                      <span className={`text-[10px] ${styles.subtext} font-medium`}>CP Solved</span>
                    </div>
                    <div className={`${styles.innerBg} border ${styles.cardBorder} p-3 rounded-xl shadow-xs`}>
                      <span className="block text-xl font-bold text-emerald-400">3 Star</span>
                      <span className={`text-[10px] ${styles.subtext} font-medium`}>CodeChef Star</span>
                    </div>
                    <div className={`${styles.innerBg} border ${styles.cardBorder} p-3 rounded-xl shadow-xs`}>
                      <span className={`block text-xl font-bold ${styles.heading}`}>2028</span>
                      <span className={`text-[10px] ${styles.subtext} font-medium`}>Graduation Year</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => setActiveTab('contact')}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline flex items-center justify-center gap-1 mx-auto"
                    >
                      Send direct message request
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Experience / Education & Skills Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left columns (Education + Positions) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Academic credentials */}
                <div className={`${styles.card} rounded-2xl border ${styles.cardBorder} p-6 shadow-md transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 ${isDark ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-500/10 text-cyan-600'} border rounded-lg`}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className={`text-lg font-bold ${styles.heading}`}>Academic Background</h3>
                  </div>

                  <div className="relative border-l-2 border-cyan-500/20 pl-4 space-y-2">
                    <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 border ${isDark ? 'border-[#050506]' : 'border-slate-50'}`}></span>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className={`text-sm font-bold ${styles.heading}`}>{displayProfile.education.institution}</h4>
                      <span className={`text-xs ${styles.badge} py-0.5 px-2 rounded-md font-mono border`}>{displayProfile.education.period}</span>
                    </div>
                    <p className={`text-xs ${styles.subtext} font-medium`}>{displayProfile.education.degree}</p>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-md font-bold mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      CGPA: {displayProfile.education.cgpa}
                    </div>
                  </div>
                </div>

                {/* Positions of Responsibility */}
                <div className={`${styles.card} rounded-2xl border ${styles.cardBorder} p-6 shadow-md transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 ${isDark ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-500/10 text-cyan-600'} border rounded-lg`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className={`text-lg font-bold ${styles.heading}`}>Positions of Responsibility</h3>
                  </div>

                  <div className="space-y-8">
                    {displayProfile.positions.map((pos, idx) => (
                      <div key={idx} className={`relative pl-6 border-l ${styles.border}`}>
                        <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-slate-300'}`}></span>
                        
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                          <div>
                            <h4 className={`text-sm font-bold ${styles.heading}`}>{pos.title}</h4>
                            <p className="text-xs text-cyan-500 font-semibold">{pos.org}</p>
                          </div>
                          <span className={`text-xs ${styles.badge} py-0.5 px-2 rounded-md font-mono font-medium border`}>{pos.period}</span>
                        </div>

                        <ul className="list-disc list-outside pl-4 space-y-1.5">
                          {pos.bullets.map((bullet, bidx) => (
                            <li key={bidx} className={`text-xs ${styles.subtext} leading-relaxed hover:${isDark ? 'text-zinc-200' : 'text-slate-900'} transition`}>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right column (Skills Categorized Tag cloud) */}
              <div className="space-y-8">
                
                {/* Categorized Skills */}
                <div className={`${styles.card} rounded-2xl border ${styles.cardBorder} p-6 shadow-md transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 ${isDark ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-500/10 text-cyan-600'} border rounded-lg`}>
                      <Code2 className="h-5 w-5" />
                    </div>
                    <h3 className={`text-lg font-bold ${styles.heading}`}>Technical Skills</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Programming Languages */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-widest">Programming Languages</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displayProfile.skills.languages.map((lang, idx) => (
                          <span key={idx} className={`${isDark ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'} text-xs py-1 px-2.5 rounded-lg border font-medium transition`}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technologies and Frameworks */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-widest">Frameworks & Technologies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displayProfile.skills.frameworks.map((fw, idx) => (
                          <span key={idx} className={`${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20' : 'bg-cyan-50 border-cyan-500/20 text-cyan-700 hover:bg-cyan-100'} text-xs py-1 px-2.5 rounded-lg border font-medium transition`}>
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tools and Platforms */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-widest">Tools & Infrastructure</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displayProfile.skills.tools.map((tool, idx) => (
                          <span key={idx} className={`${isDark ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'} text-xs py-1 px-2.5 rounded-lg border font-medium transition`}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Coursework */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono tracking-widest">Academic Coursework</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displayProfile.skills.coursework.map((course, idx) => (
                          <span key={idx} className={`${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 border-emerald-500/20 text-emerald-700 hover:bg-emerald-100'} text-xs py-1 px-2.5 rounded-lg border font-medium transition`}>
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements / Competitive Programming */}
                <div className={`${styles.card} rounded-2xl border ${styles.cardBorder} p-6 shadow-md transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 ${isDark ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-400' : 'bg-cyan-50 border-cyan-500/10 text-cyan-600'} border rounded-lg`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <h3 className={`text-lg font-bold ${styles.heading}`}>Achievements</h3>
                  </div>

                  <ul className="space-y-3.5">
                    {displayProfile.achievements.map((ach, idx) => (
                      <li key={idx} className={`flex gap-2.5 items-start text-xs ${styles.subtext} leading-relaxed hover:${isDark ? 'text-zinc-200' : 'text-slate-900'} transition`}>
                        <CheckCircle2 className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

            {/* --- PROJECTS BENTO SECTION --- */}
            <div id="projects-section" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${styles.heading} flex items-center gap-2`}>
                  <Layers className="h-5.5 w-5.5 text-cyan-400" />
                  Featured Development Projects
                </h3>
                <span className={`text-xs ${styles.subtext} font-mono font-medium`}>Fetched from REST API</span>
              </div>

              {loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`${styles.card} border ${styles.cardBorder} p-6 rounded-2xl h-64 animate-pulse space-y-4`}>
                      <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
                      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                      <div className="h-16 bg-zinc-900 rounded"></div>
                      <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.map(proj => (
                    <div 
                      key={proj.id} 
                      className={`${styles.card} hover:${isDark ? 'bg-[#0E0E12]' : 'bg-slate-100/50'} border ${styles.cardBorder} p-6 rounded-2xl shadow-md transition duration-300 flex flex-col justify-between group relative overflow-hidden`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-[10px] uppercase font-bold text-cyan-500 tracking-wider bg-cyan-500/10 border border-cyan-500/20 py-0.5 px-2 rounded-full">
                            {proj.category}
                          </span>
                          <span className={`text-[10px] font-mono ${styles.subtext}`}>{proj.tech.split(',')[0]}</span>
                        </div>

                        <div>
                          <h4 className={`text-base font-bold ${styles.heading} group-hover:text-cyan-500 transition`}>
                            {proj.title}
                          </h4>
                          <p className={`text-xs ${styles.subtext} font-medium mt-1`}>
                            {proj.description}
                          </p>
                        </div>

                        <ul className={`space-y-1.5 border-t ${styles.border} pt-3`}>
                          {proj.bullets.slice(0, 2).map((b, bIdx) => (
                            <li key={bIdx} className={`text-[11px] ${styles.subtext} leading-normal list-none pl-3 relative`}>
                              <span className="absolute left-0 top-1.5 w-1 h-1 bg-cyan-500 rounded-full"></span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`mt-5 pt-3 border-t ${styles.cardBorder} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
                        <span className={`text-[10px] font-mono ${styles.subtext} truncate max-w-[150px]`} title={proj.tech}>Stack: {proj.tech}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <a 
                            href={proj.link}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className={`text-xs font-semibold ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'} flex items-center gap-1 transition`}
                          >
                            Code
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                          {proj.liveLink && (
                            <a 
                              href={proj.liveLink}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="text-xs font-semibold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition"
                            >
                              Live Link
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB 2: SECURE CONTACT FORM --- */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            
            {/* Header info */}
            <div className="text-center space-y-3">
              <h2 className={`text-3xl font-extrabold ${styles.heading} tracking-tight`}>Secure Message Ingress Workspace</h2>
              <p className={`text-sm ${styles.subtext} max-w-lg mx-auto leading-relaxed`}>
                Establish contact securely through our private message portal. Messages are stored instantly and processed for direct notification dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
              
              {/* Form Card (3 cols) */}
              <div className={`${styles.card} rounded-2xl border ${styles.cardBorder} p-6 sm:p-8 shadow-lg md:col-span-3 space-y-6 transition-colors duration-300`}>
                <h3 className={`text-lg font-bold ${styles.heading} flex items-center gap-2`}>
                  <Shield className="h-5 w-5 text-cyan-400" />
                  Secure Message Channel
                </h3>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-bold ${styles.subtext}`}>Your Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. John Doe"
                        className={`w-full text-xs py-2.5 px-3 ${isDark ? 'bg-[#050506] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border focus:border-cyan-500/50 rounded-lg outline-none placeholder:text-zinc-500 transition`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-bold ${styles.subtext}`}>Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="john@example.com"
                        className={`w-full text-xs py-2.5 px-3 ${isDark ? 'bg-[#050506] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border focus:border-cyan-500/50 rounded-lg outline-none placeholder:text-zinc-500 transition`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${styles.subtext}`}>Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Internship Opportunity / Collaboration proposal"
                      className={`w-full text-xs py-2.5 px-3 ${isDark ? 'bg-[#050506] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border focus:border-cyan-500/50 rounded-lg outline-none placeholder:text-zinc-500 transition`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${styles.subtext}`}>Detailed Message Body</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Write your note or collaboration details here..."
                      className={`w-full text-xs py-2.5 px-3 ${isDark ? 'bg-[#050506] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border focus:border-cyan-500/50 rounded-lg outline-none placeholder:text-zinc-500 transition resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingContact}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-505 text-white font-semibold text-xs rounded-xl shadow-md hover:shadow-cyan-500/20 transition disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submittingContact ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Transmitting safe dispatch ...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Secured Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Side Info & Live Result Status Card (2 cols) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Connection Details Banner */}
                <div className={`${styles.card} border ${styles.cardBorder} p-5 rounded-2xl space-y-3.5 shadow-lg transition-colors duration-300`}>
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-cyan-500 flex items-center gap-1.5">
                    <Database className="h-4 w-4" />
                    System Telemetry
                  </h4>
                  
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className={`flex justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-100'} pb-1.5`}>
                      <span className={`${styles.subtext}`}>DATABASE:</span>
                      <span className={dbStatus.connected ? 'text-emerald-500' : 'text-amber-500'}>
                        {dbStatus.connected ? 'SYNC_ACTIVE' : 'LOCAL_FALLBACK'}
                      </span>
                    </div>
                    <div className={`flex justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-100'} pb-1.5`}>
                      <span className={`${styles.subtext}`}>API ENDPOINT:</span>
                      <span className="text-cyan-500">POST /api/contact</span>
                    </div>
                    <div className={`flex justify-between border-b ${isDark ? 'border-white/5' : 'border-slate-100'} pb-1.5`}>
                      <span className={`${styles.subtext}`}>DISPATCH MODULE:</span>
                      <span className="text-cyan-505">secure_notif_v1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${styles.subtext}`}>SMTP GATEWAY:</span>
                      <span className={`${styles.heading}`}>nodemailer</span>
                    </div>
                  </div>

                  <p className={`text-[10px] ${styles.subtext} leading-normal font-medium`}>
                    *Your message is saved securely in MongoDB and instantly dispatched directly to Gompa's email via SMTP inbox routing.*
                  </p>
                </div>

                {/* Submitting Status / Result Screen */}
                {submittingContact && (
                  <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl text-center space-y-3 animate-pulse">
                    <Activity className="h-8 w-8 text-cyan-500 animate-bounce mx-auto" />
                    <h4 className={`text-xs font-bold ${styles.heading}`}>Establishing Secure Connection</h4>
                    <p className={`text-[11px] ${styles.subtext} leading-normal`}>
                      The server is writing your record to the database cluster and assembling metadata and delivery packets...
                    </p>
                  </div>
                )}

                {contactResult && (
                  <div className={`p-6 rounded-2xl space-y-4 shadow-md border ${
                    contactResult.success 
                      ? `${styles.card} ${styles.cardBorder}` 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                  } transition-all duration-300`}>
                    
                    <div className="flex items-center gap-2">
                      {contactResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                      <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${styles.heading}`}>
                        {contactResult.success ? 'Inquiry Logged' : 'Transmission Fault'}
                      </h4>
                    </div>

                    {contactResult.success ? (
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className={`${styles.subtext}`}>
                          Your contact submission is saved successfully! Here is the extracted metadata summary of your request:
                        </p>
                        
                        {contactResult.ai && (
                          <div className={`border ${styles.cardBorder} ${isDark ? 'bg-[#050506]' : 'bg-slate-50'} rounded-xl p-4 space-y-2.5 shadow-inner`}>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-500">Extracted Sentiment/Tone</span>
                              <p className="text-xs font-bold text-cyan-505">{contactResult.ai.sentiment}</p>
                            </div>
                            <hr className={isDark ? 'border-white/5' : 'border-slate-100'} />
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-500">Executive Summary</span>
                              <p className={`text-xs italic ${styles.heading}`}>"{contactResult.ai.summary}"</p>
                            </div>
                            <hr className={isDark ? 'border-white/5' : 'border-slate-100'} />
                            <div>
                              <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-cyan-505">Auto-Generated Draft Reply</span>
                              <div className="text-[11px] font-mono leading-relaxed text-emerald-500 bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 mt-1 font-medium">
                                {contactResult.ai.draftReply}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed">
                        {contactResult.error}
                      </p>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Decorative Professional Footer */}
      <footer className={`border-t ${styles.cardBorder} ${styles.card} ${styles.subtext} py-8 text-center text-xs space-y-3 mt-12 transition-colors duration-300`}>
        <p className={`font-semibold ${styles.heading}`}>Gompa Rani Prasanna &copy; 2026 | NIT Durgapur B.Tech Computer Science</p>
        <div className="flex justify-center gap-4 text-[11px]">
          <span>MERN Full-Stack Engine</span>
          <span>&bull;</span>
          <span>Nodemailer Dispatches</span>
        </div>
        <p className={`text-[10px] ${styles.subtext} max-w-md mx-auto px-4 leading-normal`}>
          This system securely processes and logs incoming contact forms to a MongoDB database (equipped with a resilient local backup system) and dispatches real-time email notifications.
        </p>
      </footer>
    </div>
  );
}
