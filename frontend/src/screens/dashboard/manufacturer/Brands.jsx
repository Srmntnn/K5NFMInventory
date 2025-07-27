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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [editForm, setEditForm] = useState({
    companyName: "",
    description: "",
  });

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/company/get-manufacturer`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setBrands(response.data.companies); // ✅ Fix key
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  const { toast } = useToast();
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/company/delete-manufacturer/${id}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setBrands((prev) => prev.filter((b) => b._id !== id));
        toast({
          title: "Brand Deleted!",
          description: "Item deleted successfully.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error deleting manufacturer",
          description:
            error?.response?.data?.message || "Server error. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting manufacturer",
        description:
          error?.response?.data?.message || "Server error. Please try again.",
      });
    }
  };

  const handleEditClick = (brand) => {
    setSelectedBrand(brand);
    setEditForm({
      companyName: brand.companyName,
      description: brand.description,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/company/update-manufacturer/${
          selectedBrand._id
        }`,
        editForm,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast({
          title: "Brand Updated!",
          description: response.data.message,
        });

        // Update the brand in local state
        setBrands((prev) =>
          prev.map((brand) =>
            brand._id === selectedBrand._id ? response.data.company : brand
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/company/get-manufacturer/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setSelectedDetails(response.data.company);
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
      <div className="sm:px-4 px-4 pb-16">
        <div className="w-fit">
          <h2 className="md:text-3xl text-xl font-bold mb-4 bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text">
            All Brands
          </h2>
        </div>
        {brands.length === 0 ? (
          <p>No brands found.</p>
        ) : (
          <div className="grid auto-rows-min gap-4 lg:grid-cols-3 md:grid-cols-2">
            {brands.map((company) => (
              <div
                key={company._id}
                className="border p-4 rounded-lg bg-card flex flex-col justify-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-medium leading-none">
                      {company.companyName}
                    </h3>
                    <p className="text-sm font-medium">
                      <strong>Description:</strong> {company.description || "—"}
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
                            <EllipsisVertical></EllipsisVertical>
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
                            onClick={() => handleEditClick(company)}
                          >
                            <Edit /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => fetchDetails(company._id)} // ✅ This was missing
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
                            to permanently delete this file from our servers?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            onClick={() => handleDelete(company._id)}
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
                        {company.createdBy?.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="flex text-sm font-medium items-center gap-1">
                      <User className="h-5" /> {company.createdBy?.name || "—"}
                    </p>
                    <p className="flex text-sm font-medium items-center gap-1">
                      <Mail className="h-5" /> {company.createdBy?.email || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✏️ Edit Dialog */}
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
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={editForm.companyName}
                onChange={(e) =>
                  setEditForm({ ...editForm, companyName: e.target.value })
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
              className="bg-foreground text-background"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Brand Details</DialogTitle>
          </DialogHeader>
          {selectedDetails ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Brand Name:</strong> {selectedDetails.companyName}
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
                <div className="flex flex-col gap-2 pt-1">
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

export default Brands;
