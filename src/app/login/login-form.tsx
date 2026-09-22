"use client";

import { Alert } from "@/components/alert";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { memo, useState } from "react";
import { FaLock, FaUser } from "react-icons/fa6";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({
      username,
      password,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:gap-4"
      noValidate
    >
      <ErrorAlert
        isError={isError}
        error={error}
      />

      <UsernameField
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showPassword={showPassword}
        onToggleVisibility={() => setShowPassword((prev) => !prev)}
      />

      <Button
        type="submit"
        disabled={false}
        className="ml-auto text-sm h-10 px-3 rounded-[5px]!"
      >
        Login
      </Button>
    </form>
  );
};

const UsernameField = memo(
  ({ value, onChange, error }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string }) => (
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
          type="text"
          placeholder="Masukkan username Anda"
          className={`flex h-12 w-full rounded-[5px] border bg-transparent px-3 py-2 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:shadow-[0px_0px_20px_-11px_rgba(0,_0,_0,_0.8)] pr-16 sm:pr-20 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#105E15]"
          }`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 border rounded-e-[5px] pointer-events-none bg-[#EAEBEC]">
          <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-[#495057]" />
        </div>
      </div>

      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  ),
);

const PasswordField = memo(
  ({
    value,
    onChange,
    error,
    showPassword,
    onToggleVisibility,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
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
          type={showPassword ? "text" : "password"}
          placeholder="Masukkan password Anda"
          className={`flex h-12 w-full rounded-[5px] border bg-transparent px-3 py-2 text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:shadow-[0px_0px_20px_-11px_rgba(0,_0,_0,_0.8)] pr-16 sm:pr-20 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#105E15]"
          }`}
        />

        <div className="absolute inset-y-0 right-8 sm:right-10 flex items-center pr-2 sm:pr-3">
          <button
            type="button"
            onClick={onToggleVisibility}
            className="p-1 sm:p-1.5 rounded-full hover:bg-gray-200 touch-manipulation"
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

      {error && <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>}
    </div>
  ),
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
