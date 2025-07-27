import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/AuthStore";
import { Loader } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isLoading, error, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/dashboard/home");
    }
  }, [navigate, user]);

  const { toast } = useToast();
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Email and password are required.",
      });
      return;
    }

    try {
      e.preventDefault();
      await login(email, password);
      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });
    } catch (err) {
      toast({
        title: "Login Failed",
        description: err?.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background transition-colors duration-300">
      <div className="flex items-center justify-center transition-all duration-300 rounded-lg  max-w-[550px] w-full">
        {/* <img src={Logo} alt="" className="bg-gradient-to-br from-[#3b82f6] to-[#ff3333] max-w-[500px] w-full" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:px-10 py-10 px-6 md:border bg-card rounded-lg w-full relative"
        >
          <div className="text-primary text-center pt-6">
            <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2">
              <img
                src={Logo}
                alt=""
                className="bg-gradient-to-br from-[#3b82f6] to-[#ff3333] h-24 rounded-full shadow-md border-2 border-border "
              />
            </div>
            <h1 className="md:text-3xl text-2xl   font-bold text-foreground">
              Welcome Back, Ka-K5
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to login.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2 max-w-[350px] w-full mx-auto">
            <form onSubmit={handleLogin}>
              <div className="flex flex-col items-center gap-2 mt-5 ">
                <div className="w-full">
                  <label htmlFor="" className="relative cursor-pointer">
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Input"
                      value={email}
                      className="h-14 w-full px-4 pt-4  border-border border bg-input rounded-md border-opacity-50 text-foreground outline-none focus:border-blue-500 placeholder-gray-300 placeholder-opacity-0 transition duration-200"
                    />
                    <span className="text-foreground absolute left-5 top-[-8px] transition duration-200 input-email">
                      Email
                    </span>
                  </label>
                </div>
                <div className="w-full">
                  <label htmlFor="" className="relative cursor-pointer">
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Password"
                      value={password}
                      className="h-14 w-full px-4 pt-4 bborder-border border bg-input text-foreground border-border rounded-md border-opacity-50 outline-none focus:border-blue-500 placeholder-gray-300 placeholder-opacity-0 transition duration-200"
                    />
                    <span className="text-foreground absolute left-5 top-[-8px] transition duration-200 input-password">
                      Password
                    </span>
                  </label>
                </div>
                <div className="flex flex-col justify-center items-start relative h-6">
                  {/* {error && (
                    <p className="text-destructive font-semibold flex text-sm text-start justify-content-center items-start">
                      {error}
                    </p>
                  )} */}
                </div>
                {/* <div className="w-full">
                  <Label className="font-sans">Email</Label>
                  <Input type="email" id="email" placeholder="Email" />
                </div> */}
              </div>
              <div className="mt-2">
                <div>
                  <Link to="/forgot-password">
                    <h1 className="text-primary text-sm pl-3 ">
                      Forgot Password?
                    </h1>
                  </Link>
                </div>
                <Button
                  className="mt-2 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] outline-none border-none shadow-md w-full text-white transition duration-200"
                  variant="outline"
                  size="xl"
                  type="submit"
                >
                  {isLoading ? (
                    <Loader className="w-6 h-6 animate-spin text-white mx-auto " />
                  ) : (
                    "Login"
                  )}
                </Button>
                <div>
                  <h1 className="text-muted-foreground mt-2 text-center text-sm">
                    Don't Have an Account?{" "}
                    <Link to="/signup">
                      <span className="text-primary font-bold cursor-pointer hover:underline">
                        Sign Up
                      </span>
                    </Link>
                  </h1>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
