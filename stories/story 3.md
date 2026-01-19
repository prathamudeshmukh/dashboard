# Story 3: Variables Review UI with JSON Editor

## Business Context

With Stories 1 and 2 complete, the system can now identify variables and return them to the dashboard. However, users currently only see a generic "PDF Processed Successfully" message with no visibility into the variables that were identified. To reduce manual work and improve the onboarding experience, users need to see the identified variables in an editable JSON format so they can review, modify if needed, and confirm before proceeding to template creation.

This story enhances the PDF extraction success screen to display the variables JSON in an editable code editor, giving developers full control while maintaining simplicity.

## Story Text

**As a** developer who has uploaded a PDF for template extraction,

**I want** to see the identified variables displayed in a JSON editor on the extraction success screen,

**So that** I can review the auto-detected variables and their sample values before creating my template.

## Acceptance Criteria

### AC1: Variables JSON displayed when extraction completes
**Given** a user has uploaded a PDF and the extraction job completes successfully
**When** the PDFExtractor component polls and receives status "Completed" with `output.variables`
**Then** the success screen displays the variables JSON in a formatted, editable code editor
**And** the existing success message "PDF Processed Successfully" is still shown
**And** the success alert and checkmarks remain visible

### AC2: JSON editor is pre-populated with identified variables
**Given** the extraction output includes variables like:
```json
{
  "invoice_number": "INV-12345",
  "customer_name": "John Doe",
  "total_amount": "$1,234.56"
}
```
**When** the success screen renders
**Then** the JSON editor displays this data with proper formatting (indentation, syntax highlighting)
**And** the JSON is pretty-printed (2-space indentation)
**And** keys and values are syntax-highlighted for readability

### AC3: User can edit the JSON in the editor
**Given** the variables JSON is displayed in the editor
**When** the user clicks into the editor
**Then** the user can edit the JSON content (add, remove, or modify keys/values)
**And** the cursor position and text selection work as expected
**And** standard keyboard shortcuts work (Ctrl+A, Ctrl+C, Ctrl+V, etc.)

### AC4: Empty variables handled gracefully
**Given** the extraction output includes `"variables": {}`
**When** the success screen renders
**Then** the JSON editor displays an empty object `{}`
**And** a helper message appears: "No variables detected. You can manually add variables or proceed without them."
**And** the user can still edit the JSON to add variables manually

### AC5: Variables editor positioned on the success screen
**Given** the extraction completes successfully
**When** the success screen renders
**Then** the layout includes:
- Success alert at the top (existing)
- Variables section with heading "Review Variables"
- JSON editor below the heading
- "OK" button below the editor (to be implemented in Story 4)
**And** the layout is responsive and works on different screen sizes

### AC6: Component state updated when JSON is edited
**Given** the user edits the variables JSON
**When** the user makes changes in the editor
**Then** the component's local state is updated with the edited JSON string
**And** the edited JSON is ready to be validated and persisted (Story 4 handles validation)

### AC7: Visual polish and developer-friendly UX
**Given** the variables editor is displayed
**Then** the editor has a code-friendly appearance:
- Monospace font (e.g., 'Monaco', 'Courier New')
- Dark theme or syntax highlighting
- Line numbers (optional but nice-to-have)
- Proper contrast for readability
**And** the editor has a label or heading: "Sample Variables (JSON)"
**And** helper text explains: "Review and edit the identified variables. These will be used as sample data for your template."

### AC8: Existing success indicators still work
**Given** the variables editor is added to the success screen
**When** the screen renders
**Then** the existing success indicators still appear:
- Green checkmark icon
- "PDF Processed Successfully" heading
- "HTML structure generated" text with checkmark
- "Template ready for customization" text with checkmark
**And** these elements are not hidden or broken by the new variables section

## Out of Scope

- **JSON validation**: Handled in Story 4
- **"OK" button functionality**: Handled in Story 4
- **Persisting variables to template store**: Handled in Story 4
- **Variable name suggestions**: AI provides the names; no autocomplete or suggestions in the editor
- **Inline validation errors**: Story 4 handles validation and error display
- **Undo/redo functionality**: Standard browser undo is sufficient
- **Advanced editor features**: No collapsible sections, diff view, or search/replace
- **Accessibility enhancements**: Basic accessibility is fine for MVP (keyboard navigation, screen reader support can be improved later)
- **Mobile optimization**: Responsive layout is acceptable; touch-optimized editor not required

## Dependencies

### Blocking Dependencies
- **Story 2 must be complete**: Inngest job must return `{htmlContent, variables}` in output
- **getStatus API** must return the enhanced job output format

### Non-blocking Dependencies
- **Code editor library**: Decision on which editor to use (Monaco, CodeMirror, or simple textarea)
- **Existing PDFExtractor component**: Must be updated to handle new success state

## Assumptions

1. **Editor choice**: A lightweight JSON editor library (e.g., `react-json-view`, `@monaco-editor/react`, or enhanced `<textarea>`) is acceptable for MVP
2. **JSON size**: Variable JSON will typically be < 1000 lines; no special handling for massive JSON objects needed
3. **Browser compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support
4. **State management**: Using existing `useTemplateStore` Zustand store to persist variables is acceptable
5. **Polling behavior**: Existing polling mechanism in `pollJobStatus` continues to work and provides `output.variables`
6. **Success screen lifecycle**: The success screen persists until the user clicks "OK" or navigates away
7. **Default JSON format**: Pretty-printed with 2-space indentation is the standard format
8. **No server-side validation yet**: Client-side editing only; server validation happens when template is created (later in flow)

## Technical Notes

### Files to Modify

**1. PDFExtractor.tsx**
- Update `pollJobStatus` to extract `variables` from `response.output`
- Add state: `const [variables, setVariables] = useState<Record<string, any>>({})`
- Update the success screen JSX to include variables editor
- Add handler for JSON changes: `handleVariablesChange`

**2. Component Dependencies**
- Install a JSON editor library if needed (e.g., `npm install react-json-view` or `@monaco-editor/react`)
- Or use a simple controlled `<textarea>` with JSON formatting

**3. Styling**
- Add CSS/Tailwind classes for code editor appearance
- Ensure responsive layout with proper spacing

### Implementation Example

**Updated pollJobStatus:**
```typescript
async function pollJobStatus(runID: string) {
  try {
    let response = await getStatus(runID);

    while (response.status !== 'Completed' && response.status !== 'Failed' && response.status !== 'Cancelled') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      response = await getStatus(runID);
    }

    if (response.status === 'Completed') {
      setpdfExtractionStatus(PdfExtractionStatusEnum.COMPLETED);
      setHtmlContent(response.output.htmlContent);
      setHandlebarsCode(response.output.htmlContent);

      // NEW: Extract variables
      const extractedVariables = response.output.variables || {};
      setVariables(extractedVariables);
      setVariablesJson(JSON.stringify(extractedVariables, null, 2));
    } else if (response.status === 'Failed' || response.status === 'Cancelled') {
      setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED);
    }
  } catch (error) {
    console.error('An error occurred while polling job status:', error);
    setpdfExtractionStatus(PdfExtractionStatusEnum.FAILED);
  }
}
```

**Updated success screen JSX:**
```tsx
{ pdfExtractionStatus === PdfExtractionStatusEnum.COMPLETED && (
  <div className="space-y-4">
    {/* Existing success alert */}
    <Alert className="border-green-200 bg-green-50">
      <Check className="size-4 text-green-600" />
      <AlertTitle className="text-green-800">PDF Processed Successfully</AlertTitle>
      <AlertDescription className="text-green-700">
        We've extracted the template from your PDF. Review the identified variables below before proceeding.
      </AlertDescription>
    </Alert>

    {/* NEW: Variables section */}
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-lg font-semibold">Sample Variables (JSON)</h3>
      <p className="mb-3 text-sm text-muted-foreground">
        Review and edit the identified variables. These will be used as sample data for your template.
      </p>

      {Object.keys(variables).length === 0 && (
        <p className="mb-2 text-sm text-amber-600">
          No variables detected. You can manually add variables or proceed without them.
        </p>
      )}

      <textarea
        value={variablesJson}
        onChange={e => setVariablesJson(e.target.value)}
        className="h-64 w-full rounded-md border p-3 font-mono text-sm focus:ring-2 focus:ring-primary"
        placeholder="{}"
      />
    </div>

    {/* Existing checkmarks */}
    <div className="mt-4 border-t pt-4">
      <div className="mt-2 flex items-center text-sm text-muted-foreground">
        <Check className="mr-2 size-4 text-green-600" />
        <span>HTML structure generated</span>
      </div>
      <div className="mt-2 flex items-center text-sm text-muted-foreground">
        <Check className="mr-2 size-4 text-green-600" />
        <span>Template ready for customization</span>
      </div>
    </div>

    {/* OK button - functionality in Story 4 */}
    <Button
      className="mt-4 w-full"
      onClick={() => { /* Story 4 */ }}
    >
      OK
    </Button>
  </div>
); }
```

### Alternative: Using react-json-view

If using a library like `react-json-view`:

```tsx
import ReactJson from 'react-json-view';

<ReactJson
  src={variables}
  onEdit={(edit) => {
    setVariables(edit.updated_src);
    setVariablesJson(JSON.stringify(edit.updated_src, null, 2));
  }}
  onAdd={(add) => {
    setVariables(add.updated_src);
    setVariablesJson(JSON.stringify(add.updated_src, null, 2));
  }}
  onDelete={(del) => {
    setVariables(del.updated_src);
    setVariablesJson(JSON.stringify(del.updated_src, null, 2));
  }}
  theme="monokai"
  style={{ padding: '1rem', borderRadius: '0.5rem' }}
/>;
```

### UI/UX Wireframe

```
┌─────────────────────────────────────────────────────┐
│ ✓ PDF Processed Successfully                        │
│   We've extracted the template from your PDF.       │
│   Review the identified variables below.            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Sample Variables (JSON)                              │
│ Review and edit the identified variables...         │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ {                                               │ │
│ │   "invoice_number": "INV-12345",                │ │
│ │   "customer_name": "John Doe",                  │ │
│ │   "total_amount": "$1,234.56",                  │ │
│ │   "invoice_date": "2025-12-15"                  │ │
│ │ }                                               │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

✓ HTML structure generated
✓ Template ready for customization

┌─────────────────────────────────────────────────────┐
│                       OK                            │
└─────────────────────────────────────────────────────┘
```

### State Management

Add to PDFExtractor component state:
```typescript
const [variables, setVariables] = useState<Record<string, any>>({});
const [variablesJson, setVariablesJson] = useState<string>('{}');
```

### Testing Considerations

**Unit Tests:**
- Verify variables are extracted from job output
- Verify empty variables object is handled gracefully
- Verify JSON is pretty-printed on initial render

**Integration Tests (Playwright):**
- Upload PDF, wait for success, verify variables section appears
- Verify JSON editor is editable
- Verify existing success indicators still present

**Manual Testing:**
- Test with PDF that has multiple variables
- Test with PDF that has no variables (empty JSON)
- Test editing JSON (add key, remove key, modify value)
- Test on mobile/tablet responsive layout
