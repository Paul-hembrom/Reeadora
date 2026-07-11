const fs = require('fs');
let content = fs.readFileSync('app/admin/[slug]/school-content/school-content-client.tsx', 'utf8');

const chapterCardReplacement = `
function ChapterCard({ chapter, selectedGrade, userRole, userOrgId }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingSubtopic, setPendingSubtopic] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const openDestination = (subtopicId?: string) => {
    let url = \`https://d1.alphanexoraai.com?source=curriculum&grade=\${encodeURIComponent(selectedGrade)}&subject=\${encodeURIComponent(chapter.subject)}\`;
    if (userRole && userOrgId) {
      url += \`&role=\${encodeURIComponent(userRole)}&org_id=\${encodeURIComponent(userOrgId)}\`;
    }
    if (subtopicId) {
       url += \`&subtopic=\${encodeURIComponent(subtopicId)}\`;
    }
    window.open(url, "_blank");
  };

  const handleOpen = (subtopicId?: string) => {
    if (userRole === "admin") {
      openDestination(subtopicId);
      return;
    }
    // Teacher or student
    setPendingSubtopic(subtopicId);
    setShowPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRole || !userOrgId) {
       setPasswordError("Missing class or role information.");
       return;
    }
    setIsVerifying(true);
    setPasswordError("");
    try {
      const res = await verifyClassPassword(userOrgId, userRole, password);
      if (res.error) {
        setPasswordError(res.error);
      } else {
        setShowPasswordDialog(false);
        openDestination(pendingSubtopic);
      }
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const hasSubtopics = chapter.items.some((i: SubjectData) => i.subtopic);
  return (
    <>
    <Card className="overflow-hidden transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
      <div 
        className={\`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 \${expanded ? 'border-b border-slate-100 dark:border-slate-800' : ''}\`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
              {chapter.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
              {chapter.subject}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!hasSubtopics && (
             <Button
                size="sm"
                variant="secondary"
               disabled={redirecting === "chapter"}
               onClick={(e) => { e.stopPropagation(); handleOpen(); }}
             >
               {redirecting === "chapter" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Open"}
             </Button>
          )}
          {hasSubtopics && (
            <div className="text-slate-400">
              <ChevronDown className={\`w-5 h-5 transition-transform duration-200 \${expanded ? 'rotate-180' : ''}\`} />
            </div>
          )}
        </div>
      </div>
      
      {expanded && hasSubtopics && (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-2 space-y-1">
          {chapter.items.filter((i: SubjectData) => i.subtopic).map((item: SubjectData) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white dark:hover:bg-slate-900 transition-colors">
              <span className="text-sm text-slate-700 dark:text-slate-300 pl-2">{item.subtopic}</span>
              <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20"
                 disabled={redirecting === item.id}
                 onClick={() => handleOpen(item.id)}
              >
                 {redirecting === item.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "Open"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>

    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                 <LogIn className="w-4 h-4" />
               </div>
               Enter Password
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
               Authenticate to access the curriculum.
            </DialogDescription>
          </DialogHeader>
             
            <form onSubmit={handlePasswordSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Enter your {userRole} access code</Label>
                <div className="relative">
                    <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Access code..."
                    required 
                    className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-lg tracking-widest font-mono text-center pr-10"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                    >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                </div>
                {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg text-center">
                    {passwordError}
                </div>
                )}
                <Button type="submit" disabled={isVerifying} className="w-full h-11 text-base shadow-md transition-transform active:scale-[0.98]">
                {isVerifying ? "Authenticating..." : "Enter Curriculum"}
                </Button>
            </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
`;

content = content.replace(/function ChapterCard.*?export function SchoolContentClient/s, chapterCardReplacement + "\nexport function SchoolContentClient");

fs.writeFileSync('app/admin/[slug]/school-content/school-content-client.tsx', content);
