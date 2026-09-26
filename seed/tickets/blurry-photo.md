# Ticket #102: User reports photos look blurry or compressed

## Status
Investigating (Red Herring)

## Reporter
qa-tester@example.com

## Description
A user reported that photos uploaded to the system appear lower quality or blurry. 

## Investigation Notes
- Check if images are being resized or recompressed during upload or serving.
- Verification: The photo storage service saves uploaded file buffers byte-for-byte to `.data/photos` and serves them with exact binary fidelity. No canvas, sharp, or image manipulation libraries are in the processing pipeline. Uploaded SHA-256 equals downloaded SHA-256.
- Conclusion: Image distortion reported by user is likely due to high display scaling or client monitor settings rather than server-side photo handling.
