export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'JURY' | 'BAND';
}
