
import React from 'react';
import { CalendarEvent } from './Calendar';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none animate-fade-in",
        className
      )}
      title={`${event.title} at ${event.time}`}
    >
      <div className="truncate font-medium">
        {event.title}
      </div>
      <div className="text-xs opacity-80">
        {event.time}
      </div>
    </div>
  );
};
