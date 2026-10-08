/**
 * VENUE — SUBSCRIPTION ENTITLEMENT FOUNDATION SERVICE
 *
 * Provides a clean, honest, server-backed entitlement boundary for VENUE features.
 *
 * IMPORTANT RULES:
 * - Reading/viewing academic materials inside VENUE is FREE for all authorized students.
 * - Downloading the original material file requires VENUE Premium entitlement.
 * - Google Play Billing / subscription purchasing is NOT yet implemented in this stage.
 * - Do NOT fake subscription status, do NOT hardcode users as Premium, and do NOT
 *   trust client-side localStorage or React state overrides.
 */

export type SubscriptionTier = 'free' | 'premium';

export interface MaterialDownloadEntitlementResult {
  allowed: boolean;
  isPremium: boolean;
  tier: SubscriptionTier;
  reason?: 'PREMIUM_REQUIRED' | 'BILLING_NOT_AVAILABLE' | 'UNAUTHORIZED' | 'ERROR';
  title: string;
  message: string;
}

class SubscriptionEntitlementService {
  /**
   * Checks whether the current user has an active VENUE Premium subscription.
   * Because Google Play Billing / Subscription backend is not yet connected,
   * this honestly returns false (Free tier) and does NOT read from localStorage
   * or client-writable state.
   */
  public isPremiumUser(_userId?: string): boolean {
    return false;
  }

  /**
   * Queries the server-side entitlement verification endpoint before initiating
   * any material file download.
   *
   * This ensures:
   * 1. The file is NEVER downloaded first and blocked afterward.
   * 2. Frontend state manipulation cannot bypass server-side download checks.
   */
  public async verifyMaterialDownloadEntitlement(params: {
    userId?: string;
    materialId: string;
    storagePath?: string;
  }): Promise<MaterialDownloadEntitlementResult> {
    try {
      const response = await fetch('/api/materials/entitlement/check-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: params.userId || '',
          materialId: params.materialId,
          storagePath: params.storagePath || '',
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.allowed === true && data?.isPremium === true) {
        return {
          allowed: true,
          isPremium: true,
          tier: 'premium',
          title: 'Download Authorized',
          message: 'Starting material download...',
        };
      }

      return {
        allowed: false,
        isPremium: false,
        tier: 'free',
        reason: data?.reason || 'PREMIUM_REQUIRED',
        title: data?.title || 'Premium Download',
        message:
          data?.message ||
          'Reading this material is free inside VENUE. Downloading course materials for offline use is available with VENUE Premium.',
      };
    } catch {
      return {
        allowed: false,
        isPremium: false,
        tier: 'free',
        reason: 'PREMIUM_REQUIRED',
        title: 'Premium Download',
        message:
          'Reading this material is free inside VENUE. Downloading course materials for offline use is available with VENUE Premium.',
      };
    }
  }
}

export const subscriptionEntitlementService = new SubscriptionEntitlementService();
