import React, { useEffect, useState } from "react";
import { useBorrowStore } from "../store/borrowStore";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpDown, MoreVertical } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const MyBorrowRequests = () => {
  const {
    myRequests,
    myRequestsLoading,
    myRequestsError,
    fetchMyRequests,
    cancelRequest,
    requestReturn,
  } = useBorrowStore();

  const [sorting, setSorting] = useState([]);
  const [dialogInfo, setDialogInfo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const confirmAction = async () => {
    if (!dialogInfo) return;
    try {
      const res =
        dialogInfo.type === "cancel"
          ? await cancelRequest(dialogInfo.id)
          : await requestReturn(dialogInfo.id);

      toast({
        title: "Success",
        description: res.message,
      });

      fetchMyRequests();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Something went wrong",
      });
    } finally {
      setDialogInfo(null);
    }
  };

  const columns = [
    {
      accessorKey: "item.itemName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.item?.itemName || "Item Deleted",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "createdAt",
      header: "Requested Date / Time",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "borrowDate",
      header: "Borrowed Date / Time",
      cell: ({ row }) =>
        row.original.borrowDate
          ? new Date(row.original.borrowDate).toLocaleString()
          : "-",
    },
    {
      accessorKey: "returnRequested",
      header: "Return Requested",
      cell: ({ row }) => (row.original.returnRequested ? "Yes" : "No"),
    },
    {
      accessorKey: "returnApproved",
      header: "Returned",
      cell: ({ row }) => (row.original.returnApproved ? "Yes" : "No"),
    },
    {
      accessorKey: "returnedDate",
      header: "Returned Date / Time",
      cell: ({ row }) =>
        row.original.returnedDate
          ? new Date(row.original.returnedDate).toLocaleString()
          : "-",
    },
    {
      accessorKey: "adminRemarks",
      header: "Admin Remarks",
      cell: ({ row }) => row.original.adminRemarks || "-",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const req = row.original;
        const canCancel = req.status === "pending";
        const canReturn =
          req.status === "approved" &&
          !req.returnRequested &&
          !req.returnApproved;

        if (!canCancel && !canReturn) return <span>-</span>;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canCancel && (
                <DropdownMenuItem
                  onClick={() =>
                    setDialogInfo({
                      id: req._id,
                      type: "cancel",
                      message: "Are you sure you want to cancel this request?",
                    })
                  }
                  className="cursor-pointer"
                >
                  Cancel Request
                </DropdownMenuItem>
              )}
              {canReturn && (
                <DropdownMenuItem
                  onClick={() =>
                    setDialogInfo({
                      id: req._id,
                      type: "return",
                      message:
                        "Are you sure you want to request to return this item?",
                    })
                  }
                  className="cursor-pointer"
                >
                  Request Return
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: myRequests,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <Navbar />
      <div className="max-w-screen-2xl mx-auto md:px-24 px-6 mt-32">
        <h2 className="text-xl font-bold mb-4 text-center">
          My Borrow Requests
        </h2>

        {myRequestsLoading && <p className="text-center">Loading...</p>}
        {myRequestsError && (
          <p className="text-red-600 text-center">{myRequestsError}</p>
        )}
        {!myRequestsLoading && myRequests.length === 0 && (
          <p className="text-center">You have no borrow requests.</p>
        )}

        {!myRequestsLoading && myRequests.length > 0 && (
          <div className="p-[1px] rounded-lg bg-gradient-to-r from-blue-500 to-red-500 mt-4 overflow-x-auto">
            <Table className="rounded-lg overflow-hidden bg-background">
              <TableHeader className="bg-card">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-extrabold text-nowrap"
                      >
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
              <TableBody className="overflow-hidden rounded-lg">
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="overflow-hidden hover:bg-secondary transition duration-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {dialogInfo && (
        <Dialog
          open={!!dialogInfo}
          onOpenChange={(open) => !open && setDialogInfo(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>{dialogInfo?.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogInfo(null)}>
                Cancel
              </Button>
              <Button onClick={confirmAction}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-5 mb-4 text-center">
        <Link
          to="/"
          className="group inline-flex gap-2 hover:gap-5 items-center text-sm justify-center transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5 transition-colors duration-300 group-hover:text-blue-500 group-hover:drop-shadow-sm" />
          <span className="transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-red-500 group-hover:text-transparent group-hover:bg-clip-text font-semibold">
            Back to home
          </span>
        </Link>
      </div>
    </div>
  );
};

export default MyBorrowRequests;
