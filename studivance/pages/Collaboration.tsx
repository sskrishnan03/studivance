import React from 'react';
import Card from '../components/Card';
import { UsersIcon } from '@heroicons/react/24/outline';

const Collaboration: React.FC = () => {
  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">Collaboration Hub</h2>
        </div>
        <Card className="text-center p-8 md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UsersIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold my-4 text-text-primary-light dark:text-text-primary-dark">Group Study Features Are Coming Soon!</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
                Get ready to take your group projects to the next level! We're building a suite of powerful collaboration tools that will allow you to:
            </p>
            <ul className="mt-4 text-left inline-block list-disc list-inside space-y-2 text-text-secondary-light dark:text-text-secondary-dark">
                <li>Share notes and resources with classmates.</li>
                <li>Create group study planners with shared tasks.</li>
                <li>Communicate with your team in a dedicated chat.</li>
                <li>Track group project progress together.</li>
            </ul>
            <p className="mt-6 text-primary font-semibold animate-pulse">Stay tuned for updates!</p>
        </Card>
    </div>
  );
};

export default Collaboration;