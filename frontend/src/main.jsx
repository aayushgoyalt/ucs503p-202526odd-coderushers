import './index.css'
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {Protected,Secured} from './components/AuthLayout';



const Login = React.lazy(() => import('./pages/Login'));
const Home = React.lazy(() => import('./pages/Home'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Contest = React.lazy(() => import('./pages/Contest'));
const Topic = React.lazy(() => import('./pages/Topic'));
const Company = React.lazy(() => import('./pages/Company'));


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "/home",
        element: (
          <Protected authentication>
            <Home />
          </Protected>
        ),
      },
      {
        path: "/admin",
        element: (
          <Secured authentication>
            <Admin />
          </Secured>
        ),
      },
      {
        path: "/contest",
        element: (
          <Protected authentication>
            <Contest />
          </Protected>
        ),
      },
      {
        path: "/topics",
        element: (
          <Protected authentication>
            <Topic />
          </Protected>
        ),
      },
      {
        path: "/companies",
        element: (
          <Protected authentication>
            <Company />
          </Protected>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);