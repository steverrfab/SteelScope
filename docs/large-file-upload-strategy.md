# Large File Upload Strategy

## Protocol
1. Client requests `initiate` with file name, size, hash, declared MIME, project, and document role.
2. API validates extension/MIME allowlist and creates a private file record.
3. API returns an upload ID and chunk size.
4. Client uploads numbered chunks with per-chunk checksum.
5. API records received chunks and supports resume by listing missing parts.
6. Client calls `complete`.
7. Storage adapter composes parts into the final private object.
8. API enqueues file processing.

## Requirements
- Chunked/resumable uploads.
- No public object exposure.
- Server-side MIME sniffing and extension validation.
- Object key names are UUID-based, not user file names.
- Upload progress is tracked per chunk and file.
- Failed chunk uploads can retry independently.
- Completed files are immutable; addenda/revisions create new file versions.

## Storage Pattern
`org/{organizationId}/project/{projectId}/file/{fileId}/source/{versionId}`

Derived artifacts:
- `pages/{pageId}/text.json`
- `pages/{pageId}/thumbnail.webp`
- `pages/{pageId}/raster.webp`
- `reports/{reportId}/artifact.xlsx|pdf`

## Memory Safety
API routes stream chunks and avoid buffering entire files. Workers process page-by-page and store artifacts incrementally.
