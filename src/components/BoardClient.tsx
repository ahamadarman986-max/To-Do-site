'use client';

import { useState, useEffect } from 'react';
import { Task } from '@prisma/client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, Clock, GripVertical, Plus, Trash2, Search } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { TaskModal, TaskFormData } from './TaskModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function BoardClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskCandidate, setDeleteTaskCandidate] = useState<Task | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const columns = [
    { id: 'PENDING', title: 'To Do', color: 'bg-slate-100/50 dark:bg-slate-900/30' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
  ];

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskToMove = tasks.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // Optimistic UI update
    const newStatus = destination.droppableId as 'PENDING' | 'COMPLETED';
    const updatedTasks = tasks.map((t) => t.id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
      toast.success(`Moved to ${newStatus === 'COMPLETED' ? 'Completed' : 'To Do'}`);
    } catch (error) {
      toast.error('Failed to update task status');
      setTasks(initialTasks); // Revert on failure
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const updatedTasks = tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
      router.refresh();
      toast.success(`Task marked as ${newStatus === 'COMPLETED' ? 'done' : 'to do'}`);
    } catch (error) {
      toast.error('Failed to update task status');
      setTasks(initialTasks); // Revert on failure
    }
  };

  const executeDelete = async () => {
    if (!deleteTaskCandidate) return;
    const taskToDelete = deleteTaskCandidate;
    
    // Optimistic update
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

  const openEditModal = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter((task) => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Board View</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Organize your workflow by dragging tasks across columns.</p>
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
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start min-w-max">
            {columns.map((column) => (
              <div key={column.id} className={`w-80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-full overflow-hidden ${column.color}`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 tracking-tight">{column.title}</h3>
                  <Badge variant="neutral">{filteredTasks.filter((t) => t.status === column.id).length}</Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[200px] transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                    >
                      {filteredTasks
                        .filter((t) => t.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                glass
                                onClick={(e) => openEditModal(task, e as any)}
                                className={`p-4 group cursor-pointer border ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500/50 scale-[1.02] border-indigo-500 rotate-1' : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'}`}
                              >
                                <div className="flex items-start gap-2">
                                  <div {...provided.dragHandleProps} className="mt-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <h4 className={`font-semibold text-sm leading-tight mb-2 transition-all ${task.status === 'COMPLETED' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                        {task.title}
                                      </h4>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id, task.status); }}
                                        className="text-slate-300 hover:text-emerald-500 dark:text-slate-600 dark:hover:text-emerald-400 transition-colors ml-2 focus:outline-none flex-shrink-0"
                                      >
                                        {task.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                                      </button>
                                    </div>
                                    
                                    {task.description && (
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between mt-auto pt-2">
                                      <Badge variant={task.priority.toLowerCase() as any}>{task.priority}</Badge>
                                      
                                      <div className="flex items-center gap-3">
                                        {task.dueDate && (
                                          <div className={`text-[11px] flex items-center gap-1 font-medium ${isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED' ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <Clock className="w-3 h-3" />
                                            {isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
                                          </div>
                                        )}
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setDeleteTaskCandidate(task); }}
                                          className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

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
