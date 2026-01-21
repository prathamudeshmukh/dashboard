# Story 5: Observability for Variable Extraction Feature (NFR)

## Business Context

With the variable extraction feature now functional (Stories 1-4), we need visibility into how the feature performs in production to understand user behavior, identify issues, and measure success. As an onboarding accelerator feature that directly impacts "time-to-first-template" metrics, we need to track:

- How often variable extraction is used vs. manual template creation
- AI accuracy (how many variables are identified vs. how often users edit them)
- User engagement with the JSON editor (edit rate, validation failures)
- Performance impact (extraction time, token usage)

This observability story adds comprehensive logging, metrics tracking, and error monitoring across the backend (pdf2llm2html, Inngest) and frontend (dashboard UI) to support data-driven product decisions and operational health monitoring.

## Story Text

**As a** product and engineering team,

**We want** comprehensive observability into the variable extraction feature across all components,

**So that** we can monitor feature adoption, understand AI accuracy, identify performance bottlenecks, and proactively address issues in production.

## Acceptance Criteria

### AC1: Backend logging in pdf2llm2html service
**Given** the pdf2llm2html service receives a request with `extract_variables: true`
**When** the service processes the request
**Then** structured logs are emitted at key points:
- **Request received**: Log `extract_variables` flag state
- **Variable identification**: Log number of variables identified by AI
- **String replacement**: Log number of replacements performed
- **Response sent**: Log total processing time, pages processed, variable count
**And** logs include correlation IDs or request IDs for tracing
**And** logs follow existing logging standards (JSON format, appropriate log levels)

### AC2: Backend metrics in pdf2llm2html service
**Given** the service completes variable extraction
**When** metrics are captured
**Then** the following metrics are recorded:
- **Counter**: `variable_extraction_requests_total` (with label: `success/failure`)
- **Histogram**: `variable_extraction_duration_seconds` (extraction time)
- **Gauge**: `variables_identified_count` (per request)
- **Gauge**: `replacements_performed_count` (per request)
- **Counter**: `openai_tokens_used` (if available from OpenAI API response)
**And** metrics can be exported to monitoring systems (Prometheus, CloudWatch, etc.)

### AC3: Inngest job logging enhanced
**Given** the Inngest `extractPdfContent` job processes a PDF with variable extraction
**When** the job executes
**Then** structured logs include:
- **Step start**: "Calling pdf2llm2html with extract_variables: true"
- **Response received**: "Variables extracted: X variables, Y replacements"
- **Job completion**: "PDF extraction complete with variables, duration: Z seconds"
**And** logs include `pdfId` and `runID` for correlation
**And** warnings are logged if `variables` field is missing from response
**And** errors include full context for debugging (API errors, timeouts, etc.)

### AC4: PostHog event tracking for feature usage
**Given** key user interactions occur in the variable extraction flow
**When** events are triggered
**Then** PostHog events are tracked for:

**Event: `pdf_variables_extracted`**
- Triggered: When extraction completes with variables
- Properties:
  - `pdf_id`: Unique PDF identifier
  - `variables_count`: Number of variables identified
  - `has_variables`: Boolean (true if count > 0)
  - `extraction_time_ms`: Time taken for extraction
  - `user_id`: Clerk user ID

**Event: `variables_reviewed`**
- Triggered: When user sees variables on success screen
- Properties:
  - `pdf_id`: Unique PDF identifier
  - `initial_variables_count`: Number shown initially
  - `user_id`: Clerk user ID

**Event: `variables_edited`**
- Triggered: When user modifies JSON in editor
- Properties:
  - `pdf_id`: Unique PDF identifier
  - `initial_count`: Variables before edit
  - `final_count`: Variables after edit
  - `edit_type`: "added" | "removed" | "modified"
  - `user_id`: Clerk user ID

**Event: `variables_validation_failed`**
- Triggered: When JSON validation fails
- Properties:
  - `pdf_id`: Unique PDF identifier
  - `error_type`: Type of JSON error
  - `user_id`: Clerk user ID

**Event: `variables_confirmed`**
- Triggered: When user clicks "OK" with valid JSON
- Properties:
  - `pdf_id`: Unique PDF identifier
  - `final_variables_count`: Number of variables confirmed
  - `was_edited`: Boolean (did user edit the JSON?)
  - `user_id`: Clerk user ID

### AC5: Sentry error tracking enhanced
**Given** errors occur during variable extraction
**When** exceptions are captured
**Then** Sentry events include:
- **pdf2llm2html errors**: AI failures, replacement errors, timeout errors
- **Inngest job errors**: API call failures, response parsing errors
- **UI errors**: JSON validation errors, navigation failures
**And** error context includes:
  - `pdf_id` or `runID` for correlation
  - `extract_variables` flag state
  - Number of variables (if available)
  - User ID (when applicable)
**And** errors are tagged appropriately:
  - `feature: variable-extraction`
  - `component: pdf2llm2html | inngest | ui`
  - `error_type: ai-failure | network | validation`

### AC6: Performance monitoring for AI processing
**Given** the pdf2llm2html service uses OpenAI API for variable identification
**When** AI processing occurs
**Then** performance metrics are captured:
- **AI latency**: Time for OpenAI API call
- **Total extraction time**: End-to-end duration
- **Token usage**: Input and output tokens (from OpenAI response)
**And** metrics are tagged with:
  - Model used (e.g., `gpt-4o-mini`)
  - `extract_variables` flag state
  - Success/failure status

### AC7: User behavior analytics in JSON editor
**Given** users interact with the JSON editor
**When** interactions occur
**Then** analytics track:
- Time spent on variables review screen (duration)
- Edit rate (% of users who modify the JSON)
- Validation failure rate (% of sessions with invalid JSON)
- Confirmation rate (% of users who click OK vs. abandon)
**And** data is available in PostHog for funnel analysis

### AC8: Dashboard for observability data
**Given** observability data is being collected
**When** the team needs to monitor the feature
**Then** key metrics are available in dashboards:
- **Adoption**: Variable extraction requests/day
- **AI Performance**: Avg variables identified, extraction time p50/p95/p99
- **User Engagement**: Edit rate, validation failure rate, confirmation rate
- **Reliability**: Success rate, error rate, timeout rate
- **Cost**: OpenAI token usage, API calls/day
**And** dashboards support filtering by date range and user cohort

## Out of Scope

- **Real-time alerting**: Automated alerts for error spikes or performance degradation (separate ops concern)
- **User session replay**: Recording user interactions in the JSON editor (privacy/compliance concern)
- **A/B testing infrastructure**: Experimentation framework for testing variable extraction variations
- **Detailed AI prompt/response logging**: Full OpenAI request/response logging (cost/storage concern)
- **Custom metrics visualization**: Building custom dashboards in the app itself
- **Anomaly detection**: ML-based anomaly detection for metric outliers
- **Distributed tracing**: Full request tracing across all services (can be added later)
- **SLA monitoring**: Uptime monitoring and SLA tracking (separate story)

## Dependencies

### Blocking Dependencies
- **Stories 1-4 must be complete**: All functional code must be deployed before instrumenting
- **Sentry configured**: Dashboard and pdf2llm2html already use Sentry
- **PostHog configured**: Dashboard already uses PostHog for analytics

### Non-blocking Dependencies
- **Metrics backend**: Decision on metrics storage (Prometheus, CloudWatch, Datadog, etc.)
- **Dashboard tooling**: Grafana, CloudWatch Dashboards, or other visualization tools
- **Log aggregation**: Centralized logging (CloudWatch Logs, Datadog, Papertrail, etc.)

## Assumptions

1. **Existing observability infrastructure**: Sentry and PostHog are already configured and working in the dashboard
2. **Python logging**: pdf2llm2html service already uses structured logging (Python `logging` module)
3. **Inngest logging**: Inngest provides built-in logging via `logger` parameter
4. **Event volume**: Variable extraction usage won't generate excessive event volume that exceeds PostHog limits
5. **Performance impact**: Adding logging/metrics has negligible performance impact (<10ms overhead)
6. **PII compliance**: Logging variable names/values doesn't violate privacy policies (values are sample data from user PDFs)
7. **Retention**: Log and metric retention follows existing organizational policies
8. **Cost**: Additional logging/metrics costs are within acceptable limits

## Technical Notes

### Files to Modify

**Backend (pdf2llm2html):**
1. main.py - Add metrics and enhanced logging
2. llm.py - Log AI processing details
3. Add metrics middleware or decorator for request tracking

**Backend (Dashboard/Inngest):**
1. convertToHtml.ts - Enhanced logging
2. index.ts - Event tracking, error capture

**Frontend (Dashboard):**
1. PDFExtractor.tsx - PostHog event tracking
2. Track user interactions and validation failures

### Implementation Examples

#### pdf2llm2html Logging (Python)

```python
import logging
import time
from typing import Dict, Any

logger = logging.getLogger(__name__)

@app.post("/convert")
async def convert_pdf(request: PDFRequest):
    start_time = time.time()
    extract_vars = request.extract_variables

    logger.info("PDF conversion request received", extra={
        "pdf_url": request.pdf_url,
        "extract_variables": extract_vars,
        "model": request.model,
    })

    try:
        # Process PDF
        html, variables = await process_pdf(request)

        duration = time.time() - start_time
        var_count = len(variables) if variables else 0

        logger.info("PDF conversion completed", extra={
            "extract_variables": extract_vars,
            "variables_count": var_count,
            "duration_seconds": duration,
            "pages_processed": pages,
        })

        # Metrics (using Prometheus client or similar)
        VARIABLE_EXTRACTION_REQUESTS.labels(status="success").inc()
        VARIABLE_EXTRACTION_DURATION.observe(duration)
        VARIABLES_IDENTIFIED.set(var_count)

        return {
            "html": html,
            "variables": variables,
            "pages_processed": pages,
        }

    except Exception as e:
        duration = time.time() - start_time
        logger.error("PDF conversion failed", extra={
            "error": str(e),
            "extract_variables": extract_vars,
            "duration_seconds": duration,
        }, exc_info=True)

        # Capture in Sentry (if configured)
        sentry_sdk.capture_exception(e)

        VARIABLE_EXTRACTION_REQUESTS.labels(status="failure").inc()
        raise
```

#### Inngest Logging Enhancement

```typescript
export const extractPdfContent = inngest.createFunction(
  { id: 'extract-html' },
  { event: 'upload/extract.html' },
  async ({ event, step, logger }) => {
    const pdfId = event.data.pdfId;
    const startTime = Date.now();

    try {
      logger.info('Starting PDF extraction with variable detection', { pdfId });

      const { downloadUrl } = await step.run('fetch-blob-metadata', () =>
        fetchBlobMetadata(pdfId));

      const { html, variables } = await step.run('convert-to-html', async () => {
        logger.info('Calling pdf2llm2html with extract_variables: true', { pdfId });
        return await convertToHTML(downloadUrl, logger);
      });

      const duration = Date.now() - startTime;
      const varCount = Object.keys(variables).length;

      logger.info('PDF extraction completed with variables', {
        pdfId,
        variables_count: varCount,
        has_variables: varCount > 0,
        duration_ms: duration,
      });

      // Track PostHog event (server-side)
      await trackServerEvent({
        distinctId: pdfId,
        event: 'pdf_variables_extracted',
        properties: {
          pdf_id: pdfId,
          variables_count: varCount,
          has_variables: varCount > 0,
          extraction_time_ms: duration,
        },
      });

      return {
        htmlContent: html,
        variables
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error('PDF extraction failed', {
        pdfId,
        error: error.message,
        duration_ms: duration,
      });

      // Capture in Sentry with context
      Sentry.captureException(error, {
        tags: {
          feature: 'variable-extraction',
          component: 'inngest',
          pdf_id: pdfId,
        },
        extra: {
          duration_ms: duration,
        },
      });

      throw new Error(`Error during PDF processing: ${error.message}`);
    }
  },
);
```

#### Frontend Event Tracking

```typescript
// In PDFExtractor.tsx

// Track when variables are shown
useEffect(() => {
  if (pdfExtractionStatus === PdfExtractionStatusEnum.COMPLETED && variables) {
    trackEvent('variables_reviewed', {
      pdf_id: pdfId,
      initial_variables_count: Object.keys(variables).length,
      user_id: user?.id,
    });
  }
}, [pdfExtractionStatus, variables, pdfId, user]);

// Track edits
const handleVariablesChange = (newJson: string) => {
  setVariablesJson(newJson);
  debouncedValidation(newJson);

  // Track edit event
  try {
    const newVars = JSON.parse(newJson);
    const initialCount = Object.keys(variables).length;
    const finalCount = Object.keys(newVars).length;

    trackEvent('variables_edited', {
      pdf_id: pdfId,
      initial_count: initialCount,
      final_count: finalCount,
      edit_type: finalCount > initialCount
        ? 'added'
        : finalCount < initialCount ? 'removed' : 'modified',
      user_id: user?.id,
    });
  } catch {
    // Invalid JSON, tracked separately
  }
};

// Track validation failures
useEffect(() => {
  if (!isJsonValid && jsonError) {
    trackEvent('variables_validation_failed', {
      pdf_id: pdfId,
      error_type: jsonError.includes('Unexpected') ? 'syntax_error' : 'other',
      user_id: user?.id,
    });
  }
}, [isJsonValid, jsonError, pdfId, user]);

// Track confirmation
const handleOkClick = () => {
  if (!isJsonValid) {
    return;
  }

  const finalVars = JSON.parse(variablesJson);
  const wasEdited = variablesJson !== JSON.stringify(variables, null, 2);

  trackEvent('variables_confirmed', {
    pdf_id: pdfId,
    final_variables_count: Object.keys(finalVars).length,
    was_edited: wasEdited,
    user_id: user?.id,
  });

  // Continue with existing logic...
};
```

### Metrics to Monitor

**Adoption Metrics:**
- Total variable extraction requests/day
- % of PDF uploads using variable extraction vs. manual creation
- Unique users using variable extraction

**AI Performance Metrics:**
- Avg variables identified per PDF
- Variables identified distribution (p50, p95, p99)
- Extraction time (p50, p95, p99)
- Zero-variable rate (PDFs with no variables detected)

**User Engagement Metrics:**
- Edit rate (% of users who modify variables)
- Validation failure rate
- Confirmation rate (% who click OK vs. abandon)
- Avg time spent on review screen

**Reliability Metrics:**
- Success rate (% of successful extractions)
- Error rate by type (AI failure, network, timeout)
- Retry rate (Inngest job retries)

**Cost Metrics:**
- OpenAI API calls/day
- Token usage/request
- Estimated cost per extraction

### Dashboard Example (Grafana/CloudWatch)

**Panel 1: Adoption**
- Line chart: Variable extraction requests over time
- Pie chart: Manual vs. Variable extraction usage

**Panel 2: AI Performance**
- Line chart: Avg variables identified over time
- Histogram: Variables distribution
- Line chart: P95 extraction time

**Panel 3: User Engagement**
- Bar chart: Edit rate, validation failure rate, confirmation rate
- Line chart: Funnel drop-off by step

**Panel 4: Reliability**
- Line chart: Success rate over time
- Table: Top errors by frequency
- Line chart: Error rate by type

**Panel 5: Cost**
- Line chart: Token usage over time
- Single stat: Estimated daily cost

### Testing Observability

**Validation steps:**
1. Trigger variable extraction request → verify logs appear
2. Check metrics endpoint → verify counters increment
3. Edit variables in UI → verify PostHog events received
4. Cause validation error → verify Sentry event captured
5. Check dashboard → verify metrics visualized correctly

---

## Summary

This observability story provides comprehensive instrumentation across the variable extraction feature, enabling the team to:

- **Monitor adoption**: Understand how users engage with the feature
- **Measure AI accuracy**: Evaluate how well the AI identifies variables
- **Identify issues**: Quickly detect and diagnose errors
- **Optimize performance**: Track latency and resource usage
- **Make data-driven decisions**: Use metrics to guide product improvements

With all 5 stories complete, the variable extraction feature will be fully functional, user-friendly, and production-ready with robust observability.
