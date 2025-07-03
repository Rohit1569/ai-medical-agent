'use client'

import Image from "next/image";
import React, { useState } from "react";
import medicalAssistant from '../../../../public/ma.jpg'
import AddNewSessionDialog from "./AddNewSessionDialog";

function HistoryList() {
  const [historyList,setHistoryList] =useState([]);
  return (
    <div className="mt-10">
    {historyList.length==0?
        <div className="flex flex-col items-center justify-center p-7 border-dashed rounded-2xl border-2">
          <Image src={medicalAssistant} alt='medical assistant' width={150} height={150} />
          <h2 className="font-bold text-xl mt-2">No Recent Consultations</h2>
          <p>It looks you haven't consulted with any doctors yet.</p>
           <AddNewSessionDialog/>
        </div>
     
         :<div>List</div>}

    </div>
  );
}

export default HistoryList; 