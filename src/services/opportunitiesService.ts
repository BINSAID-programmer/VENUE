import { authenticatedFetch } from './apiClient';
import { CareerOpportunityRecord, EvaluatedCareerOpportunity } from '../types';

export interface PostedOpportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  regionScope: string;
  fundingType: string;
  benefit: string;
  deadline: string;
  description: string;
  eligibility: string;
  applyUrl: string;
  featured: boolean;
  active?: boolean;
  clicks?: number;
  createdAt: string;
}

async function json(res: Response) {
  return res.json().catch(() => ({}));
}

export const OPPORTUNITY_TYPES = ['Internship', 'Attachment', 'Job', 'Scholarship', 'Fellowship', 'Training', 'Competition'];
export const OPPORTUNITY_FUNDING = ['Paid / Stipend', 'Fully Funded', 'Partially Funded', 'Unpaid / Experience', 'Training / Certificate'];

export const opportunitiesService = {
  async list(): Promise<PostedOpportunity[]> {
    try {
      const res = await fetch('/api/opportunities');
      if (!res.ok) return [];
      return (await json(res)).opportunities || [];
    } catch {
      return [];
    }
  },

  trackClick(id: string) {
    try {
      void fetch(`/api/opportunities/${encodeURIComponent(id)}/click`, { method: 'POST', keepalive: true });
    } catch {
      /* ignore */
    }
  },

  async adminList(): Promise<PostedOpportunity[]> {
    const res = await authenticatedFetch('/api/opportunities/admin/list', { cache: 'no-store' });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not load opportunities.');
    return data.opportunities || [];
  },

  async save(input: Partial<PostedOpportunity>): Promise<void> {
    const res = await authenticatedFetch('/api/opportunities/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not save.');
  },

  async remove(id: string): Promise<void> {
    const res = await authenticatedFetch(`/api/opportunities/admin/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Could not delete.');
  },

  /** Convert a posted opportunity to the shape the Scholarships screen already renders. */
  toEvaluated(p: PostedOpportunity): EvaluatedCareerOpportunity {
    const opportunity: CareerOpportunityRecord = {
      id: p.id,
      title: p.title,
      organization: p.organization,
      type: p.type as any,
      eligibleProgrammesOrFields: [],
      eligibleDisciplineClusters: ['ALL'],
      eligibleStudyLevels: ['All Levels'],
      location: p.location,
      regionScope: p.regionScope as any,
      fundingType: p.fundingType as any,
      fundingBenefitSummary: p.benefit || p.fundingType,
      deadline: p.deadline || 'Open until filled',
      isRecurringAnnual: false,
      description: p.description || '',
      eligibilityCriteria: p.eligibility ? [p.eligibility] : [],
      requiredDocuments: [],
      officialApplicationUrl: p.applyUrl,
      source: 'Posted on VENUE',
      lastVerifiedDate: (p.createdAt || '').slice(0, 10),
      dataStatus: 'Curated',
      featured: p.featured,
    };
    return {
      opportunity,
      eligibilityStatus: 'Check Specific Criteria',
      eligibilityReasons: [p.eligibility || 'Read the details and apply on the official link'],
    };
  },
};
