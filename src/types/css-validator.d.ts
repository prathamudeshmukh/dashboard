declare module 'css-validator' {
  export type ValidationError = {
    message: string;
    line: number;
  };

  export type ValidationResult = {
    errors?: ValidationError[];
    warnings?: ValidationError[];
  };

  type CssValidatorOptions = {
    text: string; // The CSS text to validate
    profile?: string; // Optional CSS profile (e.g., "css3")
    medium?: string; // Optional medium (e.g., "all", "screen", "print")
  };

  function validate(
    options: CssValidatorOptions,
    callback: (err: Error | null, result: ValidationResult) => void
  ): void;

  export = validate;
}
