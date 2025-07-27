import { create } from 'zustand';
import axios from 'axios';


// Get user from localStorage at store initialization
let storedUser = null;
try {
    const raw = localStorage.getItem("user");
    storedUser = raw && raw !== "undefined" ? JSON.parse(raw) : null;
} catch (e) {
    console.warn("Failed to parse user from localStorage:", e);
    storedUser = null;
}

export const useAuthStore = create((set) => ({
    user: storedUser,
    isAuthenticated: !!storedUser,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,
    setUser: (user) => {
        localStorage.setItem("user", JSON.stringify(user));  // Persist user in localStorage
        set({ user, isAuthenticated: true });
    },

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
                email,
                password,
                name
            }, { withCredentials: true });

            const user = response.data.user;
            localStorage.setItem("user", JSON.stringify(user));

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Error Signing up', isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Login failed");
            }

            const user = response.data.user;
            localStorage.setItem("user", JSON.stringify(user));

            set({
                isAuthenticated: true,
                user,
                error: null,
                isLoading: false,
            });

        } catch (error) {
            set({
                error: error.message || "Error logging in",
                isLoading: false,
            });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
            localStorage.removeItem("user");

            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });

        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    checkAuth: async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/data`, {
                withCredentials: true,
            });

            if (response.data?.user) {
                localStorage.setItem("user", JSON.stringify(response.data.user));
                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    isCheckingAuth: false,
                });
            } else {
                throw new Error("Not authenticated");
            }

        } catch (error) {
            localStorage.removeItem("user");
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
            });
        }
    },

    verifyUser: async (otp) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-account`,
                { otp },
                { withCredentials: true }
            );

            const updatedUser = response.data.user;
            set({ user: updatedUser, isAuthenticated: true, isLoading: false });
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (error) {
            const message = error.response?.data?.message || "Error verifying user";
            set({ isLoading: false, error: message });
            throw new Error(message);
        }
    },
    refreshUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/data`, {
                withCredentials: true,
            });

            const updatedUser = res.data.user;
            if (updatedUser) {
                localStorage.setItem("user", JSON.stringify(updatedUser));
                set({ user: updatedUser });
            }
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/send-reset-otp`,
                { email }, // ✅ body with email
                { withCredentials: true } // ✅ config
            );
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error?.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async ({ email, otp, newPassword }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
                { email, otp, newPassword },
                { withCredentials: true }
            );
            set({
                message: response.data.message,
                isLoading: false,
            });
        } catch (error) {
            set({
                isLoading: false,
                error: error?.response?.data?.message,
            });
            throw error;
        }
    },

    verifyOtp: async ({ email, otp }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`,
                { email, otp },
                { withCredentials: true }
            );
            set({ isLoading: false, message: response.data.message });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error?.response?.data?.message || 'OTP verification failed',
            });
            throw error;
        }
    },

}));
