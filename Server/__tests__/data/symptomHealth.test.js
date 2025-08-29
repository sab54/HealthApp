/**
 * symptomHealth.test.js
 *
 * What This Test File Covers:
 *
 * 1. Data Structure Basics
 *    - symptomHealth exports an array with multiple symptom objects.
 *
 * 2. Symptom Object Shape
 *    - Each symptom has a "symptom" string and "severity_levels" with mild/moderate/severe keys.
 *
 * 3. Severity Level Contents
 *    - Each severity entry includes a description, possible_causes, precautions, what_to_eat, medicines, what_not_to_take, exercises, treatment, and timing.
 *
 * 4. Example Values
 *    - Spot-check representative values for "Headache" mild and severe to ensure correctness.
 */

const symptomHealth = require('../../src/data/symptomHealth');

test('symptomHealth exports a non-empty array', () => {
  expect(Array.isArray(symptomHealth)).toBe(true);
  expect(symptomHealth.length).toBeGreaterThan(0);
});

test('each symptom object has expected shape', () => {
  for (const entry of symptomHealth) {
    expect(typeof entry.symptom).toBe('string');
    expect(entry.severity_levels).toBeDefined();
    expect(Object.keys(entry.severity_levels)).toEqual(
      expect.arrayContaining(['mild', 'moderate', 'severe'])
    );
  }
});

test('each severity level contains required fields', () => {
  const requiredKeys = [
    'description',
    'possible_causes',
    'precautions',
    'what_to_eat',
    'medicines',
    'what_not_to_take',
    'exercises',
    'treatment',
    'timing',
  ];
  for (const entry of symptomHealth) {
    for (const level of ['mild', 'moderate', 'severe']) {
      const obj = entry.severity_levels[level];
      for (const key of requiredKeys) {
        expect(obj).toHaveProperty(key);
      }
    }
  }
});

test('spot-check Headache mild and severe contents', () => {
  const headache = symptomHealth.find((s) => s.symptom === 'Headache');
  expect(headache).toBeDefined();
  expect(headache.severity_levels.mild.possible_causes).toContain('Dehydration');
  expect(headache.severity_levels.severe.treatment).toContain('Seek medical advice');
});
