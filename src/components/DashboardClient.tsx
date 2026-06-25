'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task } from '@prisma/client';
import { CheckCircle2, Circle, Clock, Search, ListFilter, TrendingUp, TrendingDown, AlertCircle, FilePlus2, Plus } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TaskModal, TaskFormData } from './TaskModal';

// Lazy load the charts to keep the initial dashboard bundle size extremely small
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false, loading: () => <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-[250px] rounded-xl w-full"></div> });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface DashboardClientProps {
  initialTasks: Task[];
  userName: string;
}

export default function DashboardClient({ initialTasks, userName }: DashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Derived Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'COMPLETED').length;

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  // Mock data for the productivity chart
  const data = useMemo(() => {
    return [
      { name: 'Mon', tasks: 3 },
      { name: 'Tue', tasks: 5 },
      { name: 'Wed', tasks: 2 },
      { name: 'Thu', tasks: 7 },
      { name: 'Fri', tasks: 4 },
      { name: 'Sat', tasks: 8 },
      { name: 'Sun', tasks: completedTasks > 0 ? completedTasks : 6 }, // Use real data point for today
    ];
  }, [completedTasks]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    setTasks(tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update status');
      setTasks(initialTasks);
    }
  };

  const handleModalSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Task updated');
      } else {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Task created');
      }
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong');
      throw error;
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Good afternoon, {userName}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here is what is happening with your tasks today.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: ListFilter, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400', trend: '+12%', trendUp: true },
          { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', trend: '+4%', trendUp: true },
          { label: 'In Progress', value: pendingTasks, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400', trend: '-2%', trendUp: false },
          { label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400', trend: '+1%', trendUp: true },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex flex-col justify-between group interactive-scale cursor-default">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.color} transition-colors`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center text-xs font-semibold ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Task List */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Tasks</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search tasks (Press /)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">
            {filteredTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                  <FilePlus2 className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900 dark:text-slate-300">No tasks found</p>
                  <Button variant="ghost" size="sm" onClick={openCreateModal} className="mt-2 text-indigo-500 hover:text-indigo-600">
                    Get started by creating a new task
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredTasks.map((task) => (
                  <li 
                    key={task.id} 
                    onClick={() => openEditModal(task)}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={(e) => toggleTaskStatus(task.id, task.status, e)}
                        className="mt-0.5 text-slate-300 hover:text-emerald-500 dark:text-slate-600 transition-colors transform active:scale-90"
                      >
                        {task.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div>
                        <div className={`font-medium text-sm transition-colors ${task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.title}
                        </div>
                        {task.dueDate && (
                          <div className={`text-xs mt-1.5 flex items-center gap-1.5 ${isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            <Clock className="w-3 h-3" />
                            {isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={task.priority.toLowerCase() as any} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        {task.priority}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Activity Widget */}
        <Card className="flex flex-col h-[500px]">
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Productivity Overview</h2>
          </div>
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div className="h-[250px] w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {completedTasks === totalTasks && totalTasks > 0 
                  ? "Incredible! You've finished everything."
                  : "Keep going! You're making great progress."}
              </p>
            </div>
          </div>
        </Card>

      </div>
      
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
      />
    </div>
  );
}
