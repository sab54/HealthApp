// __tests__/unit/DailyWellnessCard.test.js

/**
 * DailyWellnessCard.test.js
 *
 * What this test file covers:
 * 1) Basic Rendering
 *    - Renders titles, summary labels, and View More button.
 * 2) Displays Provided Data
 *    - Shows mood text, formatted sleep (h m), energy label (High/Medium/Low),
 *      and renders symptom rows with severity + "Updated today".
 * 3) Fallbacks When Data Missing
 *    - Shows "No mood logged", "No sleep logged", "No energy logged",
 *      and "No symptoms logged" when corresponding props are absent/empty.
 * 4) Navigation
 *    - Pressing "View More" calls navigation.navigate('DailyLog').
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DailyWellnessCard from 'src/module/DailyWellnessCard';

const baseTheme = {
  surface: '#fff',
  border: '#e5e5e5',
  cardShadow: '#000',
  title: '#111',
  mutedText: '#666',
  text: '#000',
  buttonPrimaryBackground: '#0a84ff',
  buttonPrimaryText: '#fff',
};

const setup = (props = {}) => {
  const navigate = jest.fn();
  const navigation = { navigate };
  const utils = render(
    <DailyWellnessCard
      moodToday="Happy"
      sleepToday={7.5}
      energyToday={8}
      todaySymptoms={[
        { symptom: 'Headache', severity: 'Mild' },
        { symptom: 'Nausea', severity: 'Severe' },
      ]}
      navigation={navigation}
      theme={baseTheme}
      {...props}
    />
  );
  return { ...utils, navigate };
};

describe('DailyWellnessCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders titles, labels, and View More button', () => {
    const { getByText } = setup();

    // Titles
    expect(getByText('Daily Wellness Summary')).toBeTruthy();
    expect(getByText('Symptom Log')).toBeTruthy();

    // Summary labels
    expect(getByText('Mood')).toBeTruthy();
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Energy')).toBeTruthy();

    // Button
    expect(getByText('View More')).toBeTruthy();
  });

  it('displays provided mood, formatted sleep, energy label, and symptoms list', () => {
    const { getByText, queryAllByText } = setup({
      moodToday: 'Calm',
      sleepToday: 7.5, // 7h 30m
      energyToday: 8, // High
      todaySymptoms: [
        { symptom: 'Headache', severity: 'Mild' },
        { symptom: 'Nausea', severity: 'Severe' },
      ],
    });

    // Mood value
    expect(getByText('Calm')).toBeTruthy();

    // Sleep formatted as "7h 30m"
    expect(getByText('7h 30m')).toBeTruthy();

    // Energy formatted as "High"
    expect(getByText('High')).toBeTruthy();

    // Symptoms list with "Updated today"
    expect(getByText('Headache')).toBeTruthy();
    expect(getByText('Mild - Updated today')).toBeTruthy();
    expect(getByText('Nausea')).toBeTruthy();
    // There should be exactly one "Severe - Updated today"
    expect(queryAllByText('Severe - Updated today').length).toBe(1);
  });

  it('shows fallbacks when data is missing or empty', () => {
    const { getByText } = setup({
      moodToday: undefined,
      sleepToday: null,
      energyToday: null,
      todaySymptoms: [],
    });

    expect(getByText('No mood logged')).toBeTruthy();
    expect(getByText('No sleep logged')).toBeTruthy();
    expect(getByText('No energy logged')).toBeTruthy();
    expect(getByText('No symptoms logged')).toBeTruthy();
  });

  it('navigates to DailyLog when tapping View More', () => {
    const { getByText, navigate } = setup();

    fireEvent.press(getByText('View More'));
    expect(navigate).toHaveBeenCalledWith('DailyLog');
  });
});
