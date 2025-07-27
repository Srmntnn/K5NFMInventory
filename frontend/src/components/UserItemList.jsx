import { useBorrowStore } from "@/store/borrowStore";
import { useEffect, useState } from "react";
import CustomInput from "./CustomInput";
import { Filter, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "./ui/separator";
import LoadingSpinner from "./LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const UserItemList = () => {
  const { toast } = useToast();
  const {
    requests: items,
    loading,
    error,
    fetchRequests,
    createBorrowRequest,
  } = useBorrowStore();

  const [filterOption, setFilterOption] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [reasons, setReasons] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRequests().catch((err) => {
      console.error("Error fetching items:", err);
    });
  }, []);

  const handleReasonChange = (itemId, value) => {
    setReasons((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleBorrow = async (itemId) => {
    const reason = reasons[itemId];
    if (!reason || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Borrow Item",
        description: "Please provide a reason for borrowing.",
      });
      return;
    }

    try {
      const res = await createBorrowRequest(itemId, reason.trim());
      toast({
        title: "Borrow Item",
        description: res.message || "Request submitted!",
      });
      fetchRequests();
      setReasons((prev) => ({ ...prev, [itemId]: "" }));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Borrow Item",
        description: err.message || "Error borrowing item",
      });
    }
  };

  const locationOptions = [
    "all",
    ...Array.from(new Set(items.map((item) => item.locationList))).sort(),
  ];

  const filteredItems = items.filter((item) => {
    const isAvailable =
      filterOption === "available"
        ? item.status?.toLowerCase() === "available"
        : true;

    const matchesSearch = item.itemName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesLocation =
      locationFilter === "all" ||
      item.locationList?.toLowerCase() === locationFilter.toLowerCase();

    return isAvailable && matchesSearch && matchesLocation;
  });

  return (
    <div className="max-w-screen-2xl  mx-auto mt-28 md:px-24 px-6">
      <h2 className="md:text-3xl text-2xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent  w-fit mb-4 bg-clip-text">
        Items ({filteredItems.length})
      </h2>

      {loading && <LoadingSpinner />}

      <CustomInput
        icon={Search}
        type="text"
        placeholder="Search by item name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-lg px-3 py-1 w-full max-w-md"
      />
      <div className="flex justify-between md:flex-row flex-col gap-4">
        <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-4 border shadow  md:max-w-[250px] h-fit pb-3 w-full p-[1px] rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#ff3333]">
          <div className="bg-background p-8 gap-10 rounded-lg w-full">
            <div className="flex gap-2 flex-wrap flex-col w-full ">
              <div className="flex mb-2 gap-2 items-center">
                <Filter className="h-4" />
                <h2 className="font-bold">Filter</h2>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="mr-2 font-bold">Show</Label>
                <Select value={filterOption} onValueChange={setFilterOption}>
                  <SelectTrigger className="w-full border">
                    <SelectValue placeholder="Select filter option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Filter By</SelectLabel>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available Only</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex flex-col gap-2 w-full">
                  <Label className="mr-2 font-bold">Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Location</SelectLabel>
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc === "all" ? "All Locations" : loc}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 w-full gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="border rounded-md h-full shadow"
              >
                <h3 className="font-semibold md:text-xl text-md mt-3 px-4 flex items-center flex-wrap justify-between text-nowrap">
                  {item.itemName}
                  <TooltipProvider>
                    <Tooltip >
                      <TooltipTrigger asChild className="cursor-pointer">
                        <Badge
                          variant="outline"
                          className={
                            item.status?.toLowerCase() === "available"
                              ? "text-green-500 border-green-300"
                              : item.status?.toLowerCase() === "borrowed"
                              ? "text-red-500 border-red-300"
                              : "text-foreground border-muted"
                          }
                        >
                          {item.status || "N/A"}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 text-foreground">
                          {item.status === "available" && (
                            <p>
                              This item is currently available for borrowing.
                            </p>
                          )}

                          {item.status === "borrowed" && (
                            <>
                              <p>This item is currently borrowed.</p>
                              {item.borrowedBy ? (
                                <div className="text-xs ">
                                  <p>By: {item.borrowedBy.name}</p>
                                  <p>Email: {item.borrowedBy.email}</p>
                                </div>
                              ) : (
                                <p>Borrower info not available.</p>
                              )}
                            </>
                          )}

                          {!["available", "borrowed"].includes(item.status) && (
                            <p>Status unknown.</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <div className="py-3">
                  <Separator />
                </div>
                <div className="max-h-[78%] h-full flex flex-col justify-between">
                  <div className="px-5">
                    <p>Condition: {item.condition || "N/A"}</p>
                    <p>Manufacturer: {item.manufacturerName}</p>
                    <p>Model: {item.model}</p>
                    <p>Serial NO: {item.serialNo}</p>
                    <p>Location: {item.locationList}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex justify-end w-full">
                        <div className="mx-4 mb-6 mt-2 max-w-40 w-full p-[1px] rounded-md bg-gradient-to-r from-blue-500 to-red-500 shadow-md dark:bg-transparent dark:p-[1px]">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="relative overflow-hidden text-sm w-full rounded-md py-2 px-4 bg-white dark:bg-card font-semibold flex justify-center transition-colors duration-300 text-foreground hover:text-background dark:hover:text-foreground group"
                          >
                            <span className="z-10 relative">Borrow</span>
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-red-500 rounded-md w-0 group-hover:w-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out origin-center"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="font-bold">Borrow</DialogTitle>
                        <DialogDescription>
                          Provide your reason for borrowing below. Click Borrow
                          Item when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-2">
                        <Label className="font-bold">
                          Reason for borrowing
                        </Label>
                        <Textarea
                          value={reasons[item._id] || ""}
                          onChange={(e) =>
                            handleReasonChange(item._id, e.target.value)
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => handleBorrow(item._id)}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Borrow Item
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserItemList;
