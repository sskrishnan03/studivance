
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import AIIcon from './AIIcon';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChartBarIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  TrophyIcon,
  PencilSquareIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  onOpenChatbot: () => void;
}

const Header: React.FC<NavbarProps> = ({ onOpenChatbot }) => {
  const { t, language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return language === 'hi' ? 'सुप्रभात' : language === 'ta' ? 'காலை வணக்கம்' : language === 'kn' ? 'ಶುಭೋದಯ' : 'Good Morning';
    if (hour < 18) return language === 'hi' ? 'शुभ दोपहर' : language === 'ta' ? 'மதிய வணக்கம்' : language === 'kn' ? 'ಶುಭ ಮಧ್ಯಾಹ್ನ' : 'Good Afternoon';
    return language === 'hi' ? 'शुभ संध्या' : language === 'ta' ? 'மாலை வணக்கம்' : language === 'kn' ? 'ಶುಭ ಸಂಜೆ' : 'Good Evening';
  };

  // Mobile Menu Item Component
  const MobileMenuItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink 
      to={to} 
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) => `
        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
        ${isActive ? 'bg-primary text-accent font-bold shadow-md' : 'text-text-secondary font-medium hover:bg-surface-inset hover:text-text-primary'}
      `}
      end={to === '/'}
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );

  return (
    <>
      <header className="flex-shrink-0 h-20 px-6 bg-background flex items-center justify-between sticky top-0 z-20">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle (Visible only on mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-text-primary hover:bg-surface-inset rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          
          {/* Logo for Mobile only */}
          <span className="lg:hidden text-xl font-extrabold tracking-tight text-text-primary">
            Studivance
          </span>

          {/* Desktop Greeting & Date (Fills the free space in header) */}
          <div className="hidden lg:flex flex-col">
             <h2 className="text-lg font-extrabold text-text-primary tracking-tight leading-tight">
                {getGreeting()}!
             </h2>
             <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                {currentDate.toLocaleDateString(language === 'en' ? 'en-US' : language, { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenChatbot}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-accent font-bold text-sm rounded-full hover:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <AIIcon className="h-4 w-4 text-accent" />
            <span>{t('doubtrium')}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[45] bg-primary/20 backdrop-blur-md lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 z-[50] w-3/4 max-w-sm bg-background shadow-2xl lg:hidden overflow-y-auto animate-slide-right flex flex-col border-r border-border">
             <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg shadow-md">
                  <AIIcon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-lg font-extrabold text-text-primary">Studivance</span>
             </div>
             
             <nav className="flex-1 p-4 space-y-6">
                <div>
                  <h3 className="px-4 text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('overview')}</h3>
                  <MobileMenuItem to="/" icon={ChartBarIcon} label={t('dashboard')} />
                </div>

                <div>
                  <h3 className="px-4 text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('academics')}</h3>
                  <div className="space-y-1">
                    <MobileMenuItem to="/subjects" icon={BookOpenIcon} label={t('subjects')} />
                    <MobileMenuItem to="/timetable" icon={CalendarDaysIcon} label={t('timetable')} />
                    <MobileMenuItem to="/exams" icon={AcademicCapIcon} label={t('exams')} />
                  </div>
                </div>

                <div>
                  <h3 className="px-4 text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('productivity')}</h3>
                  <div className="space-y-1">
                    <MobileMenuItem to="/tasks" icon={CheckCircleIcon} label={t('tasks')} />
                    <MobileMenuItem to="/notes" icon={PencilSquareIcon} label={t('notes')} />
                    <MobileMenuItem to="/goals" icon={TrophyIcon} label={t('goals')} />
                  </div>
                </div>

                <div>
                  <h3 className="px-4 text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{t('system')}</h3>
                  <MobileMenuItem to="/settings" icon={Cog6ToothIcon} label={t('settings')} />
                </div>
             </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
