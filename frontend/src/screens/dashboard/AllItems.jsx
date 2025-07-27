import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckIcon,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    condition: "",
    status: "",
  });
  const [manufacturers, setManufacturers] = useState([]);
  const [locations, setLocations] = useState([]);
  const selectedLocations = formData.location || [];
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/item/get-items`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setItems(
            res.data.items.map((item) => ({
              ...item,
              id: item._id,
              manufacturerName: item.manufacturer?.companyName || "N/A",
              locationList:
                item.location
                  ?.map((loc) => `${loc.locationName} — ${loc.description}`)
                  .join(", ") || "N/A",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [manRes, locRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/company/get-manufacturer`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/location/get-locations`,
            {
              withCredentials: true,
            }
          ),
        ]);
        setManufacturers(manRes.data.companies || []);
        setLocations(locRes.data.locations || []);
      } catch (err) {
        console.error("Error fetching manufacturers or locations:", err);
      }
    };

    fetchItems();
    fetchDropdownData();
  }, []);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName,
      serialNo: item.serialNo,
      model: item.model,
      status: item.status,
      quantity: item.quantity,
      condition: item.condition,
      description: item.description || "",
      manufacturer: item.manufacturer?._id || "", // add manufacturer id here
      location: item.location ? item.location.map((loc) => loc._id) : [], // location ids array
    });
    setEditOpen(true);
  };

  const toggleLocation = (id) => {
    setFormData((prev) => {
      const current = prev.location || [];
      return current.includes(id)
        ? { ...prev, location: current.filter((locId) => locId !== id) }
        : { ...prev, location: [...current, id] };
    });
  };

  const { toast } = useToast();

  const handleUpdateItem = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/item/update-item/${
          selectedItem.id
        }`,
        formData,
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description: "Item updated successfully.",
      });

      setEditOpen(false);
      // Re-fetch updated items
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/item/get-items`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setItems(
          res.data.items.map((item) => ({
            ...item,
            id: item._id,
            manufacturerName: item.manufacturer?.companyName || "N/A",
            locationList:
              item.location
                ?.map((loc) => `${loc.locationName} — ${loc.description}`)
                .join(", ") || "N/A",
          }))
        );
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const columns = [
    {
      accessorKey: "itemName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "serialNo",
      header: "Serial No",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "condition",
      header: "Item Condition",
    },
    {
      accessorKey: "manufacturerName",
      header: "Manufacturer",
    },
    {
      accessorKey: "locationList",
      header: "Location(s)",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
              >
                Copy Item ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Item Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditClick(item)}>
                Edit Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full p-6">
      <h1 className="md:text-2xl text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#ff3333] text-transparent bg-clip-text w-fit">
        All Items
      </h1>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by item name..."
          value={
            columnFilters.find((filter) => filter.id === "itemName")?.value ||
            ""
          }
          onChange={(event) =>
            table.getColumn("itemName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="md:text-2xl text-lg">
                Edit Item
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="itemName" className="text-start font-bold">
                    Item Name
                  </Label>
                  <Input
                    id="itemName"
                    value={formData.itemName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="serialNo" className="text-start font-bold">
                    Serial No
                  </Label>
                  <Input
                    id="serialNo"
                    value={formData.serialNo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNo: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-2 w-full ">
                  <Label htmlFor="model" className="text-start font-bold ">
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={formData.model || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>

                <div className="flex flex-col gap-2 flex-2">
                  <Label htmlFor="quantity" className="text-start font-bold ">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="status" className="text-start">
                    Status
                  </Label>
                  <Input
                    id="status"
                    value={formData.status || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>

                <div className="w-full flex flex-col gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, condition: value }))
                    }
                  >
                    <SelectTrigger id="condition" className="w-full">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Condition</SelectLabel>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="needs repair">
                          Needs Repair
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="text-start">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Manufacturer dropdown using ShadCN Select */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="manufacturer" className="text-start">
                  Manufacturer
                </Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, manufacturer: value })
                  }
                  defaultValue={formData.manufacturer || ""}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((man) => (
                      <SelectItem key={man._id} value={man._id}>
                        {man.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Locations multi-select using checkboxes */}
              <div className="flex flex-col gap-2">
                <Label>Location</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        selectedLocations.length === 0 &&
                          "text-muted-foreground"
                      )}
                    >
                      {selectedLocations.length > 0
                        ? locations
                            .filter((loc) =>
                              selectedLocations.includes(loc._id)
                            )
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
                                selectedLocations.includes(loc._id)
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

            <DialogFooter>
              <Button
                onClick={handleUpdateItem}
                className="bg-foreground text-background transition duration-200"
                variant="default"
              >
                Update Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
