
import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircleIcon, BookOpenIcon, AcademicCapIcon, TrophyIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TaskStatus } from '../types';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import AIIcon from '../components/AIIcon';

const Dashboard: React.FC = () => {
  const { subjects, tasks, exams, goals, notes } = useData();
  const { t } = useLanguage();
  const [aiInsight, setAiInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(true);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  useEffect(() => {
    const fetchInsight = async () => {
      if(subjects.length === 0 && tasks.length === 0 && exams.length === 0) {
        setAiInsight(t('welcome_message'));
        setIsInsightLoading(false);
        return;
      }
      
      setIsInsightLoading(true);
      try {
        const context = `
          Here is the student's data:
          - Upcoming Exams: ${JSON.stringify(exams.filter(e => new Date(e.date) >= new Date()))}
          - Pending Tasks: ${JSON.stringify(tasks.filter(t => t.status !== TaskStatus.Submitted))}
          - Subjects: ${JSON.stringify(subjects.map(s => ({ title: s.title, progress: s.progress })))}
        `;
        const prompt = `Based on this data, provide one or two sentences of encouraging and actionable advice for the student. Be specific and positive. For example, mention an upcoming exam or a subject with low progress.`;

        const response = await ai.models.generateContent({
          model: 'gemini-flash-lite-latest',
          contents: prompt,
        });
        setAiInsight(response.text);
      } catch (error) {
        console.error("Failed to fetch AI insight:", error);
        setAiInsight("Could not load AI insight. Please check your connection or API key.");
      } finally {
        setIsInsightLoading(false);
      }
    };
    fetchInsight();
  }, [subjects, tasks, exams, t]);

  const upcomingExams = exams
    .filter(e => new Date(e.date) >= new Date())
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const upcomingTasks = tasks
    .filter(t => t.status !== TaskStatus.Submitted && new Date(t.deadline) >= new Date())
    .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());


  const tooltipStyle = { backgroundColor: '#FDFDF6', color: '#1C1C1C', border: '1px solid #1C1C1C', borderRadius: '12px' };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">{t('dashboard')}</h1>
      </div>

      <Card className="!p-0 overflow-hidden shadow-sm border border-border">
          <div className="p-6 flex items-center gap-4">
              <AIIcon className="h-10 w-10 text-primary animate-float flex-shrink-0" />
              <div>
                  <h2 className="text-xl font-bold text-text-primary">{t('ai_insights')}</h2>
                  {isInsightLoading ? (
                      <div className="h-5 w-3/4 bg-gray-200 rounded-full animate-pulse mt-2"></div>
                  ) : (
                      <p className="text-text-secondary font-medium">{aiInsight}</p>
                  )}
              </div>
          </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary text-accent mr-4">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t('total_subjects')}</p>
              <p className="text-2xl font-bold text-text-primary">{subjects.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary text-accent mr-4">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t('active_tasks')}</p>
              <p className="text-2xl font-bold text-text-primary">{tasks.filter(t => t.status !== TaskStatus.Submitted).length}</p>
            </div>
          </div>
        </Card>
         <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary text-accent mr-4">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t('upcoming_exams')}</p>
              <p className="text-2xl font-bold text-text-primary">{upcomingExams.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-primary text-accent mr-4">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted">{t('active_goals')}</p>
              <p className="text-2xl font-bold text-text-primary">{goals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">{t('subject_progress')}</h3>
            {subjects.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={subjects} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                        <defs>
                            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1C1C1C" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#1C1C1C" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="title" 
                            stroke="#1C1C1C" 
                            fontSize="12px" 
                            tickLine={false} 
                            axisLine={false} 
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            tick={{ fill: '#1C1C1C' }}
                        />
                        <YAxis stroke="#1C1C1C" fontSize="12px" tickLine={false} axisLine={false} tick={{ fill: '#1C1C1C' }} />
                        <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#1C1C1C' }} />
                        <Area type="monotone" dataKey="progress" stroke="#1C1C1C" fill="url(#colorProgress)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : <div className="text-center text-text-muted py-10">
                  <p>No subject data to display.</p>
                  <Link to="/subjects" className="text-primary font-semibold hover:underline mt-2 inline-block">Add a subject to start tracking</Link>
                </div> 
            }
        </Card>
        
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">{t('upcoming')}</h3>
          <div className="space-y-6">
              <div>
                  <h4 className="font-semibold text-sm text-text-muted mb-2 tracking-wide uppercase">{t('exams')}</h4>
                  <div className="space-y-3">
                      {upcomingExams.length > 0 ? upcomingExams.slice(0, 2).map(exam => (
                          <div key={exam.id} className="p-3 bg-surface-inset border border-border rounded-lg">
                              <p className="font-semibold text-text-primary">{exam.title}</p>
                              <p className="text-sm text-text-secondary flex items-center gap-2 mt-1"><CalendarDaysIcon className="h-4 w-4"/>{new Date(exam.date).toLocaleDateString()}</p>
                          </div>
                      )) : <p className="text-sm text-text-secondary">{t('no_exams')}</p>}
                       {upcomingExams.length > 2 && <Link to="/exams" className="text-sm text-primary hover:underline font-medium">{t('view_all')}</Link>}
                  </div>
              </div>
               <div>
                  <h4 className="font-semibold text-sm text-text-muted mb-2 tracking-wide uppercase">{t('tasks')}</h4>
                  <div className="space-y-3">
                      {upcomingTasks.length > 0 ? upcomingTasks.slice(0, 2).map(task => (
                          <div key={task.id} className="p-3 bg-surface-inset border border-border rounded-lg">
                              <p className="font-semibold text-text-primary">{task.title}</p>
                              <p className="text-sm text-text-secondary flex items-center gap-2 mt-1"><ClockIcon className="h-4 w-4"/>Due {new Date(task.deadline).toLocaleDateString()}</p>
                          </div>
                      )) : <p className="text-sm text-text-secondary">{t('no_tasks')}</p>}
                      {upcomingTasks.length > 2 && <Link to="/tasks" className="text-sm text-primary hover:underline font-medium">{t('view_all')}</Link>}
                  </div>
              </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
