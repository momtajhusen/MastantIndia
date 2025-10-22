// components/CompactCalendar.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CompactCalendar = ({ 
  selectedDate, 
  onDateSelect, 
  endDate = null
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = (date.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
      days.push({
        day: prevMonthDays - firstDay + i + 1,
        isCurrentMonth: false,
        date: new Date(prevYear, prevMonth, prevMonthDays - firstDay + i + 1),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(nextYear, nextMonth, i),
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInRange = (date) => {
    if (!endDate) return false;
    const start = selectedDate;
    const end = endDate;
    return date >= start && date <= end;
  };

  return (
    <View style={styles.calendarSection}>
      <View style={styles.compactCalendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-back" size={16} color="#333" />
        </TouchableOpacity>
        <Text style={styles.compactMonthTitle}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { 
            month: 'short', 
            year: 'numeric' 
          })}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
          <Ionicons name="chevron-forward" size={16} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Compact Week Days */}
      <View style={styles.compactWeekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.compactWeekDay}>{day.charAt(0)}</Text>
        ))}
      </View>

      {/* Compact Calendar Grid */}
      <View style={styles.compactCalendarGrid}>
        {calendarDays.slice(0, 21).map((dayObj, index) => {
          const isSelected = selectedDate.toDateString() === dayObj.date.toDateString();
          const isInRange = isDateInRange(dayObj.date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.compactCalendarDay,
                !dayObj.isCurrentMonth && styles.inactiveDay,
                isSelected && dayObj.isCurrentMonth && styles.selectedDay,
                isInRange && dayObj.isCurrentMonth && !isSelected && styles.rangeDayStyle
              ]}
              onPress={() => {
                if (dayObj.isCurrentMonth && onDateSelect) {
                  onDateSelect(dayObj.date);
                }
              }}
            >
              <Text style={[
                styles.compactCalendarDayText,
                !dayObj.isCurrentMonth && styles.inactiveDayText,
                isSelected && dayObj.isCurrentMonth && styles.selectedDayText,
                isInRange && dayObj.isCurrentMonth && !isSelected && styles.rangeDayText
              ]}>
                {dayObj.day}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarSection: {
    flex: 2
  },
  compactCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  monthNavButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  compactMonthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  },
  compactWeekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8
  },
  compactWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    fontWeight: '500'
  },
  compactCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  compactCalendarDay: {
    width: '14.28%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  inactiveDay: {
    opacity: 0.3
  },
  selectedDay: {
    backgroundColor: '#000',
    borderRadius: 15
  },
  rangeDayStyle: {
    backgroundColor: '#e9ecef',
    borderRadius: 15
  },
  compactCalendarDayText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500'
  },
  inactiveDayText: {
    color: '#ccc'
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  rangeDayText: {
    color: '#333'
  }
});

export default CompactCalendar;