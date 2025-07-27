import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/AuthStore";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
// import Logo from "../assets/Logo.png";
import Navbar from "@/components/Navbar";
import ThemeSwitcher from "@/components/themeSwitcher";
import { ArrowLeft } from "lucide-react";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user, isLoading, verifyUser, error } = useAuthStore();

  const [code, setCode] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    try {
      await verifyUser(code);
      toast({
        title: "Email Verification",
        description: "Email verified successfully",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error?.response?.data?.message || "Invalid OTP",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  useEffect(() => {
    if (user?.isVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`,
        {},
        { withCredentials: true }
      );
      toast({
        title: "Resend OTP",
        description: response.data.message,
      });
    } catch (err) {
      toast({
        title: "Resend OTP",
        description: err.response?.data?.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background transition-colors duration-300">
      <div className="flex items-center justify-center  transition-all duration-300 rounded-lg p-6 overflow-hidden w-fit">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex md:border  items-center flex-col rounded-lg w-full relative overflow-hidden"
        >
          {/* <div className="h-24 mb-4 ">
            <img src={Logo} alt="" className="h-24 w-24" />
          </div> */}

          <div className="p-8 justify-start flex flex-col md:items-start">
            <h1 className="sm:text-3xl text-xl text-center font-bold mb-4">
              Verify Your Email
            </h1>

            <form
              onSubmit={handleSubmit}
              className=" flex flex-col justify-center  md:items-start items-center"
            >
              <p className="text text-muted-foreground mb-3 font-bold">
                One-Time Password
              </p>
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value)}
                className="mx-auto"
              >
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
              <p className="text-sm text-muted-foreground mb-6 mt-2 md:text-start text-center">
                Please enter the one-time password sent to your email.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || code.length < 6}
                className="md:w-fit w-full bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-white font-semi-bold py-2 px-6 rounded-lg shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-opacity-50 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </form>
            {/* <Separator className="mt-4 max-w-72 w-full flex justify-center items-center mx-auto mb-2" /> */}
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-sm text-primary mt-2"
            >
              {isResending ? "Resending..." : "Didn't get the OTP?"}
            </button>
          </div>

          <div className="px-8 py-4 bg-accent dark:bg-card bg-opacity-50 flex w-full justify-center">
            <Link
              to={"/dashboard"}
              className="text-sm text-[#3b82f6] hover:underline flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="hidden">
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default VerifyEmailPage;
