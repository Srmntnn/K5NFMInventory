import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/AuthStore";
import CustomInput from "@/components/CustomInput";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import ThemeSwitcher from "@/components/themeSwitcher";

const steps = [
  { label: "Email", icon: Mail },
  { label: "OTP", icon: ShieldCheck },
  { label: "New Password", icon: Lock },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);

  const { toast } = useToast();
  const { isLoading, forgotPassword, verifyOtp, resetPassword } =
    useAuthStore();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await forgotPassword(email);
      toast({
        title: "Reset OTP",
        description: "OTP sent, check your email",
      });
      setStep(2);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: err?.response?.data?.message || "Try again later.",
      });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "OTP must be 6 digits.",
      });
      return;
    }

    try {
      await verifyOtp({ email, otp: code });
      toast({ title: "Verified", description: "OTP verified successfully." });
      setStep(3);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description:
          err?.response?.data?.message || "Incorrect or expired OTP.",
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !code || !email) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "All fields are required.",
      });
      return;
    }

    try {
      await resetPassword({ email, otp: code, newPassword });
      toast({
        title: "Password Reset",
        description: "You can now log in with your new password.",
      });
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description:
          err?.response?.data?.message || "Could not reset password.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card backdrop-blur-xl border rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8 pb-6">
          {/* Progress Indicator */}
          <div className="relative flex items-center justify-between mb-8">
            {/* Horizontal background line behind icons */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-300 transform -translate-y-1/2 z-0" />

            {/* Progress fill based on current step */}
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#3b82f6] to-[#ff3333] transform -translate-y-1/2 z-10 transition-all duration-300"
              style={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              }}
            />

            {/* Step Icons */}
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isCompleted = step > index + 1;
              const isActive = step === index + 1;

              const alignmentClass =
                index === 0
                  ? "items-start"
                  : index === steps.length - 1
                  ? "items-end"
                  : "items-center";
              return (
                <div
                  key={index}
                  className={`relative z-20 flex flex-col ${alignmentClass} flex-1`}
                >
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-200 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white dark:bg-muted border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Forgot Password
          </h2>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <p className="text-muted-foreground text-center">
                Enter your email and we'll send you an OTP.
              </p>
              <CustomInput
                icon={Mail}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 mt-1 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-sm text-white font-sans rounded-lg shadow-lg"
              >
                {isLoading ? (
                  <Loader className="size-6 animate-spin mx-auto" />
                ) : (
                  "Send OTP"
                )}
              </motion.button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form
              onSubmit={handleOtpSubmit}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit OTP sent to your email.
              </p>
              <InputOTP value={code} onChange={setCode} maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r mt-7 from-[#3b82f6] to-[#ff3333] text-white font-sans text-sm rounded-lg shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-4"
            >
              <p className="text-muted-foreground text-center">
                Enter your new password.
              </p>
              <CustomInput
                icon={Lock}
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-white font-sans text-sm rounded-lg shadow-lg"
              >
                {isLoading ? (
                  <Loader className="size-6 animate-spin mx-auto" />
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>
          )}
        </div>

        <div className="px-8 py-4 bg-muted flex justify-center">
          <Link
            to="/login"
            className="text-sm text-[#3b82f6] hover:underline flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Link>
        </div>
      </motion.div>

      <div className="hidden">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default ForgotPassword;
