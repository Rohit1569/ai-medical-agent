'use client';

import Image from "next/image";
import React, { useEffect, useState } from "react";
import medicalAssistant from '../../../../public/ma.jpg';
import AddNewSessionDialog from "./AddNewSessionDialog";
import axios from "axios";
import HistoryTable from "./HistoryTable";
import { SessionDetails } from "../medical-agent/[sessionId]/page";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

function HistoryList() {
  const [historyList, setHistoryList] = useState<SessionDetails[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    GetHistoryList(page);
  }, [page]);

  const GetHistoryList = async (page: number) => {
    try {
      const res = await axios.get(`/api/session-chat?sessionId=all&page=${page}&limit=${ITEMS_PER_PAGE}`);
      setHistoryList(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch session history", error);
    }
  };

  
  return (
    <div className="mt-10">
      {historyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-7 border-dashed rounded-2xl border-2">
          <Image src={medicalAssistant} alt='medical assistant' width={150} height={150} />
          <h2 className="font-bold text-xl mt-2">No Recent Consultations</h2>
          <p>It looks like you haven&apos;t consulted with any doctors yet.</p>
          <AddNewSessionDialog />
        </div>
      ) : (
        <div>
          <HistoryTable historyList={historyList} />

          <Pagination className="mt-4">
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        className={page === 1 ? "pointer-events-none opacity-50" : ""}
      />
    </PaginationItem>

    {/* Render page numbers */}
    {Array.from({ length: totalPages }, (_, index) => (
      <PaginationItem key={index}>
        <PaginationLink
          isActive={page === index + 1}
          onClick={() => setPage(index + 1)}
        >
          {index + 1}
        </PaginationLink>
      </PaginationItem>
    ))}

    <PaginationItem>
      <PaginationNext
        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>

        </div>
      )}
    </div>
  );
}

export default HistoryList;
