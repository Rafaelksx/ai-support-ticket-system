/**
 * Utility helpers for AI response processing.
 *
 * Gemini (via the OpenAI-compatible endpoint) often wraps its JSON output
 * inside markdown code fences like:
 *
 *   ```json
 *   { "key": "value" }
 *   ```
 *
 * This breaks a raw JSON.parse(). The helper below strips those fences
 * before parsing.
 */

/**
 * Strips markdown code-fence wrappers (```json … ``` or ``` … ```)
 * and trims whitespace so the result can be safely fed to JSON.parse().
 */
export function cleanJsonResponse(raw: string): string {
  let text = raw.trim();

  // Remove opening fence:  ```json  or  ```
  text = text.replace(/^```(?:json)?\s*\n?/i, '');

  // Remove closing fence:  ```
  text = text.replace(/\n?\s*```\s*$/i, '');

  return text.trim();
}

/**
 * Parse an AI response string as JSON, tolerating markdown code fences.
 * Falls back to `{}` on empty input.
 */
export function parseAIJson<T = unknown>(raw: string | null | undefined): T {
  if (!raw || raw.trim().length === 0) {
    return {} as T;
  }
  return JSON.parse(cleanJsonResponse(raw));
}
