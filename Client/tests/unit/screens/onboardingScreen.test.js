import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingScreen from '../../../src/screens/onboardingScreen';

describe('OnboardingScreen', () => {
  const mockNavigate = jest.fn();

  const createTestProps = () => ({
    navigation: {
      navigate: mockNavigate
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Get Started button', () => {
    const { getByText } = render(<OnboardingScreen {...createTestProps()} />);
    expect(getByText('Get Started')).toBeTruthy();
  });

  it('navigates to Login when Get Started is pressed', async () => {
    const { getByText } = render(<OnboardingScreen {...createTestProps()} />);
    const button = getByText('Get Started');

    fireEvent.press(button);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });
});

