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
  } = props;
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
      {sign === "true" && (
        <div className="bg-blue-500 text-white absolute top-[930px] left-[550px]">
          <img src={signImg} className="w-full h-[85px] " alt="unable"></img>
        </div>
      )}
    </div>
  );
});
