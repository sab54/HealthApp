/**
 * HealthlogScreen.test.js
 *
 * Covers:
 * 1) Basic Rendering
 * 2) Auto-redirect when already logged
 * 3) Submit "Feeling great!" -> replace MainTabs, clear moodSkipped
 * 4) "Not feeling good!" flow -> details -> symptoms -> close resets
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import HealthLogScreen from '@/screens/HealthlogScreen';

jest.mock('@/store/actions/healthlogActions', () => ({
  fetchTodayMood: jest.fn((userId) => ({ type: 'FETCH_TODAY_MOOD', meta: { userId } })),
  fetchTodaySymptoms: jest.fn((userId) => ({ type: 'FETCH_TODAY_SYMPTOMS', meta: { userId } })),
  submitMood: jest.fn((payload) => ({ type: 'SUBMIT_MOOD', payload })),
}));

// --- Modal stubs ------------------------------------------------------------
// MoodDetailsModal exposes two buttons so tests can choose which mood to submit.
jest.mock('@/modals/MoodDetailsModal', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return ({ visible, onSubmit }) =>
    visible ? (
      <View testID="mood-details-modal">
        <Button
          title="mock-mood-submit-great"
          onPress={() => onSubmit('Feeling great!', 8, 8)}
        />
        <Button
          title="mock-mood-submit-not-good"
          onPress={() => onSubmit('Not feeling good!', 7, 5)}
        />
      </View>
    ) : null;
});

jest.mock('@/modals/SymptomsModal', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return ({ visible, onClose }) =>
    visible ? (
      <View testID="symptoms-modal">
        <Button title="mock-symptoms-close" onPress={() => onClose(null)} />
        <Button
          title="mock-symptoms-select"
          onPress={() => onClose({ symptom: 'Headache' })}
        />
      </View>
    ) : null;
});

jest.mock('@/modals/SymptomDetailModal', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return ({ visible, onClose }) =>
    visible ? (
      <View testID="symptom-detail-modal">
        <Button title="mock-detail-close" onPress={() => onClose()} />
      </View>
    ) : null;
});

// AsyncStorage (global mock in setup)
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('HealthLogScreen', () => {
  const theme = {
    background: '#fff',
    text: '#111',
    title: '#000',
    mutedText: '#666',
    buttonPrimaryBackground: '#0a84ff',
    buttonPrimaryText: '#fff',
    buttonSecondaryBackground: '#eee',
    buttonSecondaryText: '#111',
  };

  const makeState = (overrides = {}) => ({
    auth: { user: { id: 'user-1', name: 'Testy' } },
    theme: { themeColors: theme },
    healthlog: { loading: false, ...overrides },
  });

  const makeNav = () => ({
    replace: jest.fn(),
    dispatch: jest.fn(),
    navigate: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // default selectors
    useSelector.mockImplementation((sel) => sel(makeState()));
    // unwrap chain control
    const dispatch = useDispatch();
    dispatch.unwrap.mockReset();
    jest.spyOn(AsyncStorage, 'removeItem').mockResolvedValue();
  });

  it('renders question and both CTAs when nothing is recorded yet', async () => {
    const nav = makeNav();
    const dispatch = useDispatch();
    dispatch.unwrap
      .mockResolvedValueOnce({})  // fetchTodayMood -> no mood
      .mockResolvedValueOnce([]); // fetchTodaySymptoms -> none

    const { getByText } = render(<HealthLogScreen navigation={nav} />);

    await waitFor(() => {
      expect(getByText('How are you feeling today?')).toBeTruthy();
      expect(getByText('Feeling great!')).toBeTruthy();
      expect(getByText('Not feeling good!')).toBeTruthy();
    });

    expect(nav.dispatch).not.toHaveBeenCalled();
  });

  it('auto-redirects to MainTabs when mood and symptoms already recorded', async () => {
    const nav = makeNav();
    const dispatch = useDispatch();
    dispatch.unwrap
      .mockResolvedValueOnce({ mood: 'Feeling great!' })
      .mockResolvedValueOnce([{ symptom: 'Cough' }]);

    render(<HealthLogScreen navigation={nav} />);

    await waitFor(() => {
      expect(nav.dispatch).toHaveBeenCalledTimes(1);
      expect(nav.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'DailyLog' });
    });
  });

  it('submits "Feeling great!" and replaces to MainTabs; clears moodSkipped', async () => {
    const nav = makeNav();
    const dispatch = useDispatch();
    dispatch.unwrap
      .mockResolvedValueOnce({})   // fetchTodayMood
      .mockResolvedValueOnce([])   // fetchTodaySymptoms
      .mockResolvedValueOnce({});  // submitMood

    const { getByText, findByTestId } = render(<HealthLogScreen navigation={nav} />);

    await waitFor(() => getByText('Feeling great!'));
    fireEvent.press(getByText('Feeling great!')); // opens MoodDetailsModal

    // Submit with the "great" path via mock button
    await findByTestId('mood-details-modal');
    fireEvent.press(getByText('mock-mood-submit-great'));

    await waitFor(() => {
      expect(nav.replace).toHaveBeenCalledWith('MainTabs');
    });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('moodSkipped');
  });

  it('"Not feeling good!" -> opens details, submits, shows SymptomsModal, then close -> resets to MainTabs', async () => {
    const nav = makeNav();
    const dispatch = useDispatch();
    dispatch.unwrap
      .mockResolvedValueOnce({})   // fetchTodayMood
      .mockResolvedValueOnce([])   // fetchTodaySymptoms
      .mockResolvedValueOnce({});  // submitMood

    const { getByText, findByTestId } = render(<HealthLogScreen navigation={nav} />);

    await waitFor(() => getByText('Not feeling good!'));
    fireEvent.press(getByText('Not feeling good!')); // open MoodDetailsModal

    await findByTestId('mood-details-modal');
    fireEvent.press(getByText('mock-mood-submit-not-good'));

    const symptomsModal = await findByTestId('symptoms-modal');
    expect(symptomsModal).toBeTruthy();

    fireEvent.press(getByText('mock-symptoms-close'));

    await waitFor(() => {
      expect(nav.dispatch).toHaveBeenCalledTimes(1);
      expect(nav.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'DailyLog' });
    });
  });
});
