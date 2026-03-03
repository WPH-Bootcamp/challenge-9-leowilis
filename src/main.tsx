import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import ScrollToTop from "./components/common/ScrollToTop";
import AuthPage from "./pages/AuthPage";
import Details from "./pages/Details";
import Category from "./pages/Category";
import MyCart from "./pages/MyCart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import MyOrders from "./pages/MyOrders";
import BlankLayout from "./components/Layout/BlankLayout";
import MyOrdersLayout from "./components/Layout/MyOrdersLayout";
import Profile from "./pages/Profile";
import { Provider } from "react-redux";
import { store } from "./app/store";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route element={<App />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/details/:id" element={<Details />} />
              <Route path="/category" element={<Category />} />
              <Route path="/mycart" element={<MyCart />} />
              <Route path="/checkout" element={<Checkout />} />

              <Route path="/myorders" element={<MyOrdersLayout />}>
                <Route index element={<MyOrders />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route element={<BlankLayout />}>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/success" element={<Success />} />
            </Route>
          </Routes>

          <Toaster position="top-center" />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
