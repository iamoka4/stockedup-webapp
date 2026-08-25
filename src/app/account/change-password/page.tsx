"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { changePassword } from "@/lib/api/password";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuthModalStore } from "@/store/authModalStore";

type PasswordField = "current" | "new" | "confirm";

export default function ChangePasswordPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState<Record<PasswordField, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      openLogin("/account/change-password");
      router.replace("/");
    }
  }, [authLoading, user, router, openLogin]);

  const mutation = useMutation({
    mutationFn: () =>
      changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-ink-soft">
        Loading…
      </div>
    );
  }

  const passwordTooShort =
    newPassword.length > 0 && newPassword.length < 8;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const toggleVisibility = (field: PasswordField) => {
    setShowPassword((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href="/account"
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to account
      </Link>

      <div className="mt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-deep/10 text-brand-deep">
          <LockKeyhole size={22} />
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
          Change password
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Update your password to keep your StockedUp account secure.
        </p>
      </div>

      {success ? (
        <div className="mt-8 rounded-2xl border border-leaf/20 bg-leaf/5 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf/10 text-leaf">
              <CheckCircle2 size={20} />
            </span>

            <div>
              <h2 className="text-sm font-semibold text-ink">
                Password changed successfully
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Your password has been updated. You can continue using your
                account normally.
              </p>
            </div>
          </div>

          <Link
            href="/account"
            className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Back to account
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSuccess(false);
            mutation.mutate();
          }}
          className="mt-8 flex flex-col gap-4"
        >
          <PasswordInput
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showPassword.current}
            onToggle={() => toggleVisibility("current")}
            autoComplete="current-password"
          />

          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showPassword.new}
            onToggle={() => toggleVisibility("new")}
            autoComplete="new-password"
          />

          {passwordTooShort && (
            <p className="-mt-2 text-xs text-clay">
              Your new password must be at least 8 characters.
            </p>
          )}

          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showPassword.confirm}
            onToggle={() => toggleVisibility("confirm")}
            autoComplete="new-password"
          />

          {passwordsDoNotMatch && (
            <p className="-mt-2 text-xs text-clay">
              The new passwords do not match.
            </p>
          )}

          {mutation.isError && (
            <div className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : "Could not change your password. Please try again."}
            </div>
          )}

          <button
            type="submit"
            disabled={
              mutation.isPending ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              passwordTooShort ||
              passwordsDoNotMatch
            }
            className="mt-2 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Updating password…" : "Change password"}
          </button>
        </form>
      )}
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          required
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="input w-full pr-12"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}