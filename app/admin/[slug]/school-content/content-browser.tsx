"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type CurriculumItem = {
  grade: string
  subject: string
  title: string
}

export function ContentBrowser({ initialItems }: { initialItems: CurriculumItem[] }) {
  const [selectedGrade, setSelectedGrade] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  
  // Extract distinct grades
  const grades = Array.from(new Set(initialItems.map(item => item.grade))).sort()
  
  // Available subjects for the selected grade
  const availableSubjects = initialItems.filter(item => item.grade === selectedGrade)
  
  // Reset subject when grade changes
  useEffect(() => {
    setSelectedSubject("")
  }, [selectedGrade])

  const filteredItems = availableSubjects.filter(item => 
    selectedSubject === "" || item.subject === selectedSubject
  )

  const handleOpen = (grade: string, subject: string) => {
    const url = `https://redora.alphanexoraai.com/library?source=curriculum&grade=${encodeURIComponent(grade)}&subject=${encodeURIComponent(subject)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Grade</label>
          <select 
            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Select a grade...</option>
            {grades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
          <select 
            className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedGrade}
          >
            <option value="">All Subjects</option>
            {availableSubjects.map(s => (
              <option key={s.subject} value={s.subject}>{s.title || s.subject}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedGrade && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredItems.map(item => (
            <Card key={`${item.grade}-${item.subject}`} className="flex flex-col justify-between border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{item.title || item.subject}</CardTitle>
                <div className="text-xs text-slate-500 font-mono mt-2 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-1 rounded w-fit">
                  {item.grade} • {item.subject}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={() => handleOpen(item.grade, item.subject)}
                >
                  Open Content
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No content found for the selected criteria.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
