
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import AIIcon from './AIIcon';

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
}

const NavGroup: React.FC<NavGroupProps> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 text-xs font-bold text-accent uppercase tracking-wider mb-3 opacity-90">{title}</h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  // Charcoal & Beige Styling - High Contrast - Removed Opacity for better visibility
  const activeLinkClass = "flex items-center gap-3 px-4 py-3 text-sm font-bold text-primary-900 bg-accent rounded-xl transition-all duration-200 shadow-md shadow-black/20";
  const inactiveLinkClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium text-accent hover:text-accent hover:bg-white/10 rounded-xl transition-all duration-200";

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-primary border-r border-primary-800 h-screen sticky top-0 z-30">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="p-2.5 bg-accent rounded-xl shadow-lg shadow-black/20">
          <AIIcon className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-accent">
          Studivance
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <NavGroup title={t('overview')}>
          <NavLink to="/" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass} end>
            <ChartBarIcon className="h-5 w-5" />
            <span>{t('dashboard')}</span>
          </NavLink>
        </NavGroup>

        <NavGroup title={t('academics')}>
          <NavLink to="/subjects" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <BookOpenIcon className="h-5 w-5" />
            <span>{t('subjects')}</span>
          </NavLink>
          <NavLink to="/timetable" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <CalendarDaysIcon className="h-5 w-5" />
            <span>{t('timetable')}</span>
          </NavLink>
          <NavLink to="/exams" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <AcademicCapIcon className="h-5 w-5" />
            <span>{t('exams')}</span>
          </NavLink>
        </NavGroup>

        <NavGroup title={t('productivity')}>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <CheckCircleIcon className="h-5 w-5" />
            <span>{t('tasks')}</span>
          </NavLink>
          <NavLink to="/notes" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <PencilSquareIcon className="h-5 w-5" />
            <span>{t('notes')}</span>
          </NavLink>
          <NavLink to="/goals" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            <TrophyIcon className="h-5 w-5" />
            <span>{t('goals')}</span>
          </NavLink>
        </NavGroup>
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-primary-800">
        <NavLink to="/settings" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
          <Cog6ToothIcon className="h-5 w-5" />
          <span>{t('settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
