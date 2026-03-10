#!/bin/bash
# Tests for the summarize skill
# Run: bash ~/.claude/skills/summarize/test.sh

PASS=0
FAIL=0

pass() { echo "  PASS: $1"; ((PASS++)); }
fail() { echo "  FAIL: $1 — $2"; ((FAIL++)); }

echo "=== Summarize Skill Tests ==="
echo ""

# Test 1: summarize is installed
echo "[1] Check installation"
if summarize --version >/dev/null 2>&1; then
  VERSION=$(summarize --version 2>&1)
  pass "installed, version $VERSION"
else
  fail "not installed" "run: brew install steipete/tap/summarize"
fi

# Test 2: API keys available
echo "[2] Check API keys"
if [ -n "$OPENAI_API_KEY" ] || [ -n "$ANTHROPIC_API_KEY" ] || [ -n "$GEMINI_API_KEY" ] || [ -n "$XAI_API_KEY" ]; then
  pass "at least one LLM API key is set"
else
  fail "no API keys" "set OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, or XAI_API_KEY"
fi

# Test 3: Web page extract (no LLM needed)
echo "[3] Extract web page (no LLM)"
OUTPUT=$(summarize "https://example.com" --extract --plain --timeout 15s 2>&1)
if echo "$OUTPUT" | grep -qi "example"; then
  pass "extracted example.com content"
else
  fail "extract failed" "$OUTPUT"
fi

# Test 4: Web page summary (needs LLM)
echo "[4] Summarize web page"
OUTPUT=$(summarize "https://example.com" --length short --plain --timeout 30s 2>&1)
if [ $? -eq 0 ] && [ -n "$OUTPUT" ]; then
  pass "summary generated (${#OUTPUT} chars)"
else
  fail "summary failed" "$OUTPUT"
fi

# Test 5: JSON output
echo "[5] JSON output mode"
OUTPUT=$(summarize "https://example.com" --json --plain --timeout 30s 2>&1)
if echo "$OUTPUT" | head -1 | grep -q '^{'; then
  pass "valid JSON output"
else
  fail "not JSON" "$(echo "$OUTPUT" | head -1)"
fi

# Test 6: Stdin input
echo "[6] Stdin pipe input"
OUTPUT=$(echo "Hello world test input" | summarize - --length short --plain --timeout 30s 2>&1)
if [ $? -eq 0 ] && [ -n "$OUTPUT" ]; then
  pass "stdin processed (${#OUTPUT} chars)"
else
  fail "stdin failed" "$OUTPUT"
fi

# Test 7: Error handling (invalid URL)
echo "[7] Error handling (invalid URL)"
OUTPUT=$(summarize "https://this-domain-does-not-exist-99999.com" --plain --timeout 10s 2>&1)
EXIT=$?
if [ $EXIT -ne 0 ]; then
  pass "non-zero exit code on invalid URL (exit=$EXIT)"
else
  fail "should have failed" "exit code was 0"
fi

# Test 8: YouTube transcript extract (longer, optional)
echo "[8] YouTube transcript extract"
OUTPUT=$(summarize "https://www.youtube.com/watch?v=jNQXAC9IVRw" --extract --plain --timeout 60s 2>&1)
if [ $? -eq 0 ] && [ ${#OUTPUT} -gt 10 ]; then
  pass "YouTube transcript extracted (${#OUTPUT} chars)"
else
  fail "YouTube extract failed" "$(echo "$OUTPUT" | head -2)"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ] && exit 0 || exit 1
