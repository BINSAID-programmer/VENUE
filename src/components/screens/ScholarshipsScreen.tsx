import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Search,
  FileText,
  Globe2,
  Building2,
  ShieldCheck,
  Info,
  X,
} from 'lucide-react';
import {
  StudentProfile,
  Course,
  EvaluatedCareerOpportunity,
  OpportunityCategoryType,
  OpportunityRegionScope,
  OpportunityStudyLevel,
} from '../../types';
import { careerHubService } from '../../services/careerHubService';

interface ScholarshipsScreenProps {
  profile?: StudentProfile;
  courses?: Course[];
  embedded?: boolean;
}

export const ScholarshipsScreen: React.FC<ScholarshipsScreenProps> = ({
  profile,
  courses = [],
  embedded = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | OpportunityCategoryType>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | OpportunityStudyLevel>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | OpportunityRegionScope>('ALL');
  const [selectedFunding, setSelectedFunding] = useState<'ALL' | 'Fully Funded' | 'Loan / Grant'>('ALL');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EvaluatedCareerOpportunity | null>(null);

  const evaluatedOpportunities = useMemo(() => {
    const safeProfile: StudentProfile = profile || ({
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

    return careerHubService.evaluateOpportunitiesForStudent(safeProfile, courses);
  }, [profile, courses]);

  const filteredOpportunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedOpportunities.filter((item) => {
      const opp = item.opportunity;
      if (selectedType !== 'ALL' && opp.type !== selectedType) return false;
      if (
        selectedLevel !== 'ALL' &&
        !opp.eligibleStudyLevels.includes('All Levels') &&
        !opp.eligibleStudyLevels.includes(selectedLevel)
      ) {
        return false;
      }
      if (selectedRegion !== 'ALL' && opp.regionScope !== selectedRegion) return false;
      if (selectedFunding !== 'ALL' && opp.fundingType !== selectedFunding) return false;
      if (eligibleOnly && item.eligibilityStatus !== 'Eligible Match') return false;

      if (q) {
        const hay = `${opp.title} ${opp.organization} ${opp.description} ${opp.eligibleProgrammesOrFields.join(' ')} ${opp.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    evaluatedOpportunities,
    searchQuery,
    selectedType,
    selectedLevel,
    selectedRegion,
    selectedFunding,
    eligibleOnly,
  ]);

  const progLabel = profile?.programmeName || profile?.programme || '';

  return (
    <div className={embedded ? 'space-y-4' : 'p-4 sm:p-6 space-y-5 pb-24'}>
      {!embedded && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Scholarships & Opportunities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {progLabel
              ? `Verified academic scholarships, fellowships, and programmes evaluated for ${progLabel}`
              : 'Verified national, regional, and international academic opportunities'}
          </p>
        </div>
      )}

      {/* Search & Eligibility Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships, fellowships, organizations, or fields..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setEligibleOnly(!eligibleOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
              eligibleOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Eligible for My Profile Only</span>
          </button>
        </div>

        {/* Multi-Dimensional Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Scholarship">Scholarships</option>
            <option value="Fellowship">Fellowships</option>
            <option value="Competition">Competitions</option>
            <option value="Internship">Internships</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Study Levels</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Regions</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Africa">Africa</option>
            <option value="International">International</option>
          </select>

          <select
            value={selectedFunding}
            onChange={(e) => setSelectedFunding(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Funding Types</option>
            <option value="Fully Funded">Fully Funded</option>
            <option value="Loan / Grant">Loans & Grants</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2.5">
          <Award className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No matching opportunities found.</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try clearing one of the region, level, or funding filters to explore all verified scholarships and career programmes.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedType('ALL');
              setSelectedLevel('ALL');
              setSelectedRegion('ALL');
              setSelectedFunding('ALL');
              setEligibleOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOpportunities.map((item) => {
            const opp = item.opportunity;
            const isEligibleMatch = item.eligibilityStatus === 'Eligible Match';

            return (
              <div
                key={opp.id}
                className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-blue-500/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-sky-400">{opp.type}</span>
                      <span>·</span>
                      <span>{opp.regionScope}</span>
                      <span>·</span>
                      <span>{opp.fundingType}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-medium">{opp.dataStatus} Source</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{opp.organization}</span>
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                        isEligibleMatch
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isEligibleMatch ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {item.eligibilityStatus}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1.5 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Location:</strong> {opp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong>Cycle / Deadline:</strong> {opp.deadline}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-slate-200">Funding / Benefit:</strong> {opp.fundingBenefitSummary}
                  </p>
                  <p className="text-[11px] text-sky-300">
                    <strong>Profile Fit:</strong> {item.eligibilityReasons[0]}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[10px] text-slate-500">
                    Source: {opp.source} · Last verified: {opp.lastVerifiedDate}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Eligibility & Documents
                    </button>
                    <a
                      href={opp.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Eligibility & Required Documents Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] text-sky-400 font-semibold">
                  {selectedItem.opportunity.type} · {selectedItem.opportunity.regionScope}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedItem.opportunity.title}
                </h3>
                <p className="text-xs text-slate-400">{selectedItem.opportunity.organization}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Eligibility Assessment for Your Academic Profile:
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedItem.eligibilityReasons.join(' ')}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Eligibility Criteria
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {selectedItem.opportunity.eligibilityCriteria.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Typical Required Documents
              </h4>
              <ul className="space-y-1.5 text-slate-300">
                {selectedItem.opportunity.requiredDocuments.map((docItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>
                <strong className="text-slate-200">Eligible Study Levels:</strong>{' '}
                {selectedItem.opportunity.eligibleStudyLevels.join(', ')}
              </div>
              <div>
                <strong className="text-slate-200">Official Source:</strong>{' '}
                {selectedItem.opportunity.source} (Verified: {selectedItem.opportunity.lastVerifiedDate})
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <a
                href={selectedItem.opportunity.officialApplicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <span>Open Official Application Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
