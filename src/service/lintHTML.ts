import { HTMLHint } from 'htmlhint';

// Helper: Lint HTML content
const lintHTML = (html: string): string[] => {
  // Define HTMLHint rules
  const rules = {
    'tag-pair': true, // Ensure tags are properly paired
    'attr-value-not-empty': true, // Ensure attribute values are not empty
    'id-unique': true, // Ensure IDs are unique
    'src-not-empty': true, // Ensure `src` attributes are not empty
    'tag-self-close': true, // Ensure self-closing tags are properly closed
  };
    // Use HTMLHint.verify() to validate the HTML content
  const results = HTMLHint?.verify(html, rules);

  // Map the errors to extract error messages
  return results?.map((error: any) => `${error.rule.id}: ${error.message} at line ${error.line}, col ${error.col}`);
};

export default lintHTML;
