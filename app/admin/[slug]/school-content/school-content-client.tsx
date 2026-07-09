"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getSubjectsByGrade } from "./actions";

interface SubjectData {
  subject: string;
  title: string;
}

export function SchoolContentClient({ initialGrades }: { initialGrades: string[] }) {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedGrade) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    getSubjectsByGrade(selectedGrade).then((data) => {
      if (isMounted) {
        setSubjects(data || []);
        setSelectedSubject("");
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedGrade]);

  const uniqueSubjects = Array.from(new Set(subjects.map((s) => s.subject)));

  const filteredCards = selectedSubject
    ? subjects.filter((s) => s.subject === selectedSubject)
    : subjects;

  const handleOpen = (grade: string, subject: string) => {
    const url = `https://redora.alphanexoraai.com/library?source=curriculum&grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`;
    window.open(url, "_blank");
  };

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
                {initialGrades.map((grade) => (
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

      {!isLoading && selectedGrade && filteredCards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((item, idx) => (
            <Card key={idx} className="group overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-800 dark:text-slate-200 line-clamp-1">
                      {item.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                      {item.subject}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-4 pb-4">
                <Button
                  onClick={() => handleOpen(selectedGrade, item.subject)}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Open Content
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && selectedGrade && filteredCards.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No subjects found for this grade.</p>
        </div>
      )}
    </div>
  );
}
