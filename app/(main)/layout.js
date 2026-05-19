import React from "react";
import HomeButton from "@/components/HomeButton";
import { checkUser } from "@/lib/checkUser";

const MainLayout = async ({ children }) => {
  await checkUser();

  return (
    <div className="container mx-auto mt-24 mb-20">
      
      {/* Top Bar */}
      <div className="flex justify-start mb-6">
        <HomeButton />
      </div>

      {/* Page Content */}
      {children}
      
    </div>
  );
};

export default MainLayout;
