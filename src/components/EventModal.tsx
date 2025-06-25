
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from './Calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    duration: 60,
    category: 'work' as CalendarEvent['category'],
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time,
        duration: event.duration,
        category: event.category,
        description: event.description || ''
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: '',
        description: ''
      }));
    }
  }, [event, selectedDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const categoryOptions = [
    { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
    { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-800' },
    { value: 'deadline', label: 'Deadline', color: 'bg-red-100 text-red-800' },
    { value: 'reminder', label: 'Reminder', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                  Time
                </Label>
                <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  min="15"
                  step="15"
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={option.color}>{option.label}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add event details..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  className="hover:bg-red-600"
                >
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {event ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
