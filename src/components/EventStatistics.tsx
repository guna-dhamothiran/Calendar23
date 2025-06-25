
import React from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, addDays, isFuture, isToday } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from './Calendar';

interface EventStatisticsProps {
  events: CalendarEvent[];
}

export const EventStatistics: React.FC<EventStatisticsProps> = ({ events }) => {
  const currentWeek = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isWithinInterval(eventDate, currentWeek);
  });

  const nextWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const nextWeekStart = addDays(currentWeek.end, 1);
    const nextWeekEnd = addDays(nextWeekStart, 6);
    return isWithinInterval(eventDate, { start: nextWeekStart, end: nextWeekEnd });
  });

  const eventsByCategory = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingEvents = [...thisWeekEvents, ...nextWeekEvents]
    .filter(event => isFuture(new Date(event.date + ' ' + event.time)) || isToday(new Date(event.date)))
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 3);

  const categoryColors = {
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-green-100 text-green-800',
    meeting: 'bg-purple-100 text-purple-800',
    deadline: 'bg-red-100 text-red-800',
    reminder: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Event Overview</h3>
        
        <div className="space-y-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{thisWeekEvents.length}</div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
            <div className="space-y-2">
              {Object.entries(eventsByCategory).slice(0, 3).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                    {category}
                  </Badge>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 truncate">{event.title}</div>
                <div className="text-xs text-gray-600">
                  {format(new Date(event.date), 'EEE, MMM d')} at {event.time}
                </div>
              </div>
            </div>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No upcoming events
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
