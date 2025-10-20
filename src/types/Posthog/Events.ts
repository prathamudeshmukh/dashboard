export type LandingPageEvents =
  | 'landing_page_viewed'
  | 'hero_cta_clicked'
  | 'navbar_cta_clicked'
  | 'scroll_depth_reached'
  | 'pricing_section_viewed'
  | 'faq_interacted'
  | 'docs_or_blog_clicked'
  | 'signup_started'
  | 'user_account_created';

export type DocsPageEvents =
  | 'docs_page_viewed'
  | 'docs_section_viewed'
  | 'docs_code_example_copied'
  | 'docs_api_endpoint_clicked'
  | 'docs_external_link_clicked';

export type InAppCoreEvents =
  | 'dashboard_viewed'
  | 'template_created'
  | 'template_edited'
  | 'template_imported_from_pdf'
  | 'visual_editor_opened'
  | 'code_editor_opened'
  | 'api_call_generated_pdf'
  | 'api_call_failed';

export type AppEvents = LandingPageEvents | DocsPageEvents | InAppCoreEvents;

export type EventPayloads = {
  // --- Landing Page Events ---
  landing_page_viewed: {
    referrer?: string;
    utm_source?: string;
    device_type?: string;
    country?: string;
  };
  hero_cta_clicked: {
    button_text: string;
    page_section: string;
  };
  navbar_cta_clicked: {
    button_text: string;
    page_section: string;
  };
  scroll_depth_reached: {
    depth_percent: number;
    time_to_reach: number;
  };
  pricing_section_viewed: {
    time_on_page: number;
    from_section?: string;
  };
  faq_interacted: {
    question_text: string;
  };
  docs_or_blog_clicked: {
    link_url: string;
    link_text: string;
  };
  signup_started: {
    referrer?: string;
    utm_source?: string;
    device_type?: string;
  };
  user_account_created: {
    user_id: string;
    email?: string;
    source?: string;
  };

  // --- Docs Page Events ---
  docs_page_viewed: {
    referrer?: string;
    utm_source?: string;
    device_type?: string;
    country?: string;
    time_on_page?: number;
  };
  docs_section_viewed: {
    section_name: string;
    section_id: string;
    time_in_section?: number;
  };
  docs_code_example_copied: {
    example_type: string;
    language: string;
    section: string;
  };
  docs_api_endpoint_clicked: {
    endpoint: string;
    method: string;
    section: string;
  };
  docs_external_link_clicked: {
    link_url: string;
    link_text: string;
    section: string;
  };

  // --- In-App Core Events ---
  dashboard_viewed: {
    user_id: string;
    first_time: boolean;
  };
  template_created: {
    template_id: string;
    method: 'pdf' | 'gallery';
  };
  template_edited: {
    templateId: string;
    templateType: string;
  };
  template_imported_from_pdf: {
    file_size: number; // in bytes
    extraction_time: number; // in milliseconds
    success: boolean;
  };
  visual_editor_opened: {
    from_mode: 'code';
    user_id?: string;
  };
  code_editor_opened: {
    from_mode: 'visual';
    user_id?: string;
  };
  api_call_generated_pdf: {
    job_id: string;
    template_id: string;
    render_time: number;
  };
  api_call_failed: {
    error_code: string;
    duration: number;
    template_id: string;
  };
};
