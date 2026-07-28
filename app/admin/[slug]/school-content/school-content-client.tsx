"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, ChevronDown } from "lucide-react";
import { getSubjectsByGrade, getGrades } from "./actions";

interface SubjectData {
  id: string;
  subject: string;
  title: string;
  subtopic: string | null;
}

interface SchoolContentClientProps {
  initialGrades: string[];
  userRole?: string;
  userOrgId?: string;
  preselectGrade?: string;
  preselectSubject?: string;
}

interface ChapterCardProps {
  chapter: {
    title: string;
    subject: string;
    items: SubjectData[];
  };
  selectedGrade: string;
  userRole?: string;
  userOrgId?: string;
}


function ChapterCard({ chapter, selectedGrade, userRole, userOrgId }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);

  const openDestination = (subtopicId?: string) => {
    let url = `https://redora.alphanexoraai.com/library?source=curriculum&grade=${encodeURIComponent(selectedGrade)}&subject=${encodeURIComponent(chapter.subject)}`;
    if (userRole && userOrgId) {
      url += `&role=${encodeURIComponent(userRole)}&org_id=${encodeURIComponent(userOrgId)}`;
    }
    if (subtopicId) {
       url += `&subtopic=${encodeURIComponent(subtopicId)}`;
    }
    window.open(url, "_blank");
  };

  const handleOpen = (subtopicId?: string) => {
    openDestination(subtopicId);
  };

  const hasSubtopics = chapter.items.some((i: SubjectData) => i.subtopic);
  return (
    <Card className="overflow-hidden transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${expanded ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
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
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
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
  );
}

export function SchoolContentClient({ 
  initialGrades, 
  userRole, 
  userOrgId, 
  preselectGrade, 
  preselectSubject 
}: SchoolContentClientProps) {
  const [grades, setGrades] = useState<string[]>(initialGrades || []);
  const [selectedGrade, setSelectedGrade] = useState<string>(preselectGrade || "");
  const [selectedSubject, setSelectedSubject] = useState<string>(preselectSubject || "");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGradesList = async () => {
      const fetchedGrades = await getGrades();
      if (fetchedGrades && fetchedGrades.length > 0) {
        setGrades(fetchedGrades);
      }
    };

    fetchGradesList();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchGradesList();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!selectedGrade) {
      setTimeout(() => {
        setSubjects([]);
        if (!preselectSubject) setSelectedSubject("");
      }, 0);
      return;
    }

    let isMounted = true;
    setTimeout(() => {
       setIsLoading(true);
    }, 0);
    getSubjectsByGrade(selectedGrade).then((data) => {
      if (isMounted) {
        setSubjects(data || []);
        if (!preselectSubject || !data?.some(s => s.subject === preselectSubject)) {
           setSelectedSubject("");
        } else {
           setSelectedSubject(preselectSubject);
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedGrade, preselectSubject]);

  const uniqueSubjects = Array.from(new Set(subjects.map((s) => s.subject)));

  const filteredCards = selectedSubject
    ? subjects.filter((s) => s.subject === selectedSubject)
    : subjects;

  const groupedChapters = useMemo(() => {
    const groups: Record<string, SubjectData[]> = {};
    filteredCards.forEach(item => {
      if (!groups[item.title]) {
        groups[item.title] = [];
      }
      groups[item.title].push(item);
    });
    return Object.entries(groups).map(([title, items]) => ({
      title,
      subject: items[0].subject,
      items
    }));
  }, [filteredCards]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="grade-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Grade
              </label>
              <select
                id="grade-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              >
                <option value="">Select a grade...</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="subject-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Subject
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedGrade || isLoading}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!isLoading && selectedGrade && groupedChapters.length > 0 && (
        <div className="flex flex-col gap-3">
          {groupedChapters.map((chapter, idx) => (
            <ChapterCard 
              key={idx} 
              chapter={chapter} 
              selectedGrade={selectedGrade}
              userRole={userRole}
              userOrgId={userOrgId}
            />
          ))}
        </div>
      )}

      {!isLoading && selectedGrade && groupedChapters.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No subjects found for this grade.</p>
        </div>
      )}
    </div>
  );
}
