export const getThemeColors = (isDarkMode) => ({
    mode: isDarkMode ? 'dark' : 'light',

    // Layout & Backgrounds
    background: isDarkMode ? '#1E1B2E' : '#ffffff', // App root background
    card: isDarkMode ? '#2A2340' : '#f9f9ff', // Cards or blocks background
    surface: isDarkMode ? '#26203A' : '#f5f5ff', // Neutral surfaces (modals, panels)
    highlight: isDarkMode ? '#3A2D5C' : '#e2e2ff', // Hoverable elements
    overlay: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)', // Modal overlays

    // Text & Typography
    title: isDarkMode ? '#ffffff' : '#1a1a2e', // Main headings
    text: isDarkMode ? '#D1D1FF' : '#333366', // Standard body text
    mutedText: isDarkMode ? '#A3A3C2' : '#7d7da6', // Less prominent text
    placeholder: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,128,0.3)', // Input placeholder

    // Inputs & Borders
    input: isDarkMode ? '#2A2340' : '#ffffff', // Text input background
    inputText: isDarkMode ? '#E5E5FF' : '#333366', // Input text color
    inputBorder: isDarkMode ? '#5C4B8A' : '#c5c5ff', // Input border
    border: isDarkMode ? '#5C4B8A' : '#c5c5ff', // General borders
    focusOutline: isDarkMode ? '#7C5DFF' : '#6C5BCD', // Focus ring color

     // Checkbox styles
    checkboxBorder: isDarkMode ? '#6C5BCD' : '#9999cc', // Subtle border
    checkboxBackground: isDarkMode ? '#3A2D5C' : '#ffffff',  // Dark background for unchecked state
    checkboxChecked: '#6C5BCD', // Purple when checked
    checkboxHover: isDarkMode ? '#3A2D5C' : '#e2e2ff',  // Hover effect
    checkboxTick: isDarkMode ? '#ffffffff' : '#ffffffff',  // White for light mode, purple for dark mode

    // Buttons
    buttonPrimaryBackground: '#6C5BCD', // Purple primary button
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBackground: '#4B9BE3', // Blue secondary button
    buttonSecondaryText: '#ffffff',
    buttonDisabledBackground: isDarkMode ? '#3A324D' : '#cccccc',
    buttonDisabledText: isDarkMode ? '#7D7DA6' : '#999999',

    // radio & Checkbox
    radioBorder: isDarkMode ? '#7D7DA6' : '#9999cc',
    radioBackground: isDarkMode ? '#2A2340' : '#ffffff',
    radioChecked: '#6C5BCD',
    radioHover: isDarkMode ? '#3A2D5C' : '#e2e2ff',
    radioDisabled: isDarkMode ? '#5C4B8A' : '#cccccc',

    // Status Feedback Colors
    success: '#4CAF50',
    successBackground: isDarkMode ? '#234B2D' : '#d4edda',
    error: '#D93F2B',
    errorBackground: isDarkMode ? '#4B2D2B' : '#f8d7da',
    warning: '#FFB900',
    warningBackground: isDarkMode ? '#4F4220' : '#fff3cd',
    info: '#4B9BE3', // Blue info
    infoBackground: isDarkMode ? '#243B52' : '#d1ecf1',

    // Actions & Interactions
    actionBackground: isDarkMode ? '#26203A' : '#f4f4ff',
    actionText: isDarkMode ? '#D1D1FF' : '#333366',
    disabled: isDarkMode ? '#3A324D' : '#e0e0e0',

    // Icons & Visuals
    icon: isDarkMode ? '#C5C5FF' : '#4a4a8a',

    // Links & Interactivity
    link: '#4B9BE3',
    linkHover: '#3A7ACC',

    // Badges & Tags
    badge: '#6C5BCD',
    badgeText: '#ffffff',
    tagBackground: isDarkMode ? '#3A2D5C' : '#ebf2ff',
    tagText: isDarkMode ? '#E0E0FF' : '#1a1a2e',

    // Dividers & Shadows
    divider: isDarkMode ? '#5C4B8A' : '#c5c5ff',
    shadow: isDarkMode ? '#00000066' : '#0000001a',
    cardShadow: isDarkMode ? '#00000066' : '#0000001a',

    // Modals & Popups
    modalBackground: isDarkMode ? '#2A2340' : '#ffffff',

    // Hover/Focus Effects
    hoverBackground: isDarkMode ? '#3A2D5C' : '#f4f4ff',

    // Header & Footer Styling
    headerBackground: isDarkMode ? '#26203A' : '#f9f9ff',
    footerBackground: isDarkMode ? '#1E1B2E' : '#ffffff',
});
