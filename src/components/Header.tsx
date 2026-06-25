'use client';

import { useSession } from 'next-auth/react';
import { Plus, Bell, User as UserIcon, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/SidebarProvider';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TaskModal, TaskFormData } from '@/components/TaskModal';

export function Header() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toggleSidebar } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if (e.key === '/') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleModalSubmit = async (data: TaskFormData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Task created');
      router.refresh();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Something went wrong');
      throw error;
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono bg-slate-50 dark:bg-slate-800">N</kbd>
            <span className="hidden lg:inline">New Task</span>
            <span className="hidden lg:inline mx-2">•</span>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-mono bg-slate-50 dark:bg-slate-800">/</kbd>
            <span className="hidden lg:inline">Search</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => toast('No new notifications', { icon: '🔔' })} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell className="w-5 h-5" />
          </button>

          <button 
            onClick={toggleTheme}
            className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDarkMode ? 'Light' : 'Dark'}
          </button>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="hidden sm:flex ml-2 shadow-indigo-500/20 shadow-lg">
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2"></div>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-sm text-right hidden md:block">
              <div className="font-medium text-slate-900 dark:text-slate-100 leading-none mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                {session?.user?.email || ''}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 w-9 h-9 rounded-full flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all">
              <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </header>
      
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}
