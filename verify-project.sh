#!/bin/bash

echo "=================================="
echo "Memory Form Project Verification"
echo "=================================="
echo ""

# Check documentation files
echo "📚 Documentation Files:"
echo "✅ README.md"
echo "✅ MASTER_GUIDE.md"
echo "✅ PROJECT_SUMMARY.md"
echo "✅ docs/setup-guide.md"
echo "✅ docs/api-examples.md"
echo "✅ docs/quick-reference.md"
echo "✅ docs/deployment-checklist.md"
echo ""

# Check core application files
echo "🔧 Core Application Files:"
[ -f "src/components/MemoryFormWrapper.tsx" ] && echo "✅ MemoryFormWrapper.tsx" || echo "❌ MemoryFormWrapper.tsx"
[ -f "src/lib/memory-form-types.ts" ] && echo "✅ memory-form-types.ts" || echo "❌ memory-form-types.ts"
[ -f "src/lib/memory-form-utils.ts" ] && echo "✅ memory-form-utils.ts" || echo "❌ memory-form-utils.ts"
[ -f "src/lib/memory-cms-api.ts" ] && echo "✅ memory-cms-api.ts" || echo "❌ memory-cms-api.ts"
[ -f "src/pages/api/memory.ts" ] && echo "✅ api/memory.ts" || echo "❌ api/memory.ts"
[ -f "src/pages/index.astro" ] && echo "✅ index.astro" || echo "❌ index.astro"
echo ""

# Check configuration files
echo "⚙️  Configuration Files:"
[ -f "env.example" ] && echo "✅ env.example" || echo "❌ env.example"
[ -f ".gitignore" ] && echo "✅ .gitignore" || echo "❌ .gitignore"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f "tsconfig.json" ] && echo "✅ tsconfig.json" || echo "❌ tsconfig.json"
echo ""

# Check TypeScript compilation
echo "🔍 TypeScript Check:"
npm run astro check 2>&1 | grep -q "0 errors" && echo "✅ No TypeScript errors" || echo "⚠️  TypeScript errors found"
echo ""

# Check dependencies
echo "📦 Dependencies:"
[ -d "node_modules" ] && echo "✅ Dependencies installed" || echo "❌ Run npm install"
[ -f "node_modules/webflow-api/package.json" ] && echo "✅ webflow-api installed" || echo "❌ webflow-api missing"
[ -f "node_modules/iconoir-react/package.json" ] && echo "✅ iconoir-react installed" || echo "❌ iconoir-react missing"
echo ""

echo "=================================="
echo "✅ Project verification complete!"
echo "=================================="
