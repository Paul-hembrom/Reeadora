const fs = require('fs');
let content = fs.readFileSync('app/admin/[slug]/school-content/school-content-client.tsx', 'utf8');

const importsToAdd = `
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { verifyClassPassword } from "@/app/actions";
`;

content = content.replace('import { BookOpen, Loader2, ChevronDown } from "lucide-react";', 'import { BookOpen, Loader2, ChevronDown, LogIn, Eye, EyeOff } from "lucide-react";\nimport { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";\nimport { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\nimport { verifyClassPassword } from "@/app/actions";');

fs.writeFileSync('app/admin/[slug]/school-content/school-content-client.tsx', content);
