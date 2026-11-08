export const getAvailableSlots = (date: string, doctorSchedule: any): string[] => {
  if (!doctorSchedule || !date) return [];
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return [];
  
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const daySchedule = doctorSchedule.workingDays?.find((d: any) => d.day === dayName);
  
  if (!daySchedule || !daySchedule.isAvailable) return [];
  
  const slots: string[] = [];
  let currentTime = daySchedule.startTime || "09:00";
  const endTime = daySchedule.endTime || "17:00";
  const duration = doctorSchedule.slotDuration || 30;
  
  while (currentTime < endTime) {
    const [h, m] = currentTime.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m < 10 ? `0${m}` : m;
    slots.push(`${displayH}:${displayM} ${ampm}`);
    
    let newM = m + duration;
    let newH = h + Math.floor(newM / 60);
    newM = newM % 60;
    
    const nextHStr = newH < 10 ? `0${newH}` : `${newH}`;
    const nextMStr = newM < 10 ? `0${newM}` : `${newM}`;
    currentTime = `${nextHStr}:${nextMStr}`;
  }
  return slots;
};
