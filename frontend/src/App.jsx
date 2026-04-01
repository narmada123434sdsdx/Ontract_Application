// App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

/* Common / Individual */
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OTPVerification from "./components/OTPVerification";
import ActivateAccount from "./components/ActivateAccount";
import ProviderProfile from "./components/ProviderProfile";
import ProviderServices from "./components/ProviderServices";
import ProviderHome from "./components/ProviderHome";
import ForgotPassword from "./components/ForgotPassword";
import ProviderUpdateProfile from "./components/ProviderUpdateProfile";
import ProviderPersonalDetails from "./components/ProviderPersonalDetails";
import ProviderBankDetails from "./components/ProviderBankDetails";
import ProviderInvoice from "./components/ProviderInvoice";

/* Admin */
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

/* Contractor (company) components */
import CompanyLogin from "./components/company/CompanyLogin";
import CompanySignup from "./components/company/CompanySignup";
import CompanyActivateAccount from "./components/company/CompanyActivateAccount";
import CompanyOTPVerification from "./components/company/CompanyOTPVerification";
import CompanyDashboardHome from "./components/company/CompanyDashboardHome";
import CompanyProfile from "./components/company/CompanyProfile";
import CompanyServices from "./components/company/CompanyServices";
import AdminApp from "./components/AdminApp";
import Notifications from "./components/Notifications";
import CompanyApp from "./components/company/CompanyApp";
import CompanyNotifications from "./components/company/CompanyNotifications";
import ProviderWorkOrders from "./components/ProviderWorkOrders";
import CompanyWorkorders from "./components/company/CompanyWorkorders";
import UpdateCompanyProfile from "./components/company/UpdateCompanyProfile";
import ContractorPersonalDetails from "./components/company/ContractorPersonalDetails";
import ContractorBankDetails from "./components/company/ContractorBankDetails";
import CompanyInvoice from "./components/company/CompanyInvoice";
import RateComparisonReport from "./components/RateComparisonReport";

function Layout({ user, setUser, admin, setAdmin, contractor, setContractor }) {
  const location = useLocation();

  // Hide header & footer for provider pages, contractor dashboard and admin pages
  const hideLayout =
    location.pathname.startsWith("/provider") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/contractor/dashboard");

  // Click Here blinking state
  const [showHint, setShowHint] = React.useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowHint((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Collapse bootstrap navbar on nav link click (mobile)
  useEffect(() => {
    const navLinks = document.querySelectorAll(".navbar-collapse .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    if (!navbarCollapse) return;

    const handleLinkClick = (e) => {
      const isDropdown =
        e.target.classList.contains("dropdown-toggle") ||
        e.target.closest(".dropdown-menu");

      if (isDropdown) return;

      if (navbarCollapse.classList.contains("show")) {
        const bsCollapse = new window.bootstrap.Collapse(navbarCollapse, {
          toggle: false,
        });
        bsCollapse.hide();
      }
    };

    navLinks.forEach((link) =>
      link.addEventListener("click", handleLinkClick)
    );

    return () => {
      navLinks.forEach((link) =>
        link.removeEventListener("click", handleLinkClick)
      );
    };
  }, []);

  return (
    <div
      className="min-h-screen d-flex flex-column"
      style={{ minHeight: "100vh" }}
    >
      {/* NAV */}
      {!hideLayout && (
        <nav className="navbar navbar-expand-lg sticky-top bg-white shadow-sm">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">
              Ontract Services
            </Link>

            {/* Hamburger icon with Click Here badge (MOBILE ONLY) */}
            <div className="position-relative d-inline-block">
              {showHint && (
                <span
                  className="badge rounded-pill bg-danger d-lg-none"
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-15px",
                    fontSize: "10px",
                    zIndex: 999,
                    padding: "5px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Click Here
                </span>
              )}

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Collapsible menu */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>

                {/* Login Dropdown */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="loginDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Login
                  </a>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="loginDropdown"
                  >
                    <li>
                      <Link className="dropdown-item" to="/login">
                        Individual
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/contractor/login">
                        Contractor
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Signup Dropdown */}
                <li className="nav-item dropdown ms-2">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="signupDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Sign Up
                  </a>

                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="signupDropdown"
                  >
                    <li>
                      <Link className="dropdown-item" to="/signup">
                        Individual
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/contractor/signup">
                        Contractor
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* ROUTES */}
      <main className="flex-fill">
        <Routes>
          {/* Common / Individuals */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/verify-otp"
            element={<OTPVerification setUser={setUser} />}
          />
          <Route
            path="/activate"
            element={<ActivateAccount setUser={setUser} />}
          />
          <Route
            path="/forgot_password"
            element={<ForgotPassword setUser={setUser} />}
          />

          {/* Provider nested */}
          <Route path="/provider_home" element={<ProviderHome user={user} />}>
            <Route path="profile" element={<ProviderProfile user={user} />} />
            <Route
              path="services"
              element={<ProviderServices user={user} />}
            />
            <Route
              path="notifications"
              element={<Notifications user={user} />}
            />
            <Route path="workorders" element={<ProviderWorkOrders />} />
            <Route path="invoice" element={<ProviderInvoice />} />
            <Route
              path="providerupdateprofile"
              element={<ProviderUpdateProfile user={user} />}
            />
            <Route
              path="personal-details"
              element={<ProviderPersonalDetails user={user} />}
            />
            <Route
              path="/provider_home/providerbankdetails"
              element={<ProviderBankDetails />}
            />
          </Route>
          <Route path="/personal/reports/ratecomparison" element={<RateComparisonReport />} />

          {/* Contractor routes */}
          <Route
            path="/contractor/login"
            element={<CompanyLogin setContractor={setContractor} />}
          />
          <Route path="/contractor/signup" element={<CompanySignup />} />
          <Route
            path="/contractor/activate"
            element={<CompanyActivateAccount setContractor={setContractor} />}
          />
          <Route
            path="/contractor/verify_otp"
            element={<CompanyOTPVerification setContractor={setContractor} />}
          />

          <Route
            path="/contractor/dashboard"
            element={
              <CompanyApp
                contractor={contractor}
                setContractor={setContractor}
              />
            }
          >
            <Route
              path="companydashboardhome"
              element={
                <CompanyDashboardHome
                  contractor={contractor}
                  setContractor={setContractor}
                />
              }
            />
            <Route
              path="profile"
              element={
                <CompanyProfile
                  contractor={contractor}
                  setContractor={setContractor}
                />
              }
            />
            <Route
              path="services"
              element={
                <CompanyServices
                  contractor={contractor}
                  setContractor={setContractor}
                />
              }
            />
            <Route
              path="notifications"
              element={
                <CompanyNotifications
                  contractor={contractor}
                  setContractor={setContractor}
                />
              }
            />
            <Route path="workorders" element={<CompanyWorkorders />} />
            <Route path="invoice" element={<CompanyInvoice />} />
            <Route
              path="updatecompanyprofile"
              element={
                <UpdateCompanyProfile
                  contractor={contractor}
                  setContractor={setContractor}
                />
              }
            />
            <Route
              path="contractor-personal-details"
              element={<ContractorPersonalDetails contractor={contractor} />}
            />
            <Route
              path="contractorbankdetails"
              element={<ContractorBankDetails contractor={contractor} />}
            />
          </Route>

          {/* Admin */}
          <Route
            path="/admin/*"
            element={<AdminApp admin={admin} setAdmin={setAdmin} />}
          />
          <Route
            path="/admin/login"
            element={<AdminLogin setAdmin={setAdmin} />}
          />

          {/* Fallback */}
          <Route path="*" element={<Home user={user} />} />
        </Routes>
      </main>

      {/* FOOTER */}
      {!hideLayout && (
        <footer className="bg-dark text-light pt-5 mt-auto">
          <div className="container">
            <div className="row">
              <div className="col-md-3 mb-4">
                <h5 className="text-white">Ontract</h5>
                <p className="small text-muted">
                  Connecting verified contractors and customers. Trusted, secure
                  and easy to use.
                </p>
                <p className="small mt-2">© 2025 Ontract Services</p>
              </div>

              <div className="col-md-2 mb-4">
                <h6 className="text-white">Products</h6>
                <ul className="list-unstyled small">
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Contractor Portal
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Customer App
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-md-2 mb-4">
                <h6 className="text-white">Company</h6>
                <ul className="list-unstyled small">
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      About
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-md-3 mb-4">
                <h6 className="text-white">Resources</h6>
                <ul className="list-unstyled small">
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Support
                    </a>
                  </li>
                  <li>
                    <a className="text-light text-decoration-none" href="#">
                      Developers
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-md-2 mb-4">
                <h6 className="text-white">Stay Updated</h6>
                <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    className="form-control form-control-sm me-2"
                    placeholder="Your email"
                  />
                  <button className="btn btn-sm btn-primary">Subscribe</button>
                </form>

                <div className="mt-3">
                  <a
                    className="btn btn-sm btn-outline-light me-1"
                    href="#"
                    aria-label="twitter"
                  >
                    T
                  </a>
                  <a
                    className="btn btn-sm btn-outline-light me-1"
                    href="#"
                    aria-label="linkedin"
                  >
                    in
                  </a>
                  <a
                    className="btn btn-sm btn-outline-light"
                    href="#"
                    aria-label="facebook"
                  >
                    f
                  </a>
                </div>
              </div>
            </div>

            <hr className="border-secondary" />
            <div className="d-flex justify-content-between small text-muted py-2">
              <div>Terms • Privacy • Cookies</div>
              <div>Made with ❤ · Version 1.0</div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = React.useState(null);
  const [admin, setAdmin] = React.useState(null);
  const [contractor, setContractor] = React.useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined")
        setUser(JSON.parse(storedUser));

      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin && storedAdmin !== "undefined")
        setAdmin(JSON.parse(storedAdmin));

      const storedContractor = localStorage.getItem("contractor");
      if (storedContractor && storedContractor !== "undefined")
        setContractor(JSON.parse(storedContractor));
    } catch (err) {
      console.error("Failed to parse localStorage:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      localStorage.removeItem("contractor");
    }
  }, []);

  return (
    <Layout
      user={user}
      setUser={setUser}
      admin={admin}
      setAdmin={setAdmin}
      contractor={contractor}
      setContractor={setContractor}
    />
  );
}