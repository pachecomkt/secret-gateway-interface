
export interface TemporaryPassword {
  id: string;
  password: string;
  description: string | null;
  created_at: string;
  expires_at: string;
  created_by: string | null;
}
