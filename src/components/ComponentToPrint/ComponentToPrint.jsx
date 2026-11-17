import React, { useEffect, useState } from "react";
import img from "../../outline_page.jpg";
import signImg from "../../Sign_page-0001.jpg";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const DEFAULT_LAYOUT = {
  MTDNo: { top: 48, left: 600 },
  ShipmentRef: { top: 72, left: 600 },
  Consignor: { top: 72, left: 20 },
  Consignee: { top: 157, left: 20 },
  NotifyParty: { top: 239, left: 20 },
  PlaceOfAcceptance: { top: 325, left: 20 },
  DateOfAcceptance: { top: 325, left: 250 },
  PortOfLoading: { top: 365, left: 20 },
  PortOfDischarge: { top: 365, left: 203 },
  VesselVoyage: { top: 403, left: 20 },
  PlaceOfDelivery: { top: 440, left: 20 },
  DateOfDelivery: { top: 440, left: 250 },
  ModeOfTransport: { top: 440, left: 400 },
  Route: { top: 440, left: 590 },
  ContainerNo: { top: 488, left: 20 },
  Marks: { top: 488, left: 135 },
  Description: { top: 492, left: 285 },
  GrossWeight: { top: 486, left: 555 },
  Measurement: { top: 486, left: 685 },
  DeliveryAgent: { top: 874, left: 20 },
  FreightAmount: { top: 872, left: 400 },
  NumberOfBl: { top: 874, left: 575 },
  PlaceAndDate: { top: 873, left: 635 },
  FreightPayable: { top: 930, left: 400 },
};

const getStoredTemplateConfig = () => {
  try {
    const saved = localStorage.getItem("blueDiamondBillTemplate");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

export const ComponentToPrint = React.forwardRef((props, ref) => {
  const {
    Consignee,
    Consignor,
    ContainerNo,
    NotifyParty,
    PlaceOfAcceptance,
    DateOfAcceptance,
    PortOfLoading,
    PortOfDischarge,
    VesselVoyage,
    PlaceOfDelivery,
    DateOfDelivery,
    ModeOfTransport,
    Route,
    Marks,
    Description,
    GrossWeight,
    Measurement,
    DeliveryAgent,
    FreightAmount,
    NumberOfBl,
    PlaceAndDate,
    FreightPayable,
    MTDNo,
    ShipmentRef,
    hidden,
    sign,
    typeText,
    templateImage,
    layout,
    showSignature = true,
    showStamp = true,
  } = props;

  const [activeTemplate, setActiveTemplate] = useState(templateImage || img);
  const [activeLayout, setActiveLayout] = useState({ ...DEFAULT_LAYOUT, ...(layout || {}) });
  const isApproved = sign === true || sign === "true";

  useEffect(() => {
    const currentLayout = { ...DEFAULT_LAYOUT, ...(layout || {}) };
    setActiveLayout(currentLayout);
    if (templateImage) {
      setActiveTemplate(templateImage);
      return;
    }

    const fetchTemplate = async () => {
      if (db) {
        const savedTemplate = await getDoc(doc(db, "systemSettings", "billTemplate"));
        if (savedTemplate.exists()) {
          const data = savedTemplate.data();
          if (data?.image) setActiveTemplate(data.image);
          if (data?.layout) setActiveLayout({ ...DEFAULT_LAYOUT, ...data.layout });
        }
      }

      const localTemplate = getStoredTemplateConfig();
      if (localTemplate?.image) setActiveTemplate(localTemplate.image);
      if (localTemplate?.layout) setActiveLayout({ ...DEFAULT_LAYOUT, ...localTemplate.layout });
    };

    fetchTemplate();
  }, [layout, templateImage]);

  const fieldPosition = (fieldName) => {
    const position = activeLayout[fieldName] || DEFAULT_LAYOUT[fieldName] || { top: 0, left: 0, width: 180, height: 26 };
    return {
      top: `${position.top ?? 0}px`,
      left: `${position.left ?? 0}px`,
      width: `${position.width ?? 180}px`,
      height: `${position.height ?? 26}px`,
    };
  };

  return (
    <div
      ref={ref}
      className="relative text-[10px] font-bold"
      style={{ width: "21cm", height: "29.7cm" }}
    >
      <img
        src={activeTemplate || img}
        className="w-full h-full "
        alt="unable"
        hidden={hidden}
      ></img>
      {hidden === false ? (
        typeText === "bl" ? (
          <div className="text-center text-[15px] text-bold h-[18px] w-[150px]  bg-white absolute top-[19px] left-[580px]">
            BL DRAFT
          </div>
        ) : typeText === "original" ? (
          <div className="text-red-500 text-center text-[15px] text-bold h-[18px] w-[150px]  bg-white absolute top-[19px] left-[580px]">
            ORIGINAL
          </div>
        ) : (
          <></>
        )
      ) : (
        <div className=" text-center text-[15px] text-bold h-[18px] w-[150px]  bg-white absolute top-[19px] left-[580px]"></div>
      )}

      <div className="absolute" style={{ ...fieldPosition("MTDNo") }}>
        <p>{MTDNo}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("ShipmentRef") }}>
        <p>{ShipmentRef}</p>
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("Consignor"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Consignor}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("Consignee"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Consignee}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("NotifyParty"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {NotifyParty}
      </div>

      <div className="absolute" style={{ ...fieldPosition("PlaceOfAcceptance") }}>
        <p>{PlaceOfAcceptance}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("DateOfAcceptance") }}>
        <p>{DateOfAcceptance}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("PortOfLoading") }}>
        <p>{PortOfLoading}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("PortOfDischarge") }}>
        <p>{PortOfDischarge}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("VesselVoyage") }}>
        <p>{VesselVoyage}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("PlaceOfDelivery") }}>
        <p>{PlaceOfDelivery}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("DateOfDelivery") }}>
        <p>{DateOfDelivery}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("ModeOfTransport") }}>
        <p>{ModeOfTransport}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("Route") }}>
        <p>{Route}</p>
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("ContainerNo"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {ContainerNo}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("Marks"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Marks}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("Description"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Description}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("GrossWeight"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {GrossWeight}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("Measurement"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Measurement}
      </div>
      <div
        className="absolute"
        style={{
          ...fieldPosition("DeliveryAgent"),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {DeliveryAgent}
      </div>
      <div className="absolute" style={{ ...fieldPosition("FreightAmount") }}>
        <p>{FreightAmount}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("NumberOfBl") }}>
        <p>{NumberOfBl}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("PlaceAndDate") }}>
        <p>{PlaceAndDate}</p>
      </div>
      <div className="absolute" style={{ ...fieldPosition("FreightPayable") }}>
        <p>{FreightPayable}</p>
      </div>
      {isApproved && showStamp && (
        <div className="absolute left-[510px] top-[840px] -rotate-12 border-4 border-red-500/70 bg-white/70 px-4 py-2 text-[24px] font-black uppercase tracking-[0.2em] text-red-500/70">
          Approved
        </div>
      )}
      {isApproved && showSignature && (
        <div className="absolute left-[545px] top-[920px] bg-white/80">
          <img src={signImg} className="h-[85px] w-auto" alt="approval signature"></img>
        </div>
      )}
    </div>
  );
});
