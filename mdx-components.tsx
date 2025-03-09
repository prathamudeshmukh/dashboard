import type { MDXComponents } from 'mdx/types';

import { a, code, h1, h2, h3, li, p, ul } from '@/documentation/Components';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1,
    h2,
    h3,
    p,
    code,
    ul,
    li,
    a,
    ...components,
  };
}
