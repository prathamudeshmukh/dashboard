/* eslint-disable regexp/no-contradiction-with-assertion */
/* eslint-disable regexp/no-super-linear-backtracking */

import type { Editor } from 'grapesjs';

// Enhanced exporter: converts GrapeJS HTML back to Handlebars format
export function exportToHandlebars(editor: Editor) {
  const html = editor.getHtml();

  let restored = html;

  // 1) Handle collections: <data-collection ...> -> {{#each path}} ... {{/each}}
  const collectionRE = /<data-collection\b[^>]*data-gjs-data-resolver=(['"])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/data-collection>/gi;
  restored = restored.replace(collectionRE, (_, _q, resolverJson, inner) => {
    try {
      const resolver = JSON.parse(resolverJson);
      const path = resolver.dataSource?.path || resolver.path;
      return path ? `{{#each ${path}}}\n${inner}\n{{/each}}` : inner || '';
    } catch (e) {
      console.error('Error in export to handlebar', e);
      return inner || '';
    }
  });

  // 2) Handle conditions: <data-condition ...> -> {{#if condition}} ... {{/if}}
  const conditionRE = /<data-condition\b[^>]*data-gjs-data-resolver=(['"])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/data-condition>/gi;
  restored = restored.replace(conditionRE, (_, _q, resolverJson, inner) => {
    try {
      const resolver = JSON.parse(resolverJson);
      const condition = resolver.condition?.statements?.[0]?.left?.path;
      if (condition) {
        // Handle true/false content
        const trueContentRE = /<data-condition-true-content>([\s\S]*?)<\/data-condition-true-content>/gi;
        const falseContentRE = /<data-condition-false-content>([\s\S]*?)<\/data-condition-false-content>/gi;

        let trueContent = '';
        let falseContent = '';

        inner.replace(trueContentRE, (_: string, content: string) => {
          trueContent = content;
          return '';
        });

        inner.replace(falseContentRE, (_: string, content: string) => {
          falseContent = content;
          return '';
        });

        if (falseContent) {
          return `{{#if ${condition}}}\n${trueContent}\n{{else}}\n${falseContent}\n{{/if}}`;
        } else {
          return `{{#if ${condition}}}\n${trueContent}\n{{/if}}`;
        }
      }
      return inner || '';
    } catch (e) {
      console.error('Error in export to handlebar', e);
      return inner || '';
    }
  });

  // 3) Handle variables: <data-variable ...> -> {{path}}
  const variableRE = /<data-variable\b[^>]*data-gjs-data-resolver=(['"])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/data-variable>/gi;
  restored = restored.replace(variableRE, (_, _q, resolverJson, inner) => {
    try {
      const resolver = JSON.parse(resolverJson);
      const path = resolver.path || (resolver.dataSource && resolver.dataSource.path);
      return path ? `{{${path}}}` : inner || '';
    } catch (e) {
      console.error('Error in export to handlebar', e);
      return inner || '';
    }
  });

  // 4) Clean up any remaining data-* wrapper tags
  restored = restored
    .replace(/<\/?data-condition-true-content>/gi, '')
    .replace(/<\/?data-condition-false-content>/gi, '')
    .replace(/<\/?data-condition[^>]*>/gi, '')
    .replace(/<\/?data-collection[^>]*>/gi, '')
    .replace(/<\/?data-variable[^>]*>/gi, '');

  // 5) Clean up extra whitespace and normalize
  restored = restored
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
    .trim();

  // return template + css appended
  const result = restored;
  return result;
}
