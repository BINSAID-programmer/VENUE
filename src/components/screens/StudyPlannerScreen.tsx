import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  Target,
  AlertCircle,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';
import { StudyTask, WeeklyGoal, ExamCountdown, Course } from '../../types';
import { analyticsTracker } from '../../services/analyticsTrackerService';

interface StudyPlannerScreenProps {
  tasks: StudyTask[];
  weeklyGoals: WeeklyGoal[];
  exams: ExamCountdown[];
  courses: Course[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: StudyTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const StudyPlannerScreen: React.FC<StudyPlannerScreenProps> = ({
  tasks,
  weeklyGoals,
  exams,
  courses,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'exams'>('daily');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourse, setNewTaskCourse] = useState(courses[0]?.code || 'General');
  const [newTaskTime, setNewTaskTime] = useState('16:00 - 18:00');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const totalScheduledMinutes = tasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 60), 0);
  const completedMinutes = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 60), 0);
  const completedHours = Number((completedMinutes / 60).toFixed(1));
  const scheduledHours = Number((totalScheduledMinutes / 60).toFixed(1));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      courseCode: newTaskCourse,
      date: 'Today',
      timeSlot: newTaskTime,
      estimatedMinutes: 90,
      completed: false,
      priority: newTaskPriority,
    };

    onAddTask(newTask);
    analyticsTracker.trackPlannerTask('create', newTask.id, newTask.courseCode);
    setNewTaskTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* Title & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Study Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage daily blocks, weekly milestones & exams</p>
        </div>
        <button
          id="planner-add-task-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Daily Completion</p>
          <p className="text-lg font-bold text-white mt-0.5">{completionPercent}%</p>
          <span className="text-[10px] text-slate-500">{completedCount}/{tasks.length} Done</span>
        </div>
        <div className="border-x border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium">Task Hours</p>
          <p className="text-lg font-bold text-sky-400 mt-0.5">{completedHours} hrs</p>
          <span className="text-[10px] text-slate-500">
            {scheduledHours > 0 ? `Planned: ${scheduledHours} hrs` : 'No tasks planned'}
          </span>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium">Active Courses</p>
          <p className="text-lg font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
            <Target className="w-4 h-4 text-amber-400" />
            {courses.length}
          </p>
          <span className="text-[10px] text-slate-500">Current Semester</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
        <button
          id="planner-tab-daily"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'daily'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Schedule ({tasks.length})
        </button>
        <button
          id="planner-tab-weekly"
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'weekly'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weekly Goals ({weeklyGoals.length})
        </button>
        <button
          id="planner-tab-exams"
          onClick={() => setActiveTab('exams')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'exams'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Exam Countdown ({exams.length})
        </button>
      </div>

      {/* Tab 1: Daily Schedule */}
      {activeTab === 'daily' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Time Blocks</span>
            <span>Tap checkbox to mark done</span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">No study tasks scheduled yet</p>
              <p className="text-[11px] text-slate-400">
                Add your first study task to organize your revision and coursework blocks.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-850 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 text-slate-100 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => {
                  onToggleTask(task.id);
                  if (!task.completed) {
                    analyticsTracker.trackPlannerTask('complete', task.id, task.courseCode);
                  }
                }}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="truncate">
                  <h4
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-sky-400">{task.courseCode}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.timeSlot}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
                    task.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Weekly Goals */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Track your target study hours by academic discipline
          </p>

          {weeklyGoals.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">No weekly goals set yet</p>
              <p className="text-[11px] text-slate-400">
                Create daily study tasks or start an Exam Preparation plan in AI Tutor to build your weekly targets.
              </p>
            </div>
          ) : (
            weeklyGoals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentHours / goal.targetHours) * 100), 100);
            return (
              <div key={goal.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{goal.title}</h4>
                    <span className="text-[10px] text-slate-400">{goal.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-400">{goal.currentHours}</span>
                    <span className="text-xs text-slate-400"> / {goal.targetHours} hrs</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
            })
          )}
        </div>
      )}

      {/* Tab 3: Exam Countdown */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            University Examinations (UE) & Continuous Assessment (CA) schedules
          </p>

          {exams.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">No upcoming exams added yet</p>
              <p className="text-[11px] text-slate-400">
                When your course test or examination dates are announced, they will appear here.
              </p>
            </div>
          ) : (
            exams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-sky-400 border border-blue-500/30">
                    {exam.courseCode}
                  </span>
                  <span className="text-[11px] text-slate-400">{exam.date}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{exam.examName}</h4>
                <p className="text-[11px] text-slate-400">Venue: {exam.venue}</p>
                <p className="text-[10px] text-slate-500">{exam.sessionTime}</p>
              </div>

              <div className="text-right shrink-0 p-3 rounded-xl bg-slate-950 border border-slate-850">
                <div className="text-2xl font-black text-amber-400 font-['Space_Grotesk'] leading-none">
                  {exam.daysRemaining}
                </div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mt-1">Days Left</div>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Study Task</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Description</label>
                <input
                  id="new-task-title-input"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Revise Lecture Notes & Practice Questions"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course</label>
                <select
                  value={newTaskCourse}
                  onChange={(e) => setNewTaskCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="General">General Study</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot</label>
                <input
                  type="text"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  placeholder="16:00 - 18:00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        newTaskPriority === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  id="confirm-add-task-btn"
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
