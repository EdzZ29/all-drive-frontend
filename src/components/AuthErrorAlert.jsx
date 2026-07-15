// Shared error alert for the auth screens. Shows the reason ("why") on the
// first line and a concrete next step ("action") on the second. `error` is a
// { title, action } object (see utils/authError) or null when there's nothing
// to show.
const AuthErrorAlert = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm"
    >
      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="font-semibold">{error.title}</p>
        {error.action && <p className="mt-0.5 text-red-600">{error.action}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-red-400 transition hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default AuthErrorAlert;
