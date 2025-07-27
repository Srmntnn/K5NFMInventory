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
  ArchiveRestore,
  ArrowLeftCircle,
  ArrowUpDown,
  CheckCircle,
  Clock,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BorrowRequest = () => {
  const [requests, setRequests] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [returnRemarks, setReturnRemarks] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request/all`,
          { withCredentials: true }
        );
        setRequests(res.data.requests || []);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Fetching Request Error",
          description:
            err?.response?.data?.message || "Failed to load requests",
        });
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request/${id}/action`,
        { action: "approve" },
        { withCredentials: true }
      );
      toast({
        title: "Approved",
        description: "Request approved successfully",
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Approve Error",
        description: err?.response?.data?.message || "Error approving request",
      });
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request/${
          selectedRequest._id
        }/action`,
        { action: "reject", adminRemarks: remarks },
        { withCredentials: true }
      );
      toast({
        title: "Rejected",
        description: "Request rejected successfully",
      });
      setSelectedRequest(null);
      setRemarks("");
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, status: "rejected", adminRemarks: remarks }
            : r
        )
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Reject Error",
        description: err?.response?.data?.message || "Error rejecting request",
      });
    }
  };

  const handleConfirmReturn = async (id) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/borrow/return-item/${id}`,
        {},
        { withCredentials: true }
      );
      toast({
        title: "Return Confirmed",
        description: res.data.message || "Return confirmed successfully",
      });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, returnApproved: true } : r))
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Return Error",
        description: err?.response?.data?.message || "Error confirming return",
      });
    }
  };

  const handleRejectReturn = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/borrow/return-item/${
          selectedRequest._id
        }/reject`,
        { returnRemarks },
        { withCredentials: true }
      );
      toast({
        title: "Return Rejected",
        description: "Return has been rejected.",
      });
      setReturnRemarks("");
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedRequest._id
            ? { ...r, returnRejected: true, returnRemarks }
            : r
        )
      );
      setSelectedRequest(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Return Reject Error",
        description: err?.response?.data?.message || "Error rejecting return",
      });
    }
  };

  const columns = [
    {
      id: "itemAndBorrower",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item & Borrower <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => {
        const itemName = row.item?.itemName || "";
        const borrowerName = row.requestedBy?.name || "";
        return `${itemName} ${borrowerName}`;
      },
      cell: ({ row }) => {
        const itemName = row.original.item?.itemName || "Unknown Item";
        const borrowerName =
          row.original.requestedBy?.name || "Unknown Borrower";
        return `${itemName} → ${borrowerName}`;
      },
      filterFn: (row, id, value) => {
        const combined = row.getValue(id).toLowerCase();
        return combined.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "requestedBy.email",
      header: "Borrower Email",
      cell: ({ row }) => row.original.requestedBy?.email || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase();

        if (status === "approved") {
          return (
            <Badge
              variant="outline"
              className="text-green-500 border-green-300 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Approved
            </Badge>
          );
        }

        if (status === "rejected") {
          return (
            <Badge
              variant="outline"
              className="text-red-500 border-red-300 flex items-center gap-1"
            >
              <ArchiveRestore className="w-3 h-3" />
              Rejected
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="text-gray-500 border-gray-300 flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            {row.original.status || "Available"}
          </Badge>
        );
      },
    },

    {
      accessorKey: "returnStatus",
      header: "Return Status",
      cell: ({ row }) => {
        const request = row.original;

        if (!request.returnRequested) {
          return (
            <Badge
              variant="outline"
              className="text-gray-500 border-gray-300 flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Pending
            </Badge>
          );
        }

        if (request.returnApproved) {
          return (
            <Badge
              variant="outline"
              className="text-green-500 border-green-300 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Return Approved
            </Badge>
          );
        }

        if (request.returnStatus) {
          return (
            <Badge
              variant="outline"
              className="text-red-500 border-red-300 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Return Rejected
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-300 flex items-center gap-1"
          >
            <ArrowLeftCircle className="w-3 h-3" />
            Return Requested
          </Badge>
        );
      },
    },
    {
      accessorKey: "adminRemarks",
      header: "Admin Remarks",
      cell: ({ row }) => row.original.adminRemarks || "N/A",
    },
    {
      accessorKey: "returnRemarks",
      header: "Return Remarks",
      cell: ({ row }) => row.original.returnRemarks || "N/A",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;

        const hasActions =
          request.status === "pending" ||
          (request.status === "approved" &&
            request.returnRequested &&
            !request.returnApproved &&
            !request.returnRejected);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {request.status === "pending" && (
                <>
                  <DropdownMenuItem onClick={() => handleApprove(request._id)}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSelectedRequest(request)}
                    className="text-destructive"
                  >
                    Reject
                  </DropdownMenuItem>
                </>
              )}

              {request.status === "approved" &&
                request.returnRequested &&
                !request.returnApproved &&
                !request.returnRejected && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleConfirmReturn(request._id)}
                    >
                      Confirm Return
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedRequest(request)}
                      className="text-destructive"
                    >
                      Reject Return
                    </DropdownMenuItem>
                  </>
                )}

              {!hasActions && (
                <DropdownMenuItem disabled>
                  No actions available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full p-6">
      <h2 className="md:text-3xl text-2xl font-bold">Borrow Requests</h2>

      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search Item or Borrower..."
          value={table.getColumn("itemAndBorrower")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("itemAndBorrower")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reject Borrow Request Dialog */}
      <Dialog
        open={!!selectedRequest && selectedRequest.status === "pending"}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Borrow Request</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter remarks for rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Return Request Dialog */}
      <Dialog
        open={
          !!selectedRequest &&
          selectedRequest.returnRequested &&
          !selectedRequest.returnApproved &&
          !selectedRequest.returnRejected
        }
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Return Request</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for rejecting return..."
            value={returnRemarks}
            onChange={(e) => setReturnRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="destructive" onClick={handleRejectReturn}>
              Confirm Return Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BorrowRequest;
