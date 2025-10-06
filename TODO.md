# TODO: Fix AI Study Planner Issues

## Completed Tasks
- [x] Modified `/api/generate-plan` endpoint in `backend/server.js` to parse the Gemini response as JSON and extract the `plan` field if present, preventing JSON strings from being displayed as text.
- [x] Updated the prompt in `/api/generate-answers` endpoint to instruct Gemini to provide answers directly without asking for more information, avoiding placeholder messages.
- [x] Added logging to `/api/generate-answers` endpoint to debug incoming request data.
- [x] Implemented `extractTextFromFile` function in `src/components/AIStudyPlanner.tsx` to extract text from uploaded PDF and TXT files using pdfjs-dist and File API.
- [x] Fixed PDF worker URL in `extractTextFromFile` to use local worker file /pdf.worker.min.mjs copied from node_modules to resolve CORS and 404 issues.

## Summary
The issues were:
1. Study plan was displaying as `{"plan": "# markdown content"}` instead of the markdown content because Gemini returned JSON but the backend treated it as plain text.
2. Question paper answers were showing a message asking for more information instead of generating answers, due to empty textbookText and questionPaperText because text extraction was not implemented.
3. Added logging to backend to monitor incoming data.

## Next Steps
- Test the updated functionality by uploading files and generating answers.
- If issues persist, check backend logs for received data.
