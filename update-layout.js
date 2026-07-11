const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

// replace the header block with <AppHeader />
content = content.replace(/<header className="sticky top-0 z-50 w-full.*?<\/header>/s, '<AppHeader />');

// add import { AppHeader } from '@/components/app-header';
if (!content.includes('AppHeader')) {
  content = content.replace(/import { ModeToggle } from '@\/components\/mode-toggle';/s, `import { ModeToggle } from '@/components/mode-toggle';\nimport { AppHeader } from '@/components/app-header';`);
}

fs.writeFileSync('app/layout.tsx', content);
