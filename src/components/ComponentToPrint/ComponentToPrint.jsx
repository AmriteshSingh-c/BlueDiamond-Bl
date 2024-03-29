import React from "react";
import img from "../../outline_page.jpg";
import signImg from "../../Sign_page-0001.jpg";
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
    showSign,
    express,
    shipDate,
    showShipDate
  } = props;
 
  return (
    <div
      ref={ref}
      className="relative text-[10px] font-bold"
      style={{ width: "21cm", height: "29.7cm" }}
    >
      <img
        src={img}
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

      <div className="absolute top-[48px] left-[600px]">
        <p>{MTDNo}</p>
      </div>
      <div className="absolute top-[72px] left-[600px]">
        <p>{ShipmentRef}</p>
      </div>
      <div
        className="absolute top-[72px] left-[20px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Consignor}
      </div>
      <div
        className="absolute top-[157px] left-[20px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Consignee}
      </div>
      <div
        className="absolute top-[239px] left-[20px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {NotifyParty}
      </div>

      <div className="absolute top-[325px] left-[20px]">
        <p>{PlaceOfAcceptance}</p>
      </div>
      <div className="absolute top-[325px] left-[250px]">
        <p>{DateOfAcceptance}</p>
      </div>
      <div className="absolute top-[365px] left-[20px]">
        <p>{PortOfLoading}</p>
      </div>
      <div className="absolute top-[365px] left-[203px]">
        <p>{PortOfDischarge}</p>
      </div>
      <div className="absolute top-[403px] left-[20px]">
        <p>{VesselVoyage}</p>
      </div>
      <div className="absolute top-[440px] left-[20px]">
        <p>{PlaceOfDelivery}</p>
      </div>
      <div className="absolute top-[440px] left-[250px]">
        <p>{DateOfDelivery}</p>
      </div>
      <div className="absolute top-[440px] left-[400px]">
        <p>{ModeOfTransport}</p>
      </div>
      <div className="absolute top-[440px] left-[590px]">
        <p>{Route}</p>
      </div>
      <div
        className="absolute top-[488px] left-[20px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {ContainerNo}
      </div>
      <div
        className="absolute top-[488px] left-[135px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Marks}
      </div>
      <div
        className="absolute top-[492px] left-[285px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Description}
      </div>
      <div
        className="absolute top-[486px] left-[555px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {GrossWeight}
      </div>
      <div
        className="absolute top-[486px] left-[685px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {Measurement}
      </div>
      {showShipDate==="true"&&<div
        className="absolute top-[736px] left-[650px] font-bold"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        <p>SHIPPED ON BOARD</p>
        <p>{shipDate}</p>
      </div>
      }
      {express==="true" &&
      <div
        className="absolute top-[770px] left-[650px] font-bold text-[16px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        EXPRESS BL
      </div>
      }
      <div
        className="absolute top-[874px] left-[20px]"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          textAlign: "left",
        }}
      >
        {DeliveryAgent}
      </div>
      <div className="absolute top-[872px] left-[400px]">
        <p>{FreightAmount}</p>
      </div>
      <div className="absolute top-[874px] left-[575px]">
        <p>{NumberOfBl}</p>
      </div>
      <div className="absolute top-[873px] left-[635px]">
        <p>{PlaceAndDate}</p>
      </div>
      <div className="absolute top-[930px] left-[400px]">
        <p>{FreightPayable}</p>
      </div>
      {(sign === "true" && showSign==="true")&& (
        <div className="bg-blue-500 text-white absolute top-[930px] left-[550px]">
          <img src={signImg} className="w-full h-[85px] " alt="unable"></img>
        </div>
      )}
    </div>
  );
});
