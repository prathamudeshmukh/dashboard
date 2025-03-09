import type { MDXComponents } from 'mdx/types';

import { a, code, h1, h2, h3, li, p, table, tbody, td, th, thead, tr, ul } from '@/documentation/Components';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1,
    h2,
    h3,
    p,
    code,
    ul,
    li,
    table,
    thead,
    tbody,
    tr,
    th,
    td,
    a,
    ...components,
  };
}
