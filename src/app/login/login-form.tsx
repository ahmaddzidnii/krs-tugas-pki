"use client";

import { Alert } from "@/components/alert";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa6";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const trpc = useTRPC();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const mutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: (data) => {
        router.refresh();
        router.push("/dash");
      },
      onError: () => {
        // Error otomatis ditangkap oleh mutation.error
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");

    if (!username.trim() || !password.trim()) {
      setValidationError("Username dan password wajib diisi");
      return;
    }

    mutation.mutate({
      username,
      password,
    });
  };

  const errorMessage = validationError || mutation.error?.message || "";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:gap-4"
      noValidate
    >
      <ErrorAlert
        isError={Boolean(errorMessage)}
        error={errorMessage}
      />

      <UsernameField
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (validationError) setValidationError("");
        }}
        disabled={mutation.isPending}
      />

      <PasswordField
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (validationError) setValidationError("");
        }}
        showPassword={showPassword}
        onToggleVisibility={() => setShowPassword((prev) => !prev)}
        disabled={mutation.isPending}
      />

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="ml-auto text-sm h-10 px-4 rounded-[5px]!"
      >
        {mutation.isPending ? "Memproses..." : "Login"}
      </Button>
    </form>
  );
};

const UsernameField = ({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col space-y-1">
    <label
      htmlFor="username"
      className="text-xs sm:text-sm font-medium text-[#777777] dark:text-gray-300 mb-[8px]"
    >
      Username
    </label>

    <div className="relative flex items-center">
      <input
        id="username"
        value={value}
        onChange={onChange}
        disabled={disabled}
        type="text"
        placeholder="Masukkan username Anda"
        className="flex h-12 w-full rounded-[5px] border border-gray-300 bg-transparent px-3 py-2 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:shadow-[0px_0px_20px_-11px_rgba(0,_0,_0,_0.8)] focus:ring-[#105E15] pr-16 sm:pr-20 disabled:opacity-50"
      />

      <div className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 border rounded-e-[5px] pointer-events-none bg-[#EAEBEC]">
        <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-[#495057]" />
      </div>
    </div>
  </div>
);

const PasswordField = ({
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  disabled,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  disabled?: boolean;
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label
        htmlFor="password"
        className="text-xs sm:text-sm font-medium text-[#777777] dark:text-gray-300 mb-[8px]"
      >
        Password
      </label>

      <a
        href="#"
        className="text-xs sm:text-sm text-[#005A00] hover:underline"
      >
        Lupa Password?
      </a>
    </div>

    <div className="relative flex items-center">
      <input
        id="password"
        value={value}
        onChange={onChange}
        disabled={disabled}
        type={showPassword ? "text" : "password"}
        placeholder="Masukkan password Anda"
        className="flex h-12 w-full rounded-[5px] border border-gray-300 bg-transparent px-3 py-2 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:shadow-[0px_0px_20px_-11px_rgba(0,_0,_0,_0.8)] focus:ring-[#105E15] pr-16 sm:pr-20 disabled:opacity-50"
      />

      <div className="absolute inset-y-0 right-8 sm:right-10 flex items-center pr-2 sm:pr-3">
        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="p-1 sm:p-1.5 rounded-full hover:bg-gray-200 touch-manipulation disabled:opacity-50"
          aria-label="Toggle password visibility"
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          ) : (
            <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          )}
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center border rounded-e-[5px] px-2 sm:px-3 bg-[#EAEBEC] pointer-events-none">
        <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-[#495057]" />
      </div>
    </div>
  </div>
);

const ErrorAlert = ({ isError, error }: { isError: boolean; error: string }) => {
  if (!isError) return null;

  return (
    <Alert variant="error">
      <div className="flex flex-col gap-1">
        <p className="text-sm">{error}</p>
      </div>
    </Alert>
  );
};

export default LoginForm;
