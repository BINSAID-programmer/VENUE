import React, { useState, useEffect } from 'react';
import {
  Globe,
  Building,
  GraduationCap,
  Calendar,
  ArrowRight,
  ArrowLeft,
  School,
  Check,
  Network,
  Loader2,
  BookOpen,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../../types';
import {
  academicStructureService,
  GLOBAL_COUNTRIES,
  CountryRecord,
  UniversityRecord,
  AcademicUnitRecord,
  DepartmentRecord,
  ProgrammeRecord,
} from '../../services/academicStructureService';
import { degreeProgrammeService } from '../../services/degreeProgrammeService';

interface OnboardingScreenProps {
  initialProfile: StudentProfile;
  onComplete: (updated: Partial<StudentProfile>) => void;
  onBackToAuth?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialProfile,
  onComplete,
  onBackToAuth,
}) => {
  // 6 sequential onboarding steps mapping to official academic hierarchy:
  // 1: Select Country
  // 2: Select University
  // 3: Select Academic Unit (College / School / Institute / Centre / Campus)
  // 4: Select Department
  // 5: Select Programme
  // 6: Select Year of Study & Semester
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Selections
  const [countriesList, setCountriesList] = useState<CountryRecord[]>(GLOBAL_COUNTRIES);
  const [selectedCountryId, setSelectedCountryId] = useState<string>(() => {
    if (initialProfile.countryId) return initialProfile.countryId;
    const found = GLOBAL_COUNTRIES.find(
      (c) => c.name.toLowerCase() === (initialProfile.country || '').toLowerCase()
    );
    return found ? found.id : 'tz';
  });
  const [country, setCountry] = useState(initialProfile.country || 'Tanzania');

  const [selectedUniId, setSelectedUniId] = useState('');
  const [university, setUniversity] = useState(initialProfile.university || '');

  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [college, setCollege] = useState(initialProfile.college || '');

  const [selectedDeptId, setSelectedDeptId] = useState(initialProfile.departmentId || '');
  const [department, setDepartment] = useState(initialProfile.department || '');

  const [selectedProgId, setSelectedProgId] = useState(initialProfile.programmeId || '');
  const [programme, setProgramme] = useState(initialProfile.programme || '');

  const [yearOfStudy, setYearOfStudy] = useState(initialProfile.yearOfStudy || 'Year 1');
  const [semester, setSemester] = useState(initialProfile.semester || 'Semester 1');

  // Dynamic Lists
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [academicUnits, setAcademicUnits] = useState<AcademicUnitRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeRecord[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>(['Year 1', 'Year 2', 'Year 3']);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial Mount: Load Countries and Universities for the country
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoading(true);
      try {
        const fetchedCountries = await academicStructureService.getCountries();
        if (!isMounted) return;
        setCountriesList(fetchedCountries);

        const ctx = academicStructureService.resolveProfileContext(initialProfile);
        const allUnis = await academicStructureService.getUniversities();
        if (!isMounted) return;

        const resolvedUni = allUnis.find((u) => u.id === ctx.universityId) || allUnis[0];
        let cId = selectedCountryId;
        if (resolvedUni?.countryId) {
          cId = resolvedUni.countryId;
          setSelectedCountryId(cId);
          const cObj = fetchedCountries.find((c) => c.id === cId);
          if (cObj) setCountry(cObj.name);
        }

        const countryUnis = allUnis.filter((u) => (u.countryId || '').toLowerCase() === cId.toLowerCase());
        setUniversities(countryUnis.length > 0 ? countryUnis : allUnis);

        if (resolvedUni) {
          setSelectedUniId(resolvedUni.id);
          setUniversity(resolvedUni.name);

          // Preload academic units for the university
          const units = await academicStructureService.getInstitutions(resolvedUni.id);
          if (!isMounted) return;
          setAcademicUnits(units);

          const targetUnit = units.find((u) => u.id === ctx.unitId) || units[0];
          if (targetUnit) {
            setSelectedUnitId(targetUnit.id);
            setCollege(targetUnit.name);
          }
        }
      } catch (err) {
        console.error('Error loading universities in onboarding:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // When selected country changes, load its universities and reset cascading selections
  const handleSelectCountry = async (c: CountryRecord) => {
    setSelectedCountryId(c.id);
    setCountry(c.name);

    setIsLoading(true);
    try {
      const unis = await academicStructureService.getUniversities(c.id);
      setUniversities(unis);

      if (unis.length > 0) {
        const firstUni = unis[0];
        setSelectedUniId(firstUni.id);
        setUniversity(firstUni.name);

        const units = await academicStructureService.getInstitutions(firstUni.id);
        setAcademicUnits(units);

        if (units.length > 0) {
          setSelectedUnitId(units[0].id);
          setCollege(units[0].name);
        } else {
          setSelectedUnitId('');
          setCollege('');
        }
      } else {
        setSelectedUniId('');
        setUniversity('');
        setAcademicUnits([]);
        setSelectedUnitId('');
        setCollege('');
      }

      // Reset subsequent dependent fields
      setSelectedDeptId('');
      setDepartment('');
      setSelectedProgId('');
      setProgramme('');
      setDepartments([]);
      setProgrammes([]);
    } catch (err) {
      console.error('Error filtering universities by country:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // When selected university changes, load its academic units
  // Cascading rule: Reset institution, department, programme, year, and semester
  const handleSelectUniversity = async (u: UniversityRecord) => {
    setSelectedUniId(u.id);
    setUniversity(u.name);

    // Cascading reset
    setSelectedUnitId('');
    setCollege('');
    setSelectedDeptId('');
    setDepartment('');
    setSelectedProgId('');
    setProgramme('');
    setYearOfStudy('Year 1');
    setSemester('Semester 1');
    setDepartments([]);
    setProgrammes([]);

    setIsLoading(true);
    try {
      const units = await academicStructureService.getInstitutions(u.id);
      setAcademicUnits(units);
      if (units.length > 0) {
        setSelectedUnitId(units[0].id);
        setCollege(units[0].name);
      }
    } catch (err) {
      console.error('Error fetching academic units:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // When step changes to Step 4 (Departments), ensure departments for selected unit are loaded
  const loadDepartmentsForCurrentUnit = async (unitId: string) => {
    setIsLoading(true);
    try {
      const depts = await academicStructureService.getDepartments(unitId, selectedUniId);
      setDepartments(depts);
      if (depts.length > 0) {
        const defaultDept = depts.find((d) => d.id === selectedDeptId) || depts[0];
        setSelectedDeptId(defaultDept.id);
        setDepartment(defaultDept.name);
      } else {
        setSelectedDeptId('');
        setDepartment('');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // When step changes to Step 5 (Programmes), ensure programmes for selected department are loaded
  const loadProgrammesForCurrentDept = async (deptId: string, unitId: string) => {
    setIsLoading(true);
    try {
      const progs = await academicStructureService.getProgrammes(deptId, unitId, selectedUniId);
      setProgrammes(progs);
      if (progs.length > 0) {
        const defaultProg = progs.find((p) => p.id === selectedProgId) || progs[0];
        setSelectedProgId(defaultProg.id);
        setProgramme(defaultProg.name);
        const yrs = academicStructureService.getYearsOfStudy(defaultProg.durationYears || 3);
        setYearOptions(yrs);
        if (!yrs.includes(yearOfStudy)) {
          setYearOfStudy(yrs[0] || 'Year 1');
        }
      } else {
        setSelectedProgId('');
        setProgramme('');
      }
    } catch (err) {
      console.error('Error fetching programmes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Transitioning to Academic Unit (Step 3)
      if (academicUnits.length === 0) {
        await handleSelectUniversity(universities.find((u) => u.id === selectedUniId) || universities[0]);
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Transitioning to Department (Step 4)
      await loadDepartmentsForCurrentUnit(selectedUnitId);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Transitioning to Programme (Step 5)
      await loadProgrammesForCurrentDept(selectedDeptId, selectedUnitId);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Transitioning to Year & Semester (Step 6)
      const currentProg = programmes.find((p) => p.id === selectedProgId);
      const yrs = academicStructureService.getYearsOfStudy(currentProg?.durationYears || 3);
      setYearOptions(yrs);
      if (!yrs.includes(yearOfStudy)) {
        setYearOfStudy(yrs[0] || 'Year 1');
      }
      setCurrentStep(6);
    } else {
      // Step 6 Complete -> Student Dashboard!
      const matchedUni = universities.find((u) => u.id === selectedUniId);
      const matchedUnit = academicUnits.find((u) => u.id === selectedUnitId);
      const matchedDept = departments.find((d) => d.id === selectedDeptId);
      const matchedProg = programmes.find((p) => p.id === selectedProgId);

      onComplete({
        country,
        countryId: selectedCountryId,
        university: matchedUni?.name || university,
        universityName: matchedUni?.name || university,
        universityShort: matchedUni?.shortName || '',
        universityId: selectedUniId,
        college: matchedUnit?.name || college,
        institutionName: matchedUnit?.name || college,
        collegeId: selectedUnitId,
        institutionId: selectedUnitId,
        academicUnitId: selectedUnitId,
        academicUnitType: matchedUnit?.type || 'College',
        department: matchedDept?.name || department,
        departmentName: matchedDept?.name || department,
        departmentId: selectedDeptId,
        programme: matchedProg?.name || programme,
        programmeName: matchedProg?.name || programme,
        programmeShort: matchedProg?.shortName || programme,
        programmeId: selectedProgId,
        programmeCode: matchedProg?.code || '',
        degreeLevel: matchedProg?.degreeLevel || "Bachelor's Degree",
        programmeDurationYears: matchedProg?.durationYears || 3,
        yearOfStudy,
        semester,
        isProfileComplete: true,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else if (onBackToAuth) {
      onBackToAuth();
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-4 sm:p-7 bg-gradient-to-b from-[#070b14] via-[#091122] to-[#070b14] relative">
      {/* Top Stepper Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <span className="text-[11px] font-bold text-sky-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
            Step {currentStep} of 6
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Step Header */}
        <div className="mb-4">
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Geographic Region</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Country</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your country of study to localize curricula and higher education institutions
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <School className="w-3.5 h-3.5" />
                <span>Higher Education Institution</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select University</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your university to link official academic catalogues, past papers, and curricula
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Building className="w-3.5 h-3.5" />
                <span>Institutional Entity</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Select College, School, or Institute
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your official academic unit from the verified university catalogue
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Network className="w-3.5 h-3.5" />
                <span>Academic Department</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Department</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your academic department hosting your degree programmes
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic Degree & Major</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Programme</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose your degree syllabus to load verified courses, syllabi, and AI tutor support
              </p>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Curriculum Progression</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Select Year of Study & Semester
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your active study cohort level and semester for immediate timetable and course access
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Step Content Container */}
      <div className="my-auto py-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <span className="text-xs text-slate-400">Loading verified catalogue data...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* STEP 1: Country */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1"
              >
                {countriesList.map((c) => {
                  const isSelected = selectedCountryId === c.id || country === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{c.name}</span>
                            {c.verified && (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                Verified
                              </span>
                            )}
                            {c.status === 'active' && !c.verified && (
                              <span className="text-[10px] text-sky-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{c.region}</p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-slate-700 bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* STEP 2: University */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1"
              >
                {universities.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No institutions listed for {country}. You can choose another country from Step 1.
                  </div>
                ) : (
                  universities.map((u) => {
                  const isSelected = selectedUniId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUniversity(u)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{u.shortName}</span>
                          <span className="text-xs text-slate-400">• {u.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {u.campus || u.country} {u.established ? `• Est. ${u.established}` : ''}
                        </p>
                        {u.badge && (
                          <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400">
                            {u.badge}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-slate-700 bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })
              )}
            </motion.div>
          )}

            {/* STEP 3: Academic Unit (College, School, Institute, Centre, Campus) */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1"
              >
                {academicUnits.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No academic units found for this university.
                  </div>
                ) : (
                  academicUnits.map((unit) => {
                    const isSelected = selectedUnitId === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          setSelectedUnitId(unit.id);
                          setCollege(unit.name);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-sky-300 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 uppercase tracking-wider">
                              {unit.type}
                            </span>
                            <span className="text-xs font-bold text-slate-300">
                              {unit.shortName}
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-white block">
                            {unit.name}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* STEP 4: Department */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1"
              >
                {departments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No departments recorded under this academic unit.
                  </div>
                ) : (
                  departments.map((dept) => {
                    const isSelected = selectedDeptId === dept.id;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeptId(dept.id);
                          setDepartment(dept.name);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="pr-2">
                          <span className="text-xs sm:text-sm font-semibold text-white block">
                            {dept.name}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* STEP 5: Programme */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1"
              >
                {programmes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No programmes found for this department.
                  </div>
                ) : (
                  programmes.map((p) => {
                    const isSelected = selectedProgId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProgId(p.id);
                          setProgramme(p.name);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Award className="w-2.5 h-2.5" />
                              {p.degreeLevel || "Bachelor's Degree"}
                            </span>
                            {p.shortName && (
                              <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                                {p.shortName}
                              </span>
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white block">
                            {p.name}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Duration: {p.durationYears} {p.durationYears === 1 ? 'Year' : 'Years'} ({p.durationYears * 2} Semesters)
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 mt-1 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* STEP 6: Year of Study & Semester */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 max-h-[50vh] overflow-y-auto pr-1"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Select Active Year of Study</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {yearOptions.map((y) => {
                      const isSelected = yearOfStudy === y;
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYearOfStudy(y)}
                          className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {y}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Select Active Semester</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Semester 1', 'Semester 2'].map((s) => {
                      const isSelected = semester === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSemester(s)}
                          className={`p-3 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Step Actions */}
      <div className="pt-4">
        <button
          id={`onboarding-step-${currentStep}-continue-btn`}
          type="button"
          onClick={handleNextStep}
          disabled={isLoading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <span>{currentStep === 6 ? 'Complete Profile & Launch VENUE' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500 text-center mt-2.5">
          VENUE • {university} {programme ? `• ${programme}` : ''}
        </p>
      </div>
    </div>
  );
};
