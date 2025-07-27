import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import CustomInput from "@/components/CustomInput";
import { motion } from "framer-motion";

const VerifyOtp = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const { verifyOtp, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ email, otp });
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      // error handled in store
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full backdrop-filter md:border backdrop-blur-xl rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>
          <form onSubmit={handleVerify} className="space-y-4">
            <CustomInput
              icon={MailCheck}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <CustomInput
              icon={MailCheck}
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] font-bold rounded-lg shadow-lg"
              type="submit"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </motion.button>
            {error && <p className="text-red-500 text-center">{error}</p>}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
