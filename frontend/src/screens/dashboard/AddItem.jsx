import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { useAuthStore } from "@/store/AuthStore";

const AddItem = () => {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [dateOfPurchase, setDateOfPurchase] = useState(null);
  const [user, setUser] = useState("normal user");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState([]);

  const [manufacturers, setManufacturers] = useState([]);
  const [locations, setLocations] = useState([]);

  const { isLoading } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [manufacturerRes, locationRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/company/get-manufacturer`,
            { withCredentials: true }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/location/get-locations`,
            { withCredentials: true }
          ),
        ]);

        console.log("Manufacturer Response:", manufacturerRes.data);
        console.log("Location Response:", locationRes.data);

        const manufacturersData = manufacturerRes.data.companies;
        const locationsData = locationRes.data.locations;

        if (Array.isArray(manufacturersData)) {
          setManufacturers(manufacturersData);
        } else {
          console.error(
            "Manufacturers data is not an array:",
            manufacturersData
          );
        }

        if (Array.isArray(locationsData)) {
          setLocations(locationsData);
        } else {
          console.error("Locations data is not an array:", locationsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const { toast } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        itemName,
        description,
        serialNo,
        manufacturer,
        model,
        dateOfPurchase,
        user,
        quantity,
        condition,
        location,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/item/create-item`,
        itemData,
        {
          withCredentials: true,
        }
      );

      console.log("Item created:", response.data);

      toast({
        title: "Item Created!",
        description: "Item created successfully.",
      });

      // ✅ Clear all input fields after success
      setItemName("");
      setDescription("");
      setSerialNo("");
      setManufacturer("");
      setModel("");
      setDateOfPurchase("");
      setUser("");
      setQuantity("");
      setCondition("");
      setLocation("");
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        variant: "destructive",
        title: "Creating Item Failed",
        description:
          error?.response?.data?.message || "Server error. Please try again.",
      });
    }
  };

  const toggleLocation = (id) => {
    setLocation((prev) =>
      prev.includes(id) ? prev.filter((loc) => loc !== id) : [...prev, id]
    );
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
          <div className="flex flex-col bg-card p-8 gap-10 rounded-lg w-full">
            <h2 className="md:text-2xl text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text">
              Add Item
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label className="font-bold">Item Name</Label>
                    <Input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-bold">User</Label>
                    <Select value={user} onValueChange={setUser}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>User</SelectLabel>
                          <SelectItem value="normal user">
                            Normal User
                          </SelectItem>
                          <SelectItem value="department">Department</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-bold">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label className="font-bold">Serial No</Label>
                    <Input
                      type="text"
                      value={serialNo}
                      onChange={(e) => setSerialNo(e.target.value)}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Label>Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="good">Good Condition</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="needs repair">
                            Needs Repair
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label>Manufacturer</Label>
                    <Select
                      value={manufacturer}
                      onValueChange={setManufacturer}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Manufacturer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Manufacturers</SelectLabel>
                          {manufacturers.length > 0 ? (
                            manufacturers.map((m) => (
                              <SelectItem key={m._id} value={m._id}>
                                {m.companyName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              No manufacturers available
                            </div>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Label className="font-bold">Model</Label>
                    <Input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Enter model"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label className="font-bold">Quantity</Label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="font-bold">Date of Purchase</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfPurchase && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfPurchase ? (
                          format(dateOfPurchase, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfPurchase}
                        onSelect={setDateOfPurchase}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <div className="flex flex-col gap-2">
                    <Label>Location</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            location.length === 0 && "text-muted-foreground"
                          )}
                        >
                          {location.length > 0
                            ? locations
                                .filter((loc) => location.includes(loc._id))
                                .map((loc) => loc.locationName)
                                .join(", ")
                            : "Select location(s)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search location..." />
                          <CommandEmpty>No locations found.</CommandEmpty>
                          <CommandGroup>
                            {locations.map((loc) => (
                              <CommandItem
                                key={loc._id}
                                onSelect={() => toggleLocation(loc._id)}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    location.includes(loc._id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {loc.locationName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
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
                  "Add Item"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AddItem;
