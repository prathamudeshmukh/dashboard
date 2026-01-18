# Python & FastAPI Coding Guidelines - Templify

This document provides Python and FastAPI specific coding standards for the Templify pdf2llm2html service. It extends the [core-standards.md](core-standards.md) with Python-specific best practices.

**Always read [core-standards.md](core-standards.md) first** - this document assumes those principles.

---

## Table of Contents
- [Project Context](#project-context)
- [Python Standards](#python-standards)
- [FastAPI Patterns](#fastapi-patterns)
- [Async/Await Best Practices](#asyncawait-best-practices)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Logging & Observability](#logging--observability)
- [Performance Guidelines](#performance-guidelines)

---

## Project Context

### Stack Overview (pdf2llm2html)
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **LLM**: OpenAI Vision API
- **PDF Processing**: pdf2image, Pillow
- **Async**: httpx for HTTP calls
- **Retry Logic**: tenacity

### Project Structure
```
src/pdf2html_api/
├── main.py              # FastAPI app & routes
├── config.py            # Configuration & settings
├── llm.py               # OpenAI Vision integration
├── pdf_to_images.py     # PDF rendering
├── html_merge.py        # HTML page merging
└── prompts/
    └── image_to_html.md # LLM prompt template
```

---

## Python Standards

### Code Style

**Follow PEP 8** with these additions:
- Maximum line length: 100 characters
- Use double quotes for strings
- Use f-strings for formatting

```python
# ✅ Good
def convert_pdf_to_html(
    pdf_url: str,
    dpi: int = 200,
    max_workers: int = 3
) -> dict[str, Any]:
    """Convert PDF to HTML using OpenAI Vision API.

    Args:
        pdf_url: URL of the PDF to convert
        dpi: Resolution for PDF rendering
        max_workers: Number of parallel workers

    Returns:
        Dictionary containing HTML and metadata
    """
    result = f"Processing {pdf_url} at {dpi} DPI"
    return {"html": result, "pages": 0}

# ❌ Avoid
def convert_pdf_to_html(pdf_url, dpi=200, max_workers=3):  # Missing types
    result = "Processing %s at %s DPI" % (pdf_url, dpi)  # Old-style formatting
    return {"html": result, "pages": 0}
```

### Type Hints

**Always use type hints**
```python
from typing import Optional, Any
from collections.abc import Callable

# ✅ Good
def process_page(
    page_num: int,
    callback: Callable[[int], str]
) -> Optional[str]:
    if page_num < 0:
        return None
    return callback(page_num)

# Modern Python 3.10+ syntax
def merge_results(
    results: list[dict[str, Any]]
) -> dict[str, Any]:
    return {"merged": results}

# ❌ Avoid
def process_page(page_num, callback):
    if page_num < 0:
        return None
    return callback(page_num)
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Variables/Functions | snake_case | `convert_pdf`, `page_count` |
| Classes | PascalCase | `HTMLGenerator`, `PDFConverter` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_DPI` |
| Private/Internal | prefix `_` | `_internal_helper` |
| Async functions | Same as sync | `async def convert_pdf()` |

### Docstrings

**Use Google-style docstrings**
```python
def render_pdf_to_images(
    pdf_path: str,
    dpi: int = 200,
    output_dir: Optional[str] = None
) -> list[str]:
    """Render each page of a PDF to images.

    This function converts PDF pages to PNG images using pdf2image.
    Images are saved to a temporary directory unless output_dir is specified.

    Args:
        pdf_path: Path to the PDF file to render
        dpi: Resolution for image rendering. Higher values produce better
            quality but larger files
        output_dir: Optional directory for output images. If None, uses
            system temp directory

    Returns:
        List of file paths to the rendered images, one per page

    Raises:
        FileNotFoundError: If pdf_path does not exist
        ValueError: If dpi is less than 50 or greater than 600

    Example:
        >>> images = render_pdf_to_images("invoice.pdf", dpi=300)
        >>> len(images)
        5
    """
    pass
```

### Imports Organization

```python
# 1. Standard library
import os
import tempfile
from pathlib import Path
from typing import Optional

# 2. Third-party packages
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 3. Local imports
from .config import get_settings
from .llm import HTMLGenerator
```

---

## FastAPI Patterns

### Application Setup

```python
# main.py
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("pdf2html_api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PDF2HTML API",
    description="Convert PDF pages to HTML using OpenAI Vision API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup."""
    logger.info("Starting PDF2HTML API")
    # Initialize connections, load models, etc.

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    logger.info("Shutting down PDF2HTML API")
    # Close connections, cleanup temp files, etc.
```

### Request/Response Models

**Use Pydantic for validation**
```python
from pydantic import BaseModel, HttpUrl, Field, validator

class PDFRequest(BaseModel):
    """Request model for PDF conversion."""

    pdf_url: HttpUrl
    model: str = Field(default="gpt-4o-mini", description="OpenAI model to use")
    dpi: int = Field(default=200, ge=50, le=600, description="Image DPI")
    max_tokens: int = Field(default=4000, ge=100, le=16000)
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    css_mode: str = Field(default="grid", regex="^(grid|flexbox|table)$")
    max_parallel_workers: int = Field(default=3, ge=1, le=10)

    @validator("dpi")
    def validate_dpi(cls, v: int) -> int:
        """Ensure DPI is within reasonable bounds."""
        if v % 50 != 0:
            raise ValueError("DPI should be a multiple of 50")
        return v

class PDFResponse(BaseModel):
    """Response model for PDF conversion."""

    html: str
    pages_processed: int
    pages_failed: int = 0
    processing_time_seconds: float
    total_tokens_used: int = 0
    model: str

    class Config:
        json_schema_extra = {
            "example": {
                "html": "<html>...</html>",
                "pages_processed": 5,
                "pages_failed": 0,
                "processing_time_seconds": 12.5,
                "total_tokens_used": 3500,
                "model": "gpt-4o-mini"
            }
        }
```

### Route Handlers

**Pattern**: One route per endpoint
```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

@app.post(
    "/convert",
    response_model=PDFResponse,
    status_code=200,
    summary="Convert PDF to HTML",
    description="Converts each page of a PDF to HTML using OpenAI Vision API"
)
async def convert_pdf(
    request: PDFRequest,
    background_tasks: BackgroundTasks
) -> PDFResponse:
    """Convert PDF to HTML.

    Args:
        request: PDF conversion parameters
        background_tasks: FastAPI background tasks for cleanup

    Returns:
        Conversion results with HTML and metadata

    Raises:
        HTTPException: If conversion fails
    """
    start_time = time.time()

    try:
        # 1. Validate request
        logger.info(f"Starting conversion for {request.pdf_url}")

        # 2. Download PDF
        pdf_path = await download_pdf(str(request.pdf_url))
        background_tasks.add_task(cleanup_file, pdf_path)

        # 3. Render to images
        images = await render_pdf_to_images(
            pdf_path,
            dpi=request.dpi
        )

        # 4. Convert pages with LLM
        results = await process_pages_parallel(
            images,
            model=request.model,
            max_workers=request.max_parallel_workers
        )

        # 5. Merge HTML
        final_html = merge_pages(results)

        # 6. Return response
        return PDFResponse(
            html=final_html,
            pages_processed=len(results),
            processing_time_seconds=time.time() - start_time,
            model=request.model
        )

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Conversion failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"PDF conversion failed: {str(e)}"
        )
```

### Dependency Injection

**Use FastAPI dependencies for reusable logic**
```python
from fastapi import Depends, Header, HTTPException

async def verify_token(authorization: str = Header(...)) -> str:
    """Verify bearer token authentication.

    Args:
        authorization: Authorization header value

    Returns:
        Validated token

    Raises:
        HTTPException: If token is invalid
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header"
        )

    token = authorization.replace("Bearer ", "")
    expected_token = os.getenv("API_TOKEN")

    if token != expected_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return token

@app.post("/convert")
async def convert_pdf(
    request: PDFRequest,
    token: str = Depends(verify_token)
) -> PDFResponse:
    """Convert PDF with authentication."""
    # Token is automatically validated
    pass
```

---

## Async/Await Best Practices

### When to Use Async

**Use async for I/O-bound operations**
```python
# ✅ Good - async for network calls
async def download_pdf(url: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
            f.write(response.content)
            return f.name

# ✅ Good - sync for CPU-bound work
def render_pdf_page(pdf_path: str, page_num: int) -> bytes:
    """CPU-intensive rendering stays synchronous."""
    # Use pdf2image synchronously
    pass
```

### Parallel Processing

**Use asyncio.gather for concurrent tasks**
```python
import asyncio
from typing import Any

async def process_pages_parallel(
    image_paths: list[str],
    model: str,
    max_workers: int = 3
) -> list[dict[str, Any]]:
    """Process multiple pages in parallel.

    Args:
        image_paths: List of image file paths
        model: OpenAI model name
        max_workers: Maximum concurrent workers

    Returns:
        List of results, one per page
    """
    semaphore = asyncio.Semaphore(max_workers)

    async def process_with_semaphore(path: str, page_num: int) -> dict[str, Any]:
        async with semaphore:
            return await process_single_page(path, page_num, model)

    tasks = [
        process_with_semaphore(path, i)
        for i, path in enumerate(image_paths)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle any exceptions
    processed_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Page {i} failed: {result}")
            processed_results.append({
                "page": i,
                "html": "<div>Error processing page</div>",
                "error": str(result)
            })
        else:
            processed_results.append(result)

    return processed_results
```

### Using httpx for HTTP Calls

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_openai_api(
    image_base64: str,
    prompt: str,
    model: str = "gpt-4o-mini"
) -> dict[str, Any]:
    """Call OpenAI Vision API with retry logic.

    Args:
        image_base64: Base64-encoded image
        prompt: Prompt for the LLM
        model: Model name

    Returns:
        API response

    Raises:
        httpx.HTTPStatusError: If API call fails after retries
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }]
            }
        )
        response.raise_for_status()
        return response.json()
```

---

## Error Handling

### Exception Hierarchy

**Create domain-specific exceptions**
```python
class PDF2HTMLError(Exception):
    """Base exception for PDF2HTML errors."""
    pass

class PDFDownloadError(PDF2HTMLError):
    """Failed to download PDF."""
    pass

class PDFRenderError(PDF2HTMLError):
    """Failed to render PDF to images."""
    pass

class LLMProcessingError(PDF2HTMLError):
    """LLM processing failed."""
    pass
```

### Error Handling Pattern

```python
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def process_pdf(pdf_url: str) -> dict[str, Any]:
    """Process PDF with comprehensive error handling."""
    try:
        # Download
        try:
            pdf_path = await download_pdf(pdf_url)
        except httpx.HTTPError as e:
            logger.error(f"Failed to download PDF: {e}")
            raise PDFDownloadError(f"Could not download PDF from {pdf_url}") from e

        # Render
        try:
            images = render_pdf_to_images(pdf_path)
        except Exception as e:
            logger.error(f"Failed to render PDF: {e}")
            raise PDFRenderError("PDF rendering failed") from e

        # Process
        try:
            results = await process_pages(images)
        except Exception as e:
            logger.error(f"LLM processing failed: {e}")
            raise LLMProcessingError("Page processing failed") from e

        return {"html": merge_pages(results)}

    except PDF2HTMLError as e:
        # Re-raise domain errors
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise PDF2HTMLError(f"Unexpected error: {str(e)}") from e
```

### HTTPException Usage

```python
@app.get("/status/{job_id}")
async def get_job_status(job_id: str) -> dict[str, Any]:
    """Get status of a conversion job."""

    # 400 - Bad Request
    if not job_id or len(job_id) < 10:
        raise HTTPException(
            status_code=400,
            detail="Invalid job_id format"
        )

    # 404 - Not Found
    job = await get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=f"Job {job_id} not found"
        )

    # 500 - Internal Server Error
    try:
        result = await process_job(job)
    except Exception as e:
        logger.error(f"Job processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Job processing failed"
        )

    return result
```

---

## Testing Standards

### Test Structure

**Use pytest with async support**
```python
# tests/test_api.py
import pytest
from httpx import AsyncClient
from src.pdf2html_api.main import app

@pytest.mark.asyncio
async def test_convert_endpoint_success():
    """Test successful PDF conversion."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/convert",
            json={
                "pdf_url": "https://example.com/test.pdf",
                "dpi": 200,
                "model": "gpt-4o-mini"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "html" in data
        assert data["pages_processed"] > 0

@pytest.mark.asyncio
async def test_convert_endpoint_invalid_url():
    """Test conversion with invalid PDF URL."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/convert",
            json={"pdf_url": "not-a-url"}
        )

        assert response.status_code == 422  # Validation error
```

### Fixtures

**Create reusable test fixtures**
```python
import pytest
from pathlib import Path

@pytest.fixture
def sample_pdf_path() -> Path:
    """Provide path to sample PDF for testing."""
    return Path(__file__).parent / "fixtures" / "sample.pdf"

@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response."""
    return {
        "choices": [{
            "message": {
                "content": "<html><body>Test</body></html>"
            }
        }],
        "usage": {
            "total_tokens": 100
        }
    }

@pytest.mark.asyncio
async def test_process_page(sample_pdf_path, mock_openai_response, monkeypatch):
    """Test single page processing."""
    # Mock the API call
    async def mock_call_api(*args, **kwargs):
        return mock_openai_response

    monkeypatch.setattr("src.pdf2html_api.llm.call_openai_api", mock_call_api)

    # Test
    result = await process_page(sample_pdf_path, 0)
    assert "<html>" in result["html"]
```

### Mocking

**Use pytest-mock or unittest.mock**
```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_download_pdf_retry():
    """Test PDF download retries on failure."""
    mock_client = AsyncMock()
    mock_client.get.side_effect = [
        httpx.TimeoutException("Timeout"),
        httpx.TimeoutException("Timeout"),
        AsyncMock(content=b"PDF content", status_code=200)
    ]

    with patch("httpx.AsyncClient", return_value=mock_client):
        result = await download_pdf("https://example.com/test.pdf")
        assert result is not None
        assert mock_client.get.call_count == 3
```

---

## Logging & Observability

### Structured Logging

```python
import logging
import json
from typing import Any

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Add extra fields
        if hasattr(record, "pdf_url"):
            log_data["pdf_url"] = record.pdf_url
        if hasattr(record, "page_num"):
            log_data["page_num"] = record.page_num

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)

# Configure
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger("pdf2html_api")
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

### Logging Best Practices

```python
import logging

logger = logging.getLogger(__name__)

async def convert_pdf(pdf_url: str) -> dict[str, Any]:
    """Convert PDF with proper logging."""

    # INFO: Business events
    logger.info(
        "Starting PDF conversion",
        extra={"pdf_url": pdf_url, "event": "conversion_started"}
    )

    try:
        result = await process_pdf(pdf_url)

        # INFO: Successful completion
        logger.info(
            "PDF conversion completed",
            extra={
                "pdf_url": pdf_url,
                "pages": result["pages_processed"],
                "duration_seconds": result["processing_time_seconds"],
                "event": "conversion_completed"
            }
        )

        return result

    except PDFDownloadError as e:
        # WARNING: Recoverable errors
        logger.warning(
            "PDF download failed, will retry",
            extra={"pdf_url": pdf_url, "error": str(e)}
        )
        raise

    except Exception as e:
        # ERROR: Unrecoverable errors
        logger.error(
            "PDF conversion failed",
            extra={"pdf_url": pdf_url, "error": str(e)},
            exc_info=True
        )
        raise
```

---

## Performance Guidelines

### Use Connection Pooling

```python
import httpx

# ✅ Good - reuse client
class OpenAIClient:
    """Shared HTTP client with connection pooling."""

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=60.0,
            limits=httpx.Limits(
                max_keepalive_connections=10,
                max_connections=20
            )
        )

    async def close(self):
        await self.client.aclose()

    async def call_api(self, payload: dict) -> dict:
        response = await self.client.post("/api", json=payload)
        return response.json()

# Initialize once
openai_client = OpenAIClient()

@app.on_event("shutdown")
async def shutdown():
    await openai_client.close()
```

### Batch Processing

```python
async def process_in_batches(
    items: list[Any],
    batch_size: int = 10
) -> list[Any]:
    """Process items in batches to avoid overwhelming resources."""
    results = []

    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        batch_results = await asyncio.gather(*[
            process_item(item) for item in batch
        ])
        results.extend(batch_results)

        # Optional: pause between batches
        if i + batch_size < len(items):
            await asyncio.sleep(1)

    return results
```

### Resource Cleanup

```python
import tempfile
import os
from pathlib import Path

async def cleanup_temp_files(file_paths: list[str]):
    """Clean up temporary files after processing."""
    for path in file_paths:
        try:
            if os.path.exists(path):
                os.unlink(path)
                logger.debug(f"Cleaned up {path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup {path}: {e}")

@app.post("/convert")
async def convert_pdf(
    request: PDFRequest,
    background_tasks: BackgroundTasks
):
    """Convert PDF with automatic cleanup."""
    temp_files = []

    try:
        pdf_path = await download_pdf(str(request.pdf_url))
        temp_files.append(pdf_path)

        images = render_pdf_to_images(pdf_path)
        temp_files.extend(images)

        result = await process_pages(images)

        # Schedule cleanup in background
        background_tasks.add_task(cleanup_temp_files, temp_files)

        return result

    except Exception as e:
        # Immediate cleanup on error
        await cleanup_temp_files(temp_files)
        raise
```

---

## Configuration Management

### Use Pydantic Settings

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings from environment variables."""

    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    default_dpi: int = 200
    max_parallel_workers: int = 3
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

**Usage**
```python
from fastapi import Depends
from .config import get_settings, Settings

@app.post("/convert")
async def convert_pdf(
    request: PDFRequest,
    settings: Settings = Depends(get_settings)
):
    """Endpoint with injected settings."""
    model = request.model or settings.openai_model
    # ...
```

---

## Checklist for Code Reviews

- [ ] All functions have type hints and docstrings
- [ ] Async used appropriately for I/O operations
- [ ] Error handling is comprehensive with custom exceptions
- [ ] Logging includes structured context
- [ ] Pydantic models validate all inputs
- [ ] Tests cover happy path and error cases
- [ ] Resource cleanup (temp files, connections) is handled
- [ ] Retry logic for external API calls
- [ ] Connection pooling for HTTP clients
- [ ] No secrets in code (use environment variables)
- [ ] Imports properly organized
- [ ] Code follows PEP 8 style guide

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [asyncio Documentation](https://docs.python.org/3/library/asyncio.html)
- [Core Standards](./core-standards.md)
