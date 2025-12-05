
import React, { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import Exams from './pages/Exams';
import Notes from './pages/Notes';
import Timetable from './pages/Timetable';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import ChatbotModal from './components/ChatbotModal';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <DataProvider>
          <HashRouter>
            <div className="flex h-screen bg-background text-text-primary overflow-hidden">
              {/* Sidebar - Visible on Desktop */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Header onOpenChatbot={() => setIsChatbotOpen(true)} />
                
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <div className="max-w-7xl mx-auto space-y-6">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/subjects" element={<Subjects />} />
                      <Route path="/timetable" element={<Timetable />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
            <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
          </HashRouter>
        </DataProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
