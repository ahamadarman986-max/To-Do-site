'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task } from '@prisma/client';
import { format, isPast } from 'date-fns';
import { ArrowUpDown, CheckCircle2, Circle, Plus, Search, Trash2, Edit2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { TaskModal, TaskFormData } from './TaskModal';

type SortConfig = {
  key: keyof Task | null;
  direction: 'asc' | 'desc';
};

export default function ListClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'asc' });
  const [deleteTaskCandidate, setDeleteTaskCandidate] = useState<Task | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getPriorityWeight = (priority: string) => {
    if (priority === 'HIGH') return 3;
    if (priority === 'MEDIUM') return 2;
    return 1;
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let filterableTasks = tasks.filter((task) => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortConfig.key) {
      filterableTasks.sort((a, b) => {
        if (sortConfig.key === 'priority') {
          const weightA = getPriorityWeight(a.priority);
          const weightB = getPriorityWeight(b.priority);
          return sortConfig.direction === 'asc' ? weightA - weightB : weightB - weightA;
        }
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filterableTasks;
  }, [tasks, searchQuery, sortConfig]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
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

  const executeDelete = async () => {
    if (!deleteTaskCandidate) return;
    const taskToDelete = deleteTaskCandidate;
    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
    setDeleteTaskCandidate(null);

    try {
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">List View</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Detailed overview of all your tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
          <Button variant="primary" size="sm" className="shadow-indigo-500/20 shadow-lg" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0f172a]/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6 w-12"></th>
                <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors group" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Task <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors group" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors group" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">Due Date <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors group" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 pr-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sortedAndFilteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <CheckCircle2 className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-300">No tasks found</p>
                      <p className="text-sm mt-1">Try adjusting your search or add a new task.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTasks.map((task) => (
                  <tr key={task.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 pl-6 align-top pt-5">
                      <button 
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="text-slate-300 hover:text-emerald-500 dark:text-slate-600 transition-colors focus:outline-none transform active:scale-90"
                      >
                        {task.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => openEditModal(task)}>
                      <div className={`font-medium transition-all ${task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                        {task.title}
                      </div>
                      {task.description && <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm mt-1">{task.description}</div>}
                    </td>
                    <td className="p-4 align-top pt-5">
                      <Badge variant="neutral">{task.category}</Badge>
                    </td>
                    <td className="p-4 align-top pt-5">
                      {task.dueDate ? (
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 align-top pt-5">
                      <Badge variant={task.priority.toLowerCase() as any}>{task.priority}</Badge>
                    </td>
                    <td className="p-4 pr-6 text-right align-top pt-5">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:opacity-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteTaskCandidate(task)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
      />

      <ConfirmModal
        isOpen={!!deleteTaskCandidate}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTaskCandidate?.title}"?`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTaskCandidate(null)}
      />
    </div>
  );
}
