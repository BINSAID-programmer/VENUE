import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Loader2,
  Eye,
  PenLine,
  Users,
  Target,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import {
  AnnouncementRecord,
  AnnouncementType,
  AnnouncementStatus,
  AnnouncementAudienceType,
  AnnouncementPriority,
} from '../../../types';
import {
  AnnouncementFormData,
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_STATUSES,
  validateAnnouncementForm,
} from '../../../services/announcementsService';
import {
  ACADEMIC_UNIVERSITIES,
  ACADEMIC_COLLEGES,
  ACADEMIC_DEPARTMENTS,
  ACADEMIC_PROGRAMMES,
} from '../../../data/academicStructure';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  initialData?: AnnouncementRecord | null;
  mode: 'create' | 'edit';
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [type, setType] = useState<AnnouncementType>('General');
  const [status, setStatus] = useState<AnnouncementStatus>('Draft');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');

  // Stage 7B: Targeting State
  const [audienceType, setAudienceType] = useState<AnnouncementAudienceType>('everyone');
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>('udsm');
  const [selectedAcademicUnitId, setSelectedAcademicUnitId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>('');
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
    type?: string;
    status?: string;
    targeting?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize or reset state on open/edit
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setSummary(initialData.summary || '');
      setType(initialData.type || 'General');
      setStatus(initialData.status || 'Draft');
      setPriority(initialData.priority || 'normal');

      // Audience targeting
      setAudienceType(initialData.audienceType || 'everyone');
      setSelectedUniversityId(initialData.targetUniversityId || 'udsm');
      setSelectedAcademicUnitId(initialData.targetAcademicUnitId || '');
      setSelectedDepartmentId(initialData.targetDepartmentId || '');
      setSelectedProgrammeId(initialData.targetProgrammeId || '');
      setSelectedYearOfStudy(initialData.targetYearOfStudy || '');
      setSelectedSemester(initialData.targetSemester || '');
    } else {
      setTitle('');
      setContent('');
      setSummary('');
      setType('General');
      setStatus('Draft');
      setPriority('normal');
      setAudienceType('everyone');
      setSelectedUniversityId('udsm');
      setSelectedAcademicUnitId('');
      setSelectedDepartmentId('');
      setSelectedProgrammeId('');
      setSelectedYearOfStudy('');
      setSelectedSemester('');
    }
    setValidationErrors({});
    setSubmitError(null);
    setActiveTab('edit');
  }, [initialData, mode, isOpen]);

  // Dependent cascading data lists
  const availableAcademicUnits = useMemo(() => {
    if (!selectedUniversityId) return [];
    return ACADEMIC_COLLEGES.filter((col) => col.universityId === selectedUniversityId);
  }, [selectedUniversityId]);

  const availableDepartments = useMemo(() => {
    if (!selectedAcademicUnitId) return [];
    return ACADEMIC_DEPARTMENTS.filter(
      (dept) =>
        dept.collegeId === selectedAcademicUnitId &&
        (!selectedUniversityId || dept.universityId === selectedUniversityId)
    );
  }, [selectedAcademicUnitId, selectedUniversityId]);

  const availableProgrammes = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return ACADEMIC_PROGRAMMES.filter((prog) => prog.departmentId === selectedDepartmentId);
  }, [selectedDepartmentId]);

  const selectedProgrammeRecord = useMemo(() => {
    if (!selectedProgrammeId) return null;
    return ACADEMIC_PROGRAMMES.find((p) => p.id === selectedProgrammeId) || null;
  }, [selectedProgrammeId]);

  const availableYears = useMemo(() => {
    const maxYears = selectedProgrammeRecord?.durationYears || 4;
    return Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);
  }, [selectedProgrammeRecord]);

  // Handle University change -> Reset invalid child options
  const handleUniversityChange = (uniId: string) => {
    setSelectedUniversityId(uniId);
    setSelectedAcademicUnitId('');
    setSelectedDepartmentId('');
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('');
    setSelectedSemester('');
  };

  // Handle Academic Unit change -> Reset invalid departments & below
  const handleAcademicUnitChange = (unitId: string) => {
    setSelectedAcademicUnitId(unitId);
    setSelectedDepartmentId('');
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('');
    setSelectedSemester('');
  };

  // Handle Department change -> Reset invalid programmes & below
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    setSelectedProgrammeId('');
    setSelectedYearOfStudy('');
    setSelectedSemester('');
  };

  // Handle Programme change -> Reset year if invalid
  const handleProgrammeChange = (progId: string) => {
    setSelectedProgrammeId(progId);
    setSelectedYearOfStudy('');
    setSelectedSemester('');
  };

  if (!isOpen) return null;

  const handleAutoSummary = () => {
    if (!content.trim()) return;
    const clean = content.trim().replace(/\n+/g, ' ');
    const autoSummary = clean.slice(0, 160) + (clean.length > 160 ? '...' : '');
    setSummary(autoSummary);
  };

  // Resolved display names for target IDs
  const resolvedUniversityName =
    ACADEMIC_UNIVERSITIES.find((u) => u.id === selectedUniversityId)?.name || 'University of Dar es Salaam';
  const resolvedAcademicUnitName =
    availableAcademicUnits.find((u) => u.id === selectedAcademicUnitId)?.name || undefined;
  const resolvedDepartmentName =
    availableDepartments.find((d) => d.id === selectedDepartmentId)?.name || undefined;
  const resolvedProgrammeName =
    availableProgrammes.find((p) => p.id === selectedProgrammeId)?.name || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const formData: AnnouncementFormData = {
      title: title.trim(),
      content: content.trim(),
      summary: summary.trim() ? summary.trim() : undefined,
      type,
      status,
      priority,
      audienceType,
      targetUniversityId: audienceType === 'targeted' ? selectedUniversityId : undefined,
      targetUniversityName: audienceType === 'targeted' ? resolvedUniversityName : undefined,
      targetAcademicUnitId: audienceType === 'targeted' ? selectedAcademicUnitId || undefined : undefined,
      targetAcademicUnitName: audienceType === 'targeted' ? resolvedAcademicUnitName : undefined,
      targetDepartmentId: audienceType === 'targeted' ? selectedDepartmentId || undefined : undefined,
      targetDepartmentName: audienceType === 'targeted' ? resolvedDepartmentName : undefined,
      targetProgrammeId: audienceType === 'targeted' ? selectedProgrammeId || undefined : undefined,
      targetProgrammeName: audienceType === 'targeted' ? resolvedProgrammeName : undefined,
      targetYearOfStudy: audienceType === 'targeted' ? selectedYearOfStudy || undefined : undefined,
      targetSemester: audienceType === 'targeted' ? selectedSemester || undefined : undefined,
    };

    const validation = validateAnnouncementForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error('Error submitting announcement:', err);
      setSubmitError(err?.message || 'Failed to save announcement. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPublishedEdit = mode === 'edit' && initialData?.status === 'Published';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === 'create' ? 'Create Institutional Announcement' : 'Edit Announcement'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'create'
                  ? 'Publish a general notice or target a specific faculty, department, or degree cohort'
                  : `Updating announcement ${initialData?.announcementId || ''}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Editor vs Live Preview */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Audience & Feed Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {audienceType === 'everyone' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-3 h-3" />
                Everyone
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Target className="w-3 h-3" />
                Targeted Audience
              </span>
            )}
          </div>
        </div>

        {/* Notice for editing already published announcement */}
        {isPublishedEdit && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-200">Active Notice Modification Alert</p>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                This announcement is currently <strong>Published</strong>. Modifying audience targeting or category type will immediately adjust which students and lecturers can see it in their live feeds.
              </p>
            </div>
          </div>
        )}

        {/* Submit Error Banner */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{submitError}</p>
          </div>
        )}

        {/* Scrollable Form / Preview Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'edit' ? (
            <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Title Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">
                    Announcement Title <span className="text-rose-400">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      title.length > 200
                        ? 'text-rose-400 font-bold'
                        : title.length >= 3
                        ? 'text-slate-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {title.length} / 200
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="e.g. Schedule of Semester II University Examinations (UE) 2025/2026"
                  maxLength={220}
                  className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    validationErrors.title
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {validationErrors.title && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{validationErrors.title}</span>
                  </p>
                )}
              </div>

              {/* Type, Priority, and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Category Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AnnouncementType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-slate-900 text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="normal" className="bg-slate-900 text-white">
                      Normal Notice
                    </option>
                    <option value="important" className="bg-slate-900 text-rose-400">
                      High Priority (Pinned Alert)
                    </option>
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Draft" className="bg-slate-900 text-amber-400">
                      Draft (Admin Only)
                    </option>
                    <option value="Published" className="bg-slate-900 text-emerald-400">
                      Published (Active Feed)
                    </option>
                    <option value="Archived" className="bg-slate-900 text-slate-400">
                      Archived (Historical)
                    </option>
                  </select>
                </div>
              </div>

              {/* Stage 7B: Academic Audience Targeting Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Academic Audience & Targeting
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Configure whether this notice is universal or scoped to specific academic units, departments, or cohorts.
                    </p>
                  </div>

                  {/* Audience Scope Radios */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAudienceType('everyone')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        audienceType === 'everyone'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Everyone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceType('targeted')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        audienceType === 'targeted'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Targeted</span>
                    </button>
                  </div>
                </div>

                {audienceType === 'everyone' ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-300">Universal Broadcast</p>
                      <p className="text-[11px] text-slate-400">
                        Visible to all authenticated students and lecturers across the entire university network.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {validationErrors.targeting && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{validationErrors.targeting}</span>
                      </p>
                    )}

                    {/* Step 1: University */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>1. University / Institution</span>
                      </label>
                      <select
                        value={selectedUniversityId}
                        onChange={(e) => handleUniversityChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        {ACADEMIC_UNIVERSITIES.map((u) => (
                          <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                            {u.name} ({u.short})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Step 2: Academic Unit & Step 3: Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Academic Unit (College / School) */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>2. Academic Unit (College / School)</span>
                        </label>
                        <select
                          value={selectedAcademicUnitId}
                          onChange={(e) => handleAcademicUnitChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                          <option value="">-- All Units in {resolvedUniversityName} --</option>
                          {availableAcademicUnits.map((unit) => (
                            <option key={unit.id} value={unit.id} className="bg-slate-900 text-white">
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Department */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>3. Department</span>
                        </label>
                        <select
                          value={selectedDepartmentId}
                          disabled={!selectedAcademicUnitId}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="">
                            {selectedAcademicUnitId
                              ? '-- All Departments in selected Unit --'
                              : '-- Select an Academic Unit first --'}
                          </option>
                          {availableDepartments.map((dept) => (
                            <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Step 4: Degree Programme */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>4. Degree Programme</span>
                      </label>
                      <select
                        value={selectedProgrammeId}
                        disabled={!selectedDepartmentId}
                        onChange={(e) => handleProgrammeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <option value="">
                          {selectedDepartmentId
                            ? '-- All Programmes in selected Department --'
                            : '-- Select a Department first --'}
                        </option>
                        {availableProgrammes.map((prog) => (
                          <option key={prog.id} value={prog.id} className="bg-slate-900 text-white">
                            {prog.name} ({prog.short})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Step 5: Year of Study & Step 6: Semester */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Year of Study */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>5. Year of Study</span>
                        </label>
                        <select
                          value={selectedYearOfStudy}
                          onChange={(e) => setSelectedYearOfStudy(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                          <option value="">-- All Years of Study --</option>
                          {availableYears.map((yr) => (
                            <option key={yr} value={yr} className="bg-slate-900 text-white">
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Semester */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>6. Semester</span>
                        </label>
                        <select
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                          <option value="">-- Both Semesters --</option>
                          <option value="Semester 1" className="bg-slate-900 text-white">
                            Semester 1
                          </option>
                          <option value="Semester 2" className="bg-slate-900 text-white">
                            Semester 2
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Summary Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Summary / Teaser</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSummary}
                    disabled={!content.trim()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                    title="Generate teaser from first sentence"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate from content</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short 1-2 sentence preview displayed in announcements list cards..."
                  maxLength={300}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Content Body Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">
                    Announcement Content <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {content.length} characters
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (validationErrors.content) {
                      setValidationErrors((prev) => ({ ...prev, content: undefined }));
                    }
                  }}
                  placeholder="Type the full announcement message, directives, timetable dates, and instructions here..."
                  className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none transition leading-relaxed ${
                    validationErrors.content
                      ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                {validationErrors.content && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{validationErrors.content}</span>
                  </p>
                )}
              </div>
            </form>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-5">
              {/* Admin Targeting Preview (Stage 7B requirement) */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Administrative Audience Targeting Preview
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Audience Scope</span>
                    <span className="font-bold text-white capitalize">
                      {audienceType === 'everyone' ? 'Everyone (All Users)' : 'Targeted Cohort'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">University</span>
                    <span className="font-medium text-slate-200">
                      {audienceType === 'everyone' ? 'All Universities' : resolvedUniversityName}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Academic Unit</span>
                    <span className="font-medium text-slate-200">
                      {audienceType === 'everyone' || !selectedAcademicUnitId
                        ? 'All Academic Units'
                        : resolvedAcademicUnitName}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Department</span>
                    <span className="font-medium text-slate-200">
                      {audienceType === 'everyone' || !selectedDepartmentId
                        ? 'All Departments'
                        : resolvedDepartmentName}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Programme</span>
                    <span className="font-medium text-slate-200">
                      {audienceType === 'everyone' || !selectedProgrammeId
                        ? 'All Programmes'
                        : resolvedProgrammeName}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Year & Semester</span>
                    <span className="font-medium text-slate-200">
                      {selectedYearOfStudy || 'All Years'} • {selectedSemester || 'All Semesters'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feed Card Simulation */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  How Students & Lecturers will see this in the Feed:
                </span>
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-blue-500/10 text-sky-400 border-blue-500/30">
                          {type}
                        </span>
                        {priority === 'important' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold border bg-rose-500/10 text-rose-400 border-rose-500/30">
                            High Priority
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Just now
                        </span>
                        {audienceType === 'targeted' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Targeted: {resolvedProgrammeName || resolvedDepartmentName || resolvedAcademicUnitName || 'Department'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Universal
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {title || 'Announcement Title Preview'}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {summary || content || 'Announcement content will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'edit' && (
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Audience Preview</span>
              </button>
            )}

            <button
              type="submit"
              form="announcement-form"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {mode === 'create'
                      ? status === 'Published'
                        ? 'Publish Announcement'
                        : 'Save as Draft'
                      : 'Save Changes'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
