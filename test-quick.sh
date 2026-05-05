#!/bin/bash
echo "==================================="
echo "Quick Verification Test"
echo "==================================="
echo ""

echo "✓ Checking build artifacts..."
if [ -f "public/memory-embed.js" ] && [ -f "public/astro.css" ]; then
  echo "  ✅ memory-embed.js: $(ls -lh public/memory-embed.js | awk '{print $5}')"
  echo "  ✅ astro.css: $(ls -lh public/astro.css | awk '{print $5}')"
else
  echo "  ❌ Missing build artifacts!"
  exit 1
fi

echo ""
echo "✓ Checking key files..."
files=(
  "src/components/MemoryFormWrapper.tsx"
  "embed/memoryButton.tsx"
  "src/pages/index.astro"
  "src/pages/test-embed.astro"
  "public/embed-example.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file missing!"
    exit 1
  fi
done

echo ""
echo "✓ Checking for VisuallyHidden import..."
if grep -q "@radix-ui/react-visually-hidden" "src/components/MemoryFormWrapper.tsx"; then
  echo "  ✅ MemoryFormWrapper.tsx uses VisuallyHidden"
else
  echo "  ❌ MemoryFormWrapper.tsx missing VisuallyHidden!"
  exit 1
fi

if grep -q "@radix-ui/react-visually-hidden" "embed/memoryButton.tsx"; then
  echo "  ✅ memoryButton.tsx uses VisuallyHidden"
else
  echo "  ❌ memoryButton.tsx missing VisuallyHidden!"
  exit 1
fi

echo ""
echo "✓ Checking for baseUrl usage in test-embed.astro..."
if grep -q "baseUrl" "src/pages/test-embed.astro"; then
  echo "  ✅ test-embed.astro uses baseUrl"
else
  echo "  ❌ test-embed.astro missing baseUrl!"
  exit 1
fi

echo ""
echo "==================================="
echo "✅ ALL CHECKS PASSED!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. npm run dev - Test locally"
echo "2. npm run build:all - Build for production"
echo "3. wrangler deploy - Deploy to Cloudflare"
echo ""
echo "Test URLs (after deploy):"
echo "• Main: https://patricia-lanning.webflow.io/memory-form/"
echo "• Test: https://patricia-lanning.webflow.io/memory-form/test-embed"
echo "• HTML: https://patricia-lanning.webflow.io/memory-form/embed-example.html"
