import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CareerPath } from '../../types';

interface CareerHubScreenProps {
  careerPaths: CareerPath[];
}

export const CareerHubScreen: React.FC<CareerHubScreenProps> = ({ careerPaths }) => {
  const [expandedId, setExpandedId] = useState<string>(careerPaths[0]?.id || 'car-1');

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Career Hub</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          High-demand professional trajectories for BSc Mathematics & Statistics graduates
        </p>
      </div>

      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-blue-500/25 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-500/20 text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white">
            Quantitative Degree Market Alignment
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Mathematics & Statistics graduates hold strong quantitative foundational skills for data science, risk management, quantitative analytics, and actuarial practice across industry.
        </p>
      </div>

      {/* Career Pathways Accordion List */}
      <div className="space-y-3">
        {careerPaths.map((career) => {
          const isExpanded = expandedId === career.id;

          return (
            <div
              key={career.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900 border-blue-500/40 shadow-lg'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : career.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/30 to-sky-400/20 border border-blue-500/30 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white">{career.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                        {career.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Demand: <span className="text-sky-400 font-semibold">{career.industryDemand}</span>
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Accordion Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-1 space-y-4 border-t border-slate-800/80 text-xs">
                  {/* Overview */}
                  <p className="text-slate-300 leading-relaxed">{career.overview}</p>

                  {/* Compensation Band */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                      Compensation & Salary Guide:
                    </span>
                    <p className="font-bold text-emerald-400 text-xs sm:text-sm">
                      {career.averageSalaryRange}
                    </p>
                  </div>

                  {/* Core Responsibilities */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider block">
                      Key Responsibilities:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {career.keyResponsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Skills & Recommended Electives */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-sky-400 text-[11px] block">Top Skills Required:</span>
                      <div className="flex flex-wrap gap-1">
                        {career.topSkillsRequired.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <span className="font-bold text-sky-400 text-[11px] block">
                        Recommended Degree Courses:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {career.recommendedElectives.map((rec, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          >
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Professional Certifications */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Recognized Certifications:
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      {career.certifications.join(' • ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
