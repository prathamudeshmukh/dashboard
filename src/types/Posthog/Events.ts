export type LandingPageEvents =
  | 'landing_page_viewed'
  | 'hero_cta_clicked'
  | 'navbar_cta_clicked'
  | 'scroll_depth_reached'
  | 'pricing_section_viewed'
  | 'faq_interacted'
  | 'docs_or_blog_clicked'
  | 'signup_started'
  | 'user_account_created'
  | 'live_example_section_viewed'
  | 'live_example_cta_clicked';

export type InAppCoreEvents =
  | 'dashboard_viewed'
  | 'dashboard_ftux_shown'
  | 'create_template_cta_clicked'
  | 'template_created'
  | 'template_edited'
  | 'template_imported_from_pdf'
  | 'template_import_failed'
  | 'visual_editor_opened'
  | 'code_editor_opened'
  | 'wizard_step_viewed'
  | 'wizard_abandoned'
  | 'api_call_generated_pdf'
  | 'api_call_failed';

export type AppEvents = LandingPageEvents | InAppCoreEvents;

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
  live_example_section_viewed: {
    device_type?: string;
  };
  live_example_cta_clicked: {
    cta_label: 'try_it_out' | 'view_source';
    destination_url: string;
  };
  user_account_created: {
    user_id: string;
    email?: string;
    source?: string;
  };

  // --- In-App Core Events ---
  dashboard_viewed: {
    user_id: string;
    first_time: boolean;
  };
  dashboard_ftux_shown: {
    user_id: string;
  };
  create_template_cta_clicked: {
    cta_location: 'ftux' | 'table_header';
    user_has_templates: boolean;
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
    pdf_id: string;
    file_name: string;
    file_size: number; // in bytes
    extraction_time: number; // in milliseconds
    html_length: number; // chars in extracted HTML
  };
  template_import_failed: {
    pdf_id: string;
    file_name: string;
    file_size: number; // in bytes
    failure_stage: 'upload' | 'extraction';
    error_message?: string;
  };
  visual_editor_opened: {
    from_mode: 'code';
    user_id?: string;
  };
  code_editor_opened: {
    from_mode: 'visual';
    user_id?: string;
  };
  wizard_step_viewed: {
    step: number;
    step_name: string;
  };
  wizard_abandoned: {
    last_step: number;
    last_step_name: string;
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
