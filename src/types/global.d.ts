import type { OrgPermission, OrgRole } from './Auth';

// Use type safe message keys with `next-intl`
type Messages = typeof import('../locales/en.json');

// eslint-disable-next-line ts/consistent-type-definitions
declare interface IntlMessages extends Messages {}

// MDX module declarations
declare module '*.mdx' {
  const MDXComponent: (props: any) => JSX.Element;
  export default MDXComponent;
}

declare module '*.mdx?url' {
  const url: string;
  export default url;
}

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface ClerkAuthorization {
    permission: OrgPermission;
    role: OrgRole;
  }
}
