// utils/dateHelpers.js
/**
 * dateHelpers.js
 *
 * This file defines utility functions for working with dates, specifically for managing and sorting appointment data.
 * The function `getUpcomingAppointment` filters a list of appointments to find the next scheduled appointment that is 
 * in the future, based on the current date and time.
 *
 * Features:
 * - `getUpcomingAppointment`: Filters and sorts appointments to find the next scheduled appointment.
 *   - Filters out appointments without a date or time, or those that are not scheduled.
 *   - Sorts appointments by the soonest date and time.
 *   - Returns the first upcoming appointment, or `null` if no future appointments are found.
 *
 * This file uses the following libraries:
 * - Native JavaScript `Date` object for working with date and time.
 *
 * Dependencies:
 * - None
 *
 * Author: Sunidhi Abhange
 */

export const getUpcomingAppointment = (appointments) => {
  if (!appointments || appointments.length === 0) return null;

  const now = new Date();

  const futureAppointments = appointments.filter(appt => {
    if (!appt.date || !appt.time) return false;

    const apptDateTime = new Date(`${appt.date}T${appt.time}:00`);
    return apptDateTime >= now && appt.status === 'scheduled';
  });

  // sort by soonest
  futureAppointments.sort(
    (a, b) =>
      new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`)
  );

  return futureAppointments[0] || null;
};
