import { AuthVerifMiddleware } from './auth-verif.middleware';

describe('AuthVerifMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthVerifMiddleware()).toBeDefined();
  });
});
