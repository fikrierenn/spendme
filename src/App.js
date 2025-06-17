import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import BottomNav from "./components/BottomNav";
import AddTransaction from "./components/AddTransaction";
import Settings from "./components/Settings";
// import SupabaseTest from "./components/SupabaseTest";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  // Kullanıcı id'si sabit (örnek)
  const userId = "b5318971-add4-48ba-85fb-b856f2bd22ca";

  // Test sayfaları için routing
  // if (window.location.hash === "#/parser-test") {
  //   return <ParserTest />;
  // }
  
  if (window.location.hash === "#/ai-test") {
    // return <AITestPage />;
  }

  return (
    <div className="relative min-h-screen pb-20 flex flex-col items-center bg-gradient-to-br from-brand-lightPurple to-brand-lightGray">
      {/* <SupabaseTest /> */}
      <div className="w-full max-w-md flex-1">
        {activeTab === 0 && <Dashboard userId={userId} onAddTransaction={() => setActiveTab(1)} />}
        {activeTab === 1 && <AddTransaction userId={userId} />}
        {activeTab === 3 && <Settings userId={userId} />}
      </div>
      {/* Alt menü her zaman ekranın altında ve ortada */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
        <BottomNav active={activeTab} setActive={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
