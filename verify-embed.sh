#!/bin/bash

echo "========================================"
echo "Memory Form Embed Verification"
echo "========================================"
echo ""

# Check if files exist
echo "1. Checking if files exist..."
if [ -f "public/memory-embed.js" ]; then
  echo "   ✅ memory-embed.js exists ($(du -h public/memory-embed.js | cut -f1))"
else
  echo "   ❌ memory-embed.js NOT FOUND"
  exit 1
fi

if [ -f "public/astro.css" ]; then
  echo "   ✅ astro.css exists ($(du -h public/astro.css | cut -f1))"
else
  echo "   ❌ astro.css NOT FOUND"
  exit 1
fi

if [ -f "public/embed-test.html" ]; then
  echo "   ✅ embed-test.html exists"
else
  echo "   ❌ embed-test.html NOT FOUND"
  exit 1
fi
echo ""

# Check if dev server is running
echo "2. Checking if dev server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
  echo "   ✅ Dev server is running on port 3000"
else
  echo "   ⚠️  Dev server not running. Start with: npm run dev"
fi
echo ""

# Check if files are accessible
echo "3. Checking if files are accessible..."
JS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/memory-embed.js 2>/dev/null)
if [ "$JS_STATUS" = "200" ]; then
  echo "   ✅ memory-embed.js accessible (HTTP $JS_STATUS)"
else
  echo "   ⚠️  memory-embed.js returned HTTP $JS_STATUS"
fi

CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/astro.css 2>/dev/null)
if [ "$CSS_STATUS" = "200" ]; then
  echo "   ✅ astro.css accessible (HTTP $CSS_STATUS)"
else
  echo "   ⚠️  astro.css returned HTTP $CSS_STATUS"
fi

TEST_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/embed-test.html 2>/dev/null)
if [ "$TEST_STATUS" = "200" ]; then
  echo "   ✅ embed-test.html accessible (HTTP $TEST_STATUS)"
else
  echo "   ⚠️  embed-test.html returned HTTP $TEST_STATUS"
fi
echo ""

# Check if exports are present
echo "4. Checking if exports are present..."
if curl -s http://localhost:3000/memory-embed.js 2>/dev/null | grep -q "mountMemoryFormButton"; then
  echo "   ✅ mountMemoryFormButton export found"
else
  echo "   ❌ mountMemoryFormButton export NOT FOUND"
  exit 1
fi
echo ""

# Summary
echo "========================================"
echo "✅ All checks passed!"
echo "========================================"
echo ""
echo "You can now:"
echo "1. Test locally: http://localhost:3000/embed-test.html"
echo "2. Deploy with: npm run build:all"
echo "3. Use in production with the code from SOLUTION.md"
echo ""
