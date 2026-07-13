import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("intrepedus_token");
const user = JSON.parse(localStorage.getItem("intrepedus_user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: { token, user, isAuthenticated: !!token },
  reducers: {
    setCredentials(state, { payload }) {
      state.token = payload.token;
      state.user = payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("intrepedus_token", payload.token);
      localStorage.setItem("intrepedus_user", JSON.stringify(payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("intrepedus_token");
      localStorage.removeItem("intrepedus_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuth = (s) => s.auth.isAuthenticated;
export const selectUserRole = (s) => s.auth.user?.role;
