export interface RegisterInput {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: 'student' | 'admin';
}

export interface LoginInput {
  email?: string;
  password?: string;
}

export const validateRegisterInput = (input: RegisterInput): string | null => {
  if (!input.name || input.name.trim().length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  if (!input.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input.email.trim())) {
    return 'Please provide a valid email address.';
  }
  if (!input.password || input.password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (input.confirmPassword && input.password !== input.confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
};

export const validateLoginInput = (input: LoginInput): string | null => {
  if (!input.email || !input.email.trim()) {
    return 'Email address is required.';
  }
  if (!input.password) {
    return 'Password is required.';
  }
  return null;
};

