import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import WidgetInput from "@/components/Widget/WidgetInput";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#4880FF] flex items-center justify-center p-4 md:p-6">
      <Head>
        <title>Trackahabit | Register</title>
      </Head>

      <main className="w-full max-w-[630px] md:h-[688px] rounded-[24px] border-[0.3px] border-[#B9B9B9] bg-white px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto w-full max-w-[518px]">
          <h1
            className="mb-[28px] w-[518px] max-w-full whitespace-nowrap text-[24px] sm:text-[28px] md:text-[32px] not-italic font-bold leading-normal tracking-[-0.114px] text-[#202224]"
            style={{ fontFamily: '"Nunito Sans", sans-serif' }}
          >
            Create Trackahabit Account
          </h1>

          <p className="text-[#303236] text-[14px] font-medium mb-[10px]">
            Sign up with your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-[18px]">
            <div className="mb-4 mt-4">
              <WidgetInput
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={true}
              />
            </div>

            <div>
              <p className="text-[#303236] text-[14px] font-medium mb-[10px]">Password</p>
              <div className="relative mb-4 mt-4">
                <WidgetInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required={true}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#6E727A]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              <ul className="mt-[8px] text-[12px] text-[#303236] leading-[1.45] list-disc pl-[14px]">
                <li>6-15 characters</li>
                <li>Must include both letters and numbers</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full h-[32px] rounded-[5px] bg-[#85A5E8] text-white text-[20px] font-semibold leading-none hover:brightness-95 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-[12px] text-center text-[13px] text-[#5C5F65]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-[#4976D8] underline"
            >
              Log in
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
