import React from 'react'
import { Button } from './Button'

const DateTimePicker = ({ value, onChange, className = "" }) => {
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (event) => {
    const newDateTime = event.target.value;
    onChange(newDateTime);
  };

  const setToNow = () => {
    const now = new Date();
    onChange(formatDateTime(now));
  };

  const addOneHour = () => {
    const currentDate = value ? new Date(value) : new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    onChange(formatDateTime(currentDate));
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="datetime-local"
        value={formatDateTime(value)}
        onChange={handleDateTimeChange}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={setToNow}
          className="text-xs px-2 py-1"
        >
          Now
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addOneHour}
          className="text-xs px-2 py-1"
        >
          +1h
        </Button>
      </div>
    </div>
  );
};

export default DateTimePicker;
