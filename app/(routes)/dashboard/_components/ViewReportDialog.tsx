import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionDetails } from "../medical-agent/[sessionId]/page";
import moment from "moment";

type Props = {
  record: SessionDetails;
};

function ViewReportDialog({ record }: Props) {
  const doctor = record.selectedDoctor;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report = record.report as any;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          View Report
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <h2 className="text-center text-2xl font-bold">Medical AI Report</h2>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="mt-6 space-y-6 text-sm text-gray-800">
            {/* Doctor Information */}
            <div>
              <h3 className="text-lg font-semibold text-blue-500">Doctor Information</h3>
              {doctor ? (
                <div className="ml-2 space-y-1">
                  <p><span className="font-bold">Specialization:</span> {doctor.specialist ?? "N/A"}</p>
                  {/* <p><span className="font-bold">Name:</span> {doctor.name ?? "N/A"}</p> */}
                </div>
              ) : (
                <p className="ml-2 text-red-500">No doctor information found for this session.</p>
              )}
              <p className="ml-2"><span className="font-bold">Consulted On:</span> {moment(record.createdOn).calendar()}</p>
              <p className="ml-2"><span className="font-bold">Session ID:</span> {record.sessionId}</p>
            </div>

            {/* Doctor's Notes */}
            <div>
              <h3 className="text-lg font-semibold text-blue-500">Doctor&apos;s Notes</h3>
              <p className="ml-2">{record.notes || "No notes provided."}</p>
            </div>

            {/* Additional Report Data */}
            {report && (
              <div>
                <h3 className="text-lg font-semibold text-blue-500">Additional Report Data</h3>
                <div className="ml-2 space-y-1">
                  <p><span className="font-bold">Chief Complaint:</span> {report.chiefComplaint ?? "N/A"}</p>
                  <p><span className="font-bold">Summary:</span> {report.summary ?? "N/A"}</p>
                  <p><span className="font-bold">Duration:</span> {report.duration ?? "Not specified"}</p>
                  <p><span className="font-bold">Severity:</span> {report.severity ?? "Not specified"}</p>
                  <p><span className="font-bold">Symptoms:</span> {report.symptoms?.join(", ") || "N/A"}</p>
                  <p><span className="font-bold">Medications:</span> {report.medicationsMentioned?.join(", ") || "None mentioned"}</p>
                  <p><span className="font-bold">Recommendations:</span> {report.recommendations?.join(" | ") || "None"}</p>
                </div>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog;
