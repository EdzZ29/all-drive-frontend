// Central fetch wrapper for talking to the AllDrive backend.
//
// - Prefixes every request with the configured API base URL.
// - Sends cookies on every request (credentials: 'include') so the httpOnly
//   auth cookie set by the backend is included automatically.
// - Parses JSON responses and throws a rich ApiError on non-2xx responses.

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, headers, ...rest } = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: { ...headers },
    ...rest,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      // Let the browser set the multipart Content-Type (with boundary).
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  // 204 No Content and empty bodies parse to null.
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${response.status})`;
    // NestJS validation errors arrive as an array of strings.
    const flatMessage = Array.isArray(message) ? message.join(', ') : message;
    throw new ApiError(flatMessage, response.status, data);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
