import 'expect';

declare module 'expect' {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}


