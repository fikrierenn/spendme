import React, { useState } from "react";
import "./App.css";
import AddTransaction from "./components/AddTransaction";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import Settings from "./components/Settings";
import SupabaseTest from "./components/SupabaseTest";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Test modunu kontrol etmek için
  const isTestMode = window.location.hash === "#/test";

  if (isTestMode) {
    return <SupabaseTest />;
  }

  return (
    <div className="App">
      {showAddTransaction ? (
        <AddTransaction onClose={() => setShowAddTransaction(false)} />
      ) : (
        <>
          {activeTab === 0 && <Dashboard onAddTransaction={() => setShowAddTransaction(true)} />}
          {activeTab === 1 && <Settings />}
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
}

export default App;
