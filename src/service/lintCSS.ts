import cssValidator, { type ValidationError, type ValidationResult } from 'css-validator';

// Helper: Lint CSS content
const lintCSS = async (css: string): Promise<string[]> => {
  if (!css) {
    return [];
  } // Skip validation if CSS is empty

  const validationResult = await new Promise((resolve, reject) => {
    cssValidator({ text: css }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });

  const errors = (validationResult as ValidationResult)?.errors || [];
  return errors.map((error: ValidationError) => `${error.message} (line: ${error.line})`);
};

export default lintCSS;
