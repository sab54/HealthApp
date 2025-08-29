// utils/dateHelpers.js
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
