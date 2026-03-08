import { useMemo, useState, } from "react";
import { EyeOff, Lock, User } from "lucide-react";
import LoginInput from "../components/LoginInput";
// import GSWMILogo from "../assets/logo.png"

function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const isFormValid = useMemo(() => {
    return username.trim() !== "" && password.trim() !== "";
  }, [username, password]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <header className="flex h-[100px] items-center justify-center bg-[#0C2039] px-4">
        <div className="text-center text-white">
          <h1 className="text-[44px] font-medium leading-none tracking-tight">
            GSWMI
          </h1>
          <p className="mt-1 text-[8px] leading-none opacity-95">
            Gbenga Samuel Weimino Ministry International
          </p>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[350px]">
          <div className="text-center">
            <h2 className="text-[18px] font-semibold text-black">
              Welcome to GSWMI Ticketing Portal
            </h2>
            <p className="mt-2 text-[16px] text-[#6B7280]">Login to continue</p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <LoginInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={User}
            />

            <LoginInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={Lock}
              rightIcon={EyeOff}
              isFocused={password.length > 0}
            />

            <button
              type="submit"
              disabled={!isFormValid}
              className={`h-[48px] w-full rounded-[8px] text-[16px] font-semibold transition ${
                isFormValid
                  ? "cursor-pointer bg-[#3867D6] text-white"
                  : "cursor-not-allowed border border-[#D1D5DB] bg-[#E5E7EB] text-[#9CA3AF]"
              }`}
            >
              Login
            </button>
          </form>
        </div>
      </main>

      <footer className="flex h-[48px] items-center justify-center bg-[#E5E7EB] px-4">
        <p className="text-[14px] text-[#4B5563]">© GSWMI Logistics Team</p>
      </footer>
    </div>
  );
}

export default LoginPage;