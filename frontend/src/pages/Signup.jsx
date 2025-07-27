import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/AuthStore";
import Logo from "../assets/Logo.png"; // Adjust the path as necessary
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { signup, isLoading, error, user } = useAuthStore();

  const { toast } = useToast();
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Input fields are required.",
      });
      return;
    }
    try {
      await signup(email, password, name);
      toast({
        title: "Signup Successful",
        description: "You've succesfully created your account!",
      });
      navigate("/verify-email");
    } catch (error) {
      if (error?.response?.data?.message === "Email already exists") {
        toast({
          title: "Signup Failed",
          description:
            "This email is already registered. Please use a different email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description:
            error?.response?.data?.message ||
            "An error occurred during signup.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background transition-colors duration-300">
      <div className="flex items-center justify-center  transition-all duration-300 rounded-lg  max-w-[550px] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:p-10 p-6  rounded-lg bg-card  w-full relative border-border border "
        >
          <div className="text-primary text-center pt-6">
            <div className="absolute top-[-50px] left-1/2 transform -translate-x-1/2">
              <img
                src={Logo}
                alt=""
                className="bg-gradient-to-br from-[#3b82f6] to-[#ff3333] h-24 rounded-full shadow-md border-2 border-border "
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Create an Account
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to create an account.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2 max-w-[350px] w-full mx-auto">
            <form onSubmit={handleSignup}>
              <div className="flex flex-col items-center gap-2 mt-5 ">
                <div className="w-full">
                  <label htmlFor="" className="relative cursor-pointer">
                    <input
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Input"
                      value={name}
                      className="h-14 w-full px-4 pt-4  border-border border bg-input rounded-md border-opacity-50 text-foreground outline-none focus:border-blue-500 placeholder-gray-300 placeholder-opacity-0 transition duration-200"
                    />
                    <span className="text-foreground absolute left-5 top-[-8px] transition duration-200 input-text">
                      Name
                    </span>
                  </label>
                </div>
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
              </div>
              <div className="mt-2">
                <Button
                  className="mt-2 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] outline-none border-none shadow-md w-full text-white transition duration-200"
                  variant="outline"
                  size="xl"
                  type="submit"
                >
                  {isLoading ? (
                    <Loader className="w-6 h-6 animate-spin text-white mx-auto " />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <div>
                  <h1 className="text-muted-foreground mt-2 text-center text-sm">
                    Already Have an Account?{" "}
                    <Link to="/login">
                      <span className="text-primary font-bold cursor-pointer hover:underline">
                        Login
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

export default Signup;
