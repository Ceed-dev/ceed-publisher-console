/**
 * @fileoverview Ad-related type definitions for Publisher Console
 *
 * This module contains type definitions synchronized with ads-dashboard
 * for displaying ad information in logs and analytics views.
 *
 * @note Publisher Console is a monitoring dashboard for media partners.
 * Ad creation/management is handled by ads-dashboard (internal tool).
 * These types are READ-ONLY for Publisher Console.
 *
 * @module types/ad
 */

// =============================================================================
// Basic Types
// =============================================================================

/**
 * Available ad formats in the Ceed Ads platform
 * @description Synchronized with ads-dashboard for type consistency
 */
export type AdFormat = 'action_card' | 'lead_gen' | 'static' | 'followup';

/**
 * Ad lifecycle status
 */
export type AdStatus = 'active' | 'paused' | 'archived';

/**
 * Supported locale codes for ad content
 */
export type LocaleCode = 'eng' | 'jpn';

/**
 * Localized text structure for multi-language ad content
 * @example { eng: 'Hello', jpn: 'こんにちは' }
 */
export type LocalizedText = Partial<Record<LocaleCode, string>>;

// =============================================================================
// Lead Generation Format (lead_gen)
// =============================================================================

/**
 * HTML autocomplete attribute values for lead gen form inputs
 */
export type AutocompleteType = 'email' | 'name' | 'tel' | 'off';

/**
 * Configuration for lead generation ad format
 * @description Email collection form embedded in ad unit
 */
export interface LeadGenConfig {
  /** Placeholder text for input field */
  placeholder: LocalizedText;
  /** Submit button label */
  submitButtonText: LocalizedText;
  /** Browser autocomplete hint for the input */
  autocompleteType: AutocompleteType;
  /** Message shown after successful submission */
  successMessage: LocalizedText;
}

// =============================================================================
// Static Display Format (static)
// =============================================================================

/**
 * Display position options for static ads
 */
export type DisplayPosition = 'top' | 'bottom' | 'inline' | 'sidebar';

/**
 * Targeting parameters for static ad display
 */
export interface StaticTargetingParams {
  /** Keyword-based targeting */
  keywords?: string[];
  /** Geographic targeting (country/region codes) */
  geo?: string[];
  /** Device type targeting */
  deviceTypes?: ('desktop' | 'mobile' | 'tablet')[];
}

/**
 * Configuration for static display ad format
 * @description Page load targeting display ad
 */
export interface StaticConfig {
  /** Where the ad appears on the page */
  displayPosition: DisplayPosition;
  /** Optional targeting parameters */
  targetingParams?: StaticTargetingParams;
}

// =============================================================================
// Follow-up Question Format (followup)
// =============================================================================

/**
 * User interaction types for followup ads
 */
export type FollowupTapAction = 'expand' | 'redirect' | 'submit';

/**
 * Configuration for follow-up question ad format
 * @description Sponsored question format for conversational contexts
 */
export interface FollowupConfig {
  /** The sponsored question text */
  questionText: LocalizedText;
  /** What happens when user taps the question */
  tapAction: FollowupTapAction;
  /** Redirect URL (required when tapAction is 'redirect') */
  tapActionUrl?: string;
}

// =============================================================================
// SDK Response Types
// =============================================================================

/**
 * Resolved ad data as returned by SDK endpoints
 *
 * @description This is the ad structure returned to publishers via the SDK.
 * All localized fields are resolved to a single language based on the request.
 * Used for displaying ad information in logs and analytics.
 *
 * @example
 * ```typescript
 * const ad: ResolvedAd = {
 *   id: 'ad_123',
 *   advertiserId: 'adv_456',
 *   advertiserName: 'Example Corp',
 *   format: 'action_card',
 *   title: 'Check out our product',
 *   description: 'Amazing deals await',
 *   ctaText: 'Learn More',
 *   ctaUrl: 'https://example.com',
 * };
 * ```
 */
export interface ResolvedAd {
  /** Unique ad identifier */
  id: string;
  /** Advertiser reference */
  advertiserId: string;
  /** Advertiser display name */
  advertiserName: string;
  /** Ad format type */
  format: AdFormat;
  /** Resolved title (single language) */
  title: string;
  /** Resolved description (single language) */
  description: string;
  /** Resolved CTA button text (single language) */
  ctaText: string;
  /** Click-through URL */
  ctaUrl: string;
  /** Lead gen config (resolved to single language, if format is lead_gen) */
  leadGenConfig?: {
    placeholder: string;
    submitButtonText: string;
    autocompleteType: AutocompleteType;
    successMessage: string;
  };
  /** Static config (if format is static) */
  staticConfig?: StaticConfig;
  /** Followup config (resolved to single language, if format is followup) */
  followupConfig?: {
    questionText: string;
    tapAction: FollowupTapAction;
    tapActionUrl?: string;
  };
}

// =============================================================================
// UI Display Constants
// =============================================================================

/**
 * Human-readable labels for ad formats
 * @description Used in UI dropdowns, tables, and badges
 */
export const AD_FORMAT_LABELS: Record<AdFormat, string> = {
  action_card: 'Action Card',
  lead_gen: 'Lead Generation',
  static: 'Static Display',
  followup: 'Follow-up Question',
} as const;

/**
 * Brief descriptions for each ad format
 * @description Used in UI tooltips and help text
 */
export const AD_FORMAT_DESCRIPTIONS: Record<AdFormat, string> = {
  action_card: 'Contextual ad with CTA button',
  lead_gen: 'Email collection form embedded in ad',
  static: 'Page load targeting display ad',
  followup: 'Sponsored question format',
} as const;
