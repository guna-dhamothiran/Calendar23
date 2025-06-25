
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onNavigate,
  view,
  onViewChange,
  onToday
}) => {
  const getHeaderTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(currentDate, 'MMM do, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM do, yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getHeaderTitle()}
            </h1>
            <p className="text-indigo-100 text-sm">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-white/20 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
              <Button
                key={viewType}
                onClick={() => onViewChange(viewType)}
                variant={view === viewType ? "secondary" : "ghost"}
                size="sm"
                className={view === viewType ? "bg-white text-indigo-600" : "text-white hover:bg-white/20"}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex space-x-1">
            <Button
              onClick={() => onNavigate('prev')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              ←
            </Button>
            <Button
              onClick={() => onNavigate('next')}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              →
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={onToday}
          >
            Today
          </Button>
        </div>
      </div>
    </div>
  );
};
