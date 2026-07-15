import { ApiError } from '../api';

// Turns any thrown error into a clear { title, action } pair — the "why it
// happened" and a concrete next step — so auth screens never show a raw or
// cryptic message. `mode` tailors a few messages to login vs register.
export function describeAuthError(err, mode = 'login') {
  // Not an ApiError → almost always a network/connection failure.
  if (!(err instanceof ApiError)) {
    return {
      title: "We couldn't reach the server.",
      action: 'Check your internet connection and try again in a moment.',
    };
  }

  const status = err.status;
  const raw = err.message;

  if (status === 401) {
    return {
      title: 'The email or password is incorrect.',
      action: 'Double-check your details and try again.',
    };
  }

  if (status === 403) {
    return {
      title: 'This account can’t sign in.',
      action: 'It may be deactivated — please contact support for help.',
    };
  }

  if (status === 409) {
    return {
      title: 'An account with this email already exists.',
      action: 'Try logging in instead, or use a different email address.',
    };
  }

  if (status === 400 || status === 422) {
    return {
      title: 'Some details need fixing.',
      action: raw || 'Please review the highlighted fields and try again.',
    };
  }

  if (status >= 500) {
    return {
      title: 'Something went wrong on our end.',
      action: 'This is temporary — please try again in a few moments.',
    };
  }

  // Fallback: surface whatever the server said, plus a generic action.
  return {
    title: raw || (mode === 'register' ? 'Could not create your account.' : 'Could not sign you in.'),
    action: 'Please try again.',
  };
}
