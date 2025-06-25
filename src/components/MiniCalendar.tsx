
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from './Calendar';
import { cn } from '@/lib/utils';

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  onDateChange,
  events
}) => {
  const [displayDate, setDisplayDate] = React.useState(currentDate);

  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDisplayDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {format(displayDate, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            ←
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-xs text-gray-500 text-center p-1 font-medium">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, displayDate);
          const isDayToday = isToday(day);
          const isSelected = isSameDay(day, currentDate);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={cn(
                "relative text-xs p-1 h-8 w-8 rounded transition-colors hover:bg-gray-100",
                isDayToday && "bg-blue-100 text-blue-600 font-bold",
                isSelected && "bg-indigo-500 text-white",
                !isCurrentMonth && "text-gray-300",
                isCurrentMonth && !isDayToday && !isSelected && "text-gray-700"
              )}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
