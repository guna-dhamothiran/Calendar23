import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CalendarHeader } from './CalendarHeader';
import { EventModal } from './EventModal';
import { EventCard } from './EventCard';
import { MiniCalendar } from './MiniCalendar';
import { EventStatistics } from './EventStatistics';
import { cn } from '@/lib/utils';
import eventsDataRaw from '../data/events.json';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  category: 'work' | 'personal' | 'meeting' | 'deadline' | 'reminder';
  description?: string;
  color?: string;
  location?: string;
  attendees?: string[];
}

const categoryColors = {
  work: 'bg-blue-100 text-blue-800 border-blue-500',
  personal: 'bg-green-100 text-green-800 border-green-500',
  meeting: 'bg-purple-100 text-purple-800 border-purple-500',
  deadline: 'bg-red-100 text-red-800 border-red-500',
  reminder: 'bg-yellow-100 text-yellow-800 border-yellow-500'
};

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(eventsDataRaw as CalendarEvent[]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['work', 'personal', 'meeting', 'deadline', 'reminder']);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const getViewDates = useMemo(() => {
    switch (view) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      case 'day':
        return [currentDate];
      
      default:
        return [];
    }
  }, [currentDate, view]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedCategories.includes(event.category));
  }, [events, selectedCategories]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(event => event.date === dateStr);
  };

  const hasConflictingEvents = (dayEvents: CalendarEvent[]) => {
    if (dayEvents.length < 2) return false;
    
    const sortedEvents = dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEnd = getEventEndTime(sortedEvents[i]);
      const nextStart = sortedEvents[i + 1].time;
      
      if (currentEnd > nextStart) {
        return true;
      }
    }
    return false;
  };

  const getEventEndTime = (event: CalendarEvent) => {
    const [hours, minutes] = event.time.split(':').map(Number);
    const endMinutes = minutes + event.duration;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (view) {
        case 'month':
          return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
        case 'week':
          return direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1);
        case 'day':
          return direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1);
        default:
          return prev;
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEventSave = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (selectedEvent) {
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e));
    } else {
      const newEvent: CalendarEvent = {
        ...eventData,
        id: Date.now().toString()
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderCalendarGrid = () => {
    if (view === 'day') {
      const dayEvents = getEventsForDate(currentDate);
      const defaultTimeSlots = Array.from({ length: 5 }, (_, hour) => hour);
      const allTimeSlots = Array.from({ length: 24 }, (_, hour) => hour);
      
      return (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {format(currentDate, 'EEEE')}
            </h2>
            <p className="text-xl text-indigo-600">
              {format(currentDate, 'MMMM do, yyyy')}
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Badge variant="outline" className="bg-white/70">
                {dayEvents.length} events scheduled
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="h-[600px] w-full rounded-md border">
            <div className="space-y-2 p-4">
              {allTimeSlots.map((hour) => {
                const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                const hourEvents = dayEvents.filter(event => event.time.startsWith(hour.toString().padStart(2, '0')));
                
                return (
                  <div key={hour} className="flex border-b border-gray-100">
                    <div className="w-24 text-sm text-gray-500 py-4 px-3 bg-gray-50 rounded-l font-medium">
                      {format(new Date().setHours(hour, 0), 'h:mm a')}
                    </div>
                    <div className="flex-1 p-3 min-h-[70px] bg-white rounded-r">
                      {hourEvents.map(event => (
                        <div key={event.id} className="relative mb-2">
                          <EventCard
                            event={event}
                            onClick={(e) => handleEventClick(event, e)}
                            className={cn('mb-1', categoryColors[event.category])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      );
    }

    const gridCols = view === 'week' ? 'grid-cols-7' : 'grid-cols-7';
    
    return (
      <div className={cn('grid gap-px bg-gray-200 rounded-lg overflow-hidden shadow-inner', gridCols)}>
        {view === 'week' ? (
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 text-center text-sm font-semibold text-gray-700">
              <div>{day}</div>
              <div className="text-lg font-bold">{format(getViewDates[index], 'd')}</div>
            </div>
          ))
        ) : (
          ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))
        )}
        
        {getViewDates.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const hasConflicts = hasConflictingEvents(dayEvents);
          const isCurrentMonth = view === 'week' || isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          const displayEvents = dayEvents.slice(0, view === 'week' ? 4 : 3);
          const hiddenEvents = dayEvents.slice(view === 'week' ? 4 : 3);
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                'calendar-day bg-white',
                view === 'week' ? 'min-h-[120px]' : 'min-h-[100px]',
                isDayToday && 'today',
                !isCurrentMonth && 'other-month'
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isDayToday ? "text-blue-600 font-bold" : "text-gray-700",
                  !isCurrentMonth && "text-gray-400"
                )}>
                  {format(day, 'd')}
                </span>
                {hasConflicts && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    !
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 overflow-hidden">
                {displayEvents.map((event) => (
                  <div key={event.id} className="relative">
                    <EventCard
                      event={event}
                      onClick={(e) => handleEventClick(event, e)}
                      className={cn(
                        'event-card',
                        categoryColors[event.category]
                      )}
                    />
                  </div>
                ))}
                {hiddenEvents.length > 0 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="text-xs text-gray-500 pl-1 cursor-pointer hover:text-gray-700">
                        +{hiddenEvents.length} more
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">All Events for {format(day, 'MMM d')}</h4>
                        {dayEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-gray-500">{event.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <Card className="glass-sidebar p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Navigation</h2>
              <MiniCalendar 
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                events={events}
              />
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Event Categories</h3>
              <div className="space-y-2">
                {Object.entries(categoryColors).map(([category, colorClass]) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={category} className="flex items-center space-x-2 cursor-pointer">
                      <div className={cn("w-3 h-3 rounded border-2", colorClass.split(' ')[2])}></div>
                      <span className="capitalize text-sm">{category}</span>
                    </label>
                  </div>
                ))}
              </div>
              
              
            </Card>
          </div>

          <div className="xl:col-span-2">
            <Card className="glass-card">
              <CalendarHeader 
                currentDate={currentDate}
                onNavigate={navigate}
                view={view}
                onViewChange={setView}
                onToday={goToToday}
              />
              
              <div className="p-6">
                {renderCalendarGrid()}
              </div>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <EventStatistics 
                events={filteredEvents}
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => {
          setSelectedDate(new Date());
          setSelectedEvent(null);
          setIsModalOpen(true);
        }}
        className="floating-button"
        size="lg"
      >
        <span className="text-2xl">+</span>
      </Button>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleEventSave}
        onDelete={selectedEvent ? () => handleEventDelete(selectedEvent.id) : undefined}
      />
    </div>
  );
};
