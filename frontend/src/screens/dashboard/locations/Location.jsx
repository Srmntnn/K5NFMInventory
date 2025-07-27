import React, { Profiler, useEffect, useState } from "react";
import axios from "axios";
import { Separator } from "@/components/ui/separator";
import {
  Delete,
  Edit,
  EllipsisVertical,
  ListCollapse,
  Mail,
  Share,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function Location() {
  const [locations, setLocations] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editForm, setEditForm] = useState({
    locationName: "",
    description: "",
  });

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/location/get-locations`,
          { withCredentials: true }
        );
        if (response.data.success) {
          console.log(response.data.locations); // Log the response to inspect the data
          setLocations(response.data.locations);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const { toast } = useToast();
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/location/delete-location/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLocations((prev) => prev.filter((b) => b._id !== id));
        toast({
          title: "Location Deleted!",
          description: "location deleted successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error deleting location",
          description:
            response.data.message || "Server error. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting location",
        description:
          error?.response?.data?.message || "Server error. Please try again.",
      });
    }
  };

  const handleEditClick = (location) => {
    setSelectedLocation(location); // ✅ Correct

    setEditForm({
      locationName: location.locationName,
      description: location.description,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/location/update-location/${
          selectedLocation._id
        }`,
        editForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast({
          title: "Location Updated!",
          description: response.data.message,
        });

        // Update the location in local state
        setLocations((prev) =>
          prev.map((location) =>
            location._id === selectedLocation._id
              ? response.data.location // Use response data to update the location
              : location
          )
        );

        setEditDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: response.data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: error?.response?.data?.message || "Server error.",
      });
    }
  };

  const fetchDetails = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/location/get-location/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setSelectedDetails(response.data.location);
        setViewDialogOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching details",
          description: response.data.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Server error",
        description: error?.response?.data?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full">
      <div className="sm:px-0 px-4 pb-16">
        <div className="w-fit">
          <h2 className="md:text-3xl text-xl font-bold mb-4 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text">
            All Locations
          </h2>
        </div>
        {locations.length === 0 ? (
          <p>No location found.</p>
        ) : (
          <div className="grid auto-rows-min gap-4 lg:grid-cols-3 md:grid-cols-2">
            {locations.map((location) => (
              <div
                key={location._id}
                className="border p-4 rounded-lg bg-card flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium leading-none">
                      {location.locationName}
                    </h3>
                    <p className="text-sm font-medium">
                      <strong>Description:</strong>{" "}
                      {location.description || "—"}
                    </p>
                  </div>
                  <div>
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-none shadow-none"
                          >
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56"
                          align="end"
                          sideOffset={4}
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleEditClick(location)}
                          >
                            <Edit /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => fetchDetails(location._id)} // ✅ This was missing
                          >
                            <ListCollapse /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" disabled>
                            <Share /> Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DialogTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer hover:bg-destructive hover:text-white transition duration-300">
                              <Delete /> Delete
                            </DropdownMenuItem>
                          </DialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="border-destructive bg-card">
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. Are you sure you want
                            to permanently delete this location?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            onClick={() => handleDelete(location._id)}
                            className="bg-destructive border-none hover:bg-destructive/90"
                          >
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between">
                    <h1 className="uppercase text-xs">Created by</h1>
                    <div className="p-[1px] rounded-md bg-gradient-to-r from-[#3b82f6] to-[#ff3333] flex">
                      <Badge className="rounded-md ">
                        {/* Add a fallback for createdBy */}
                        {location.createdBy && location.createdBy.role
                          ? location.createdBy.role
                          : "—"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="flex text-sm font-medium items-center gap-1">
                      <User className="h-5" />
                      {/* Check if createdBy exists before accessing its properties */}
                      {location.createdBy && location.createdBy.name
                        ? location.createdBy.name
                        : "—"}
                    </p>
                    <p className="flex text-sm font-medium items-center gap-1">
                      <Mail className="h-5" />
                      {/* Check if createdBy exists before accessing its properties */}
                      {location.createdBy && location.createdBy.email
                        ? location.createdBy.email
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update manufacturer details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                value={editForm.locationName}
                onChange={(e) =>
                  setEditForm({ ...editForm, locationName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdate}
              className="bg-foreground text-foreground"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Details</DialogTitle>
            <DialogDescription>
              View the complete information of the selected location.
            </DialogDescription>
          </DialogHeader>

          {selectedDetails ? (
            <div className="space-y-2 text-sm mt-2">
              <p>
                <strong>Location Name:</strong> {selectedDetails.locationName}
              </p>
              <p>
                <strong>Description:</strong> {selectedDetails.description}
              </p>
              <p>
                <strong>Created By:</strong> {selectedDetails.createdBy?.name} (
                {selectedDetails.createdBy?.email})
              </p>
              <p>
                <strong>Role:</strong> {selectedDetails.createdBy?.role}
              </p>

              {selectedDetails.editedBy && (
                <div className="flex flex-col gap-2 pt-1
                
                ">
                  <Separator />
                  <p>
                    <strong>Last Edited By:</strong>{" "}
                    {selectedDetails.editedBy?.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Location;
