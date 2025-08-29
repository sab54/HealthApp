/**
 * appointmentReducer.test.js
 *
 * What This Test File Covers:
 *
 * 1. Initial State
 *    - Ensures reducer returns the correct initial state.
 *
 * 2. Local Reducers
 *    - clearError resets error to null.
 *    - addAppointment appends a new appointment.
 *
 * 3. bookAppointment Lifecycle
 *    - Pending sets loading=true and clears error.
 *    - Fulfilled sets loading=false and pushes payload.
 *    - Rejected sets loading=false and populates error.
 */

import reducer, { clearError, addAppointment } from '@/store/reducers/appointmentReducers';
import { bookAppointment } from '@/store/actions/appointmentActions';

describe('appointmentReducer', () => {
  const initialState = {
    appointments: [],
    loading: false,
    error: null,
  };

  it('returns initial state by default', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('handles clearError and addAppointment reducers', () => {
    // set an error and then clear it
    const errored = { ...initialState, error: 'Some error' };
    expect(reducer(errored, clearError())).toEqual(initialState);

    // addAppointment appends new appointment
    const appointment = { id: 1, doctor: 'Dr. Smith' };
    const afterAdd = reducer(initialState, addAppointment(appointment));
    expect(afterAdd.appointments).toContainEqual(appointment);
  });

  it('handles bookAppointment.pending', () => {
    const action = { type: bookAppointment.pending.type };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles bookAppointment.fulfilled', () => {
    const appointment = { id: 2, doctor: 'Dr. Jones' };
    const action = { type: bookAppointment.fulfilled.type, payload: appointment };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.appointments).toContainEqual(appointment);
  });

  it('handles bookAppointment.rejected', () => {
    const action = { type: bookAppointment.rejected.type, payload: 'Network error' };
    const state = reducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});
