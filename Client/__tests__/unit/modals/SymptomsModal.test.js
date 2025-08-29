// __tests__/unit/modals/SymptomsModal.test.js

/**
 * SymptomsModal.test.js
 *
 * What This Test File Covers:
 *
 * 1) Basic Rendering
 *    - Title, info text, search input, and close button.
 *
 * 2) Search Filtering
 *    - Filters the symptom list as the user types.
 *
 * 3) Selecting a Symptom
 *    - Dispatches addSymptom, updates local addedSymptoms, and calls onClose.
 *
 * 4) Disabled When Daily Limit Reached
 *    - With 3 symptoms already logged, tapping items does nothing.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useSelector, useDispatch } from 'react-redux';
import SymptomsModal from 'src/modals/SymptomsModal';
import { addSymptom } from 'src/store/reducers/healthlogReducers';

// ---- Mocks ----
jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  const unwrap = jest.fn().mockResolvedValue({});
  const dispatch = jest.fn(() => ({ unwrap }));
  dispatch.unwrap = unwrap;
  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn(() => dispatch),
    Provider: ({ children }) => children,
  };
});

// Provide symptoms used by the modal list
jest.mock('src/data/symptomHealth', () => ({
  symptomHealth: [
    { symptom: 'Headache', image: { uri: 'headache.png' } },
    { symptom: 'Fever', image: { uri: 'fever.png' } },
    { symptom: 'Cough', image: { uri: 'cough.png' } },
  ],
}));
jest.mock('client/src/data/symptomHealth', () => ({
  symptomHealth: [
    { symptom: 'Headache', image: { uri: 'headache.png' } },
    { symptom: 'Fever', image: { uri: 'fever.png' } },
    { symptom: 'Cough', image: { uri: 'cough.png' } },
  ],
}));

jest.mock('src/store/reducers/healthlogReducers', () => ({
  addSymptom: jest.fn((payload) => ({ type: 'ADD_SYMPTOM', payload })),
}));

// ---- Test helpers ----
const theme = {
  mode: 'light',
  modalBackground: '#fff',
  surface: '#fafafa',
  shadow: '#000',
  card: '#f7f7f7',
  disabled: '#eee',
  text: '#111',
  mutedText: '#666',
  input: '#fff',
  inputBorder: '#ddd',
  inputText: '#111',
  placeholder: '#999',
  title: '#000',
};

const setSelectors = (todaySymptomsRaw = []) => {
  useSelector.mockImplementation((sel) =>
    sel({
      theme: { themeColors: theme },
      healthlog: { todaySymptoms: todaySymptomsRaw },
    })
  );
};

const renderModal = (props = {}) =>
  render(
    <SymptomsModal
      visible
      onClose={jest.fn()}
      addedSymptoms={[]}
      setAddedSymptoms={jest.fn()}
      {...props}
    />
  );

describe('SymptomsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSelectors([]); // default: no symptoms selected yet
  });

  it('renders title, info text, search input, and close button', () => {
    const { getByText, getByPlaceholderText } = renderModal();

    expect(getByText('Select Your Symptoms')).toBeTruthy();
    expect(getByText(/max 3/i)).toBeTruthy();
    expect(getByPlaceholderText('Search symptoms...')).toBeTruthy();

    // In test setup, @expo/vector-icons renders as a Text node: "ion:<name>"
    // SymptomsModal uses Ionicons name="arrow-back"
    expect(getByText('ion:arrow-back')).toBeTruthy();
  });

  it('filters the list based on search input', () => {
    const { getByPlaceholderText, queryByText, getByText } = renderModal();

    // All mocked items initially present
    expect(getByText('Headache')).toBeTruthy();
    expect(getByText('Fever')).toBeTruthy();
    expect(getByText('Cough')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Search symptoms...'), 'fev');

    expect(queryByText('Headache')).toBeNull();
    expect(getByText('Fever')).toBeTruthy();
    expect(queryByText('Cough')).toBeNull();
  });

  it('selecting a symptom dispatches addSymptom, updates addedSymptoms, and calls onClose', () => {
    const onClose = jest.fn();
    const setAddedSymptoms = jest.fn();
    const { getByText } = renderModal({ onClose, setAddedSymptoms });

    // Tap on "Fever"
    fireEvent.press(getByText('Fever'));

    const dispatch = useDispatch();
    expect(addSymptom).toHaveBeenCalledWith(
      expect.objectContaining({ symptom: 'Fever' })
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ADD_SYMPTOM',
        payload: expect.objectContaining({ symptom: 'Fever' }),
      })
    );

    expect(setAddedSymptoms).toHaveBeenCalledWith(expect.arrayContaining(['Fever']));
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ symptom: 'Fever' })
    );
  });

  it('disables selection when 3 symptoms already selected', () => {
    setSelectors([
      { symptom: 'Headache' },
      { symptom: 'Fever' },
      { symptom: 'Cough' },
    ]);

    const onClose = jest.fn();
    const setAddedSymptoms = jest.fn();
    const { getByText } = renderModal({ onClose, setAddedSymptoms });

    // All items are disabled; presses should do nothing
    fireEvent.press(getByText('Headache'));
    fireEvent.press(getByText('Fever'));
    fireEvent.press(getByText('Cough'));

    const dispatch = useDispatch();
    expect(dispatch).not.toHaveBeenCalled();
    expect(addSymptom).not.toHaveBeenCalled();
    expect(setAddedSymptoms).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
