import React, { createContext, useContext, useEffect, useState } from "react";

/* =====================================================
   CONTRACTOR CONTEXT
===================================================== */
const ContractorContext = createContext(null);

/* =====================================================
   PROVIDER
===================================================== */
export const ContractorProvider = ({ children }) => {
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------
     LOAD CONTRACTOR FROM LOCALSTORAGE
  -------------------------------------------- */
  useEffect(() => {
    console.group("🧠 ContractorContext Init");

    try {
      const stored = localStorage.getItem("contractor");

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("✅ Contractor loaded from localStorage:", parsed);
        setContractor(parsed);
      } else {
        console.log("ℹ️ No contractor in localStorage");
      }
    } catch (err) {
      console.error("❌ Failed to parse contractor", err);
      localStorage.removeItem("contractor");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, []);

  /* -------------------------------------------
     LOGIN CONTRACTOR
  -------------------------------------------- */
  const loginContractor = (contractorData) => {
    console.group("🔐 Contractor Login");

    setContractor(contractorData);
    localStorage.setItem("contractor", JSON.stringify(contractorData));

    console.log("✅ Contractor stored in context & localStorage");
    console.groupEnd();
  };

  /* -------------------------------------------
     LOGOUT CONTRACTOR
  -------------------------------------------- */
  const logoutContractor = () => {
    console.group("🚪 Contractor Logout");

    setContractor(null);
    localStorage.removeItem("contractor");

    console.log("✅ Contractor cleared");
    console.groupEnd();
  };

  return (
    <ContractorContext.Provider
      value={{
        contractor,
        loginContractor,
        logoutContractor,
        loading,
      }}
    >
      {children}
    </ContractorContext.Provider>
  );
};

/* =====================================================
   HOOK
===================================================== */
export const useContractor = () => {
  const ctx = useContext(ContractorContext);
  if (!ctx) {
    throw new Error("useContractor must be used inside ContractorProvider");
  }
  return ctx;
};
