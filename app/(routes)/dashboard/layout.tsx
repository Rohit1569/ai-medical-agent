import React from "react";
import AppHeader from "./_components/AppHeader";

function Dashboard({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){
  return(
    <>
      <AppHeader/>
      <div className="px-10 md:px-20 lg:px-40 py-10">{children}</div>
    </>
  
  )
}

export default Dashboard