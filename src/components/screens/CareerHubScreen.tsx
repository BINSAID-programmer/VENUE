import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  SlidersHorizontal,
  Bookmark,
  Send,
  Flag,
  Layers,
  GraduationCap,
  FolderGit2,
  Building2,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  StudentProfile,
  Course,
  CareerPath,
  MatchedCareerRecommendation,
  StudentCareerPreference,
  StudentCareerRoadmap,
  AICareerAdvisorMessage,
  AICareerReportCategory,
} from '../../types';
import {
  careerHubService,
  AcademicCareerAlignmentSummary,
} from '../../services/careerHubService';
import { ScholarshipsScreen } from './ScholarshipsScreen';
import { MathRenderer } from '../MathRenderer';

interface CareerHubScreenProps {
  careerPaths?: CareerPath[];
  profile?: StudentProfile;
  courses?: Course[];
  onNavigateToProfile?: () => void;
}

const ADVISOR_QUICK_PROMPTS = [
  'What careers can I pursue with my degree?',
  'Which career best matches my skills?',
  'What skills am I missing for my target career?',
  'What projects should I build for my current year of study?',
  'What postgraduate degrees fit my career goal?',
  'Give me a 2-year roadmap for internships and graduate roles.',
  'How can I improve my CV and prepare for technical interviews?',
];

export const CareerHubScreen: React.FC<CareerHubScreenProps> = ({
  profile,
  courses = [],
}) => {
  const [activeSection, setActiveSection] = useState<
    'paths' | 'roadmap' | 'advisor' | 'opportunities'
  >('paths');
  const [loading, setLoading] = useState<boolean>(true);
  const [exploreAllMode, setExploreAllMode] = useState<boolean>(false);

  const [alignment, setAlignment] = useState<AcademicCareerAlignmentSummary | null>(null);
  const [recommendations, setRecommendations] = useState<MatchedCareerRecommendation[]>([]);
  const [preferences, setPreferences] = useState<StudentCareerPreference | null>(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState<StudentCareerRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<StudentCareerRoadmap | null>(null);

  const [expandedCareerId, setExpandedCareerId] = useState<string>('');
  const [expandedCourseConnectionId, setExpandedCourseConnectionId] = useState<string>('');

  // Preferences Modal State
  const [isPrefModalOpen, setIsPrefModalOpen] = useState<boolean>(false);
  const [prefInterestsInput, setPrefInterestsInput] = useState<string>('');
  const [prefIndustriesInput, setPrefIndustriesInput] = useState<string>('');
  const [prefSkillsInput, setPrefSkillsInput] = useState<string>('');
  const [prefLocation, setPrefLocation] = useState<string>('Tanzania');
  const [prefWorkArrangement, setPrefWorkArrangement] = useState<
    'On-site' | 'Remote' | 'Hybrid' | 'Flexible'
  >('Flexible');
  const [prefCareerGoals, setPrefCareerGoals] = useState<string>('');
  const [prefPostgrad, setPrefPostgrad] = useState<string>('');
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);

  // AI Career Advisor State
  const [advisorSelectedCareerId, setAdvisorSelectedCareerId] = useState<string>('');
  const [advisorInput, setAdvisorInput] = useState<string>('');
  const [advisorLoading, setAdvisorLoading] = useState<boolean>(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [advisorMessages, setAdvisorMessages] = useState<AICareerAdvisorMessage[]>([]);

  // AI Safety Report Modal State (Section 37)
  const [reportingMessage, setReportingMessage] = useState<AICareerAdvisorMessage | null>(null);
  const [reportCategory, setReportCategory] = useState<AICareerReportCategory>('Incorrect information');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSubmittedMsg, setReportSubmittedMsg] = useState<string | null>(null);

  const effectiveProfile: StudentProfile = profile || ({
    uid: '',
    name: 'Student',
    creatorTag: 'VENUE Student',
    email: '',
    avatar: '',
    country: 'Tanzania',
    university: '',
    universityShort: '',
    college: '',
    department: '',
    programme: '',
    programmeShort: '',
    degreeLevel: "Bachelor's Degree",
    yearOfStudy: 'Year 1',
    semester: 'Semester 1',
    academicYear: '2025/2026',
    gpa: 0,
    gpaMax: 5.0,
    creditsCompleted: 0,
    totalCreditsRequired: 0,
    studyStreakDays: 0,
    studyHoursThisWeek: 0,
    skills: [],
    achievements: [],
  } as StudentProfile);

  // Load dynamic career recommendations and saved roadmaps
  useEffect(() => {
    let isMounted = true;
    const loadCareerHub = async () => {
      setLoading(true);
      try {
        const [recResult, roadmaps] = await Promise.all([
          careerHubService.getCareerRecommendations(
            effectiveProfile,
            courses,
            exploreAllMode
          ),
          careerHubService.getSavedCareerRoadmaps(effectiveProfile.uid),
        ]);

        if (!isMounted) return;
        setAlignment(recResult.alignment);
        setRecommendations(recResult.recommendations);
        setPreferences(recResult.preferences);
        setSavedRoadmaps(roadmaps);

        if (roadmaps.length > 0 && !activeRoadmap) {
          setActiveRoadmap(roadmaps[0]);
        }

        if (recResult.recommendations.length > 0) {
          const firstId = recResult.recommendations[0].career.id;
          setExpandedCareerId((prev) => prev || firstId);
          setAdvisorSelectedCareerId((prev) => prev || firstId);
        }

        // Sync form inputs
        const p = recResult.preferences;
        setPrefInterestsInput((p.careerInterests || []).join(', '));
        setPrefIndustriesInput((p.preferredIndustries || []).join(', '));
        setPrefSkillsInput((p.knownSkills || []).join(', '));
        setPrefLocation(p.preferredLocation || 'Tanzania');
        setPrefWorkArrangement(p.workArrangement || 'Flexible');
        setPrefCareerGoals(p.careerGoals || '');
        setPrefPostgrad(p.preferredPostgraduateDirection || '');
      } catch (err) {
        console.warn('CareerHubScreen: Error loading recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCareerHub();
    return () => {
      isMounted = false;
    };
  }, [
    effectiveProfile.uid,
    effectiveProfile.programmeId,
    effectiveProfile.programmeName,
    effectiveProfile.departmentId,
    effectiveProfile.yearOfStudy,
    effectiveProfile.semester,
    courses.length,
    exploreAllMode,
  ]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const parseList = (raw: string) =>
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      const updated = await careerHubService.saveStudentCareerPreferences(
        {
          careerInterests: parseList(prefInterestsInput),
          preferredIndustries: parseList(prefIndustriesInput),
          knownSkills: parseList(prefSkillsInput),
          preferredLocation: prefLocation.trim() || 'Tanzania',
          workArrangement: prefWorkArrangement,
          careerGoals: prefCareerGoals.trim(),
          preferredPostgraduateDirection: prefPostgrad.trim(),
        },
        effectiveProfile.uid
      );
      setPreferences(updated);

      const refreshed = await careerHubService.getCareerRecommendations(
        effectiveProfile,
        courses,
        exploreAllMode
      );
      setAlignment(refreshed.alignment);
      setRecommendations(refreshed.recommendations);
      setIsPrefModalOpen(false);
    } catch (err) {
      console.warn('Error saving career preferences:', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleToggleSaveCareer = async (careerId: string) => {
    if (!preferences) return;
    const existing = preferences.savedCareerIds || [];
    const nextSaved = existing.includes(careerId)
      ? existing.filter((id) => id !== careerId)
      : [...existing, careerId];

    const updated = await careerHubService.saveStudentCareerPreferences(
      { savedCareerIds: nextSaved },
      effectiveProfile.uid
    );
    setPreferences(updated);
  };

  const handleBuildRoadmap = async (rec: MatchedCareerRecommendation) => {
    const prefs = preferences || (await careerHubService.getStudentCareerPreferences(effectiveProfile.uid));
    const generated = await careerHubService.generatePersonalCareerRoadmap(
      effectiveProfile,
      rec,
      prefs
    );
    setActiveRoadmap(generated);
    const updatedList = await careerHubService.getSavedCareerRoadmaps(effectiveProfile.uid);
    setSavedRoadmaps(updatedList.length > 0 ? updatedList : [generated]);
    setActiveSection('roadmap');
  };

  const handleAskAdvisorAboutCareer = (rec: MatchedCareerRecommendation, initialPrompt?: string) => {
    setAdvisorSelectedCareerId(rec.career.id);
    setActiveSection('advisor');
    if (initialPrompt) {
      handleSendAdvisorQuestion(initialPrompt, rec);
    }
  };

  const handleSendAdvisorQuestion = async (
    questionText?: string,
    overrideCareer?: MatchedCareerRecommendation
  ) => {
    const q = (questionText ?? advisorInput).trim();
    if (!q || advisorLoading) return;

    const userMsg: AICareerAdvisorMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString(),
    };

    setAdvisorMessages((prev) => [...prev, userMsg]);
    if (!questionText) setAdvisorInput('');
    setAdvisorLoading(true);
    setAdvisorError(null);

    const targetRec =
      overrideCareer ||
      recommendations.find((r) => r.career.id === advisorSelectedCareerId) ||
      recommendations[0] ||
      null;

    try {
      const response = await careerHubService.askAICareerAdvisor({
        question: q,
        profile: effectiveProfile,
        courses,
        selectedCareer: targetRec,
        preferences,
        savedRoadmap: activeRoadmap,
        conversationHistory: advisorMessages.map((m) => ({
          role: m.sender,
          text: m.text,
        })),
      });

      const advisorMsg: AICareerAdvisorMessage = {
        id: `adv_${Date.now()}`,
        sender: 'advisor',
        text: response.answer,
        timestamp: new Date().toISOString(),
        epistemicTags: response.epistemicTags,
        suggestedFollowUps: response.suggestedFollowUps,
      };
      setAdvisorMessages((prev) => [...prev, advisorMsg]);
    } catch (err: any) {
      setAdvisorError(err?.message || 'Unable to reach VENUE Career Advisor right now.');
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleSubmitSafetyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessage) return;

    await careerHubService.reportAdvisorResponse({
      messageId: reportingMessage.id,
      messageExcerpt: reportingMessage.text,
      category: reportCategory,
      details: reportDetails,
      careerContext: advisorSelectedCareerId,
      programmeName: alignment?.programmeTitle,
      userId: effectiveProfile.uid,
    });

    setAdvisorMessages((prev) =>
      prev.map((m) => (m.id === reportingMessage.id ? { ...m, reported: true } : m))
    );
    setReportSubmittedMsg('Report submitted. Thank you for helping keep VENUE Career Advisor accurate and safe.');
    setTimeout(() => {
      setReportingMessage(null);
      setReportDetails('');
      setReportSubmittedMsg(null);
    }, 1500);
  };

  const hasPreferencesConfigured = Boolean(
    preferences &&
      ((preferences.careerInterests && preferences.careerInterests.length > 0) ||
        (preferences.knownSkills && preferences.knownSkills.length > 0) ||
        preferences.careerGoals)
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      {/* 1. Dynamic Header & Subtitle (Section 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Career Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {alignment?.dynamicSubtitle ||
              'Career paths and opportunities matched to your academic journey'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPrefModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Career Preferences</span>
        </button>
      </div>

      {/* 2. Academic Profile Summary Card (Section 3) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            Your Career Profile
          </span>
          {preferences?.preferredLocation && (
            <span className="text-[11px] text-slate-400">
              Location Focus: <strong className="text-slate-200">{preferences.preferredLocation}</strong> ({preferences.workArrangement})
            </span>
          )}
        </div>

        {alignment?.isProfileConfigured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <p className="text-slate-400">
                Programme:{' '}
                <strong className="text-white">{alignment.programmeTitle}</strong>
              </p>
              {(alignment.yearLabel || alignment.semesterLabel) && (
                <p className="text-slate-400">
                  Level:{' '}
                  <strong className="text-slate-200">
                    {[alignment.yearLabel, alignment.semesterLabel].filter(Boolean).join(' · ')}
                  </strong>
                </p>
              )}
              {alignment.departmentTitle && (
                <p className="text-slate-400">
                  Department:{' '}
                  <span className="text-slate-300">{alignment.departmentTitle}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              {alignment.currentAcademicFocus.length > 0 && (
                <p className="text-slate-400">
                  Current focus:{' '}
                  <span className="text-slate-200 font-medium">
                    {alignment.currentAcademicFocus.join(' / ')}
                  </span>
                </p>
              )}
              {alignment.potentialCareerAreas.length > 0 && (
                <p className="text-slate-400">
                  Potential career areas:{' '}
                  <span className="text-sky-300 font-medium">
                    {alignment.potentialCareerAreas.join(' • ')}
                  </span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-300">
            Your academic programme placement is not yet configured. Complete your academic profile setup to receive course-matched career paths.
          </div>
        )}

        {!hasPreferencesConfigured ? (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">
              Complete your career preferences to improve your recommendations.
            </span>
            <button
              type="button"
              onClick={() => setIsPrefModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Set Interests & Skills →
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              {preferences?.knownSkills && preferences.knownSkills.length > 0 && (
                <span>
                  Declared skills:{' '}
                  <strong className="text-slate-200">
                    {preferences.knownSkills.join(' · ')}
                  </strong>
                </span>
              )}
              {preferences?.careerGoals && (
                <span className="block sm:inline sm:ml-3">
                  Goal: <strong className="text-slate-200">{preferences.careerGoals}</strong>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsPrefModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* 3. Academic-to-Career Alignment Card (Section 4) */}
      {alignment && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40 border border-blue-500/25 space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white">
              {alignment.alignmentHeadline}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {alignment.alignmentExplanation}
          </p>
        </div>
      )}

      {/* 4. Navigation Tabs inside Career Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSection('paths')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSection === 'paths'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Career Paths ({recommendations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('roadmap')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSection === 'roadmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>My Roadmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('advisor')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSection === 'advisor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Career Advisor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('opportunities')}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeSection === 'opportunities'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Opportunities</span>
        </button>
      </div>

      {/* ====================================================================
          TAB 1: CAREER PATHS & DETAILED COURSE-AWARE CARDS (Sections 5–18, 32)
         ==================================================================== */}
      {activeSection === 'paths' && (
        <div className="space-y-3.5">
          {loading ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Analyzing your programme curriculum and matching career paths...
            </div>
          ) : recommendations.length === 0 ? (
            /* Section 39 Empty State */
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                Career recommendations are not available yet for this programme.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                We do not display unrelated default careers unless you choose to explore all disciplines across VENUE.
              </p>
              <button
                type="button"
                onClick={() => setExploreAllMode(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Explore all career paths
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing {recommendations.length} career path(s) evaluate-matched for your profile
                </span>
                <button
                  type="button"
                  onClick={() => setExploreAllMode(!exploreAllMode)}
                  className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  {exploreAllMode ? 'Show My Discipline Only' : 'Explore All Career Paths'}
                </button>
              </div>

              {recommendations.map((rec) => {
                const { career, matchLabel, matchFactors, matchedDegreeCourses, skillGap, levelAppropriateProjects } = rec;
                const isExpanded = expandedCareerId === career.id;
                const isSaved = Boolean(preferences?.savedCareerIds?.includes(career.id));

                return (
                  <div
                    key={career.id}
                    className={`rounded-2xl border transition-all ${
                      isExpanded
                        ? 'bg-slate-900 border-blue-500/40 shadow-lg'
                        : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header (Section 32) */}
                    <div
                      onClick={() => setExpandedCareerId(isExpanded ? '' : career.id)}
                      className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {career.title}
                            </h4>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                matchLabel === 'Strong Match'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : matchLabel === 'Good Match'
                                  ? 'bg-blue-500/15 text-sky-300 border-blue-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {matchLabel}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400">
                            Demand:{' '}
                            <span className="text-slate-300 font-medium">
                              {career.demandLevel === 'Unknown'
                                ? 'Demand data unavailable'
                                : career.demandLevel}
                            </span>
                            {' · '}
                            <span>{matchedDegreeCourses.length} Programme Course(s) Linked</span>
                          </p>
                          <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                            {career.shortDescription}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSaveCareer(career.id);
                          }}
                          title={isSaved ? 'Saved in Career Profile' : 'Save Career'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isSaved
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                        <div className="text-slate-400 p-1">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Career Detail View (Sections 7–18, 32) */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-2 space-y-5 border-t border-slate-800/80 text-xs">
                        {/* Transparent Match Basis */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                            Why This Path Matches Your Profile ({career.dataStatus})
                          </span>
                          <p className="text-slate-300 text-[11px]">
                            {matchFactors.join(' · ')}
                          </p>
                        </div>

                        {/* About This Career */}
                        <div className="space-y-1">
                          <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                            About This Career
                          </span>
                          <p className="text-slate-300 leading-relaxed">
                            {career.aboutCareer}
                          </p>
                        </div>

                        {/* Compensation Guide (Section 13: Never fabricate salary ranges!) */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Compensation Guide
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Status: {career.compensation.dataStatus}
                            </span>
                          </div>
                          {career.compensation.tanzaniaRange ||
                          career.compensation.internationalRemoteRange ? (
                            <div className="space-y-1 text-slate-200">
                              <p>
                                <strong>Tanzania:</strong>{' '}
                                {career.compensation.tanzaniaRange || 'Salary data unavailable'}
                              </p>
                              <p>
                                <strong>International / Remote:</strong>{' '}
                                {career.compensation.internationalRemoteRange ||
                                  'Salary data unavailable'}
                              </p>
                              {career.compensation.lastUpdated && (
                                <p className="text-[10px] text-slate-500">
                                  Last updated: {career.compensation.lastUpdated} · Source:{' '}
                                  {career.compensation.source}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-[11px]">
                              Salary data unavailable for this career/location.
                            </p>
                          )}
                        </div>

                        {/* Key Responsibilities */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                            Key Responsibilities
                          </span>
                          <ul className="space-y-1.5 text-slate-300">
                            {career.typicalResponsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Top Skills Required & Skill Gap Analysis (Sections 8 & 9) */}
                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                          <div>
                            <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                              Top Skills Required & Your Skill Gap Analysis
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Compared against your current coursework, AI Tutor learning progress, and declared skills
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Existing / Developing */}
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-emerald-400 block">
                                ✓ Existing / Developing ({skillGap.existingOrDeveloping.length})
                              </span>
                              {skillGap.existingOrDeveloping.length === 0 ? (
                                <p className="text-[11px] text-slate-500">
                                  No verified skill evidence recorded yet.
                                </p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {skillGap.existingOrDeveloping.map((item, i) => (
                                    <li key={i} className="text-[11px]">
                                      <span className="font-semibold text-slate-200 block">
                                        {item.skill}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.evidenceNote}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Needs Development */}
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-amber-400 block">
                                → Needs Development ({skillGap.needsDevelopment.length})
                              </span>
                              {skillGap.needsDevelopment.length === 0 ? (
                                <p className="text-[11px] text-slate-500">
                                  None flagged yet.
                                </p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {skillGap.needsDevelopment.map((item, i) => (
                                    <li key={i} className="text-[11px]">
                                      <span className="font-semibold text-slate-200 block">
                                        {item.skill}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.evidenceNote}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Not Yet Assessed */}
                            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-300 block">
                                ○ Not Yet Assessed ({skillGap.notYetAssessed.length})
                              </span>
                              {skillGap.notYetAssessed.length === 0 ? (
                                <p className="text-[11px] text-slate-500">
                                  All core skills mapped to your programme.
                                </p>
                              ) : (
                                <ul className="space-y-1.5">
                                  {skillGap.notYetAssessed.map((item, i) => (
                                    <li key={i} className="text-[11px]">
                                      <span className="font-semibold text-slate-200 block">
                                        {item.skill}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {item.evidenceNote}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>

                          {/* Your Next Skills */}
                          {skillGap.nextRecommendedSkills.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                                Your Next Skills to Prioritize
                              </span>
                              <p className="text-slate-200 font-medium text-[11px]">
                                {skillGap.nextRecommendedSkills.join(' · ')}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Recommended Degree Courses & Course -> Career Connection (Sections 10, 11, 33) */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                              Recommended Degree Courses (From Your Canonical Catalogue)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Tap a course to view Course → Career Connection
                            </span>
                          </div>

                          {matchedDegreeCourses.length === 0 ? (
                            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                              No specific canonical courses from {alignment?.programmeTitle || 'your programme'} are directly mapped to this career yet.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {matchedDegreeCourses.map((mc) => {
                                const connKey = `${career.id}_${mc.courseCode}`;
                                const isConnOpen = expandedCourseConnectionId === connKey;
                                return (
                                  <div
                                    key={mc.courseCode}
                                    className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden"
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedCourseConnectionId(isConnOpen ? '' : connKey)
                                      }
                                      className="w-full p-3 flex items-center justify-between gap-2 text-left hover:bg-slate-900/60 transition cursor-pointer"
                                    >
                                      <div>
                                        <span className="font-bold text-sky-400">
                                          {mc.courseCode}
                                        </span>{' '}
                                        <span className="font-semibold text-white">
                                          — {mc.courseTitle}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-2">
                                          {mc.yearOfStudy ? `Year ${mc.yearOfStudy}` : ''}{' '}
                                          {mc.semester ? `· Sem ${mc.semester}` : ''}{' '}
                                          {mc.coreOrElective ? `· ${mc.coreOrElective}` : ''}
                                        </span>
                                      </div>
                                      <ChevronDown
                                        className={`w-4 h-4 text-slate-400 transition-transform ${
                                          isConnOpen ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </button>

                                    {isConnOpen && (
                                      <div className="px-3 pb-3 pt-1 border-t border-slate-800/70 space-y-1.5 text-[11px]">
                                        <p className="text-slate-300">
                                          <strong className="text-white">
                                            Why it matters for {career.title}:
                                          </strong>{' '}
                                          {mc.whyItMatters}
                                        </p>
                                        <p className="text-slate-400">
                                          <strong className="text-sky-300">
                                            Skills Developed:
                                          </strong>{' '}
                                          {mc.skillsDeveloped.join(' · ')}
                                        </p>
                                        <p className="text-slate-400">
                                          <strong className="text-emerald-300">
                                            Careers Supported:
                                          </strong>{' '}
                                          {mc.careersSupported.join(' · ')}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Recognized / Relevant Certifications (Section 12) */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Recognized / Relevant Certifications
                          </span>
                          {career.certifications.length === 0 ? (
                            <p className="text-slate-400 text-[11px]">
                              Certification information unavailable.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {career.certifications.map((cert) => (
                                <div
                                  key={cert.id}
                                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-white">
                                      {cert.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {cert.requirementStatus}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-300">
                                    {cert.relevanceNote}
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>Issuing Body: {cert.issuingBody}</span>
                                    {cert.officialUrl && (
                                      <a
                                        href={cert.officialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-400 hover:underline inline-flex items-center gap-1"
                                      >
                                        <span>Official Info</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Industries & Example Career Progression (Sections 15 & 16) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                            <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-sky-400" />
                              Typical Industries
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {career.typicalIndustries.join(' • ')}
                            </p>

                            <span className="font-bold text-white uppercase text-[11px] tracking-wider block pt-2">
                              Typical Entry Requirements
                            </span>
                            <ul className="space-y-1 text-[11px] text-slate-300">
                              {career.entryRequirements.map((req, idx) => (
                                <li key={idx}>• {req}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                            <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-400" />
                              Example Career Progression
                            </span>
                            <div className="space-y-2">
                              {career.careerProgression.map((step) => (
                                <div key={step.stepIndex} className="text-[11px]">
                                  <div className="font-semibold text-slate-200">
                                    {step.stepIndex}. {step.roleTitle}{' '}
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({step.stageLabel})
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400">
                                    {step.typicalFocus}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Level-Appropriate Project Recommendations & Further Study (Sections 17 & 18) */}
                        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                          <span className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
                            Practical Project Recommendations (Matched to Your Level)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {levelAppropriateProjects.map((proj) => (
                              <div
                                key={proj.id}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                              >
                                <span className="text-[10px] text-sky-400 font-semibold">
                                  {proj.academicLevel}
                                </span>
                                <h5 className="font-bold text-white text-xs">
                                  {proj.title}
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  {proj.description}
                                </p>
                                <p className="text-[10px] text-slate-400 pt-1">
                                  Skills: {proj.skillsPracticed.join(' · ')}
                                </p>
                              </div>
                            ))}
                          </div>

                          {career.furtherStudyOptions.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                              <strong className="text-white">Further Study Options:</strong>{' '}
                              {career.furtherStudyOptions.join(' • ')}
                            </div>
                          )}
                        </div>

                        {/* Action Bar: Build My Roadmap & Ask AI Career Advisor (Section 32) */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleBuildRoadmap(rec)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer transition"
                          >
                            <Compass className="w-4 h-4" />
                            <span>Build My Career Roadmap</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAskAdvisorAboutCareer(
                                rec,
                                `How can I prepare for a career as a ${career.title} from my current ${
                                  alignment?.programmeTitle || 'degree'
                                } (${alignment?.yearLabel || 'Year 1'})?`
                              )
                            }
                            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Ask AI Career Advisor</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 2: PERSONAL CAREER ROADMAP (Section 19)
         ==================================================================== */}
      {activeSection === 'roadmap' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Personal Career Roadmap
                </h3>
                <p className="text-xs text-slate-400">
                  Adapted to your {effectiveProfile.programmeDurationYears || 3}-year{' '}
                  {alignment?.programmeTitle || 'degree'} structure and current academic level
                </p>
              </div>

              {recommendations.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={activeRoadmap?.careerId || recommendations[0]?.career.id || ''}
                    onChange={(e) => {
                      const found = recommendations.find((r) => r.career.id === e.target.value);
                      if (found) handleBuildRoadmap(found);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {recommendations.map((r) => (
                      <option key={r.career.id} value={r.career.id}>
                        {r.career.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!activeRoadmap ? (
              <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 text-center space-y-3">
                <Compass className="w-8 h-8 text-sky-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Select a career path to generate your personalized year-by-year academic and skill roadmap.
                </p>
                {recommendations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleBuildRoadmap(recommendations[0])}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Generate Roadmap for {recommendations[0].career.title}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Target Role: </span>
                    <strong className="text-white">{activeRoadmap.careerTitle}</strong>
                    <span className="text-slate-400"> · Programme Length: </span>
                    <strong className="text-sky-300">{activeRoadmap.durationYears} Years</strong>
                    <span className="text-slate-400"> · Location Focus: </span>
                    <strong className="text-slate-200">{activeRoadmap.targetLocation}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = recommendations.find(
                        (r) => r.career.id === activeRoadmap.careerId
                      );
                      if (rec) {
                        handleAskAdvisorAboutCareer(
                          rec,
                          `Review my ${activeRoadmap.durationYears}-year roadmap for ${activeRoadmap.careerTitle} and suggest specific milestones for Year ${activeRoadmap.currentYearOfStudy}.`
                        );
                      }
                    }}
                    className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    Discuss Roadmap with AI Advisor →
                  </button>
                </div>

                {activeRoadmap.years.map((yr) => (
                  <div
                    key={yr.yearNumber}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      yr.isCurrentYear
                        ? 'bg-slate-900 border-blue-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{yr.yearLabel}</span>
                        {yr.isCurrentYear && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-sky-300 border border-blue-500/30">
                            Your Current Level
                          </span>
                        )}
                        {yr.isCompletedYear && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Completed / Foundation Year
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                          Academic & Skill Focus
                        </span>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {yr.academicFocus.map((f, i) => (
                            <li key={i}>• {f}</li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-slate-400 pt-1">
                          <strong className="text-slate-200">Skills to build:</strong>{' '}
                          {yr.technicalSkillsFocus.join(' · ')}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Relevant Programme Courses & Milestones
                        </span>
                        {yr.relevantDegreeCourses.length > 0 ? (
                          <p className="text-[11px] text-slate-200">
                            {yr.relevantDegreeCourses.join(' • ')}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Core Year {yr.yearNumber} programme courses
                          </p>
                        )}
                        <ul className="space-y-1 text-slate-300 text-[11px] pt-1">
                          {yr.careerPreparationMilestones.map((m, i) => (
                            <li key={i}>→ {m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: DEDICATED AI CAREER ADVISOR (Sections 20–22, 37)
         ==================================================================== */}
      {activeSection === 'advisor' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    VENUE Career Advisor
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dedicated career guidance grounded in your {alignment?.programmeTitle || 'degree'} context
                  </p>
                </div>
              </div>

              {recommendations.length > 0 && (
                <select
                  value={advisorSelectedCareerId}
                  onChange={(e) => setAdvisorSelectedCareerId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {recommendations.map((r) => (
                    <option key={r.career.id} value={r.career.id}>
                      Focus: {r.career.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Prompt Buttons (Section 20) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Suggested Career Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ADVISOR_QUICK_PROMPTS.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAdvisorQuestion(promptText)}
                    disabled={advisorLoading}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] text-left transition cursor-pointer disabled:opacity-50"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 pt-2">
              {advisorMessages.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-medium">
                    Ask VENUE Career Advisor about career paths, missing skills, projects, internships, CVs, or postgraduate options.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    The advisor uses only your academic programme, current courses, and career preferences—and clearly distinguishes known curriculum facts from general career guidance.
                  </p>
                </div>
              ) : (
                advisorMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30 text-slate-100 ml-6'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 mr-2'
                    }`}
                  >
                    {msg.sender === 'advisor' && msg.epistemicTags && msg.epistemicTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-sky-400 font-medium border-b border-slate-800/80 pb-1.5">
                        <span>Basis: {msg.epistemicTags.join(' · ')}</span>
                      </div>
                    )}

                    {msg.sender === 'advisor' ? (
                      <div className="leading-relaxed">
                        <MathRenderer content={msg.text} variant="dark" messageId={msg.id} />
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                    )}

                    {msg.sender === 'advisor' && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowUps?.map((followUp, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendAdvisorQuestion(followUp)}
                              className="text-[10px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                            >
                              {followUp}
                            </button>
                          ))}
                        </div>

                        {/* Play Store Compliance: Report AI Response (Section 37) */}
                        <button
                          type="button"
                          onClick={() => setReportingMessage(msg)}
                          className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer ml-auto"
                        >
                          <Flag className="w-3 h-3" />
                          <span>{msg.reported ? 'Reported' : 'Report response'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {advisorLoading && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  VENUE Career Advisor is analyzing your programme and skill context...
                </div>
              )}

              {advisorError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{advisorError}</span>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAdvisorQuestion();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={advisorInput}
                onChange={(e) => setAdvisorInput(e.target.value)}
                placeholder="Ask about career paths, skills, projects, internships, or CV preparation..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={advisorLoading || !advisorInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: OPPORTUNITIES FOR YOU (Sections 24–27)
         ==================================================================== */}
      {activeSection === 'opportunities' && (
        <ScholarshipsScreen profile={effectiveProfile} courses={courses} embedded={true} />
      )}

      {/* ====================================================================
          MODAL 1: STUDENT CAREER PREFERENCES (Section 29)
         ==================================================================== */}
      {isPrefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Career Preferences</h3>
                <p className="text-xs text-slate-400">
                  Optional preferences to tailor your career recommendations & skill gap analysis
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrefModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Skills You Already Know or Are Practicing (comma-separated)
                </label>
                <input
                  type="text"
                  value={prefSkillsInput}
                  onChange={(e) => setPrefSkillsInput(e.target.value)}
                  placeholder="e.g. Python, SQL, Statistical Analysis, Financial Accounting, AutoCAD"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Career Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={prefInterestsInput}
                  onChange={(e) => setPrefInterestsInput(e.target.value)}
                  placeholder="e.g. Data Science, Banking, Software Engineering, Research"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Preferred Industries (comma-separated)
                </label>
                <input
                  type="text"
                  value={prefIndustriesInput}
                  onChange={(e) => setPrefIndustriesInput(e.target.value)}
                  placeholder="e.g. Telecommunications, Banking, Public Health, Infrastructure"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={prefLocation}
                    onChange={(e) => setPrefLocation(e.target.value)}
                    placeholder="Tanzania / East Africa / Global"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Work Arrangement
                  </label>
                  <select
                    value={prefWorkArrangement}
                    onChange={(e) => setPrefWorkArrangement(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Flexible">Flexible</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Career Goal
                </label>
                <input
                  type="text"
                  value={prefCareerGoals}
                  onChange={(e) => setPrefCareerGoals(e.target.value)}
                  placeholder="e.g. Secure a graduate analyst role or industrial internship"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Preferred Postgraduate Direction (optional)
                </label>
                <input
                  type="text"
                  value={prefPostgrad}
                  onChange={(e) => setPrefPostgrad(e.target.value)}
                  placeholder="e.g. MSc Data Science, MBA, CPA(T), ERB Professional Registration"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPrefModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                >
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: REPORT AI CAREER ADVISOR RESPONSE (Section 37 Play Store Safety)
         ==================================================================== */}
      {reportingMessage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report AI Response</span>
              </h3>
              <button
                type="button"
                onClick={() => setReportingMessage(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmittedMsg ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
                {reportSubmittedMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitSafetyReport} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Reason for reporting
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as AICareerReportCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Incorrect information">Incorrect information</option>
                    <option value="Misleading career advice">Misleading career advice</option>
                    <option value="Offensive content">Offensive content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what was inaccurate or inappropriate..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportingMessage(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
