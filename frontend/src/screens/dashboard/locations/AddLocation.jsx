import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function AddLocation() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Location Name and Description are required.",
      });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/location/new`,
        {
          locationName: name, // <-- FIXED HERE
          description: description,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setName("");
        setDescription("");
        toast({
          title: "Location Added!",
          description: "Location added successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Adding Location Failed",
          description: response.data.message || "Invalid input.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Adding Location Failed",
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
              Add Location
            </h2>
            <form onSubmit={handleSubmit} className="gap-3 flex flex-col">
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name of the location"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Location Address</Label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Address of the location "
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

export default AddLocation;
