import { apiRequest } from "./client";

export interface UpdateProfileInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface UpdateProfileResult {
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
}

export function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  return apiRequest<UpdateProfileResult>("/update-profile.php", {
    method: "POST",
    body: input,
  });
}