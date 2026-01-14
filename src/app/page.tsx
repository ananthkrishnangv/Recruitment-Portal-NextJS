import Link from "next/link";
import { Search, Fingerprint, Briefcase, Award, Rocket, Database, ArrowRight } from "lucide-react";

export default function Home() {
  const stats = [
    { icon: <Database className="w-7 h-7" />, value: "2.4K+", label: "Applicants", color: "bg-blue-50 text-blue-600" },
    { icon: <Briefcase className="w-7 h-7" />, value: "12+", label: "Divisions", color: "bg-emerald-50 text-emerald-600" },
    { icon: <Award className="w-7 h-7" />, value: "45+", label: "Openings", color: "bg-amber-50 text-amber-600" },
    { icon: <Rocket className="w-7 h-7" />, value: "08", label: "Mega Projects", color: "bg-indigo-50 text-indigo-600" },
  ];

  const steps = [
    { id: 1, icon: <Fingerprint />, title: "Registration", desc: "Create account with Aadhaar UID" },
    { id: 2, icon: <Briefcase />, title: "Select Post", desc: "Choose from available vacancies" },
    { id: 3, icon: <Fingerprint />, title: "Fill Details", desc: "Complete 7-step application form" },
    { id: 4, icon: <Fingerprint />, title: "Upload Files", desc: "Submit documents securely" },
    { id: 5, icon: <Fingerprint />, title: "Submit", desc: "Finalize your application" },
    { id: 6, icon: <Fingerprint />, title: "Download", desc: "Get PDF acknowledgement" },
    { id: 7, icon: <Search />, title: "Track Status", desc: "Monitor application progress" },
  ];

  const vacancies = [
    { id: 1, title: "Senior Research Scientist", type: "Scientists", lastDate: "2024-02-15", desc: "Lead structural research projects" },
    { id: 2, title: "Research Associate", type: "Technical", lastDate: "2024-02-20", desc: "Support research and testing operations" },
    { id: 3, title: "Project Engineer", type: "Technical", lastDate: "2024-02-25", desc: "Manage engineering projects and teams" },
  ];

  return (
    <main className="w-full min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-black text-2xl text-slate-900">
            CSIR-SERC <span className="text-blue-600">Portal</span>
          </div>
          <div className="flex gap-6">
            <Link href="/posts" className="font-bold text-slate-600 hover:text-blue-600 transition">Vacancies</Link>
            <Link href="/register" className="font-bold text-slate-600 hover:text-blue-600 transition">Register</Link>
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Login</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-4 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 mb-8 bg-blue-100/50 px-4 py-2 rounded-full border border-blue-200">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-sm font-bold text-blue-600">CSIR Nodal Recruitment System 2024</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-8 text-slate-900 tracking-tight leading-tight">
              Engineering <span className="text-blue-600">The Future</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
              Join the pinnacle of structural engineering research. Empower India's infrastructure through world-class scientific innovation and talent.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
               <Link href="/posts" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                 Explore Vacancies →
               </Link>
               <Link href="/register" className="bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-900 font-bold py-4 px-8 rounded-xl transition">
                 Register Profile →
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 mb-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition">
              <div className={`${stat.color} w-12 h-12 flex items-center justify-center rounded-lg mb-4`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <h2 className="text-4xl font-black text-center mb-16">How to Apply?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition">
              <div className="text-4xl mb-4 text-blue-600">{step.icon}</div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vacancies */}
      <section className="max-w-7xl mx-auto px-4 mb-32">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black">Current Vacancies</h2>
          <Link href="/posts" className="text-blue-600 font-bold hover:text-blue-700">View All →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vacancies.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition flex flex-col">
              <div className="flex justify-between mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{job.type}</span>
                <span className="text-xs font-bold text-red-500">Deadline: {job.lastDate}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
              <p className="text-slate-600 text-sm mb-6 flex-grow">{job.desc}</p>
              <Link href={`/posts/${job.id}`} className="inline-block py-2 px-4 bg-blue-600 text-white rounded-lg font-bold text-center hover:bg-blue-700 transition">
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <p className="text-slate-400 text-sm">Official recruitment portal for CSIR-SERC</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/posts" className="hover:text-white">Vacancies</Link></li>
                <li><Link href="/register" className="hover:text-white">Register</Link></li>
                <li><Link href="/helpdesk" className="hover:text-white">Helpdesk</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/helpdesk" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-slate-400 text-sm">
                CSIR-SERC<br/>
                Chennai, India<br/>
                Email: recruitment@csir-serc.in
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2024 CSIR-SERC. All rights reserved. | GIGW 3.0 Compliant</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
