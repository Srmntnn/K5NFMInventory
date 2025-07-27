import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/AuthStore";
import { Loader } from "lucide-react";

function AddBrands() {
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const { isLoading, user, isAuthenticated } = useAuthStore();

  const { toast } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Unauthorized",
        description: "You need to log in to add a brand.",
      });
      return;
    }

    // Check for missing fields
    if (!brandName || !brandDescription) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Brand Name and Description are required.",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/create-manufacturer`,
        {
          companyName: brandName, // ✅ Must match backend expectation
          description: brandDescription,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setBrandName("");
        setBrandDescription("");
        toast({
          title: "Brand Added!",
          description: "Brand added successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Adding Brand Failed",
          description: response.data.message || "Invalid input.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Adding Brand Failed",
        description: error?.response?.data?.message || "Server error",
      });
    }
  };

  return (
    <>
      <div className="sm:px-8 px-4 h-svh mt-[-96px] flex items-center justify-center">
        {/* Gradient Border Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-[1px] rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#ff3333] w-full max-w-[500px] mx-auto mt-8"
        >
          {/* Inner Content Box */}
          <div className="flex flex-col bg-card p-8 gap-10 rounded-lg w-full">
            <h2 className="md:text-2xl text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text">
              Add Brand
            </h2>
            <form onSubmit={handleSubmit} className="gap-3 flex flex-col">
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Brand Name</Label>
                <Input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Brand Description</Label>
                <Input
                  type="text"
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  placeholder="Enter brand description"
                />
              </div>

              <Button
                className="bg-gradient-to-r from-[#3b82f6] to-[#ff3333] outline-none border-none shadow-md w-full text-white transition duration-200 mt-4"
                variant="outline"
                size="default"
                type="submit"
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin text-white mx-auto" />
                ) : (
                  "Add Brand"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default AddBrands;
