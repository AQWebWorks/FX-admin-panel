import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  User,
  Plus,
  Minus,
  History,
  Download,
} from "lucide-react";

const ManualDW = () => {
  const [formData, setFormData] = useState({
    account: "",
    display: "",
    amount: "",
    remark: "",
    transactionType: "deposit", // deposit or withdraw
    accountId: null,
    accountBalance: null,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, warning
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccountSearch, setShowAccountSearch] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sample accounts data
  const sampleAccounts = [
    {
      id: 1,
      username: "john_doe",
      uid: "1058801",
      balance: 1500.0,
      status: "Active",
    },
    {
      id: 2,
      username: "alice_smith",
      uid: "1058802",
      balance: 3200.5,
      status: "Active",
    },
    {
      id: 3,
      username: "bob_wilson",
      uid: "1058803",
      balance: 875.25,
      status: "Active",
    },
    {
      id: 4,
      username: "sara_jones",
      uid: "1058804",
      balance: 0.0,
      status: "Inactive",
    },
    {
      id: 5,
      username: "mike_brown",
      uid: "1058805",
      balance: 5420.75,
      status: "Active",
    },
    {
      id: 6,
      username: "emma_davis",
      uid: "1058806",
      balance: 123.45,
      status: "Active",
    },
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    setIsLoading(true);

    // Load transactions
    const savedTransactions = localStorage.getItem("manualDWTransactions");
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        setTransactions(
          Array.isArray(parsedTransactions) ? parsedTransactions : []
        );
      } catch (error) {
        console.error("Error loading transactions:", error);
        setTransactions([]);
      }
    }

    // Load accounts
    const savedAccounts = localStorage.getItem("manualDWAccounts");
    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(
          Array.isArray(parsedAccounts) ? parsedAccounts : sampleAccounts
        );
      } catch (error) {
        console.error("Error loading accounts:", error);
        setAccounts(sampleAccounts);
      }
    } else {
      setAccounts(sampleAccounts);
    }

    setIsLoading(false);
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(
        "manualDWTransactions",
        JSON.stringify(transactions)
      );
    }
  }, [transactions, isLoading]);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("manualDWAccounts", JSON.stringify(accounts));
    }
  }, [accounts, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAccountSelect = (account) => {
    if (account && account.balance !== undefined) {
      setFormData({
        ...formData,
        account: account.username,
        accountId: account.id,
        accountBalance: account.balance,
      });
    }
    setShowAccountSearch(false);
  };

  const handleTransactionTypeChange = (type) => {
    setFormData({ ...formData, transactionType: type });
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.account || !formData.accountId) {
      showMessage("⚠️ Please select an account", "error");
      return;
    }

    if (!formData.display) {
      showMessage("⚠️ Please select display option", "error");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) === 0) {
      showMessage("⚠️ Please enter a valid amount", "error");
      return;
    }

    if (!formData.remark) {
      showMessage("⚠️ Please enter a remark", "error");
      return;
    }

    const amount = parseFloat(formData.amount);
    const selectedAccount = accounts.find(
      (acc) => acc.id === formData.accountId
    );

    if (!selectedAccount || selectedAccount.balance === undefined) {
      showMessage("❌ Selected account not found or invalid balance", "error");
      return;
    }

    // Check for sufficient balance for withdrawals
    if (
      formData.transactionType === "withdraw" &&
      amount > selectedAccount.balance
    ) {
      showMessage("❌ Insufficient balance for withdrawal", "error");
      return;
    }

    // Check for negative amount
    if (amount < 0) {
      showMessage("❌ Please enter a positive amount", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create transaction record
      const transaction = {
        id: Date.now(),
        accountId: formData.accountId,
        username: formData.account,
        amount: amount,
        type: formData.transactionType,
        display: formData.display,
        remark: formData.remark,
        timestamp: new Date().toISOString(),
        status: "Completed",
        previousBalance: selectedAccount.balance || 0,
        newBalance:
          formData.transactionType === "deposit"
            ? (selectedAccount.balance || 0) + amount
            : (selectedAccount.balance || 0) - amount,
      };

      // Update account balance
      const updatedAccounts = accounts.map((account) =>
        account.id === formData.accountId
          ? {
              ...account,
              balance:
                formData.transactionType === "deposit"
                  ? (account.balance || 0) + amount
                  : (account.balance || 0) - amount,
            }
          : account
      );

      // Update state
      setAccounts(updatedAccounts);
      setTransactions([transaction, ...transactions]);

      // Reset form
      setFormData({
        account: "",
        display: "",
        amount: "",
        remark: "",
        transactionType: "deposit",
        accountId: null,
        accountBalance: null,
      });

      showMessage(
        `✅ ${
          formData.transactionType === "deposit" ? "Deposit" : "Withdrawal"
        } of $${amount.toFixed(2)} completed successfully for ${
          formData.account
        }`,
        "success"
      );
    } catch (error) {
      showMessage("❌ Transaction failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTransactions = () => {
    if (!transactions.length) {
      showMessage("⚠️ No transactions to export", "warning");
      return;
    }

    const dataToExport = transactions.map((t) => ({
      "Transaction ID": t.id,
      Username: t.username,
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Amount: t.amount,
      "Previous Balance": t.previousBalance || 0,
      "New Balance": t.newBalance || 0,
      Remark: t.remark,
      Display: t.display,
      Timestamp: new Date(t.timestamp).toLocaleString(),
      Status: t.status,
    }));

    const headers = Object.keys(dataToExport[0]).join(",");
    const csv = [
      headers,
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manual-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showMessage("📊 Transactions exported successfully", "success");
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.uid.includes(searchTerm)
  );

  const getMessageStyles = (type) => {
    const baseStyle = {
      marginBottom: "20px",
      padding: "12px 16px",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
    };

    switch (type) {
      case "success":
        return {
          ...baseStyle,
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
        };
      case "error":
        return {
          ...baseStyle,
          backgroundColor: "#f8d7da",
          color: "#721c24",
          border: "1px solid #f5c6cb",
        };
      case "warning":
        return {
          ...baseStyle,
          backgroundColor: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeaa7",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#d1ecf1",
          color: "#0c5460",
          border: "1px solid #bee5eb",
        };
    }
  };

  const getTransactionTypeColor = (type) => {
    return type === "deposit" ? "#27ae60" : "#e74c3c";
  };

  const getTransactionTypeIcon = (type) => {
    return type === "deposit" ? <Plus size={14} /> : <Minus size={14} />;
  };

  // Statistics
  const getStatistics = () => {
    const totalDeposits = transactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalWithdrawals = transactions
      .filter((t) => t.type === "withdraw")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const netFlow = totalDeposits - totalWithdrawals;

    return {
      totalTransactions: transactions.length,
      totalDeposits,
      totalWithdrawals,
      netFlow,
    };
  };

  const stats = getStatistics();

  // Close account search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAccountSearch &&
        !event.target.closest(".account-search-container")
      ) {
        setShowAccountSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccountSearch]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
            }}
          >
            ☰
          </button>
          <h1
            style={{
              fontSize: "18px",
              margin: "0",
              color: "#ff6b6b",
              fontWeight: "normal",
            }}
          >
            MANAGEMENT SYSTEM
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "13px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>online</span>
            <span style={{ fontWeight: "600" }}>1</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>top up</span>
            <span style={{ fontWeight: "600" }}>4</span>
            <Bell size={16} color='#4a90e2' />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>Withdraw money</span>
            <span style={{ fontWeight: "600" }}>4</span>
            <Bell size={16} color='#4a90e2' />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>Order</span>
            <span style={{ fontWeight: "600" }}>0</span>
            <Bell size={16} color='#4a90e2' />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ color: "#666" }}>admin</span>
            <span style={{ color: "#999" }}>▼</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0",
              color: "#333",
            }}
          >
            Manual Deposit/Withdraw
          </h2>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <History size={16} />
              {showTransactionHistory ? "Hide History" : "Show History"}
            </button>

            {transactions.length > 0 && (
              <button
                onClick={handleExportTransactions}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Download size={16} />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              Total Transactions
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}
            >
              {stats.totalTransactions}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              Total Deposits
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#27ae60" }}
            >
              ${stats.totalDeposits.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              Total Withdrawals
            </div>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}
            >
              ${stats.totalWithdrawals.toFixed(2)}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}
            >
              Net Flow
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: stats.netFlow >= 0 ? "#27ae60" : "#e74c3c",
              }}
            >
              ${stats.netFlow.toFixed(2)}
            </div>
          </div>
        </div>

        {message && <div style={getMessageStyles(messageType)}>{message}</div>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: showTransactionHistory ? "1fr 1fr" : "1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Transaction Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {/* Transaction Type */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Transaction Type
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type='button'
                  onClick={() => handleTransactionTypeChange("deposit")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor:
                      formData.transactionType === "deposit"
                        ? "#27ae60"
                        : "#f8f9fa",
                    color:
                      formData.transactionType === "deposit" ? "white" : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Plus size={16} />
                  Deposit
                </button>
                <button
                  type='button'
                  onClick={() => handleTransactionTypeChange("withdraw")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor:
                      formData.transactionType === "withdraw"
                        ? "#e74c3c"
                        : "#f8f9fa",
                    color:
                      formData.transactionType === "withdraw"
                        ? "white"
                        : "#333",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Minus size={16} />
                  Withdraw
                </button>
              </div>
            </div>

            {/* Account Selection */}
            <div
              style={{ marginBottom: "20px" }}
              className='account-search-container'
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Account
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type='text'
                  name='account'
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({ ...formData, account: e.target.value })
                  }
                  onFocus={() => setShowAccountSearch(true)}
                  placeholder='Search and select account'
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type='button'
                  onClick={() => setShowAccountSearch(!showAccountSearch)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  <Search size={16} />
                </button>

                {showAccountSearch && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                    >
                      <input
                        type='text'
                        placeholder='Search accounts...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: "white",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        <User size={16} color='#666' />
                        <div>
                          <div style={{ fontWeight: "500" }}>
                            {account.username}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            UID: {account.uid} | Balance: $
                            {(account.balance || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No accounts found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Display Option */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Whether it is shown
              </label>
              <select
                name='display'
                value={formData.display}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                }}
              >
                <option value=''>-- Select --</option>
                <option value='display'>Display to User</option>
                <option value='hide'>Hide from User</option>
              </select>
            </div>

            {/* Operation Amount */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Operation Amount
              </label>
              <input
                type='number'
                name='amount'
                value={formData.amount}
                onChange={handleChange}
                placeholder='Enter amount (positive number)'
                min='0'
                step='0.01'
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              {formData.accountBalance !== null && (
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Current Balance: ${(formData.accountBalance || 0).toFixed(2)}
                </div>
              )}
            </div>

            {/* Remark */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Remark
              </label>
              <textarea
                name='remark'
                value={formData.remark}
                onChange={handleChange}
                placeholder='Please enter a comment'
                rows='3'
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px 24px",
                backgroundColor: isLoading ? "#95a5a6" : "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {isLoading
                ? "Processing..."
                : `Submit ${
                    formData.transactionType === "deposit"
                      ? "Deposit"
                      : "Withdrawal"
                  }`}
            </button>
          </form>

          {/* Transaction History */}
          {showTransactionHistory && (
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                maxHeight: "600px",
                overflowY: "auto",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Transaction History
              </h3>

              {transactions.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  <History size={48} color='#ddd' />
                  <div style={{ marginTop: "12px" }}>No transactions yet</div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {transactions.slice(0, 50).map((transaction) => (
                    <div
                      key={transaction.id}
                      style={{
                        padding: "12px",
                        border: "1px solid #eee",
                        borderRadius: "6px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <div style={{ fontWeight: "500" }}>
                          {transaction.username}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: getTransactionTypeColor(transaction.type),
                            fontWeight: "600",
                          }}
                        >
                          {getTransactionTypeIcon(transaction.type)}
                          {transaction.type === "deposit" ? "+" : "-"}$
                          {Math.abs(transaction.amount || 0).toFixed(2)}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                        }}
                      >
                        {transaction.remark}
                      </div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {new Date(transaction.timestamp).toLocaleString()} •
                        Display: {transaction.display} • Balance: $
                        {(transaction.newBalance || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualDW;
