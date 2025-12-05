
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'kn';

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Navigation & General
  'dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'முகப்பு', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'subjects': { en: 'Subjects', hi: 'विषय', ta: 'பாடங்கள்', kn: 'ವಿಷಯಗಳು' },
  'timetable': { en: 'Timetable', hi: 'समय सारिणी', ta: 'கால அட்டவணை', kn: 'ವೇಳಾಪಟ್ಟಿ' },
  'exams': { en: 'Exams', hi: 'परीक्षाएं', ta: 'தேர்வுகள்', kn: 'ಪರೀಕ್ಷೆಗಳು' },
  'tasks': { en: 'Tasks', hi: 'कार्य', ta: 'பணிகள்', kn: 'ಕಾರ್ಯಗಳು' },
  'notes': { en: 'Notes', hi: 'नोट्स', ta: 'குறிப்புகள்', kn: 'ಟಿಪ್ಪಣಿಗಳು' },
  'goals': { en: 'Goals', hi: 'लक्ष्य', ta: 'இலக்குகள்', kn: 'ಗುರಿಗಳು' },
  'settings': { en: 'Settings', hi: 'सेटिंग्स', ta: 'அமைப்புகள்', kn: 'ಸಂಯೋಜನೆಗಳು' },
  'overview': { en: 'Overview', hi: 'अवलोकन', ta: 'கண்ணோட்டம்', kn: 'ಅವಲೋಕನ' },
  'academics': { en: 'Academics', hi: 'शैक्षणिक', ta: 'கல்வி', kn: 'ಶಿಕ್ಷಣ' },
  'productivity': { en: 'Productivity', hi: 'उत्पादकता', ta: 'உற்பத்தித்திறன்', kn: 'ಉತ್ಪಾದಕತೆ' },
  'system': { en: 'System', hi: 'सिस्टम', ta: 'அமைப்பு', kn: 'ವ್ಯವಸ್ಥೆ' },
  'doubtrium': { en: 'Doubtrium', hi: 'डाउट्रियम', ta: 'டவுட்ரியம்', kn: 'ಡೌಟ್ರಿಯಮ್' },

  // Common Actions
  'save': { en: 'Save', hi: 'सहेजें', ta: 'சேமி', kn: 'ಉಳಿಸಿ' },
  'cancel': { en: 'Cancel', hi: 'रद्द करें', ta: 'ரத்துசெய்', kn: 'ರದ್ದುಮಾಡಿ' },
  'delete': { en: 'Delete', hi: 'हटाएं', ta: 'அழி', kn: 'ಅಳಿಸಿ' },
  'edit': { en: 'Edit', hi: 'संपादित करें', ta: 'திருತ್ತು', kn: 'ತಿದ್ದುಪಡಿ' },
  'add': { en: 'Add', hi: 'जोड़ें', ta: 'சேர்', kn: 'ಸೇರಿಸಿ' },
  'search': { en: 'Search', hi: 'खोजें', ta: 'தேடு', kn: 'ಹುಡುಕಿ' },
  'filter': { en: 'Filter', hi: 'फिल्टर', ta: 'வடிகட்டி', kn: 'ಫಿಲ್ಟರ್' },
  'reset': { en: 'Reset', hi: 'रीसेट', ta: 'மீட்டமை', kn: 'ಮರುಹೊಂದಿಸಿ' },
  'view_all': { en: 'View All', hi: 'सभी देखें', ta: 'அனைத்தையும் பார்', kn: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...', ta: 'ஏற்றடுகிறது...', kn: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' },
  'confirm': { en: 'Confirm', hi: 'पुष्टि करें', ta: 'உறுதிப்படுத்து', kn: 'ದೃಢೀಕರಿಸಿ' },
  'back': { en: 'Back', hi: 'वापस', ta: 'பின்னால்', kn: 'ಹಿಂದೆ' },
  'discard': { en: 'Discard', hi: 'त्यागें', ta: 'நிராகரி', kn: 'ತಿರಸ್ಕರಿಸಿ' },
  'select': { en: 'Select', hi: 'चुनें', ta: 'தேர்ந்தெடு', kn: 'ಆರಿಸಿ' },

  // Dashboard
  'ai_insights': { en: 'AI Insights', hi: 'AI इनसाइट्स', ta: 'AI நுண்ணறிவு', kn: 'AI ಒಳನೋಟಗಳು' },
  'total_subjects': { en: 'Total Subjects', hi: 'कुल विषय', ta: 'மொத்த பாடங்கள்', kn: 'ಒಟ್ಟು ವಿಷಯಗಳು' },
  'active_tasks': { en: 'Active Tasks', hi: 'सक्रिय कार्य', ta: 'செயலில் உள்ள பணிகள்', kn: 'ಸಕ್ರಿಯ ಕಾರ್ಯಗಳು' },
  'upcoming_exams': { en: 'Upcoming Exams', hi: 'आगामी परीक्षाएं', ta: 'வரவிருக்கும் தேர்வுகள்', kn: 'ಮುಂಬರುವ ಪರೀಕ್ಷೆಗಳು' },
  'active_goals': { en: 'Active Goals', hi: 'सक्रिय लक्ष्य', ta: 'செயலில் உள்ள இலக்குகள்', kn: 'ಸಕ್ರಿಯ ಗುರಿಗಳು' },
  'subject_progress': { en: 'Subject Progress', hi: 'विषय प्रगति', ta: 'பாட முன்னேற்றம்', kn: 'ವಿಷಯ ಪ್ರಗತಿ' },
  'upcoming': { en: 'Upcoming', hi: 'आगामी', ta: 'வரவிருக்கும்', kn: 'ಮುಂಬರುವ' },
  'welcome_message': { en: 'Welcome! Add some subjects, tasks, or exams to start.', hi: 'स्वागत है! शुरू करने के लिए कुछ विषय, कार्य या परीक्षाएं जोड़ें।', ta: 'வரவேற்பு! தொடங்க பாடங்கள், பணிகள் அல்லது தேர்வுகளைச் சேர்க்கவும்.', kn: 'ಸ್ವಾಗತ! ಪ್ರಾರಂಭಿಸಲು ಕೆಲವು ವಿಷಯಗಳು, ಕಾರ್ಯಗಳು ಅಥವಾ ಪರೀಕ್ಷೆಗಳನ್ನು ಸೇರಿಸಿ.' },
  
  // Tasks
  'task_board': { en: 'Task Board', hi: 'कार्य बोर्ड', ta: 'பணி பலகை', kn: 'ಕಾರ್ಯ ಮಂಡಳಿ' },
  'pending': { en: 'Pending', hi: 'लंबित', ta: 'நிலுவையில்', kn: 'ಬಾಕಿ ಉಳಿದಿದೆ' },
  'in_progress': { en: 'In Progress', hi: 'प्रगति में', ta: 'செயல்பாட்டில்', kn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
  'submitted': { en: 'Submitted', hi: 'जमा किया', ta: 'சமர்ப்பிக்கப்பட்டது', kn: 'ಸಲ್ಲಿಸಲಾಗಿದೆ' },
  'priority': { en: 'Priority', hi: 'प्राथमिकता', ta: 'முன்னுரிமை', kn: 'ಆದ್ಯತೆ' },
  'deadline': { en: 'Deadline', hi: 'समय सीमा', ta: 'கடைசி தேதி', kn: 'ಗಡುವು' },
  'subject': { en: 'Subject', hi: 'विषय', ta: 'பாடம்', kn: 'ವಿಷಯ' },
  'no_tasks': { en: 'No Tasks Found', hi: 'कोई कार्य नहीं मिला', ta: 'பணிகள் எதுவும் இல்லை', kn: 'ಯಾವುದೇ ಕಾರ್ಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'all_priorities': { en: 'All Priorities', hi: 'सभी प्राथमिकताएं', ta: 'அனைத்து முன்னுரிமைகளும்', kn: 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು' },
  'all_subjects': { en: 'All Subjects', hi: 'सभी विषय', ta: 'அனைத்து பாடங்களும்', kn: 'ಎಲ್ಲಾ ವಿಷಯಗಳು' },
  'task_title': { en: 'Task Title', hi: 'कार्य शीर्षक', ta: 'பணி தலைப்பு', kn: 'ಕಾರ್ಯ ಶೀರ್ಷಿಕೆ' },
  'general_task': { en: 'General Task', hi: 'सामान्य कार्य', ta: 'பொது பணி', kn: 'ಸಾಮಾನ್ಯ ಕಾರ್ಯ' },
  'caught_up': { en: "You're All Caught Up!", hi: 'आप पूरी तरह से तैयार हैं!', ta: 'நீங்கள் அனைத்தையும் முடித்துவிட்டீர்கள்!', kn: 'ನೀವು ಎಲ್ಲವನ್ನೂ ಪೂರೈಸಿದ್ದೀರಿ!' },
  'create_task_start': { en: 'Create a new task to get started.', hi: 'शुरू करने के लिए एक नया कार्य बनाएं।', ta: 'தொடங்க புதிய பணியை உருவாக்கவும்.', kn: 'ಪ್ರಾರಂಭಿಸಲು ಹೊಸ ಕಾರ್ಯವನ್ನು ರಚಿಸಿ.' },
  'drop_items': { en: 'Drop items here', hi: 'यहाँ आइटम छोड़ें', ta: 'இங்கே விடவும்', kn: 'ಇಲ್ಲಿ ಬಿಡಿ' },

  // Exams
  'exam_schedule': { en: 'Exam Schedule', hi: 'परीक्षा अनुसूची', ta: 'தேர்வு அட்டவணை', kn: 'ಪರೀಕ್ಷಾ ವೇಳಾಪಟ್ಟಿ' },
  'no_exams': { en: 'No Exams Found', hi: 'कोई परीक्षा नहीं मिली', ta: 'தேர்வுகள் எதுவும் இல்லை', kn: 'ಯಾವುದೇ ಪರೀಕ್ಷೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'days': { en: 'Days', hi: 'दिन', ta: 'நாட்கள்', kn: 'ದಿನಗಳು' },
  'hours': { en: 'Hours', hi: 'घंटे', ta: 'மணிநேரம்', kn: 'ಗಂಟೆಗಳು' },
  'minutes': { en: 'Minutes', hi: 'मिनट', ta: 'நிமிடங்கள்', kn: 'ನಿಮಿಷಗಳು' },
  'exam_title': { en: 'Exam Title', hi: 'परीक्षा शीर्षक', ta: 'தேர்வு தலைப்பு', kn: 'ಪರೀಕ್ಷಾ ಶೀರ್ಷಿಕೆ' },
  'date': { en: 'Date', hi: 'तारीख', ta: 'தேதி', kn: 'ದಿನಾಂಕ' },
  'type': { en: 'Type', hi: 'प्रकार', ta: 'வகை', kn: 'ಬಗೆ' },
  'no_exams_scheduled': { en: 'No Exams Scheduled', hi: 'कोई परीक्षा निर्धारित नहीं है', ta: 'தேர்வுகள் எதுவும் திட்டமிடப்படவில்லை', kn: 'ಯಾವುದೇ ಪರೀಕ್ಷೆಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ' },
  'schedule_exam': { en: 'Schedule First Exam', hi: 'पहली परीक्षा निर्धारित करें', ta: 'முதல் தேர்வை திட்டமிடு', kn: 'ಮೊದಲ ಪರೀಕ್ಷೆಯನ್ನು ನಿಗದಿಪಡಿಸಿ' },
  'all_types': { en: 'All Types', hi: 'सभी प्रकार', ta: 'அனைத்து வகைகளும்', kn: 'ಎಲ್ಲಾ ಬಗೆಗಳು' },

  // Notes
  'my_notes': { en: 'My Notes', hi: 'मेरे नोट्स', ta: 'எனது குறிப்புகள்', kn: 'ನನ್ನ ಟಿಪ್ಪಣಿಗಳು' },
  'new_note': { en: 'New Note', hi: 'नया नोट', ta: 'புதிய குறிப்பு', kn: 'ಹೊಸ ಟಿಪ್ಪಣಿ' },
  'generate_ai': { en: 'Generate with AI', hi: 'AI के साथ बनाएं', ta: 'AI உடன் உருவாக்கு', kn: 'AI ನೊಂದಿಗೆ ರಚಿಸಿ' },
  'topic': { en: 'Topic', hi: 'विषय', ta: 'தலைப்பு', kn: 'ವಿಷಯ' },
  'content': { en: 'Content', hi: 'सामग्री', ta: 'உள்ளடக்கம்', kn: 'ವಿಷಯ' },
  'note_title': { en: 'Note Title', hi: 'नोट शीर्षक', ta: 'குறிப்பு தலைப்பு', kn: 'ಟಿಪ್ಪಣಿ ಶೀರ್ಷಿಕೆ' },
  'general_note': { en: 'General Note', hi: 'सामान्य नोट', ta: 'பொது குறிப்பு', kn: 'ಸಾಮಾನ್ಯ ಟಿಪ್ಪಣಿ' },
  'attachments': { en: 'Attachments', hi: 'संलग्नक', ta: 'இணைப்புகள்', kn: 'ಲಗತ್ತುಗಳು' },
  'upload_drag': { en: 'Click to upload or drag and drop', hi: 'अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें', ta: 'பதிவேற்ற கிளிக் செய்யவும் அல்லது இழுத்து விடவும்', kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಎಳೆದು ಬಿಡಿ' },
  'select_note': { en: 'Select a Note', hi: 'एक नोट चुनें', ta: 'ஒரு குறிப்பைத் தேர்ந்தெடுக்கவும்', kn: 'ಟಿಪ್ಪಣಿಯನ್ನು ಆರಿಸಿ' },
  'create_new_note': { en: 'Create New Note', hi: 'नया नोट बनाएं', ta: 'புதிய குறிப்பை உருவாக்கவும்', kn: 'ಹೊಸ ಟಿಪ್ಪಣಿಯನ್ನು ರಚಿಸಿ' },
  'select_subject': { en: 'Select a Subject', hi: 'एक विषय चुनें', ta: 'ஒரு பாடத்தைத் தேர்ந்தெடுக்கவும்', kn: 'ವಿಷಯವನ್ನು ಆರಿಸಿ' },
  'select_topic': { en: 'Select a Topic', hi: 'एक विषय चुनें', ta: 'ஒரு தலைப்பைத் தேர்ந்தெடுக்கவும்', kn: 'ವಿಷಯವನ್ನು ಆರಿಸಿ' },
  'filter_by_tag': { en: 'Filter by Tag', hi: 'टैग द्वारा फ़िल्टर करें', ta: 'குறிச்சொல் மூலம் வடிகட்டவும்', kn: 'ಟ್ಯಾಗ್ ಮೂಲಕ ಫಿಲ್ಟರ್ ಮಾಡಿ' },
  'all_tags': { en: 'All Tags', hi: 'सभी टैग', ta: 'அனைத்து குறிச்சொற்களும்', kn: 'ಎಲ್ಲಾ ಟ್ಯಾಗ್‌ಗಳು' },
  'uncategorized': { en: 'Uncategorized', hi: 'अवर्गीकृत', ta: 'வகைப்படுத்தப்படாதவை', kn: 'ವರ್ಗೀಕರಿಸದ' },
  'back_to_subjects': { en: 'Back to Subjects', hi: 'विषयों पर वापस', ta: 'பாடங்களுக்குத் திரும்பு', kn: 'ವಿಷಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ' },
  'back_to_topics': { en: 'Back to Topics', hi: 'विषयों पर वापस', ta: 'தலைப்புகளுக்குத் திரும்பு', kn: 'ವಿಷಯಗಳಿಗೆ ಹಿಂತಿರುಗಿ' },
  'no_notes_found': { en: 'No Notes Found', hi: 'कोई नोट्स नहीं मिले', ta: 'குறிப்புகள் எதுவும் இல்லை', kn: 'ಯಾವುದೇ ಟಿಪ್ಪಣಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'save_note': { en: 'Save Note', hi: 'नोट सहेजें', ta: 'குறிப்பைச் சேமி', kn: 'ಟಿಪ್ಪಣಿಯನ್ನು ಉಳಿಸಿ' },
  
  // Goals
  'my_goals': { en: 'My Goals', hi: 'मेरे लक्ष्य', ta: 'எனது இலக்குகள்', kn: 'ನನ್ನ ಗುರಿಗಳು' },
  'set_goal': { en: 'Set New Goal', hi: 'नया लक्ष्य निर्धारित करें', ta: 'புதிய இலக்கை அமை', kn: 'ಹೊಸ ಗುರಿಯನ್ನು ಹೊಂದಿಸಿ' },
  'description': { en: 'Description', hi: 'विवरण', ta: 'விளக்கம்', kn: 'ವಿವರಣೆ' },
  'target_date': { en: 'Target Date', hi: 'लक्ष्य तिथि', ta: 'இலக்கு தேதி', kn: 'ಗುರಿ ದಿನಾಂಕ' },
  'status': { en: 'Status', hi: 'स्थिति', ta: 'நிலை', kn: 'ಸ್ಥಿತಿ' },
  'goal_title': { en: 'Goal Title', hi: 'लक्ष्य शीर्षक', ta: 'இலக்கு தலைப்பு', kn: 'ಗುರಿ ಶೀರ್ಷಿಕೆ' },
  'no_goals_found': { en: 'No Goals Found', hi: 'कोई लक्ष्य नहीं मिला', ta: 'இலக்குகள் எதுவும் இல்லை', kn: 'ಯಾವುದೇ ಗುರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'no_goals_set': { en: 'No Goals Set', hi: 'कोई लक्ष्य निर्धारित नहीं', ta: 'இலக்குகள் எதுவும் அமைக்கப்படவில்லை', kn: 'ಯಾವುದೇ ಗುರಿಗಳನ್ನು ಹೊಂದಿಸಲಾಗಿಲ್ಲ' },
  
  // Subjects
  'subject_title': { en: 'Subject Title', hi: 'विषय शीर्षक', ta: 'பாடத் தலைப்பு', kn: 'ವಿಷಯ ಶೀರ್ಷಿಕೆ' },
  'instructor': { en: 'Instructor', hi: 'प्रशिक्षक', ta: 'ஆசிரியர்', kn: 'ಬೋಧಕ' },
  'semester': { en: 'Semester', hi: 'सत्र', ta: 'செமஸ்டர்', kn: 'ಸೆಮಿಸ್ಟರ್' },
  'progress': { en: 'Progress', hi: 'प्रगति', ta: 'முன்னேற்றம்', kn: 'ಪ್ರಗತಿ' },
  'color': { en: 'Color', hi: 'रंग', ta: 'நிறம்', kn: 'ಬಣ್ಣ' },
  'no_subjects_found': { en: 'No Subjects Found', hi: 'कोई विषय नहीं मिला', ta: 'பாடங்கள் எதுவும் இல்லை', kn: 'ಯಾವುದೇ ವಿಷಯಗಳು ಕಂಡುಬಂದಿಲ್ಲ' },
  'no_subjects_yet': { en: 'No Subjects Yet', hi: 'अभी तक कोई विषय नहीं', ta: 'இதுவரை பாடங்கள் இல்லை', kn: 'ಇನ್ನೂ ಯಾವುದೇ ವಿಷಯಗಳಿಲ್ಲ' },
  
  // Timetable
  'event_title': { en: 'Event Title', hi: 'ईवेंट शीर्षक', ta: 'நிகழ்வு தலைப்பு', kn: 'ಈವೆಂಟ್ ಶೀರ್ಷಿಕೆ' },
  'start_time': { en: 'Start Time', hi: 'शुरू करने का समय', ta: 'தொடங்கும் நேரம்', kn: 'ಪ್ರಾರಂಭದ ಸಮಯ' },
  'end_time': { en: 'End Time', hi: 'समाप्ति समय', ta: 'முடியும் நேரம்', kn: 'ಮುಕ್ತಾಯ ಸಮಯ' },
  'event_color': { en: 'Event Color', hi: 'ईवेंट रंग', ta: 'நிகழ்வு நிறம்', kn: 'ಈವೆಂಟ್ ಬಣ್ಣ' },
  'custom_event': { en: 'Custom Event', hi: 'कस्टम ईवेंट', ta: 'தனிப்பயன் நிகழ்வு', kn: 'ಕಸ್ಟಮ್ ಈವೆಂಟ್' },
  'from_subject': { en: 'From Subject', hi: 'विषय से', ta: 'பாடத்திலிருந்து', kn: 'ವಿಷಯದಿಂದ' },
  'today': { en: 'Today', hi: 'आज', ta: 'இன்று', kn: 'ಇಂದು' },
  'week': { en: 'Week', hi: 'सप्ताह', ta: 'வாரம்', kn: 'ವಾರ' },
  'month': { en: 'Month', hi: 'महीना', ta: 'மாதம்', kn: 'ತಿಂಗಳು' },
  'day': { en: 'Day', hi: 'दिन', ta: 'நாள்', kn: 'ದಿನ' },
  
  // Settings
  'choose_language': { en: 'Choose the language for the App', hi: 'ऐप के लिए भाषा चुनें', ta: 'பயன்பாட்டிற்கான மொழியைத் தேர்வுசெய்க', kn: 'ಅಪ್ಲಿಕೇಶನ್‌ಗಾಗಿ ಭಾಷೆಯನ್ನುರಿಸಿ' },
  'appearance': { en: 'Appearance', hi: 'दिखावट', ta: 'தோற்றம்', kn: 'ಗೋಚರತೆ' },
  'font_size': { en: 'Font Size', hi: 'फ़ॉन्ट आकार', ta: 'எழுத்து அளவு', kn: 'ಫಾಂಟ್ ಗಾತ್ರ' },
  'data_management': { en: 'Data Management', hi: 'डेटा प्रबंधन', ta: 'தரவு மேலாண்மை', kn: 'ಡೇಟಾ ನಿರ್ವಹಣೆ' },
  'import': { en: 'Import', hi: 'आयात', ta: 'இறக்குமதி', kn: 'ಆಮದು' },
  'export': { en: 'Export', hi: 'निर्यात', ta: 'ஏற்றுமதி', kn: 'ರಫ್ತು' },
  'system_backup': { en: 'System Backup', hi: 'सिस्टम बैकअप', ta: 'கணினி காப்புப்பிரதி', kn: 'ಸಿಸ್ಟಮ್ ಬ್ಯಾಕಪ್' },
  'system_restore': { en: 'System Restore', hi: 'सिस्टम रिस्टोर', ta: 'கணினி மீட்டமைப்பு', kn: 'ಸಿಸ್ಟಮ್ ಮರುಸ್ಥಾಪನೆ' },
  'general_notes': { en: 'General Notes', hi: 'सामान्य नोट्स', ta: 'பொது குறிப்புகள்', kn: 'ಸಾಮಾನ್ಯ ಟಿಪ್ಪಣಿಗಳು' },
  'all_notes': { en: 'All Notes', hi: 'सभी नोट्स', ta: 'அனைத்து குறிப்புகளும்', kn: 'ಎಲ್ಲಾ ಟಿಪ್ಪಣಿಗಳು' },
  'export_by_subject': { en: 'Export by Subject', hi: 'विषय के अनुसार निर्यात', ta: 'பாடத்தின் படி ஏற்றுமதி', kn: 'ವಿಷಯದ ಮೂಲಕ ರಫ್ತು' },
  'select_language': { en: 'Language', hi: 'भाषा', ta: 'மொழி', kn: 'ಭಾಷೆ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('appLanguage');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    // If key not found, return key itself (fallback)
    if (!translations[key]) return key;
    // If translation for current language missing, fallback to english
    return translations[key][language] || translations[key]['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
