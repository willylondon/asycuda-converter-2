# API Documentation — ASYCUDA Excel Converter 2.0

## Endpoints

### POST /api/convert

Converts an uploaded Excel file to ASYCUDA XML.

**Request**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Excel file (`.xlsx` or `.xls`, max 10MB)

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "fileName": "manifest-2026-06.xml",
    "xmlContent": "<?xml version=\"1.0\"...",
    "stats": {
      "rowsProcessed": 150,
      "containers": 45,
      "validationIssues": 0
    }
  }
}
```

**Response** (400 Validation Error)
```json
{
  "success": false,
  "error": "Invalid file structure",
  "issues": [
    {
      "type": "error",
      "message": "Column \"Container Number\" is missing",
      "column": "Container Number"
    },
    {
      "type": "warning",
      "message": "Row 14 contains an empty \"Consignee\" field",
      "row": 14,
      "column": "Consignee"
    }
  ]
}
```

**Error Codes**

| Status | Meaning |
|--------|---------|
| 400 | Invalid file format, structure, or size |
| 413 | File too large (>10MB) |
| 429 | Rate limit exceeded |
| 500 | Server/processing error |

### GET /api/validate

Validates an Excel file structure without converting.

**Request**: Same as `/api/convert`

**Response** (200)
```json
{
  "success": true,
  "data": {
    "fileName": "manifest.xlsx",
    "valid": true,
    "columns": ["Container Number", "Bill of Lading", ...],
    "rowCount": 150,
    "issues": []
  }
}
```

### GET /api/health

Health check endpoint.

**Response** (200)
```json
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2026-06-22T00:00:00Z"
}
```

## Rate Limiting

- 10 conversions per minute per IP
- 50 conversions per hour per IP
- 200 conversions per day per IP

Exceeded limits return HTTP 429 with a `Retry-After` header.

## Authentication

- No authentication required for basic conversion
- API keys will be added for programmatic access (see roadmap)