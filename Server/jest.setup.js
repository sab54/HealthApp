// Keep tests deterministic and quiet
process.env.NODE_ENV = 'test';
jest.setTimeout(30000);

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore?.();
  console.error.mockRestore?.();
});
