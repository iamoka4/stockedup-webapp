import { apiRequest } from "./client";

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export function changePassword(
  input: ChangePasswordInput
): Promise<void> {
  return apiRequest<void>("/change-password.php", {
    method: "POST",
    body: input,
  });
}