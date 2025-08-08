import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { SessionDetails } from "../medical-agent/[sessionId]/page";

import ViewReportDialog from "./ViewReportDialog";
  
  type Props = {
    historyList: SessionDetails[];
  };
  
  function HistoryTable({ historyList }: Props) {
    return (
      <div>
        <Table>
          <TableCaption>Previous Consultation Reports.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100 items-center justify-between" >
              <TableHead className="w-[25%]">AI Medical Specialist</TableHead>
              <TableHead className="w-[25%]">Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyList.map((record, index) => (
              <TableRow key={record.id ?? index}>
                <TableCell>
                  {record.selectedDoctor?.specialist ?? "-"}
                </TableCell>
                <TableCell>{record.notes ?? "N/A"}</TableCell>
                <TableCell>
                  {record.createdOn
                    ? new Date(record.createdOn).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {/* <button className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                    View Report
                  </button> */}
                 <ViewReportDialog record={record}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  export default HistoryTable;
  