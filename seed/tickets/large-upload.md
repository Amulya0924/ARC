# Ticket #101: Oversized photo upload returns HTTP 500 error

## Status
Open

## Reporter
user-ops@example.com

## Description
When users attempt to upload photos larger than 8 MiB, the application encounters an internal server error (HTTP 500) with code `INTERNAL_ERROR`. As a result, the web UI treats this as an unhandled application error and redirects the browser to `/?uploadFailed=1`.

## Expected Behavior
The API should return a proper client error (e.g. 413 Payload Too Large or 400 Bad Request) with a clear user message explaining that the file size limit is 8 MiB.

## Actual Behavior
Multer raises `MulterError: LIMIT_FILE_SIZE`, but the Express global error handler catches it and responds with `HTTP 500 INTERNAL_ERROR`.

## Reproduction
1. Navigate to `/`
2. Select a photo file larger than 8 MiB (e.g., `fixtures/large-noisy.png`)
3. Click Upload
4. Notice the HTTP 500 error response and redirect to `/?uploadFailed=1`.
