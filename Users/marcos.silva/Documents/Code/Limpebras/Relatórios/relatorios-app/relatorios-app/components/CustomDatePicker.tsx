"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDatePicker({ 
  selectedDate, 
  onChange: onDateChange, 
  placeholder = "Selecione uma data",
  className = ""
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => {
          onDateChange(date);
          setIsOpen(false);
        }}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        open={isOpen}
        placeholderText={placeholder}
        dateFormat="dd/MM/yyyy"
        showPopperArrow={false}
        popperClassName="custom-datepicker-popper"
        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 focus:shadow-md cursor-pointer"
        calendarClassName="custom-datepicker-calendar"
        dayClassName={(date) => {
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          
          let className = "hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg transition-colors duration-200";
          
          if (isToday) {
            className += " bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold";
          }
          
          if (isSelected) {
            className += " bg-indigo-500 text-white font-bold";
          }
          
          return className;
        }}
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-lg font-bold">
              {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
            
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      />
      
      <style jsx global>{`
        .custom-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .custom-datepicker-calendar {
          border: none !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
          overflow: hidden !important;
        }
        
        .react-datepicker {
          border: none !important;
          font-family: inherit !important;
        }
        
        .react-datepicker__header {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        
        .react-datepicker__month-container {
          background: white !important;
        }
        
        .dark .react-datepicker__month-container {
          background: #1f2937 !important;
        }
        
        .react-datepicker__day-names {
          background: #f8fafc !important;
          padding: 0.5rem 0 !important;
        }
        
        .dark .react-datepicker__day-names {
          background: #374151 !important;
        }
        
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
        }
        
        .dark .react-datepicker__day-name {
          color: #9ca3af !important;
        }
        
        .react-datepicker__day {
          color: #374151 !important;
          font-weight: 500 !important;
          border-radius: 0.5rem !important;
          margin: 0.125rem !important;
          width: 2rem !important;
          height: 2rem !important;
          line-height: 2rem !important;
          transition: all 0.2s ease !important;
        }
        
        .dark .react-datepicker__day {
          color: #d1d5db !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #e0e7ff !important;
          color: #3730a3 !important;
        }
        
        .dark .react-datepicker__day:hover {
          background-color: #4338ca !important;
          color: #ffffff !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #6366f1 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
        }
        
        .react-datepicker__day--today {
          background-color: #dbeafe !important;
          color: #1e40af !important;
          font-weight: 600 !important;
        }
        
        .dark .react-datepicker__day--today {
          background-color: #1e3a8a !important;
          color: #dbeafe !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #9ca3af !important;
        }
        
        .dark .react-datepicker__day--outside-month {
          color: #6b7280 !important;
        }
        
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
        }
        
        .dark .react-datepicker__day--disabled {
          color: #4b5563 !important;
        }
      `}</style>
    </div>
  );
}

