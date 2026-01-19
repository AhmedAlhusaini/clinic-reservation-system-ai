import { format, addDays, parse, addMinutes, isAfter, set } from 'date-fns';

const HOLIDAY_API_BASE = 'https://date.nager.at/api/v3/publicholidays';

// Cache holidays in memory to avoid repeated fetch
let holidayCache = {};

export const fetchHolidays = async (year) => {
    if (holidayCache[year]) return holidayCache[year];
    
    try {
        const response = await fetch(`${HOLIDAY_API_BASE}/${year}/EG`); // Egypt
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Map to simpler array of "YYYY-MM-DD"
        const holidayDates = data.map(h => h.date);
        holidayCache[year] = holidayDates;
        return holidayDates;
    } catch (error) {
        console.error('Failed to fetch holidays', error);
        return []; // Fail safe
    }
};

export const isHoliday = async (dateStr) => {
    const year = dateStr.split('-')[0];
    const holidays = await fetchHolidays(year);
    return holidays.includes(dateStr);
};

// Check if a specific date is manually set as Open or Closed
// exceptions: { '2025-01-25': 'open', '2025-01-26': 'closed' }
export const checkException = (dateStr, exceptions) => {
    if (!exceptions) return null;
    return exceptions[dateStr] || null;
};

export const isWorkingDay = (date, workingDays, exceptions) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const exception = checkException(dateStr, exceptions);
    
    if (exception === 'open') return true;
    if (exception === 'closed') return false;

    // Default logic
    const dayName = format(date, 'ccc'); 
    return workingDays.includes(dayName);
};

// Returns boolean: TRUE if valid slot, FALSE if blocked (holiday or off day)
export const isSlotAvailable = async (date, workingDays, exceptions) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 1. Check Exceptions first
    const exception = checkException(dateStr, exceptions);
    if (exception === 'open') return true; // Force Open matching Holiday/OffDay
    if (exception === 'closed') return false; // Force Closed

    // 2. Check Standard Working Days
    const dayName = format(date, 'ccc');
    if (!workingDays.includes(dayName)) return false;

    // 3. Check Holidays
    const holiday = await isHoliday(dateStr);
    if (holiday) return false;

    return true;
};

export const findNextAvailableSlot = async (reservations, workingDays, startHour, endHour, exceptions = {}) => {
    let current = new Date(); 
    
    for (let i = 0; i < 30; i++) { 
        const dateStr = format(current, 'yyyy-MM-dd');
        
        // Comprehensive Availability Check
        const available = await isSlotAvailable(current, workingDays, exceptions);
        if (!available) {
            current = addDays(current, 1);
            continue;
        }

        // ... rest of generation logic
        const dailySlots = generateSlotsForDay(current, startHour, endHour);
        // ...
        const now = new Date();
        const isToday = format(current, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        for (const slot of dailySlots) {
             if (isToday) {
                 const slotStartPart = slot.split(' - ')[0]; 
                 const slotStartDate = parse(slotStartPart, 'h a', current);
                 if (isAfter(now, slotStartDate)) continue; 
             }

             const taken = reservations.some(r => r.date === dateStr && r.timeSlot === slot && r.status === 'active');
             if (!taken) {
                 return { date: dateStr, slot: slot };
             }
        }
        
        current = addDays(current, 1);
    }
    return null; 
};
