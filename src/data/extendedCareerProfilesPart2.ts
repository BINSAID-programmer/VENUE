import { CareerPathProfile } from '../types';

export const EXTENDED_CAREER_PROFILES_PART2: CareerPathProfile[] = [
  // ==========================================================================
  // CLUSTER 3 EXTENDED: BUSINESS, ACCOUNTING, FINANCE & ECONOMICS
  // ==========================================================================
  {
    id: 'cp-corporate-finance-analyst',
    title: 'Corporate Finance & FP&A Analyst',
    subtitle: 'Financial Planning, Budgeting & Capital Allocation',
    summary: 'Drive corporate financial strategy by building annual budgets, rolling forecasts, variance analyses, and capital expenditure business cases.',
    category: 'Finance, Risk & Actuarial',
    demandLevel: 'High',
    demandContext: 'High demand across telecoms, manufacturing, energy, banking, and multinational subsidiaries in East Africa.',
    programmeKeywords: ['accounting', 'finance', 'business', 'commerce', 'economics', 'banking'],
    departmentKeywords: ['accounting', 'finance', 'business', 'economics'],
    courseCodeKeywords: ['AC', 'FN', 'FI', 'BU', 'EC', 'MT'],
    courseTitleKeywords: ['Financial Management', 'Management Accounting', 'Corporate Finance', 'Cost Accounting', 'Financial Reporting'],
    interestKeywords: ['Finance & Investment', 'Entrepreneurship & Business', 'Data & Analytics'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,200,000 – 2,400,000 / month',
      midRange: '2,800,000 – 5,500,000 / month',
      seniorRange: '6,000,000 – 13,000,000+ / month',
      note: 'Estimated ranges vary by sector (FMCG, telecoms, banking, mining), CPA/ACCA/CFA progress, and firm size.'
    },
    responsibilities: [
      'Prepare monthly, quarterly, and annual management accounts and budget-versus-actual variance reports.',
      'Build 3-statement financial models and cash flow forecasts to guide executive decision-making.',
      'Evaluate capital investment proposals using NPV, IRR, payback period, and sensitivity analysis.',
      'Partner with operational heads to optimize cost structures and working capital.'
    ],
    requiredSkills: [
      { id: 'sk-fpa-1', name: 'Management Accounting & Budgeting', category: 'Core Academic', level: 'Advanced', description: 'Costing, variance analysis, and rolling forecasts.', relatedCourseKeywords: ['Management Accounting', 'Cost Accounting', 'AC'] },
      { id: 'sk-fpa-2', name: '3-Statement Financial Modelling', category: 'Technical & Tools', level: 'Advanced', description: 'Dynamic Excel modelling linking Income Statement, Balance Sheet, and Cash Flow.', relatedCourseKeywords: ['Corporate Finance', 'Financial Management', 'FN'] },
      { id: 'sk-fpa-3', name: 'Capital Budgeting (NPV / IRR / WACC)', category: 'Domain & Industry', level: 'Intermediate', description: 'Evaluating long-term project viability and cost of capital.', relatedCourseKeywords: ['Corporate Finance', 'Investment', 'FN'] },
      { id: 'sk-fpa-4', name: 'BI Reporting (Power BI / Advanced Excel)', category: 'Technical & Tools', level: 'Intermediate', description: 'Executive financial dashboards and automated reporting.', relatedCourseKeywords: ['Information Systems', 'Spreadsheet'] }
    ],
    recommendedCertifications: [
      { name: 'CPA (T) — NBAA Tanzania or ACCA', provider: 'NBAA / ACCA', level: 'Professional', whyItMatters: 'Gold-standard professional accounting and corporate finance qualification.' },
      { name: 'FMVA (Financial Modeling & Valuation Analyst)', provider: 'Corporate Finance Institute (CFI)', level: 'Intermediate', whyItMatters: 'Demonstrates practical spreadsheet modelling and FP&A capability.' }
    ],
    recommendedProjects: [
      {
        title: '5-Year Integrated Corporate Financial Model & Capital Allocation Case',
        difficulty: 'Intermediate',
        description: 'Build a dynamic 3-statement financial model for a Tanzanian manufacturing or telecom company evaluating a new plant expansion, complete with scenario toggles and executive dashboard.',
        skillsPracticed: ['3-Statement Modelling', 'NPV/IRR Valuation', 'Sensitivity Analysis', 'Power BI / Excel']
      }
    ],
    industries: ['Telecommunications', 'FMCG & Manufacturing', 'Energy & Mining', 'Commercial Banking', 'Aviation & Logistics'],
    careerProgression: ['Graduate Finance Trainee', 'FP&A / Corporate Finance Analyst', 'Senior Finance Business Partner', 'Head of FP&A / Finance Manager', 'Chief Financial Officer (CFO)'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-tax-consultant',
    title: 'Tax Consultant & Revenue Advisory Specialist',
    subtitle: 'Corporate Tax Compliance, Transfer Pricing & Fiscal Policy',
    summary: 'Advise corporations, investors, and public agencies on tax compliance, VAT/customs planning, international transfer pricing, and fiscal regulations.',
    category: 'Business, Management & Consulting',
    demandLevel: 'High',
    demandContext: 'Strong continuous demand in Big 4 advisory firms, law/tax chambers, multinationals, and revenue authorities (TRA).',
    programmeKeywords: ['accounting', 'finance', 'tax', 'commerce', 'business', 'economics', 'law'],
    departmentKeywords: ['accounting', 'finance', 'tax', 'business', 'law'],
    courseCodeKeywords: ['AC', 'FN', 'TX', 'LW', 'BU', 'EC'],
    courseTitleKeywords: ['Taxation', 'Public Finance', 'Financial Accounting', 'Business Law', 'Corporate Law', 'Auditing'],
    interestKeywords: ['Finance & Investment', 'Public Policy & Social Impact', 'Entrepreneurship & Business'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,100,000 / month',
      midRange: '2,400,000 – 4,800,000 / month',
      seniorRange: '5,200,000 – 11,500,000+ / month',
      note: 'Estimated ranges vary across Big 4 firms, multinational in-house tax teams, and TRA.'
    },
    responsibilities: [
      'Prepare and review corporate income tax, withholding tax, VAT, and payroll returns in accordance with statutory deadlines.',
      'Advise domestic and cross-border clients on tax structuring, investment incentives, and double taxation treaties.',
      'Prepare transfer pricing documentation and represent clients during tax health checks and revenue authority audits.',
      'Monitor legislative amendments in Finance Acts and brief corporate leadership on financial impacts.'
    ],
    requiredSkills: [
      { id: 'sk-tax-1', name: 'Direct & Indirect Tax Law', category: 'Core Academic', level: 'Advanced', description: 'Mastery of Income Tax Act, VAT Act, and Tax Administration frameworks.', relatedCourseKeywords: ['Taxation', 'Public Finance', 'TX', 'AC'] },
      { id: 'sk-tax-2', name: 'Financial Accounting & Reconciliations', category: 'Core Academic', level: 'Advanced', description: 'Reconciling IFRS accounting profit to taxable income and deferred tax computation.', relatedCourseKeywords: ['Financial Accounting', 'Financial Reporting', 'AC'] },
      { id: 'sk-tax-3', name: 'Transfer Pricing & Cross-Border Tax', category: 'Domain & Industry', level: 'Intermediate', description: 'Understanding arm’s-length principles for multinational transactions.', relatedCourseKeywords: ['International Finance', 'Taxation', 'Corporate Law'] },
      { id: 'sk-tax-4', name: 'Regulatory Research & Advisory Writing', category: 'Professional', level: 'Intermediate', description: 'Drafting clear tax opinions and audit objection letters.', relatedCourseKeywords: ['Business Law', 'Communication'] }
    ],
    recommendedCertifications: [
      { name: 'CPA (T) or ACCA', provider: 'NBAA / ACCA', level: 'Professional', whyItMatters: 'Core accounting and taxation qualification recognized by employers and regulators.' },
      { name: 'Registered Tax Consultant Qualification', provider: 'Tanzania Revenue Authority (TRA)', level: 'Professional', whyItMatters: 'Mandatory professional accreditation for practicing tax representation in Tanzania.' }
    ],
    recommendedProjects: [
      {
        title: 'Corporate Tax Health-Check & Deferred Tax Computation Toolkit',
        difficulty: 'Intermediate',
        description: 'Construct an automated spreadsheet template that reconciles IFRS financial statements into corporate tax computations, flags common VAT/withholding tax exposures, and models Finance Act changes.',
        skillsPracticed: ['Corporate Tax Computation', 'IFRS vs Tax Reconciliation', 'Compliance Risk Assessment']
      }
    ],
    industries: ['Big 4 & Tax Advisory Firms', 'Revenue Authorities (TRA)', 'Mining & Energy Multinationals', 'Banking & Telecoms', 'Legal & Corporate Chambers'],
    careerProgression: ['Tax Associate', 'Senior Tax Consultant', 'Tax Manager', 'Director of Tax Advisory', 'Tax Partner / Head of Group Tax'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-supply-chain-procurement-analyst',
    title: 'Supply Chain, Logistics & Procurement Analyst',
    subtitle: 'Operations Optimization, Strategic Sourcing & Inventory Analytics',
    summary: 'Optimize end-to-end supply networks, strategic procurement, port/corridor logistics, and inventory forecasting using quantitative and operational discipline.',
    category: 'Business, Management & Consulting',
    demandLevel: 'High',
    demandContext: 'Critical growth across port logistics (Dar es Salaam corridor), FMCG manufacturing, agribusiness, pharmaceuticals, and mining.',
    programmeKeywords: ['business', 'commerce', 'procurement', 'supply chain', 'logistics', 'economics', 'mathematics', 'statistics', 'industrial'],
    departmentKeywords: ['business', 'management', 'marketing', 'operations', 'economics', 'mathematics'],
    courseCodeKeywords: ['BU', 'MK', 'OP', 'PR', 'MT', 'ST', 'EC'],
    courseTitleKeywords: ['Operations Research', 'Supply Chain', 'Procurement', 'Operations Management', 'Inventory', 'Quantitative Methods'],
    interestKeywords: ['Entrepreneurship & Business', 'Data & Analytics', 'Engineering & Infrastructure'],
    compensation: {
      currency: 'TZS',
      entryRange: '950,000 – 1,900,000 / month',
      midRange: '2,100,000 – 4,200,000 / month',
      seniorRange: '4,800,000 – 9,500,000+ / month',
      note: 'Estimated ranges vary by industry (shipping/corridor logistics, mining, FMCG, public procurement).'
    },
    responsibilities: [
      'Forecast product demand and optimize safety stock levels across regional warehouses to prevent stock-outs and overstocking.',
      'Analyze supplier bids, total cost of ownership (TCO), and vendor lead-time reliability.',
      'Model transport routing and fleet utilization across domestic and cross-border trade corridors.',
      'Ensure compliance with public and corporate procurement regulations and ERP workflows (SAP/Oracle).'
    ],
    requiredSkills: [
      { id: 'sk-scm-1', name: 'Inventory & Demand Forecasting', category: 'Core Academic', level: 'Intermediate', description: 'EOQ models, safety stock math, and time-series demand planning.', relatedCourseKeywords: ['Operations Research', 'Operations Management', 'Statistics', 'MT', 'BU'] },
      { id: 'sk-scm-2', name: 'Strategic Sourcing & Procurement Law', category: 'Domain & Industry', level: 'Intermediate', description: 'Tendering, contract negotiation, Incoterms, and vendor evaluation.', relatedCourseKeywords: ['Procurement', 'Business Law', 'Supply Chain'] },
      { id: 'sk-scm-3', name: 'ERP & Spreadsheet Analytics (SAP / Excel / SQL)', category: 'Technical & Tools', level: 'Intermediate', description: 'Tracking SKU movement, lead times, and procurement spend analytics.', relatedCourseKeywords: ['Information Systems', 'Quantitative Methods'] }
    ],
    recommendedCertifications: [
      { name: 'CIPS (Chartered Institute of Procurement & Supply) / CPSP-T', provider: 'CIPS / PSPTB Tanzania', level: 'Professional', whyItMatters: 'Recognized benchmark for procurement and supply chain professionals.' },
      { name: 'CSCP / CPIM Supply Chain Foundations', provider: 'ASCM / Coursera', level: 'Intermediate', whyItMatters: 'Validates global end-to-end supply chain planning and inventory optimization skills.' }
    ],
    recommendedProjects: [
      {
        title: 'Multi-Warehouse Inventory & Corridor Routing Optimization Model',
        difficulty: 'Intermediate',
        description: 'Build an Excel/Python model that calculates optimal reorder points and safety stock for 200 SKUs and minimizes transport cost across 5 regional distribution hubs.',
        skillsPracticed: ['EOQ & Safety Stock', 'Linear Programming', 'Spend & Lead-Time Analytics']
      }
    ],
    industries: ['Port & Corridor Logistics', 'FMCG & Beverage Manufacturing', 'Mining & Energy Supply Chain', 'Pharmaceutical & Medical Distribution', 'Agribusiness Export'],
    careerProgression: ['Procurement / Logistics Officer', 'Supply Chain Analyst', 'Supply Chain / Procurement Manager', 'Head of Logistics & Operations', 'Chief Operating Officer (COO)'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-commercial-banking-credit-manager',
    title: 'Commercial Banking & Corporate Credit Specialist',
    subtitle: 'Corporate Lending, Trade Finance & Treasury Relationship Management',
    summary: 'Structure credit facilities, working capital lines, and trade finance solutions (Letters of Credit, guarantees) for corporate and institutional clients.',
    category: 'Finance, Risk & Actuarial',
    demandLevel: 'High',
    demandContext: 'Consistent hiring across Tier-1 commercial banks, development finance institutions (DFIs), and regional financial groups.',
    programmeKeywords: ['banking', 'finance', 'accounting', 'economics', 'commerce', 'business'],
    departmentKeywords: ['finance', 'accounting', 'banking', 'economics', 'business'],
    courseCodeKeywords: ['FN', 'BK', 'AC', 'EC', 'BU'],
    courseTitleKeywords: ['Money and Banking', 'Corporate Finance', 'Financial Accounting', 'Credit', 'International Finance', 'Macroeconomics'],
    interestKeywords: ['Finance & Investment', 'Entrepreneurship & Business'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,100,000 – 2,200,000 / month',
      midRange: '2,500,000 – 5,000,000 / month',
      seniorRange: '5,500,000 – 12,000,000+ / month',
      note: 'Estimated ranges vary by bank tier, portfolio size, and performance bonuses.'
    },
    responsibilities: [
      'Appraise corporate loan applications by analyzing audited financial statements, debt-service coverage ratios (DSCR), and collateral quality.',
      'Structure trade finance instruments including Letters of Credit (LCs), bank guarantees, and invoice discounting.',
      'Prepare comprehensive credit appraisal memoranda and present recommendations to the Credit Committee.',
      'Monitor borrower covenant compliance and sector risk across assigned corporate portfolios.'
    ],
    requiredSkills: [
      { id: 'sk-cb-1', name: 'Credit Appraisal & Ratio Analysis', category: 'Core Academic', level: 'Advanced', description: 'Evaluating liquidity, leverage, DSCR, and cash conversion cycles.', relatedCourseKeywords: ['Financial Accounting', 'Corporate Finance', 'FN', 'AC'] },
      { id: 'sk-cb-2', name: 'Trade Finance & Banking Operations', category: 'Domain & Industry', level: 'Intermediate', description: 'Structuring LCs, guarantees, and FX treasury products.', relatedCourseKeywords: ['Money and Banking', 'International Finance', 'EC', 'FN'] },
      { id: 'sk-cb-3', name: 'Client Relationship & Deal Structuring', category: 'Professional', level: 'Intermediate', description: 'Writing persuasive credit papers and advising corporate treasurers.', relatedCourseKeywords: ['Business Communication', 'Management'] }
    ],
    recommendedCertifications: [
      { name: 'CPB (Certified Professional Banker)', provider: 'Tanzania Institute of Bankers (TIOB)', level: 'Professional', whyItMatters: 'Core banking qualification recognized across commercial banks in Tanzania.' },
      { name: 'CBCA (Commercial Banking & Credit Analyst)', provider: 'Corporate Finance Institute (CFI)', level: 'Intermediate', whyItMatters: 'Practical training in credit memo writing, loan covenants, and cash flow lending.' }
    ],
    recommendedProjects: [
      {
        title: 'Corporate Credit Appraisal Memo & Covenant Stress-Tester',
        difficulty: 'Intermediate',
        description: 'Prepare a full institutional credit appraisal memo and debt-service stress test for a mid-sized agribusiness seeking a TZS 2B working capital and equipment facility.',
        skillsPracticed: ['DSCR & Cash Flow Lending', 'Credit Memo Writing', 'Collateral & Risk Mitigation']
      }
    ],
    industries: ['Commercial & Corporate Banks', 'Development Finance Institutions (TADB, TIB, IFC)', 'Microfinance & SME Banks', 'Trade Finance Houses'],
    careerProgression: ['Management Trainee / Credit Analyst', 'Corporate Relationship Manager', 'Senior Credit Underwriter', 'Head of Corporate Banking / Chief Credit Officer'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-management-consultant',
    title: 'Management & Strategy Consultant',
    subtitle: 'Corporate Strategy, Operational Transformation & Market Entry',
    summary: 'Solve high-stakes strategic, operational, and organizational problems for private corporations, development agencies, and public sector institutions.',
    category: 'Business, Management & Consulting',
    demandLevel: 'Growing',
    demandContext: 'Growing demand across global strategy firms, Big 4 advisory practices, development consulting firms, and corporate strategy units.',
    programmeKeywords: ['business', 'economics', 'finance', 'commerce', 'management', 'engineering', 'mathematics', 'statistics'],
    departmentKeywords: ['business', 'economics', 'finance', 'management', 'engineering'],
    courseCodeKeywords: ['BU', 'EC', 'FN', 'MG', 'MT', 'ST'],
    courseTitleKeywords: ['Strategic Management', 'Microeconomics', 'Macroeconomics', 'Corporate Finance', 'Operations Management', 'Research Methods'],
    interestKeywords: ['Entrepreneurship & Business', 'Public Policy & Social Impact', 'Data & Analytics'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,300,000 – 2,600,000 / month',
      midRange: '3,000,000 – 6,000,000 / month',
      seniorRange: '6,500,000 – 15,000,000+ / month',
      note: 'Estimated ranges vary between global strategy boutiques, Big 4 advisory, and regional development consultancies.'
    },
    responsibilities: [
      'Break down ambiguous business or policy challenges into structured, hypothesis-driven analytical workstreams.',
      'Conduct market sizing, competitor benchmarking, customer segmentation, and financial feasibility modelling.',
      'Interview executives, field stakeholders, and regulators to synthesize actionable strategic recommendations.',
      'Deliver board-ready presentation decks and implementation roadmaps.'
    ],
    requiredSkills: [
      { id: 'sk-mc-1', name: 'Structured Problem Solving (MECE)', category: 'Professional', level: 'Advanced', description: 'Issue trees, hypothesis-driven analysis, and quantitative synthesis.', relatedCourseKeywords: ['Strategic Management', 'Research Methods', 'BU', 'EC'] },
      { id: 'sk-mc-2', name: 'Market Sizing & Financial Feasibility', category: 'Core Academic', level: 'Intermediate', description: 'Unit economics, demand estimation, and business case modelling.', relatedCourseKeywords: ['Microeconomics', 'Corporate Finance', 'EC', 'FN'] },
      { id: 'sk-mc-3', name: 'Executive Deck & Narrative Design', category: 'Professional', level: 'Advanced', description: 'Communicating complex insights clearly using the Pyramid Principle.', relatedCourseKeywords: ['Communication', 'Management'] }
    ],
    recommendedCertifications: [
      { name: 'Management Consulting Specialization', provider: 'Emory University / Coursera', level: 'Foundational', whyItMatters: 'Builds structured problem decomposition and client engagement toolkit.' },
      { name: 'PMP or Agile Project Management', provider: 'PMI / Google', level: 'Intermediate', whyItMatters: 'Demonstrates ability to translate strategy into disciplined execution.' }
    ],
    recommendedProjects: [
      {
        title: 'East African FinTech / Agribusiness Market Entry Strategy Case',
        difficulty: 'Intermediate',
        description: 'Develop a 20-slide board strategy deck and unit-economics model evaluating market sizing, regulatory barriers, and go-to-market economics for a regional expansion.',
        skillsPracticed: ['Market Sizing', 'Unit Economics', 'Executive Storytelling']
      }
    ],
    industries: ['Strategy & Management Consulting Firms', 'Big 4 Advisory', 'Development Consulting (Dalberg, Palladium, Technoserve)', 'Corporate Strategy Teams'],
    careerProgression: ['Business Analyst / Associate Consultant', 'Consultant', 'Engagement Manager / Project Leader', 'Associate Director / Principal', 'Partner'],
    workModes: ['Hybrid', 'On-site']
  },
  {
    id: 'cp-digital-marketing-growth-analyst',
    title: 'Growth, Product Marketing & Market Research Analyst',
    subtitle: 'Consumer Insights, Customer Acquisition & Revenue Analytics',
    summary: 'Combine consumer research, digital campaign analytics, and pricing/funnel experiments to grow product adoption and brand revenue.',
    category: 'Business, Management & Consulting',
    demandLevel: 'High',
    demandContext: 'Strong demand in telecoms, consumer banking, FMCG, e-commerce, and tech startups.',
    programmeKeywords: ['marketing', 'business', 'commerce', 'economics', 'statistics', 'entrepreneurship', 'public relations'],
    departmentKeywords: ['marketing', 'business', 'management', 'economics', 'statistics'],
    courseCodeKeywords: ['MK', 'BU', 'EC', 'ST', 'CM'],
    courseTitleKeywords: ['Marketing', 'Consumer Behavior', 'Market Research', 'Statistics', 'E-Commerce', 'Entrepreneurship'],
    interestKeywords: ['Entrepreneurship & Business', 'Data & Analytics', 'Software & Product Engineering'],
    compensation: {
      currency: 'TZS',
      entryRange: '850,000 – 1,700,000 / month',
      midRange: '1,900,000 – 3,800,000 / month',
      seniorRange: '4,200,000 – 8,500,000+ / month',
      note: 'Estimated ranges vary by sector (telecoms, FMCG, banking, digital agencies).'
    },
    responsibilities: [
      'Design and analyze quantitative consumer surveys, brand trackers, and cohort retention studies.',
      'Measure customer acquisition cost (CAC), lifetime value (LTV), and campaign ROI across digital and field channels.',
      'Collaborate with product and sales teams on pricing strategy, go-to-market launches, and A/B experiments.',
      'Present consumer intelligence and competitive market share insights to commercial leaders.'
    ],
    requiredSkills: [
      { id: 'sk-mkt-1', name: 'Market Research & Survey Design', category: 'Core Academic', level: 'Intermediate', description: 'Sampling, questionnaire design, and hypothesis testing on consumer data.', relatedCourseKeywords: ['Market Research', 'Marketing', 'Statistics', 'MK', 'ST'] },
      { id: 'sk-mkt-2', name: 'Funnel, Cohort & Campaign Analytics', category: 'Technical & Tools', level: 'Intermediate', description: 'Measuring CAC, LTV, churn, and conversion rates using Google Analytics / SQL / Excel.', relatedCourseKeywords: ['Digital Marketing', 'Information Systems', 'MK'] },
      { id: 'sk-mkt-3', name: 'Brand Positioning & Commercial Strategy', category: 'Domain & Industry', level: 'Intermediate', description: 'Segmentation, targeting, positioning, and pricing elasticity.', relatedCourseKeywords: ['Marketing Management', 'Consumer Behavior', 'Microeconomics'] }
    ],
    recommendedCertifications: [
      { name: 'CIM (Chartered Institute of Marketing) or Google Digital Marketing & E-Commerce', provider: 'CIM / Google', level: 'Foundational', whyItMatters: 'Demonstrates modern commercial marketing and digital funnel analytics.' },
      { name: 'Meta / Google Analytics Certification', provider: 'Google Skillshop', level: 'Intermediate', whyItMatters: 'Validates hands-on proficiency in attribution and web/app analytics.' }
    ],
    recommendedProjects: [
      {
        title: 'Consumer Segmentation & Mobile Money Product Growth Study',
        difficulty: 'Beginner',
        description: 'Analyze a 1,000-respondent consumer dataset to identify underserved customer segments, estimate price sensitivity, and propose a data-backed go-to-market launch plan.',
        skillsPracticed: ['Survey Analytics', 'Customer Segmentation', 'Go-To-Market Strategy']
      }
    ],
    industries: ['Telecommunications', 'FMCG & Consumer Goods', 'FinTech & Retail Banking', 'Market Research Agencies (Ipsos, GeoPoll, Kantar)', 'E-Commerce'],
    careerProgression: ['Market Research / Growth Executive', 'Brand / Growth Marketing Analyst', 'Product Marketing / Consumer Insights Manager', 'Head of Marketing / Chief Commercial Officer'],
    workModes: ['Hybrid', 'On-site', 'Remote-friendly']
  },
  {
    id: 'cp-hr-people-analytics-specialist',
    title: 'Human Capital & People Analytics Specialist',
    subtitle: 'Talent Strategy, Organizational Development & Workforce Analytics',
    summary: 'Build high-performing organizations through structured talent acquisition, performance architecture, labour law compliance, and workforce analytics.',
    category: 'Business, Management & Consulting',
    demandLevel: 'High',
    demandContext: 'Essential across large corporate employers, banks, mining companies, NGOs, and public institutions.',
    programmeKeywords: ['human resource', 'business', 'public administration', 'management', 'industrial', 'psychology', 'sociology', 'commerce'],
    departmentKeywords: ['human resource', 'management', 'business', 'public administration'],
    courseCodeKeywords: ['HR', 'MG', 'BU', 'PA', 'LW', 'PS'],
    courseTitleKeywords: ['Human Resource', 'Organizational Behavior', 'Labour Law', 'Industrial Relations', 'Public Administration', 'Management'],
    interestKeywords: ['Entrepreneurship & Business', 'Public Policy & Social Impact', 'Education & Academic Leadership'],
    compensation: {
      currency: 'TZS',
      entryRange: '850,000 – 1,650,000 / month',
      midRange: '1,900,000 – 3,900,000 / month',
      seniorRange: '4,500,000 – 9,500,000+ / month',
      note: 'Estimated ranges vary by organization size, multinational vs local corporate, and HR certification.'
    },
    responsibilities: [
      'Design competency-based recruitment processes, graduate assessment centers, and onboarding programs.',
      'Manage performance appraisal cycles, compensation benchmarking, and succession planning.',
      'Analyze workforce metrics including attrition rates, training ROI, and payroll cost efficiency.',
      'Ensure strict adherence to national Employment and Labour Relations laws.'
    ],
    requiredSkills: [
      { id: 'sk-hr-1', name: 'Organizational Behaviour & Talent Systems', category: 'Core Academic', level: 'Advanced', description: 'Job evaluation, performance management, and workforce planning.', relatedCourseKeywords: ['Human Resource', 'Organizational Behavior', 'HR', 'MG'] },
      { id: 'sk-hr-2', name: 'Employment & Labour Law Compliance', category: 'Domain & Industry', level: 'Intermediate', description: 'Managing contracts, disciplinary hearings, and statutory benefits.', relatedCourseKeywords: ['Labour Law', 'Industrial Relations', 'LW'] },
      { id: 'sk-hr-3', name: 'HRIS & Workforce Data Analytics', category: 'Technical & Tools', level: 'Intermediate', description: 'Tracking headcount, turnover, and compensation bands in Excel/Power BI.', relatedCourseKeywords: ['Information Systems', 'Statistics'] }
    ],
    recommendedCertifications: [
      { name: 'SHRM-CP / PHRi or National HR Accreditation', provider: 'SHRM / HRCI', level: 'Professional', whyItMatters: 'Globally recognized credential for strategic HR business partners.' },
      { name: 'People Analytics Certificate', provider: 'Wharton / Coursera', level: 'Intermediate', whyItMatters: 'Differentiates modern data-driven HR professionals.' }
    ],
    recommendedProjects: [
      {
        title: 'Employee Attrition & Compensation Equity Analytics Dashboard',
        difficulty: 'Beginner',
        description: 'Build a workforce analytics dashboard analyzing employee turnover drivers, salary band equity, and training effectiveness across departments.',
        skillsPracticed: ['People Analytics', 'Compensation Benchmarking', 'HR Policy Design']
      }
    ],
    industries: ['Banking & Telecoms', 'Mining & Energy', 'International NGOs', 'Manufacturing & Hospitality', 'Executive Recruitment Firms'],
    careerProgression: ['HR Officer / Talent Associate', 'HR Business Partner (HRBP)', 'People Analytics / Talent Manager', 'Head of Human Resources / Chief People Officer'],
    workModes: ['On-site', 'Hybrid']
  },

  // ==========================================================================
  // CLUSTER 4 EXTENDED: ENGINEERING, INFRASTRUCTURE & ARCHITECTURE
  // ==========================================================================
  {
    id: 'cp-electrical-power-renewable-engineer',
    title: 'Electrical Power & Renewable Energy Engineer',
    subtitle: 'Power Grid Systems, Solar/Hydro Microgrids & Industrial Automation',
    summary: 'Design, commission, and maintain high-voltage transmission networks, industrial power systems, and utility-scale solar/hydro renewable installations.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'High demand driven by national rural electrification (REA), grid expansion (TANESCO), commercial solar C&I, and industrial manufacturing.',
    programmeKeywords: ['electrical', 'energy', 'renewable', 'electromechanical', 'power', 'engineering', 'electronics'],
    departmentKeywords: ['electrical', 'energy', 'engineering', 'mechanical'],
    courseCodeKeywords: ['EE', 'EL', 'EN', 'ME', 'PH', 'MT'],
    courseTitleKeywords: ['Power Systems', 'Electrical Machines', 'Control Systems', 'Power Electronics', 'High Voltage', 'Circuit Analysis', 'Renewable Energy'],
    interestKeywords: ['Engineering & Infrastructure', 'Agriculture, Climate & Environment'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,200,000 – 2,400,000 / month',
      midRange: '2,600,000 – 5,200,000 / month',
      seniorRange: '5,800,000 – 12,000,000+ / month',
      note: 'Estimated ranges vary by ERB registration status, EPC contractor tier, mining/energy sector, and field allowances.'
    },
    responsibilities: [
      'Perform load flow, short-circuit, and protection coordination studies for substations and industrial plants.',
      'Design and size solar PV, battery storage (BESS), and hybrid microgrid systems using PVsyst, AutoCAD Electrical, and MATLAB/ETAP.',
      'Supervise installation, testing, and commissioning of transformers, switchgear, and PLC motor control centers.',
      'Ensure strict compliance with IEEE/IEC electrical standards and occupational safety protocols.'
    ],
    requiredSkills: [
      { id: 'sk-ee-1', name: 'Power Systems & Electrical Machines', category: 'Core Academic', level: 'Advanced', description: 'Three-phase circuits, transformers, protection relays, and load flow.', relatedCourseKeywords: ['Power Systems', 'Electrical Machines', 'Circuit', 'EE'] },
      { id: 'sk-ee-2', name: 'Simulation & CAD (ETAP / MATLAB / AutoCAD / PVsyst)', category: 'Technical & Tools', level: 'Intermediate', description: 'Single-line diagrams (SLDs), PV sizing, and grid stability simulation.', relatedCourseKeywords: ['Control Systems', 'Power Electronics', 'CAD'] },
      { id: 'sk-ee-3', name: 'Industrial PLC & Instrumentation', category: 'Domain & Industry', level: 'Intermediate', description: 'Automated plant controls, SCADA telemetry, and VFD drives.', relatedCourseKeywords: ['Control Systems', 'Instrumentation', 'Automation'] }
    ],
    recommendedCertifications: [
      { name: 'Graduate / Professional Engineer Registration (ERB)', provider: 'Engineers Registration Board (ERB)', level: 'Professional', whyItMatters: 'Mandatory legal requirement for practicing and signing electrical engineering works.' },
      { name: 'Solar PV System Design & ETAP Power System Analysis', provider: 'NABCEP / ETAP Academy', level: 'Intermediate', whyItMatters: 'Directly applicable to utility and commercial renewable energy projects.' }
    ],
    recommendedProjects: [
      {
        title: 'Commercial Hybrid Solar PV + Battery Microgrid Engineering Design',
        difficulty: 'Intermediate',
        description: 'Create a complete engineering package (load profile audit, PVsyst yield simulation, single-line diagram, protection sizing, and financial LCOE calculation) for a hospital or campus microgrid.',
        skillsPracticed: ['Load Flow & Sizing', 'Single-Line Diagrams', 'PVsyst / MATLAB', 'LCOE Economics']
      }
    ],
    industries: ['Power Utilities (TANESCO, REA)', 'Renewable Energy EPCs & IPPs', 'Mining & Heavy Manufacturing', 'Oil, Gas & Industrial Automation', 'MEP Consulting Firms'],
    careerProgression: ['Graduate Electrical Engineer (SEAP)', 'Power Systems / Renewable Project Engineer', 'Senior Electrical Engineer (PE)', 'Chief Engineer / Technical Director'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-mechanical-industrial-engineer',
    title: 'Mechanical, Manufacturing & Reliability Engineer',
    subtitle: 'Plant Reliability, HVAC/MEP Systems, Fleet & Industrial Production',
    summary: 'Design, optimize, and maintain mechanical machinery, thermal/HVAC systems, automated production lines, and heavy mining/transport fleets.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'Strong demand in beverage/cement/FMCG manufacturing, mining operations, aviation/marine maintenance, and building MEP services.',
    programmeKeywords: ['mechanical', 'industrial', 'manufacturing', 'electromechanical', 'mechatronics', 'automotive', 'engineering'],
    departmentKeywords: ['mechanical', 'industrial', 'manufacturing', 'engineering'],
    courseCodeKeywords: ['ME', 'IE', 'MF', 'MT', 'PH'],
    courseTitleKeywords: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Mechanics of Materials', 'Manufacturing Processes', 'Heat Transfer'],
    interestKeywords: ['Engineering & Infrastructure', 'Entrepreneurship & Business'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,100,000 – 2,300,000 / month',
      midRange: '2,500,000 – 5,000,000 / month',
      seniorRange: '5,500,000 – 11,500,000+ / month',
      note: 'Estimated ranges vary across mining sites, multinational FMCG plants, and MEP consultancies.'
    },
    responsibilities: [
      'Implement preventive and predictive maintenance programs (RCM, vibration/oil analysis) to maximize plant Overall Equipment Effectiveness (OEE).',
      'Design mechanical components, piping networks, and commercial HVAC systems using SolidWorks, AutoCAD, and ANSYS.',
      'Apply Lean Six Sigma and root-cause analysis (FMEA) to eliminate production bottlenecks and downtime.',
      'Manage spare-parts engineering, safety inspections, and contractor turnarounds.'
    ],
    requiredSkills: [
      { id: 'sk-me-1', name: 'Thermodynamics, Fluids & Machine Design', category: 'Core Academic', level: 'Advanced', description: 'Stress analysis, pumps/compressors, heat exchangers, and kinematics.', relatedCourseKeywords: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'ME'] },
      { id: 'sk-me-2', name: '3D CAD/CAE (SolidWorks / AutoCAD / Inventor)', category: 'Technical & Tools', level: 'Intermediate', description: 'Mechanical drafting, P&IDs, and finite element stress simulation.', relatedCourseKeywords: ['Engineering Drawing', 'CAD', 'Machine Design'] },
      { id: 'sk-me-3', name: 'Plant Reliability & Lean Six Sigma', category: 'Domain & Industry', level: 'Intermediate', description: 'OEE optimization, FMEA, preventive maintenance scheduling.', relatedCourseKeywords: ['Industrial Engineering', 'Operations', 'Maintenance'] }
    ],
    recommendedCertifications: [
      { name: 'ERB Graduate / Professional Mechanical Engineer', provider: 'Engineers Registration Board (ERB)', level: 'Professional', whyItMatters: 'Statutory engineering accreditation in Tanzania.' },
      { name: 'Lean Six Sigma Green Belt / Certified Maintenance & Reliability Professional (CMRP)', provider: 'ASQ / SMRP', level: 'Intermediate', whyItMatters: 'Highly valued by multinational manufacturing and mining employers.' }
    ],
    recommendedProjects: [
      {
        title: 'Industrial Pumping / HVAC System Design & Reliability Audit',
        difficulty: 'Intermediate',
        description: 'Complete a hydraulic pipe-network calculation, pump head selection, 3D CAD assembly, and FMEA maintenance schedule for an industrial cooling system.',
        skillsPracticed: ['Fluid & Thermal Sizing', 'SolidWorks / AutoCAD', 'FMEA & Reliability']
      }
    ],
    industries: ['FMCG & Beverage Manufacturing', 'Mining & Mineral Processing', 'Cement & Steel Plants', 'MEP Building Services', 'Energy, Marine & Railway Rolling Stock'],
    careerProgression: ['Graduate Mechanical Trainee', 'Reliability / Plant Mechanical Engineer', 'Senior Maintenance / Project Manager', 'Plant Engineering Manager / Head of Operations'],
    workModes: ['On-site']
  },
  {
    id: 'cp-quantity-surveyor-construction-economist',
    title: 'Quantity Surveyor & Construction Cost Manager',
    subtitle: 'Bills of Quantities (BoQ), Contract Administration & Project Cost Control',
    summary: 'Manage the commercial, contractual, and financial lifecycle of construction and infrastructure projects from feasibility estimates to final account settlement.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'Consistent demand across building contractors, civil infrastructure projects, real estate developers, and public works.',
    programmeKeywords: ['quantity survey', 'building economics', 'construction', 'civil', 'architecture', 'real estate', 'land'],
    departmentKeywords: ['building economics', 'architecture', 'civil', 'construction'],
    courseCodeKeywords: ['QS', 'BE', 'CE', 'CV', 'AR', 'CM'],
    courseTitleKeywords: ['Measurement', 'Building Economics', 'Cost Estimating', 'Construction Law', 'Contract Administration', 'Project Management'],
    interestKeywords: ['Engineering & Infrastructure', 'Finance & Investment'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,100,000 / month',
      midRange: '2,300,000 – 4,600,000 / month',
      seniorRange: '5,000,000 – 10,500,000+ / month',
      note: 'Estimated ranges vary by AQRB registration status and project scale.'
    },
    responsibilities: [
      'Take off quantities from architectural and structural drawings and prepare comprehensive Bills of Quantities (BoQs).',
      'Evaluate contractor tenders, prepare interim payment certificates (IPCs), and value site variations.',
      'Administer FIDIC and national standard construction contracts, managing claims and cost-to-complete forecasts.',
      'Perform life-cycle costing and value engineering to keep developments within budget.'
    ],
    requiredSkills: [
      { id: 'sk-qs-1', name: 'Taking-Off & Standard Method of Measurement', category: 'Core Academic', level: 'Advanced', description: 'Accurate quantity measurement for building and civil works.', relatedCourseKeywords: ['Measurement', 'Building Economics', 'QS', 'CE'] },
      { id: 'sk-qs-2', name: 'FIDIC & Construction Contract Administration', category: 'Domain & Industry', level: 'Intermediate', description: 'Interim valuations, variations, extensions of time, and claims.', relatedCourseKeywords: ['Contract', 'Construction Law', 'Project Management'] },
      { id: 'sk-qs-3', name: 'Cost Estimating Software (Planswift / CostX / Excel)', category: 'Technical & Tools', level: 'Intermediate', description: 'Digital take-off and rate build-up modelling.', relatedCourseKeywords: ['Cost Estimating', 'CAD', 'Spreadsheets'] }
    ],
    recommendedCertifications: [
      { name: 'Registered Quantity Surveyor (AQRB)', provider: 'Architects and Quantity Surveyors Registration Board (AQRB)', level: 'Professional', whyItMatters: 'Mandatory statutory registration for practicing Quantity Surveyors in Tanzania.' },
      { name: 'RICS / PMP Certification', provider: 'RICS / PMI', level: 'Professional', whyItMatters: 'Unlocks international infrastructure consultancy and commercial management roles.' }
    ],
    recommendedProjects: [
      {
        title: 'Multi-Storey Commercial Building BoQ & Cash-Flow S-Curve Package',
        difficulty: 'Intermediate',
        description: 'Prepare a digital quantity take-off, unit rate build-up, priced Bill of Quantities, and monthly contractor cash-flow S-curve for a 4-storey institutional building.',
        skillsPracticed: ['Quantity Take-Off', 'Rate Build-Up', 'Cash-Flow S-Curve']
      }
    ],
    industries: ['Quantity Surveying Consultancies', 'Civil & Building Contractors', 'Real Estate & Property Developers', 'Public Infrastructure Agencies (TANROADS, TBA, NHC)'],
    careerProgression: ['Assistant Quantity Surveyor', 'Project Quantity Surveyor', 'Senior QS / Commercial Manager', 'Principal Quantity Surveyor / Contracts Director'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-water-environmental-engineer',
    title: 'Water Resources, Sanitation & Environmental Engineer',
    subtitle: 'Hydraulic Networks, Water Treatment, EIA & Climate Resilience',
    summary: 'Design clean water supply networks, wastewater treatment plants, urban flood drainage, and Environmental & Social Impact Assessments (ESIA).',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'High priority across urban/rural water authorities (DAWASA, RUWASA), international WASH NGOs, mining compliance, and climate infrastructure.',
    programmeKeywords: ['water', 'environmental', 'civil', 'irrigation', 'hydrology', 'sanitation', 'chemical', 'engineering'],
    departmentKeywords: ['water', 'civil', 'environmental', 'chemical', 'agricultural'],
    courseCodeKeywords: ['WE', 'WR', 'CE', 'CV', 'EN', 'CH'],
    courseTitleKeywords: ['Hydrology', 'Hydraulics', 'Water Supply', 'Wastewater', 'Environmental Engineering', 'Fluid Mechanics', 'Irrigation'],
    interestKeywords: ['Engineering & Infrastructure', 'Agriculture, Climate & Environment', 'Public Policy & Social Impact'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,100,000 – 2,200,000 / month',
      midRange: '2,400,000 – 4,800,000 / month',
      seniorRange: '5,200,000 – 11,000,000+ / month',
      note: 'Estimated ranges vary across water utilities, international development agencies (UNICEF, World Bank projects), and engineering consultancies.'
    },
    responsibilities: [
      'Model pressurized water distribution networks and gravity sewers using EPANET, WaterGEMS, and HEC-RAS.',
      'Design water treatment processes (coagulation, filtration, disinfection) and industrial effluent treatment systems.',
      'Conduct hydrological flood frequency analysis and climate-resilient drainage design.',
      'Lead Environmental and Social Impact Assessments (ESIA) in compliance with NEMC and IFC Performance Standards.'
    ],
    requiredSkills: [
      { id: 'sk-we-1', name: 'Hydraulics, Hydrology & Water Treatment', category: 'Core Academic', level: 'Advanced', description: 'Open-channel flow, pipe networks, catchment hydrology, and water chemistry.', relatedCourseKeywords: ['Hydraulics', 'Hydrology', 'Water', 'Fluid Mechanics', 'CE', 'WE'] },
      { id: 'sk-we-2', name: 'Hydraulic & GIS Modelling (EPANET / HEC-RAS / QGIS)', category: 'Technical & Tools', level: 'Intermediate', description: 'Simulating pipe pressures, floodplains, and catchment basins.', relatedCourseKeywords: ['GIS', 'Hydrology', 'Water Supply'] },
      { id: 'sk-we-3', name: 'ESIA & Environmental Compliance (NEMC / IFC)', category: 'Domain & Industry', level: 'Intermediate', description: 'Environmental impact auditing, water quality monitoring, and ESG safeguards.', relatedCourseKeywords: ['Environmental', 'Impact Assessment'] }
    ],
    recommendedCertifications: [
      { name: 'ERB Engineer Registration & NEMC Environmental Expert', provider: 'ERB / NEMC Tanzania', level: 'Professional', whyItMatters: 'Required for signing engineering designs and statutory ESIA reports.' },
      { name: 'GIS & Hydraulic Modelling (EPANET / HEC-RAS)', provider: 'IHE Delft / Bentley / Esri', level: 'Intermediate', whyItMatters: 'Core technical toolkit for water and climate infrastructure projects.' }
    ],
    recommendedProjects: [
      {
        title: 'Peri-Urban Water Distribution Network & Reservoir Sizing in EPANET',
        difficulty: 'Intermediate',
        description: 'Model a 25,000-resident water supply network in EPANET/QGIS, sizing storage tanks, pipe diameters, and pumping heads under peak demand scenarios.',
        skillsPracticed: ['EPANET Hydraulic Modelling', 'QGIS Mapping', 'Demand Projection']
      }
    ],
    industries: ['Water Authorities (DAWASA, RUWASA, Basin Boards)', 'Civil & Environmental Consultancies', 'International WASH & Climate Agencies', 'Mining & Industrial ESG Teams'],
    careerProgression: ['Graduate Water / Environmental Engineer', 'Hydraulic Design / WASH Engineer', 'Senior Water Resources Specialist', 'Chief Engineer / Environmental Director'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-chemical-process-mining-engineer',
    title: 'Chemical, Process & Mineral Processing Engineer',
    subtitle: 'Industrial Process Design, Hydrometallurgy, Quality & Plant Safety',
    summary: 'Design, control, and optimize chemical, food/beverage, petrochemical, cement, and gold/mineral processing plants for maximum yield and safety.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'Strong demand in Tanzania’s gold/critical minerals processing sector, cement, fertilizer, energy/gas, and beverage industries.',
    programmeKeywords: ['chemical', 'process', 'mining', 'mineral', 'metallurgy', 'petroleum', 'industrial', 'chemistry'],
    departmentKeywords: ['chemical', 'mining', 'process', 'chemistry', 'engineering'],
    courseCodeKeywords: ['CH', 'CP', 'MN', 'MP', 'PE', 'ME'],
    courseTitleKeywords: ['Chemical Reaction', 'Unit Operations', 'Mass Transfer', 'Thermodynamics', 'Process Control', 'Mineral Processing'],
    interestKeywords: ['Engineering & Infrastructure', 'Healthcare, Life Sciences & Biotech'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,200,000 – 2,500,000 / month',
      midRange: '2,800,000 – 5,500,000 / month',
      seniorRange: '6,000,000 – 13,000,000+ / month',
      note: 'Estimated ranges are particularly competitive in mineral processing, oil/gas, and large-scale manufacturing.'
    },
    responsibilities: [
      'Perform material and energy balance calculations and develop Process Flow Diagrams (PFDs) and P&IDs.',
      'Monitor and optimize unit operations (leaching, flotation, distillation, filtration, pasteurization) to improve recovery and product quality.',
      'Participate in HAZOP (Hazard and Operability) studies and enforce process safety and ISO quality standards.',
      'Run metallurgical or chemical lab trials to scale up process improvements.'
    ],
    requiredSkills: [
      { id: 'sk-ch-1', name: 'Mass/Energy Balances & Unit Operations', category: 'Core Academic', level: 'Advanced', description: 'Thermodynamics, heat/mass transfer, and reactor/plant stoichiometry.', relatedCourseKeywords: ['Unit Operations', 'Mass Transfer', 'Thermodynamics', 'CH', 'CP'] },
      { id: 'sk-ch-2', name: 'Process Simulation (Aspen HYSYS / DWSIM / MATLAB)', category: 'Technical & Tools', level: 'Intermediate', description: 'Simulating steady-state chemical and mineral recovery flowsheets.', relatedCourseKeywords: ['Process Control', 'Simulation', 'Chemical'] },
      { id: 'sk-ch-3', name: 'Process Safety (HAZOP) & Quality (ISO / Six Sigma)', category: 'Domain & Industry', level: 'Intermediate', description: 'Managing hazardous materials, effluent standards, and statistical process control.', relatedCourseKeywords: ['Safety', 'Quality', 'Analytical Chemistry'] }
    ],
    recommendedCertifications: [
      { name: 'ERB Registered Chemical / Process / Mining Engineer', provider: 'Engineers Registration Board (ERB)', level: 'Professional', whyItMatters: 'Statutory engineering accreditation.' },
      { name: 'NEBOSH Process Safety / Lean Six Sigma Green Belt', provider: 'NEBOSH / ASQ', level: 'Intermediate', whyItMatters: 'Essential for mining, petrochemical, and FMCG plant leadership.' }
    ],
    recommendedProjects: [
      {
        title: 'Plant Material & Energy Balance Simulator + PFD Package',
        difficulty: 'Intermediate',
        description: 'Build an automated mass and energy balance model (in Python/Excel or DWSIM) with a complete Process Flow Diagram and HAZOP risk matrix for a mineral leaching or beverage processing line.',
        skillsPracticed: ['Mass & Energy Balance', 'Process Flow Diagrams', 'HAZOP Safety Analysis']
      }
    ],
    industries: ['Gold & Critical Minerals Processing', 'Beverage, Sugar & Food Processing', 'Cement, Glass & Fertilizer Manufacturing', 'Natural Gas & Petrochemicals', 'Water & Industrial Effluent Treatment'],
    careerProgression: ['Graduate Metallurgist / Process Engineer', 'Plant Process Engineer', 'Senior Process / Production Superintendent', 'Process Engineering Manager / Plant Director'],
    workModes: ['On-site']
  },
  {
    id: 'cp-geomatic-gis-spatial-specialist',
    title: 'Geomatics, GIS & Spatial Data Engineer',
    subtitle: 'Satellite Remote Sensing, Engineering Surveying & Geospatial Intelligence',
    summary: 'Capture, model, and analyze high-precision spatial data using GNSS, drone photogrammetry, LiDAR, and GIS for infrastructure, mining, urban planning, and climate projects.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'High',
    demandContext: 'Growing demand across SGR/road corridors, land administration, mining exploration, utilities, and environmental monitoring.',
    programmeKeywords: ['geomatics', 'surveying', 'gis', 'geography', 'geology', 'urban planning', 'civil', 'environmental', 'land'],
    departmentKeywords: ['geomatics', 'geography', 'civil', 'geology', 'land'],
    courseCodeKeywords: ['GM', 'SV', 'GY', 'GL', 'CE', 'UR'],
    courseTitleKeywords: ['GIS', 'Remote Sensing', 'Surveying', 'Photogrammetry', 'Cartography', 'Geodesy', 'Spatial'],
    interestKeywords: ['Engineering & Infrastructure', 'Agriculture, Climate & Environment', 'Data & Analytics'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,100,000 / month',
      midRange: '2,300,000 – 4,500,000 / month',
      seniorRange: '5,000,000 – 10,000,000+ / month',
      note: 'Estimated ranges vary across mining exploration, civil corridor contractors, and international geospatial projects.'
    },
    responsibilities: [
      'Conduct high-precision engineering and cadastral surveys using RTK-GNSS, Total Stations, and UAV/drone photogrammetry.',
      'Build enterprise geodatabases and spatial web dashboards using ArcGIS Pro, QGIS, PostGIS, and Python (GeoPandas).',
      'Analyze multi-spectral satellite imagery (Sentinel/Landsat) for land-use change, flood risk, and agricultural yield mapping.',
      'Set out alignments and earthwork volumes for highways, railways, pipelines, and mining pits.'
    ],
    requiredSkills: [
      { id: 'sk-gis-1', name: 'GIS & Spatial Database Engineering (QGIS / ArcGIS / PostGIS)', category: 'Technical & Tools', level: 'Advanced', description: 'Spatial joins, geoprocessing, coordinate systems, and web mapping.', relatedCourseKeywords: ['GIS', 'Cartography', 'Spatial', 'GM', 'GY'] },
      { id: 'sk-gis-2', name: 'GNSS Surveying & Drone Photogrammetry', category: 'Core Academic', level: 'Intermediate', description: 'Geodetic datum transformations, DEM generation, and volumetric earthworks.', relatedCourseKeywords: ['Surveying', 'Photogrammetry', 'Geodesy', 'CE'] },
      { id: 'sk-gis-3', name: 'Remote Sensing & Python Geospatial Scripting', category: 'Technical & Tools', level: 'Intermediate', description: 'Automating satellite imagery analysis with Google Earth Engine and GeoPandas.', relatedCourseKeywords: ['Remote Sensing', 'Programming'] }
    ],
    recommendedCertifications: [
      { name: 'NCPS Land Surveyor Registration / Esri GIS Certification', provider: 'NCPS Tanzania / Esri', level: 'Professional', whyItMatters: 'Accredits professional surveying and enterprise GIS capability.' },
      { name: 'Google Earth Engine & Spatial Data Science', provider: 'Coursera / NASA ARSET', level: 'Intermediate', whyItMatters: 'Unlocks climate, agriculture, and infrastructure remote-sensing roles.' }
    ],
    recommendedProjects: [
      {
        title: 'Urban Flood Vulnerability & Infrastructure Accessibility Atlas',
        difficulty: 'Intermediate',
        description: 'Combine digital elevation models (DEM), Sentinel satellite imagery, and road network data in QGIS/PostGIS to map flood-prone wards and emergency hospital accessibility.',
        skillsPracticed: ['QGIS / PostGIS', 'DEM Terrain Analysis', 'Remote Sensing']
      }
    ],
    industries: ['Civil & Rail Infrastructure', 'Mining & Mineral Exploration', 'Urban Planning & Land Ministry', 'Climate & Conservation Organizations', 'Telecom & Power Grid Utilities'],
    careerProgression: ['Graduate Geomatic / GIS Analyst', 'Engineering Surveyor / Spatial Data Specialist', 'Senior GIS & Remote Sensing Lead', 'Chief Geomatics Engineer / Geospatial Director'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-architect-urban-designer',
    title: 'Architect, BIM Coordinator & Sustainable Urban Designer',
    subtitle: 'Architectural Design, Building Information Modelling (BIM) & Master Planning',
    summary: 'Design functional, climate-responsive buildings and urban spaces while coordinating multidisciplinary 3D BIM models across structural and MEP teams.',
    category: 'Engineering, Energy & Infrastructure',
    demandLevel: 'Growing',
    demandContext: 'Growing demand in commercial real estate, public institutional complexes, hospitality design, and sustainable urban master planning.',
    programmeKeywords: ['architecture', 'interior design', 'urban planning', 'regional planning', 'building', 'civil'],
    departmentKeywords: ['architecture', 'urban planning', 'civil', 'design'],
    courseCodeKeywords: ['AR', 'UP', 'UR', 'ID', 'CE'],
    courseTitleKeywords: ['Architectural Design', 'Building Technology', 'Urban Planning', 'History of Architecture', 'Environmental Design', 'CAD'],
    interestKeywords: ['Engineering & Infrastructure', 'Agriculture, Climate & Environment'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,000,000 / month',
      midRange: '2,200,000 – 4,500,000 / month',
      seniorRange: '5,000,000 – 11,000,000+ / month',
      note: 'Estimated ranges vary by AQRB registration, BIM proficiency, and consultancy portfolio.'
    },
    responsibilities: [
      'Develop conceptual designs, spatial layouts, 3D visualizations, and municipal approval drawings.',
      'Coordinate federated Building Information Models (BIM) in Revit/ArchiCAD to resolve clashes between architecture, structure, and MEP.',
      'Integrate passive solar shading, natural ventilation, and green building principles into tropical building envelopes.',
      'Inspect construction sites to ensure workmanship matches architectural specifications.'
    ],
    requiredSkills: [
      { id: 'sk-arc-1', name: 'BIM & Architectural CAD (Revit / ArchiCAD / AutoCAD)', category: 'Technical & Tools', level: 'Advanced', description: '3D parametric modelling, construction detailing, and schedules.', relatedCourseKeywords: ['Architectural Design', 'CAD', 'Building Technology', 'AR'] },
      { id: 'sk-arc-2', name: 'Climate-Responsive & Sustainable Design', category: 'Core Academic', level: 'Intermediate', description: 'Passive cooling, daylighting, and tropical building materials.', relatedCourseKeywords: ['Environmental Design', 'Building Science', 'AR'] },
      { id: 'sk-arc-3', name: '3D Visualization & Urban Master Planning', category: 'Technical & Tools', level: 'Intermediate', description: 'Lumion/Twinmotion rendering and zoning compliance.', relatedCourseKeywords: ['Urban Planning', 'Studio'] }
    ],
    recommendedCertifications: [
      { name: 'Registered Architect (AQRB)', provider: 'Architects and Quantity Surveyors Registration Board (AQRB)', level: 'Professional', whyItMatters: 'Statutory accreditation required to sign architectural plans in Tanzania.' },
      { name: 'Autodesk Certified Professional in Revit / EDGE Green Building', provider: 'Autodesk / IFC EDGE', level: 'Intermediate', whyItMatters: 'High-demand credentials for modern BIM coordination and sustainable architecture.' }
    ],
    recommendedProjects: [
      {
        title: 'Climate-Responsive University Innovation Hub (Full BIM Package)',
        difficulty: 'Intermediate',
        description: 'Design a net-zero-ready academic building in Revit/ArchiCAD featuring passive tropical ventilation, solar shading analysis, structural grid coordination, and construction details.',
        skillsPracticed: ['Revit / ArchiCAD BIM', 'Passive Thermal Design', 'Construction Detailing']
      }
    ],
    industries: ['Architectural & Urban Design Firms', 'Real Estate & Hospitality Developers', 'Public Works & Housing Agencies (NHC, TBA)', 'Design-Build EPC Contractors'],
    careerProgression: ['Graduate Architect / Junior BIM Modeller', 'Project Architect / BIM Coordinator', 'Senior Architect / Urban Design Lead', 'Principal Architect / Managing Partner'],
    workModes: ['On-site', 'Hybrid']
  },

  // ==========================================================================
  // CLUSTER 5 EXTENDED: EDUCATION, HUMANITIES, LAW & SOCIAL SCIENCES
  // ==========================================================================
  {
    id: 'cp-instructional-designer-edtech-specialist',
    title: 'Instructional Designer & EdTech Learning Architect',
    subtitle: 'Digital Curriculum Engineering, LMS Systems & Educational Media',
    summary: 'Design engaging digital courses, interactive assessment systems, and blended learning platforms for universities, corporate academies, and EdTech companies.',
    category: 'Education, Policy & Research',
    demandLevel: 'High',
    demandContext: 'Rapidly expanding across higher education e-learning units, EdTech platforms, international NGOs, and corporate L&D teams.',
    programmeKeywords: ['education', 'curriculum', 'adult education', 'psychology', 'linguistics', 'arts', 'science with education', 'multimedia'],
    departmentKeywords: ['education', 'curriculum', 'educational psychology', 'foundations'],
    courseCodeKeywords: ['ED', 'CT', 'EP', 'FE', 'EA'],
    courseTitleKeywords: ['Curriculum', 'Educational Technology', 'Instructional', 'Psychology', 'Pedagogy', 'Assessment', 'Teaching Methods'],
    interestKeywords: ['Education & Academic Leadership', 'Software & Product Engineering'],
    compensation: {
      currency: 'TZS',
      entryRange: '900,000 – 1,800,000 / month',
      midRange: '2,000,000 – 4,000,000 / month',
      seniorRange: '4,500,000 – 9,000,000+ / month',
      note: 'Estimated ranges vary across EdTech companies, international NGOs, universities, and remote global contracts.'
    },
    responsibilities: [
      'Apply instructional design frameworks (ADDIE, Backward Design, Bloom’s Taxonomy) to structure digital and blended courses.',
      'Build interactive learning modules, quizzes, and rubrics on Moodle, Canvas, Articulate Storyline, and mobile platforms.',
      'Analyze learner completion, engagement, and assessment data to iterate and improve learning outcomes.',
      'Train lecturers, teachers, and subject-matter experts on digital pedagogy.'
    ],
    requiredSkills: [
      { id: 'sk-id-1', name: 'Curriculum & Instructional Design (ADDIE / UDL)', category: 'Core Academic', level: 'Advanced', description: 'Structuring learning objectives, scaffolding, and formative/summative assessments.', relatedCourseKeywords: ['Curriculum', 'Pedagogy', 'Teaching Methods', 'ED', 'CT'] },
      { id: 'sk-id-2', name: 'LMS & E-Learning Authoring (Moodle / Canvas / H5P)', category: 'Technical & Tools', level: 'Intermediate', description: 'Building interactive digital lessons and managing LMS workflows.', relatedCourseKeywords: ['Educational Technology', 'Computer', 'ED'] },
      { id: 'sk-id-3', name: 'Learning Analytics & Psychometrics', category: 'Domain & Industry', level: 'Intermediate', description: 'Evaluating item difficulty, learner mastery, and course effectiveness.', relatedCourseKeywords: ['Assessment', 'Educational Measurement', 'Psychology'] }
    ],
    recommendedCertifications: [
      { name: 'Instructional Design & Learning Technologies Certificate', provider: 'University of Illinois / Coursera', level: 'Foundational', whyItMatters: 'Builds practical portfolio skills in digital course authoring and ADDIE.' },
      { name: 'Moodle Educator Certification (MEC)', provider: 'Moodle', level: 'Intermediate', whyItMatters: 'Directly relevant to university and institutional LMS administration.' }
    ],
    recommendedProjects: [
      {
        title: 'Interactive Blended Course Module with Competency Analytics',
        difficulty: 'Beginner',
        description: 'Design a complete 4-week competency-based digital module (syllabus, storyboard, H5P interactive exercises, diagnostic rubric, and mastery tracking sheet) for a challenging secondary or university subject.',
        skillsPracticed: ['ADDIE Storyboarding', 'Digital Assessment Design', 'LMS Authoring']
      }
    ],
    industries: ['EdTech Startups & Platforms', 'Universities & Colleges', 'Corporate Learning & Development (Banks/Telecoms)', 'International Education NGOs (UNICEF, UNESCO, CAMFED)'],
    careerProgression: ['Instructional Design Associate', 'Learning Experience Designer (LXD)', 'Head of Digital Learning / Curriculum Manager', 'Chief Learning Officer / EdTech Director'],
    workModes: ['Hybrid', 'Remote-friendly', 'On-site']
  },
  {
    id: 'cp-monitoring-evaluation-learning-specialist',
    title: 'Monitoring, Evaluation, Research & Learning (MERL) Specialist',
    subtitle: 'Impact Evaluation, Survey Systems & Development Programme Analytics',
    summary: 'Design Theories of Change, digital field survey systems, and quantitative/qualitative impact evaluations for national and international development programmes.',
    category: 'Education, Policy & Research',
    demandLevel: 'High',
    demandContext: 'Very high demand across international NGOs, UN agencies, research institutes (REPOA, Ifakara), and donor-funded programmes.',
    programmeKeywords: ['sociology', 'development studies', 'economics', 'education', 'population', 'demography', 'geography', 'political science', 'social work', 'public administration', 'statistics'],
    departmentKeywords: ['development', 'sociology', 'education', 'economics', 'social', 'geography'],
    courseCodeKeywords: ['DS', 'SO', 'ED', 'EC', 'ST', 'PA', 'SW', 'DM'],
    courseTitleKeywords: ['Research Methods', 'Monitoring and Evaluation', 'Project Planning', 'Social Research', 'Statistics', 'Development', 'Demography'],
    interestKeywords: ['Public Policy & Social Impact', 'Research & Academia', 'Data & Analytics'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,100,000 – 2,200,000 / month',
      midRange: '2,500,000 – 5,000,000 / month',
      seniorRange: '5,500,000 – 11,500,000+ / month',
      note: 'Estimated ranges are competitive across international NGOs, UN agencies, and donor-funded bilateral programmes.'
    },
    responsibilities: [
      'Develop project Logical Frameworks (LogFrames), Theories of Change, and performance indicator tracking tables.',
      'Deploy mobile data collection tools (KoboToolbox, ODK, SurveyCTO) and supervise field enumerator teams.',
      'Conduct baseline, midline, and endline evaluations using SPSS, Stata, R, and qualitative thematic coding.',
      'Author donor impact reports and facilitate learning workshops with communities and government ministries.'
    ],
    requiredSkills: [
      { id: 'sk-mel-1', name: 'Mixed-Methods Research & Impact Evaluation', category: 'Core Academic', level: 'Advanced', description: 'Sampling design, counterfactual thinking, focus groups, and survey validity.', relatedCourseKeywords: ['Research Methods', 'Social Research', 'Statistics', 'DS', 'SO', 'ED'] },
      { id: 'sk-mel-2', name: 'Digital Data Collection (KoboToolbox / ODK / SurveyCTO)', category: 'Technical & Tools', level: 'Intermediate', description: 'XLSForm logic design, data quality checks, and field monitoring.', relatedCourseKeywords: ['Research Methods', 'Information Systems'] },
      { id: 'sk-mel-3', name: 'Statistical & Qualitative Analysis (Stata / R / SPSS / NVivo)', category: 'Technical & Tools', level: 'Intermediate', description: 'Analyzing household survey datasets and synthesizing policy briefs.', relatedCourseKeywords: ['Statistics', 'Data Analysis', 'Demography'] }
    ],
    recommendedCertifications: [
      { name: 'Monitoring & Evaluation in Global Health / Development', provider: 'University of Washington / USAID Global Health eLearning', level: 'Intermediate', whyItMatters: 'Standard methodology expected by international development employers.' },
      { name: 'J-PAL Evaluating Social Programs', provider: 'MITx / edX', level: 'Advanced', whyItMatters: 'Gold-standard training in randomized evaluations and causal impact measurement.' }
    ],
    recommendedProjects: [
      {
        title: 'End-to-End Programme LogFrame, XLSForm Survey & Impact Dashboard',
        difficulty: 'Intermediate',
        description: 'Design a complete Theory of Change, Logical Framework, KoboToolbox XLSForm questionnaire, and interactive Power BI/R baseline report for a youth employment or education intervention.',
        skillsPracticed: ['LogFrame & Theory of Change', 'KoboToolbox XLSForm', 'Baseline Data Analysis']
      }
    ],
    industries: ['International NGOs (Save the Children, World Vision, IRC, BRAC)', 'UN Agencies (UNICEF, UNDP, WFP)', 'Policy Think Tanks (REPOA, ESRF)', 'Government Ministries & Donor Programmes'],
    careerProgression: ['M&E Assistant / Field Research Officer', 'MERL Officer', 'Senior MERL Manager / Impact Lead', 'Director of Evidence, Learning & Impact'],
    workModes: ['Hybrid', 'On-site']
  },
  {
    id: 'cp-corporate-legal-regulatory-counsel',
    title: 'Corporate Legal Counsel & Regulatory Compliance Specialist',
    subtitle: 'Commercial Law, Corporate Governance, Contracts & Regulatory Affairs',
    summary: 'Protect organizations through rigorous contract drafting, corporate governance, regulatory licensing, intellectual property, and dispute resolution.',
    category: 'Business, Management & Consulting',
    demandLevel: 'High',
    demandContext: 'Strong demand in commercial law firms, banks, telecoms, mining/energy companies, and regulatory authorities.',
    programmeKeywords: ['law', 'llb', 'jurisprudence', 'legal', 'public administration', 'international relations', 'business'],
    departmentKeywords: ['law', 'legal', 'public law', 'private law', 'commercial law'],
    courseCodeKeywords: ['LW', 'LL', 'LA', 'BL'],
    courseTitleKeywords: ['Contract Law', 'Company Law', 'Commercial Law', 'Administrative Law', 'Tax Law', 'Labour Law', 'Constitutional Law'],
    interestKeywords: ['Public Policy & Social Impact', 'Entrepreneurship & Business', 'Finance & Investment'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,200,000 / month',
      midRange: '2,500,000 – 5,500,000 / month',
      seniorRange: '6,000,000 – 14,000,000+ / month',
      note: 'Estimated ranges vary by Admission to the Bar (Advocate status), corporate law firm tier, and in-house sector.'
    },
    responsibilities: [
      'Draft, review, and negotiate commercial agreements, shareholder contracts, SLAs, and financing documents.',
      'Ensure corporate compliance with BRELA, sector regulators (BoT, TCRA, EWURA, Mining Commission), and data protection laws.',
      'Serve as Company Secretary supporting Board governance, resolutions, and statutory filings.',
      'Manage litigation strategy, arbitration, and external legal counsel.'
    ],
    requiredSkills: [
      { id: 'sk-law-1', name: 'Commercial & Corporate Law Drafting', category: 'Core Academic', level: 'Advanced', description: 'Precision drafting of contracts, indemnities, and corporate governance instruments.', relatedCourseKeywords: ['Contract Law', 'Company Law', 'Commercial Law', 'LW'] },
      { id: 'sk-law-2', name: 'Regulatory Compliance & Risk Advisory', category: 'Domain & Industry', level: 'Intermediate', description: 'Navigating licensing, data privacy, AML/CFT, and competition law (FCC).', relatedCourseKeywords: ['Administrative Law', 'Tax Law', 'Banking Law'] },
      { id: 'sk-law-3', name: 'Legal Research, Negotiation & Dispute Resolution', category: 'Professional', level: 'Advanced', description: 'Case law analysis, commercial arbitration, and stakeholder negotiation.', relatedCourseKeywords: ['Legal Method', 'Civil Procedure', 'Arbitration'] }
    ],
    recommendedCertifications: [
      { name: 'Postgraduate Diploma in Legal Practice (Law School of Tanzania) & Roll of Advocates', provider: 'Law School of Tanzania / Judiciary', level: 'Professional', whyItMatters: 'Mandatory qualification to practice as an Advocate of the High Court.' },
      { name: 'Chartered Governance / Company Secretary or CIPP Data Privacy', provider: 'CGI / IAPP', level: 'Intermediate', whyItMatters: 'High-value specialization for corporate boards, fintech, and telecoms.' }
    ],
    recommendedProjects: [
      {
        title: 'FinTech / Renewable Energy Regulatory Compliance & Contract Playbook',
        difficulty: 'Intermediate',
        description: 'Produce a structured regulatory licensing matrix and annotated commercial SLA/Data Processing Agreement template compliant with Tanzanian Personal Data Protection and sector laws.',
        skillsPracticed: ['Contract Drafting', 'Regulatory Mapping', 'Data Protection Law']
      }
    ],
    industries: ['Corporate & Commercial Law Firms', 'Banking & Financial Institutions', 'Telecommunications & FinTech', 'Mining, Oil & Gas', 'Regulatory Authorities & Public Corporations'],
    careerProgression: ['Legal Officer / Pupil Advocate', 'Associate / In-House Legal Counsel', 'Senior Legal Counsel & Company Secretary', 'General Counsel / Managing Partner'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-public-policy-governance-analyst',
    title: 'Public Policy, Governance & International Development Analyst',
    subtitle: 'Policy Analysis, Public Sector Reform, Diplomacy & Institutional Strategy',
    summary: 'Research, design, and evaluate public policies, regulatory reforms, trade frameworks, and governance programmes for ministries, think tanks, and multilateral bodies.',
    category: 'Education, Policy & Research',
    demandLevel: 'Growing',
    demandContext: 'Consistent opportunities in government ministries, policy research institutes, diplomatic missions, EAC/SADC regional bodies, and international NGOs.',
    programmeKeywords: ['political science', 'public administration', 'international relations', 'development studies', 'history', 'sociology', 'economics', 'law'],
    departmentKeywords: ['political science', 'public administration', 'development', 'history', 'social'],
    courseCodeKeywords: ['PS', 'PA', 'IR', 'DS', 'EC', 'SO', 'HI'],
    courseTitleKeywords: ['Public Policy', 'Public Administration', 'International Relations', 'Political', 'Governance', 'Local Government', 'Development'],
    interestKeywords: ['Public Policy & Social Impact', 'Research & Academia'],
    compensation: {
      currency: 'TZS',
      entryRange: '950,000 – 1,900,000 / month',
      midRange: '2,200,000 – 4,500,000 / month',
      seniorRange: '5,000,000 – 10,500,000+ / month',
      note: 'Estimated ranges vary across public service scales, think tanks, embassies, and multilateral organizations.'
    },
    responsibilities: [
      'Analyze legislative bills, public expenditure budgets, and socio-economic data to draft evidence-based policy briefs.',
      'Facilitate multi-stakeholder dialogues between government ministries, private sector associations, and civil society.',
      'Evaluate public sector service delivery, decentralization reforms, and regional trade protocols (EAC / AfCFTA).',
      'Prepare grant proposals, diplomatic briefing notes, and institutional strategy documents.'
    ],
    requiredSkills: [
      { id: 'sk-pol-1', name: 'Public Policy Analysis & Regulatory Impact Assessment', category: 'Core Academic', level: 'Advanced', description: 'Evaluating policy alternatives, cost-benefit trade-offs, and institutional feasibility.', relatedCourseKeywords: ['Public Policy', 'Public Administration', 'Political', 'PS', 'PA'] },
      { id: 'sk-pol-2', name: 'Public Finance & Budget Analysis', category: 'Domain & Industry', level: 'Intermediate', description: 'Reading national budget books, CAG audit reports, and sector allocations.', relatedCourseKeywords: ['Public Finance', 'Economics', 'Budgeting'] },
      { id: 'sk-pol-3', name: 'Policy Brief Writing & Stakeholder Diplomacy', category: 'Professional', level: 'Advanced', description: 'Synthesizing complex research into clear 2-page executive policy briefs.', relatedCourseKeywords: ['Research Methods', 'International Relations', 'Communication'] }
    ],
    recommendedCertifications: [
      { name: 'Public Policy Challenges & Evidence-Based Policy Certificate', provider: 'University of Virginia / HarvardX', level: 'Foundational', whyItMatters: 'Strengthens structured policy memo writing and evaluation frameworks.' },
      { name: 'Project Management for Development Professionals (PMD Pro)', provider: 'PM4NGOs', level: 'Intermediate', whyItMatters: 'Widely recognized across international development and governance projects.' }
    ],
    recommendedProjects: [
      {
        title: 'Sector Budget & Regulatory Impact Policy Brief',
        difficulty: 'Intermediate',
        description: 'Author a rigorous 4-page policy brief analyzing national budget allocations, audit findings, and regional benchmarks for youth digital employment or agricultural trade under AfCFTA.',
        skillsPracticed: ['Budget Analysis', 'Policy Memo Writing', 'Stakeholder Mapping']
      }
    ],
    industries: ['Policy Think Tanks (REPOA, ESRF, Sikika, Twaweza)', 'Government Ministries & Local Authorities', 'Diplomatic Missions & Multilaterals (UN, World Bank, EU, EAC)', 'Private Sector Business Associations (TPSF, CTI)'],
    careerProgression: ['Research / Policy Assistant', 'Policy & Governance Analyst', 'Senior Policy Advisor / Programme Manager', 'Director of Policy & Institutional Strategy'],
    workModes: ['On-site', 'Hybrid']
  },
  {
    id: 'cp-strategic-communications-media-specialist',
    title: 'Strategic Communications, Public Relations & Media Specialist',
    subtitle: 'Corporate Affairs, Public Advocacy, Editorial Strategy & Digital Storytelling',
    summary: 'Shape institutional reputation, public health/development behavior-change campaigns, and executive communications across broadcast, digital, and stakeholder channels.',
    category: 'Business, Management & Consulting',
    demandLevel: 'Growing',
    demandContext: 'Steady demand across corporate communications departments, international organizations, media houses, and PR agencies.',
    programmeKeywords: ['journalism', 'mass communication', 'public relations', 'linguistics', 'literature', 'kiswahili', 'english', 'languages', 'arts', 'fine art', 'heritage'],
    departmentKeywords: ['journalism', 'communication', 'languages', 'linguistics', 'literature', 'arts'],
    courseCodeKeywords: ['JM', 'MC', 'PR', 'LG', 'LL', 'SW', 'EN'],
    courseTitleKeywords: ['Communication', 'Journalism', 'Public Relations', 'Linguistics', 'Media', 'Editing', 'Translation'],
    interestKeywords: ['Public Policy & Social Impact', 'Entrepreneurship & Business', 'Education & Academic Leadership'],
    compensation: {
      currency: 'TZS',
      entryRange: '800,000 – 1,600,000 / month',
      midRange: '1,800,000 – 3,800,000 / month',
      seniorRange: '4,200,000 – 9,000,000+ / month',
      note: 'Estimated ranges vary between media houses, corporate telecom/banking PR teams, and international agencies.'
    },
    responsibilities: [
      'Design and execute integrated corporate communications, crisis response, and Social & Behavior Change Communication (SBCC) campaigns.',
      'Write press releases, executive speeches, annual impact reports, and bilingual (English/Kiswahili) policy publications.',
      'Manage media relations, digital content calendars, and multimedia documentary production.',
      'Track brand sentiment, audience reach, and campaign engagement analytics.'
    ],
    requiredSkills: [
      { id: 'sk-com-1', name: 'Bilingual Editorial & Executive Writing (English & Kiswahili)', category: 'Core Academic', level: 'Advanced', description: 'High-impact writing, translation, and editorial precision across audiences.', relatedCourseKeywords: ['Linguistics', 'Communication', 'Journalism', 'Kiswahili', 'LG', 'JM'] },
      { id: 'sk-com-2', name: 'Public Relations, Crisis Comms & SBCC Strategy', category: 'Domain & Industry', level: 'Intermediate', description: 'Stakeholder messaging, reputation management, and behavior-change frameworks.', relatedCourseKeywords: ['Public Relations', 'Media', 'MC', 'PR'] },
      { id: 'sk-com-3', name: 'Digital Media Production & Analytics', category: 'Technical & Tools', level: 'Intermediate', description: 'Multimedia storytelling, layout design, and audience analytics.', relatedCourseKeywords: ['Multimedia', 'Digital', 'Publishing'] }
    ],
    recommendedCertifications: [
      { name: 'CIPR (Chartered Institute of Public Relations) or Strategic Communications Certificate', provider: 'CIPR / PRST Tanzania', level: 'Professional', whyItMatters: 'Recognized credential for corporate affairs and PR leaders.' },
      { name: 'Social & Behavior Change Communication (SBCC)', provider: 'Johns Hopkins / Global Health eLearning', level: 'Intermediate', whyItMatters: 'Highly valued by UN agencies and international NGOs.' }
    ],
    recommendedProjects: [
      {
        title: 'Bilingual Corporate Annual Impact Report & Crisis Communication Playbook',
        difficulty: 'Beginner',
        description: 'Produce a polished bilingual (English/Kiswahili) impact report prototype and a 48-hour crisis communication response playbook for a financial institution or public health agency.',
        skillsPracticed: ['Executive Copywriting', 'Crisis Communication', 'Bilingual Translation']
      }
    ],
    industries: ['Corporate Communications (Banks, Telecoms, Mining)', 'International NGOs & UN Agencies', 'PR & Creative Agencies', 'Broadcast & Digital Media Houses', 'Government Directorate of Communications'],
    careerProgression: ['Communications / Editorial Officer', 'PR & Corporate Affairs Specialist', 'Senior Communications Manager', 'Head of Corporate Affairs & Sustainability'],
    workModes: ['Hybrid', 'On-site']
  },

  // ==========================================================================
  // CLUSTER 6 EXTENDED: NATURAL SCIENCES, HEALTH, AGRICULTURE & ENVIRONMENT
  // ==========================================================================
  {
    id: 'cp-public-health-epidemiology-specialist',
    title: 'Epidemiologist & Public Health Surveillance Specialist',
    subtitle: 'Disease Surveillance, Health Systems Analytics & Clinical Research',
    summary: 'Investigate disease patterns, design public health interventions, analyze clinical/HMIS datasets, and strengthen national and community health systems.',
    category: 'Healthcare, Biotech & Life Sciences',
    demandLevel: 'High',
    demandContext: 'High demand across research institutes (NIMR, Ifakara Health Institute), Ministry of Health, WHO/CDC partners, and global health NGOs.',
    programmeKeywords: ['medicine', 'nursing', 'public health', 'environmental health', 'biology', 'microbiology', 'biomedical', 'laboratory', 'pharmacy', 'nutrition', 'statistics'],
    departmentKeywords: ['public health', 'medicine', 'biology', 'microbiology', 'epidemiology', 'health'],
    courseCodeKeywords: ['PH', 'MD', 'BL', 'MB', 'EP', 'ST', 'NU'],
    courseTitleKeywords: ['Epidemiology', 'Biostatistics', 'Public Health', 'Microbiology', 'Infectious Diseases', 'Research Methods', 'Community Health'],
    interestKeywords: ['Healthcare, Life Sciences & Biotech', 'Research & Academia', 'Data & Analytics'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,200,000 – 2,400,000 / month',
      midRange: '2,600,000 – 5,200,000 / month',
      seniorRange: '5,800,000 – 12,500,000+ / month',
      note: 'Estimated ranges vary across biomedical research institutes, international health organizations, and public health agencies.'
    },
    responsibilities: [
      'Analyze routine health management information system (DHIS2) data and outbreak surveillance reports.',
      'Design and manage epidemiological cohort, case-control, and clinical trial studies.',
      'Compute disease incidence, prevalence, odds ratios, and survival models using R, Stata, or Python.',
      'Translate epidemiological evidence into national disease control guidelines (malaria, HIV, TB, maternal health, NCDs).'
    ],
    requiredSkills: [
      { id: 'sk-epi-1', name: 'Epidemiological Study Design & Disease Surveillance', category: 'Core Academic', level: 'Advanced', description: 'Outbreak investigation, bias control, and infectious/NCD epidemiology.', relatedCourseKeywords: ['Epidemiology', 'Public Health', 'Microbiology', 'BL', 'PH'] },
      { id: 'sk-epi-2', name: 'Biostatistics & DHIS2 Health Analytics (R / Stata)', category: 'Technical & Tools', level: 'Advanced', description: 'Logistic regression, survival analysis, and DHIS2 health indicator dashboards.', relatedCourseKeywords: ['Biostatistics', 'Statistics', 'Research Methods', 'ST'] },
      { id: 'sk-epi-3', name: 'Good Clinical Practice (GCP) & Research Ethics', category: 'Domain & Industry', level: 'Intermediate', description: 'NIMR ethical clearance protocols and clinical data integrity.', relatedCourseKeywords: ['Ethics', 'Clinical', 'Research'] }
    ],
    recommendedCertifications: [
      { name: 'ICH Good Clinical Practice (GCP) & Research Ethics', provider: 'Global Health Training Centre / NIDA', level: 'Foundational', whyItMatters: 'Mandatory certification for working on clinical and public health research studies.' },
      { name: 'DHIS2 Academy Fundamentals & Epidemiology Specialization', provider: 'University of Oslo (DHIS2) / Johns Hopkins Coursera', level: 'Intermediate', whyItMatters: 'DHIS2 is the national health information platform across East Africa.' }
    ],
    recommendedProjects: [
      {
        title: 'Regional Disease Surveillance & Maternal Health Indicator Analysis',
        difficulty: 'Intermediate',
        description: 'Analyze a public DHS (Demographic and Health Survey) or simulated DHIS2 dataset in R/Stata to model risk factors, compute adjusted odds ratios, and map high-burden districts.',
        skillsPracticed: ['R / Stata Biostatistics', 'Odds Ratios & Regression', 'Public Health Mapping']
      }
    ],
    industries: ['Biomedical Research Institutes (Ifakara Health Institute, NIMR, MUHAS)', 'International Health Agencies (WHO, UNICEF, CDC, PATH, Jhpiego)', 'Ministry of Health', 'Hospital Clinical Research Units'],
    careerProgression: ['Research Officer / Field Epidemiologist', 'Epidemiologist / Public Health Specialist', 'Senior Epidemiologist / Principal Investigator', 'Director of Public Health & Clinical Research'],
    workModes: ['Hybrid', 'On-site']
  },
  {
    id: 'cp-quality-assurance-laboratory-scientist',
    title: 'Analytical Laboratory, Quality Assurance & Regulatory Scientist',
    subtitle: 'Analytical Chemistry, Microbiology, TBS/TMDA Standards & ISO 17025',
    summary: 'Perform high-precision chemical, microbiological, and pharmaceutical quality testing to safeguard food, drugs, water, cosmetics, and industrial products.',
    category: 'Healthcare, Biotech & Life Sciences',
    demandLevel: 'High',
    demandContext: 'Strong demand in TBS, TMDA, pharmaceutical plants, beverage/food manufacturers, mining assay labs, and agricultural testing centers.',
    programmeKeywords: ['chemistry', 'biology', 'microbiology', 'biochemistry', 'biotechnology', 'food science', 'laboratory', 'pharmacy', 'chemical', 'science'],
    departmentKeywords: ['chemistry', 'biology', 'biochemistry', 'food science', 'pharmacy', 'science'],
    courseCodeKeywords: ['CH', 'BL', 'BC', 'MB', 'FS', 'PH'],
    courseTitleKeywords: ['Analytical Chemistry', 'Organic Chemistry', 'Microbiology', 'Biochemistry', 'Instrumental Analysis', 'Quality Control', 'Spectroscopy'],
    interestKeywords: ['Healthcare, Life Sciences & Biotech', 'Engineering & Infrastructure'],
    compensation: {
      currency: 'TZS',
      entryRange: '950,000 – 1,950,000 / month',
      midRange: '2,200,000 – 4,400,000 / month',
      seniorRange: '4,800,000 – 9,800,000+ / month',
      note: 'Estimated ranges vary across regulatory bodies (TBS, TMDA, GCLA), multinational FMCG/pharma plants, and commercial assay laboratories.'
    },
    responsibilities: [
      'Operate analytical instruments (HPLC, GC-MS, AAS, UV-Vis spectrophotometers) and microbiological assays on raw materials and finished products.',
      'Maintain ISO/IEC 17025 laboratory accreditation, calibration schedules, and Good Manufacturing Practice (GMP / HACCP) compliance.',
      'Validate analytical test methods, investigate out-of-specification (OOS) batches, and issue Certificates of Analysis (CoA).',
      'Ensure safe handling of chemical reagents and regulatory compliance with GCLA, TBS, and TMDA.'
    ],
    requiredSkills: [
      { id: 'sk-lab-1', name: 'Instrumental Chemical & Microbiological Analysis', category: 'Core Academic', level: 'Advanced', description: 'Chromatography (HPLC/GC), spectroscopy (AAS/UV-Vis), titration, and microbial culturing.', relatedCourseKeywords: ['Analytical Chemistry', 'Microbiology', 'Biochemistry', 'CH', 'BL'] },
      { id: 'sk-lab-2', name: 'ISO 17025, GMP & HACCP Quality Systems', category: 'Domain & Industry', level: 'Intermediate', description: 'Method validation, standard operating procedures (SOPs), and regulatory auditing.', relatedCourseKeywords: ['Quality', 'Laboratory', 'Food Science'] },
      { id: 'sk-lab-3', name: 'Statistical Quality Control (SQC) & LIMS', category: 'Technical & Tools', level: 'Intermediate', description: 'Shewhart control charts, measurement uncertainty, and Laboratory Information Management Systems.', relatedCourseKeywords: ['Statistics', 'Analytical Chemistry'] }
    ],
    recommendedCertifications: [
      { name: 'ISO/IEC 17025 Laboratory Quality Management & HACCP / ISO 22000', provider: 'TBS / SGS / BSI', level: 'Professional', whyItMatters: 'Core industry standard for accredited testing laboratories and food/pharma plants.' },
      { name: 'GCLA / Professional Chemist or Laboratory Scientist Registration', provider: 'GCLA / Professional Boards', level: 'Professional', whyItMatters: 'Recognized regulatory credential in Tanzania.' }
    ],
    recommendedProjects: [
      {
        title: 'Analytical Method Validation & Statistical Quality Control (SQC) Package',
        difficulty: 'Intermediate',
        description: 'Build a complete ISO 17025 method validation workbook computing limit of detection (LOD/LOQ), recovery accuracy, measurement uncertainty, and Shewhart control charts for water or pharmaceutical testing.',
        skillsPracticed: ['Method Validation (LOD/LOQ)', 'Shewhart Control Charts', 'ISO 17025 Documentation']
      }
    ],
    industries: ['Regulatory Agencies (TBS, TMDA, GCLA)', 'Pharmaceutical & Medical Device Manufacturing', 'Beverage, Dairy & Food Processing', 'Mining Geochemical Assay Labs (SGS, ALS)', 'Water Utilities'],
    careerProgression: ['Laboratory Analyst / QC Chemist', 'Senior Analytical Scientist / QA Officer', 'Quality Assurance / Laboratory Manager', 'Head of Quality & Regulatory Affairs'],
    workModes: ['On-site']
  },
  {
    id: 'cp-climate-esg-environmental-scientist',
    title: 'Climate Change, Carbon Markets & ESG Sustainability Specialist',
    subtitle: 'Environmental Impact, Carbon Credits, Conservation & Corporate ESG Reporting',
    summary: 'Measure environmental footprints, develop carbon credit/nature-based projects, conduct biodiversity assessments, and guide corporate ESG sustainability compliance.',
    category: 'Healthcare, Biotech & Life Sciences',
    demandLevel: 'High',
    demandContext: 'Fast-growing demand across carbon project developers, mining/energy ESG teams, banks (green finance), conservation agencies, and climate consultancies.',
    programmeKeywords: ['environmental', 'forestry', 'wildlife', 'aquatic', 'marine', 'botany', 'zoology', 'ecology', 'geography', 'climate', 'agriculture', 'natural resources'],
    departmentKeywords: ['environmental', 'botany', 'zoology', 'aquatic', 'geography', 'forestry', 'wildlife'],
    courseCodeKeywords: ['EV', 'EN', 'BT', 'ZL', 'AQ', 'GY', 'FR', 'WL'],
    courseTitleKeywords: ['Ecology', 'Environmental', 'Climate', 'Conservation', 'Biodiversity', 'Natural Resource', 'Forestry', 'Marine'],
    interestKeywords: ['Agriculture, Climate & Environment', 'Public Policy & Social Impact', 'Research & Academia'],
    compensation: {
      currency: 'TZS',
      entryRange: '1,000,000 – 2,100,000 / month',
      midRange: '2,400,000 – 4,800,000 / month',
      seniorRange: '5,200,000 – 11,500,000+ / month',
      note: 'Estimated ranges are strong in carbon market developers, mining ESG departments, and international conservation NGOs.'
    },
    responsibilities: [
      'Conduct baseline ecological surveys, biomass/carbon stock inventories, and Environmental & Social Impact Assessments (ESIA).',
      'Develop and monitor REDD+, afforestation, or clean-cooking carbon credit projects under Verra (VCS) and Gold Standard frameworks.',
      'Prepare corporate ESG disclosures aligned with IFC Performance Standards, GRI, and IFRS S1/S2 climate reporting.',
      'Use GIS and remote sensing to track deforestation, marine ecosystem health, and climate vulnerability.'
    ],
    requiredSkills: [
      { id: 'sk-esg-1', name: 'Ecological Assessment & Carbon Accounting (GHG Protocol)', category: 'Core Academic', level: 'Advanced', description: 'Biomass estimation, biodiversity indices, and Scope 1-3 emissions accounting.', relatedCourseKeywords: ['Ecology', 'Environmental', 'Botany', 'Forestry', 'BT', 'EV'] },
      { id: 'sk-esg-2', name: 'ESIA & ESG Safeguards (NEMC / IFC / Verra)', category: 'Domain & Industry', level: 'Intermediate', description: 'Environmental management plans, community safeguards, and carbon regulations.', relatedCourseKeywords: ['Environmental Management', 'Conservation', 'Policy'] },
      { id: 'sk-esg-3', name: 'Spatial Conservation Mapping (QGIS / Remote Sensing)', category: 'Technical & Tools', level: 'Intermediate', description: 'Mapping habitat change and carbon project polygons.', relatedCourseKeywords: ['GIS', 'Remote Sensing', 'Geography'] }
    ],
    recommendedCertifications: [
      { name: 'NEMC Registered Environmental Expert', provider: 'National Environment Management Council (NEMC)', level: 'Professional', whyItMatters: 'Statutory certification for environmental impact auditing in Tanzania.' },
      { name: 'GHG Protocol Carbon Accounting & IFC ESG Performance Standards', provider: 'GHG Management Institute / IFC', level: 'Intermediate', whyItMatters: 'Directly unlocks roles in carbon markets, green banking, and mining sustainability.' }
    ],
    recommendedProjects: [
      {
        title: 'Community Forest Carbon Stock Inventory & Corporate GHG Footprint Model',
        difficulty: 'Intermediate',
        description: 'Build an allometric biomass carbon calculator and QGIS land-cover map estimating carbon sequestration potential and Scope 1-2 GHG emissions for an agribusiness or conservation area.',
        skillsPracticed: ['Carbon Stock Accounting', 'QGIS Land-Cover Mapping', 'ESG Reporting']
      }
    ],
    industries: ['Carbon Market & Nature-Based Project Developers', 'Conservation NGOs (WWF, WCS, TNC, FZS, IUCN)', 'Mining, Energy & Infrastructure ESG Teams', 'Commercial Banks (Sustainable & Climate Finance)', 'Environmental Consultancies'],
    careerProgression: ['Environmental / Conservation Officer', 'Climate & ESG Specialist', 'Senior Carbon / Sustainability Manager', 'Head of ESG & Climate Strategy'],
    workModes: ['Hybrid', 'On-site']
  }
];
