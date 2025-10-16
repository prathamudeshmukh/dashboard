export type LandingPageEvents =
  | 'landing_page_viewed'
  | 'hero_cta_clicked'
  | 'navbar_cta_clicked'
  | 'scroll_depth_reached'
  | 'pricing_section_viewed'
  | 'faq_interacted'
  | 'docs_or_blog_clicked'
  | 'signup_started';

export type EventPayloads = {
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
    source_page: string;
    utm_source?: string;
  };
};
