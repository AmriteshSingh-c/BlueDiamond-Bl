import React from "react";
import img from ".././../Attached Sheet_page-0001.jpg";
import signImg from "../../Sign_page-0001.jpg";
export const AttachedSheet = React.forwardRef((props, ref) => {
  const {
    attachedSheetMarks,
    attachedSheetDescription,
    MTDNo,
    PortOfLoading,
    PortOfDischarge,
    sign,
    sheetNumber = 1,
    sheetTotal = 1,
    showSignature = true,
    showStamp = true,
  } = props;
  const isApproved = sign === true || sign === "true";
  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-white text-[10px] font-bold"
      style={{ width: "21cm", height: "29.7cm" }}
    >
      <img src={img} className="w-full h-full " alt="unable"></img>

      <div className="absolute top-[57.5px] left-[663px]">
        <p>{sheetNumber}</p>
      </div>
      <div className="absolute top-[57.5px] left-[690px]">
        <p>{sheetTotal}</p>
      </div>
      <div className="absolute top-[113px] left-[550px]">
        <p>{PortOfDischarge}</p>
      </div>
      <div className="absolute top-[113px] left-[120px]">
        <p>{PortOfLoading}</p>
      </div>
      <div className="absolute top-[75px] left-[120px]">
        <p>{MTDNo}</p>
      </div>
      <div
        className="absolute top-[190px] left-[42px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {attachedSheetMarks}
      </div>
      <div
        className="absolute top-[190px] left-[335px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {attachedSheetDescription}
      </div>
      {isApproved && showStamp && (
        <div className="absolute left-[510px] top-[860px] -rotate-12 border-4 border-red-500/70 bg-white/80 px-4 py-2 text-[24px] font-black uppercase tracking-[0.18em] text-red-500/70">
          Approved
        </div>
      )}
      {isApproved && showSignature && (
        <div className="absolute left-[545px] top-[930px] bg-white/80">
          <img src={signImg} className="h-[85px] w-auto" alt="approval signature"></img>
        </div>
      )}
    </div>
  );
});
