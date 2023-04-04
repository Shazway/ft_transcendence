import { HeaderInterceptorMiddleware } from './header-interceptor.middleware';

describe('HeaderInterceptorMiddleware', () => {
  it('should be defined', () => {
    expect(new HeaderInterceptorMiddleware()).toBeDefined();
  });
});
