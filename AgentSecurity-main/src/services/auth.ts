export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    token: string;
  };
}

/**
 * Mock authentication service for Agent Guard.
 * Simulates network latency (~1.2s).
 * Accepts any email with valid format and password with 8+ characters.
 * Triggers failure banner if credentials contain 'invalid' or 'fail'.
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network delay of ~1.2s
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // TODO: Replace this mock implementation with real backend API call
  // Example:
  // const response = await fetch('/api/v1/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  // if (!response.ok) throw new Error('Authentication failed');
  // return await response.json();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(credentials.email);
  const isPasswordValid = credentials.password.length >= 8;

  // Explicit test cases for simulating invalid server credentials
  if (
    !isEmailValid ||
    !isPasswordValid ||
    credentials.email.toLowerCase().includes('invalid') ||
    credentials.email.toLowerCase().includes('fail')
  ) {
    return {
      success: false,
      message: 'Invalid email or password.',
    };
  }

  // Handle local storage persistence for "Remember me"
  if (credentials.rememberMe) {
    localStorage.setItem('aegis_remembered_email', credentials.email);
  } else {
    localStorage.removeItem('aegis_remembered_email');
  }

  return {
    success: true,
    user: {
      email: credentials.email,
      token: 'mock-jwt-token-aegis-' + Date.now(),
    },
  };
}

export function getRememberedEmail(): string {
  try {
    return localStorage.getItem('aegis_remembered_email') || '';
  } catch {
    return '';
  }
}
