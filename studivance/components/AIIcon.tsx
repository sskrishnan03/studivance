import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

const AIIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => {
    return <SparklesIcon className={className} />;
};

export default AIIcon;
