import { create } from 'zustand';
import axios from 'axios';

export const useBorrowStore = create((set) => ({
    requests: [],
    myRequests: [],
    loading: false,
    error: null,
    myRequestsLoading: false,
    myRequestsError: null,

    fetchRequests: async () => {
        try {
            set({ loading: true });

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/available-items`
            );

            const enrichedItems = res.data.items.map((item) => ({
                ...item,
                id: item._id,
                manufacturerName: item.manufacturer?.companyName || "N/A",
                locationList:
                    item.location?.map((loc) => loc.locationName).join(", ") || "N/A", // Only locationName
            }));

            set({ requests: enrichedItems, loading: false, error: null });
        } catch (err) {
            console.error("fetchRequests error", err);
            set({
                error: err.response?.data?.message || "Error fetching available items",
                loading: false,
            });
        }
    },

    fetchMyRequests: async () => {
        try {
            set({ myRequestsLoading: true, myRequestsError: null });

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/my-requests`,
                { withCredentials: true }
            );

            set({ myRequests: res.data.requests || [], myRequestsLoading: false });
        } catch (err) {
            console.error("fetchMyRequests error:", err);
            set({
                myRequestsError: err.response?.data?.message || "Error fetching your requests",
                myRequestsLoading: false,
            });
        }
    },

    createBorrowRequest: async (itemId, reason) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/borrow-item`,
                { itemId, reason },
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            console.error("createBorrowRequest error:", err.response?.data || err);
            throw err.response?.data || { message: 'Error creating request' };
        }
    },

    approveRequest: async (id) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request/${id}/action`,
                { action: 'approve' },
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Error approving request' };
        }
    },

    rejectRequest: async (id, remarks) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request/${id}/action`,
                { action: 'reject', adminRemarks: remarks },
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Error rejecting request' };
        }
    },

    requestReturn: async (id) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/request-return/${id}`,
                {},
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Error requesting return' };
        }
    },

    confirmReturn: async (id) => {
        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/return-item/${id}`,
                {},
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: 'Error confirming return' };
        }
    },

    cancelRequest: async (id) => {
        try {
            const res = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/borrow/cancel/${id}`,
                { withCredentials: true }
            );
            return res.data;
        } catch (err) {
            throw err.response?.data || { message: "Error cancelling request" };
        }
    },

}));
