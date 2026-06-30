import Link from 'next/link';
import { ArrowRight, CheckCircle2, LayoutDashboard, Zap, Shield, ListTodo } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between py-6 px-8 lg:px-16 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ListTodo className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow Pro</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 px-8 lg:px-16 text-center max-w-5xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 border border-indigo-100 dark:border-indigo-800/50">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            TaskFlow v2.0 is now live!
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Manage your daily tasks with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">absolute clarity.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl leading-relaxed">
            TaskFlow Pro is the premium productivity suite that helps professionals organize workflows, set priorities, and track progress effortlessly without the clutter.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/register" className="w-full sm:w-auto text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
              Start for free
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto text-lg font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 rounded-full transition-all flex items-center justify-center">
              See how it works
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to get things done</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Powerful features designed to optimize your focus and output.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: LayoutDashboard, title: "Intuitive Dashboard", desc: "A clean, distraction-free Kanban board and list view to manage your tasks your way." },
                { icon: Zap, title: "Lightning Fast", desc: "Optimized performance means your tasks load instantly. Say goodbye to loading spinners." },
                { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and securely stored. We prioritize your privacy above all else." },
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits & How It Works */}
        <section id="how-it-works" className="py-24 px-8 lg:px-16 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Built for peak productivity</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                We've stripped away the complex, unnecessary features found in other tools to give you exactly what you need: a fast, reliable, and beautiful place to organize your mind.
              </p>
              <ul className="space-y-4">
                {[
                  "Organize tasks by Category and Priority",
                  "Drag and drop task management",
                  "Analytics to track your weekly progress",
                  "Beautiful dark mode interface"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-30 dark:opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-2xl transform transition-transform duration-700 hover:rotate-y-2 hover:scale-[1.02]">
                <img 
                  src="/dashboard_mockup.png" 
                  alt="TaskFlow Pro Dashboard" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-indigo-600 text-white px-8 lg:px-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-12">Loved by professionals everywhere</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <p className="text-lg mb-6 text-indigo-50">"TaskFlow Pro completely changed how I manage my freelance projects. It's clean, lightning-fast, and a joy to use daily."</p>
                <div className="font-semibold text-white">Sarah Jenkins</div>
                <div className="text-indigo-200 text-sm">Product Designer</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                <p className="text-lg mb-6 text-indigo-50">"Finally, a to-do app that doesn't feel like a spreadsheet. The analytics feature keeps me motivated throughout the week."</p>
                <div className="font-semibold text-white">Marcus Cole</div>
                <div className="text-indigo-200 text-sm">Software Engineer</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 px-8 lg:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ListTodo className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">TaskFlow Pro</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} TaskFlow Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
