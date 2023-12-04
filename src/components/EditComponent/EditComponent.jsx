import "./EditComponent.css";
import { useState } from "react";
import React, { useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { UserAuth } from "../../context/AuthContext";
import { onSnapshot, collection, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ComponentToPrint } from "../ComponentToPrint/ComponentToPrint";
import { AttachedSheet } from "../AttachedSheet/AttachedSheet";
export const EditComponent = () => {
  const [Consignor, setConsignor] = useState("");
  const [Consignee, setConsignee] = useState("");
  const [NotifyParty, setNotifyParty] = useState("");
  const [PlaceOfAcceptance, setPlaceOfAcceptance] = useState("");
  const [DateOfAcceptance, setDateofAcceptance] = useState("");
  const [PortOfLoading, setPlaceOfLoading] = useState("");
  const [PortOfDischarge, setPlaceOfDischarge] = useState("");
  const [VesselVoyage, setVesselVoyage] = useState("");
  const [PlaceOfDelivery, setPlaceOfDelivery] = useState("");
  const [DateOfDelivery, setDateOfDelivery] = useState("");
  const [ModeOfTransport, setModeOfTransport] = useState("");
  const [Route, setRoute] = useState("");
  const [ContainerNo, setContainerNo] = useState("");
  const [Marks, setMarks] = useState("");
  const [Description, setDescription] = useState("");
  const [GrossWeight, setGrossWeight] = useState("");
  const [Measurement, setMeasurement] = useState("");
  const [DeliveryAgent, setDeliveryAgent] = useState("");
  const [FreightAmount, setFreightAmount] = useState("");
  const [NumberOfBl, setNumberOfBl] = useState("");
  const [PlaceAndDate, setPlaceAndDate] = useState("");
  const [FreightPayable, setFreightPayable] = useState("");
  const [MTDNo, setMTDNo] = useState("");
  const [ShipmentRef, setShipmentRef] = useState("");
  const [JobNo, setJobNO] = useState("");
  const [hidden, setHidden] = useState(false);
  const [typeText, setTypeText] = useState("");
  const [sign, setSign] = useState(false);
  const [attachedSheetMarks, setAttachedSheetMarks] = useState("");
  const [attachedSheetDescription, setAttachedSheetDescription] = useState("");
  const [text, setText] = useState("New");

  const { user } = UserAuth();

  const componentRef = useRef();
  const attachedRef = useRef();
  const [BlDrafts, setBlDrafts] = useState([]);
  const [SearchText, setSearchText] = useState("");
  const [CurrBl, setCurrBl] = useState({});
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handlePrintAttached = useReactToPrint({
    content: () => attachedRef.current,
  });
  const handleHidden = () => {
    if (hidden === false) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  };

  useEffect(
    () =>
      onSnapshot(collection(db, "bldraft"), (snapshot) =>
        setBlDrafts(snapshot.docs.map((document) => document.data()))
      ),

    []
  );
  const handleBl = () => {
    setTypeText("bl");
  };

  const handleOriginal = () => {
    setTypeText("original");
  };
  const handleNegotiable = () => {
    setTypeText("");
  };

  const handleSubmit = () => {
    let curr = {};
    BlDrafts.forEach((docs) => {
      Object.keys(docs).forEach((key) => {
        if (key === "JobNo" && docs[key] === SearchText) {
          curr = { ...docs };
        }
      });
    });

    setCurrBl(curr);
    setConsignee(curr.Consignee ? curr.Consignee : "");
    setConsignor(curr.Consignor ? curr.Consignor : "");
    setNotifyParty(curr.NotifyParty ? curr.NotifyParty : "");
    setPlaceOfAcceptance(curr.PlaceOfAcceptance ? curr.PlaceOfAcceptance : "");
    setDateofAcceptance(curr.DateOfAcceptance ? curr.DateOfAcceptance : "");
    setPlaceOfLoading(curr.PortOfLoading ? curr.PortOfLoading : "");
    setPlaceOfDischarge(curr.PortOfDischarge ? curr.PortOfDischarge : "");
    setVesselVoyage(curr.VesselVoyage ? curr.VesselVoyage : "");
    setPlaceOfDelivery(curr.PlaceOfDelivery ? curr.PlaceOfDelivery : "");
    setDateOfDelivery(curr.DateOfDelivery ? curr.DateOfDelivery : "");
    setModeOfTransport(curr.ModeOfTransport ? curr.ModeOfTransport : "");
    setRoute(curr.Route ? curr.Route : "");
    setContainerNo(curr.ContainerNo ? curr.ContainerNo : "");
    setMarks(curr.Marks ? curr.Marks : "");
    setDescription(curr.Description ? curr.Description : "");
    setGrossWeight(curr.GrossWeight ? curr.GrossWeight : "");
    setMeasurement(curr.Measurement ? curr.Measurement : "");
    setDeliveryAgent(curr.DeliveryAgent ? curr.DeliveryAgent : "");
    setFreightAmount(curr.FreightAmount ? curr.FreightAmount : "");
    setNumberOfBl(curr.NumberOfBl ? curr.NumberOfBl : "");
    setPlaceAndDate(curr.PlaceAndDate ? curr.PlaceAndDate : "");
    setFreightPayable(curr.FreightPayable ? curr.FreightPayable : "");
    setMTDNo(curr.MTDNo ? curr.MTDNo : "");
    setShipmentRef(curr.ShipmentRef ? curr.ShipmentRef : "");
    setJobNO(curr.JobNo ? curr.JobNo : "");
    setSign(curr.sign ? curr.sign : "false");
    setTypeText(curr.typeText ? curr.typeText : "");
    setAttachedSheetMarks(
      curr.attachedSheetMarks ? curr.attachedSheetMarks : ""
    );
    setAttachedSheetDescription(
      curr.attachedSheetDescription ? curr.attachedSheetDescription : ""
    );
    setText("Edit");
    toast("Fetched Sucessfully");
  };
  const handleSave = async () => {
    const docRef = doc(db, "bldraft", JobNo);
    setCurrBl({
      Consignee: Consignee,
      Consignor: Consignor,
      NotifyParty: NotifyParty,
      PlaceOfAcceptance: PlaceOfAcceptance,
      DateOfAcceptance: DateOfAcceptance,
      PortOfLoading: PortOfLoading,
      PortOfDischarge: PortOfDischarge,
      VesselVoyage: VesselVoyage,
      PlaceOfDelivery: PlaceOfDelivery,
      DateOfDelivery: DateOfDelivery,
      ModeOfTransport: ModeOfTransport,
      Route: Route,
      ContainerNo: ContainerNo,
      Marks: Marks,
      Description: Description,
      GrossWeight: GrossWeight,
      Measurement: Measurement,
      DeliveryAgent: DeliveryAgent,
      FreightAmount: FreightAmount,
      NumberOfBl: NumberOfBl,
      PlaceAndDate: PlaceAndDate,
      FreightPayable: FreightPayable,
      MTDNo: MTDNo,
      ShipmentRef: ShipmentRef,
      JobNo: JobNo,
      sign: sign,
      lastEdited: user.email,
      typeText: typeText,
      attachedSheetDescription: attachedSheetDescription,
      attachedSheetMarks: attachedSheetMarks,
    });

    const payload = CurrBl;
    await setDoc(docRef, payload);
    toast("Saved SuccessFully");
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="p-[10px] ml-[15px]">
        <div className="flex flex-col justify-center w-full items-center">
          <div className="flex items-center">
            <h2 className="text-[40px] font-bold ml-[150px]">HOUSE B/L</h2>
          </div>
        </div>
        <div className="w-full relative border-2 border-solid flex flex-row items-center">
          <div className="relative w-[45%]">
            <label className="absolute">Search JOB NO</label>
            <input
              type="text"
              name="searchtext"
              className="w-[50%] ml-[225px] "
              onChange={(e) => setSearchText(e.target.value)}
            ></input>
          </div>
          <div className="w-[22%]">
            <button
              type="button"
              onClick={handleSubmit}
              className="border-2 border-solid  ml-[10px] h-[30px] w-[120px] text-gray-300 text-2xl font-extrabold bg-green-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
            >
              Search
            </button>
          </div>
          <div className="w-[22%]">
            <button
              type="button"
              onClick={handleSave}
              className="border-2 border-solid  ml-[10px] h-[30px] w-[120px] text-black-800 text-2xl font-black bg-yellow-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
            >
              Save
            </button>
          </div>
        </div>
        <div className="w-full mt-[20px] mb-[20px] flex justify-center items-center text-3xl font-bold">
          <h2>{text} B/L</h2>
        </div>
        <div className="ml-[25px] mt-[20px] mb-[20px] border-2 border-solid">
          <div className="mt-[10px] relative w-[75%]">
            <label className="absolute">Job NO</label>
            <input
              type="text"
              className="w-[80%] ml-[225px] "
              value={JobNo}
              onChange={(e) => {
                setJobNO(e.target.value);
              }}
            ></input>
          </div>
          <div className="p-[10px] mt-[10px] relative flex flex-row w-full border-2 border-solid">
            <div className="w-[45%]">
              <label className="absolute font-bold text-[20px]">
                Consignor
              </label>
              <textarea
                rows="5"
                cols="60"
                className=" mt-[28px] w-[80%]"
                value={Consignor}
                onChange={(e) => {
                  setConsignor(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="relative w-[45%]">
              <label className="absolute">Consignee</label>

              <textarea
                rows="5"
                cols="60"
                className=" mt-[28px] w-[80%]"
                value={Consignee}
                onChange={(e) => {
                  setConsignee(e.target.value);
                }}
              ></textarea>
            </div>
          </div>
          <div className="p-[10px] border-2 border-solid mt-[20px] flex flex-row w-[full]">
            <div className="relative w-[45%]">
              <label className="absolute">Notify party</label>

              <textarea
                rows="5"
                cols="60"
                className="mt-[28px]   w-[80%]"
                value={NotifyParty}
                onChange={(e) => {
                  setNotifyParty(e.target.value);
                }}
              ></textarea>
            </div>
            <div className=" w-[45%] relative flex flex-col w-full">
              <div className="mt-[35px]  relative  w-[75%]">
                <label className="absolute">MTD NO</label>
                <input
                  type="text"
                  className="w-[80%] ml-[225px] "
                  value={MTDNo}
                  onChange={(e) => {
                    setMTDNo(e.target.value);
                  }}
                ></input>
              </div>
              <div className="mt-[30px] relative w-[75%]">
                <label className="absolute">Shipment reference</label>
                <input
                  type="text"
                  className="w-[80%] ml-[225px] "
                  value={ShipmentRef}
                  onChange={(e) => {
                    setShipmentRef(e.target.value);
                  }}
                ></input>
              </div>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-[80px] items-center ">
            <div className="realtive w-[55%]">
              <label className="absolute">Place of Acceptance</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={PlaceOfAcceptance}
                onChange={(e) => {
                  setPlaceOfAcceptance(e.target.value);
                }}
              ></input>
            </div>
            <div className="w-[55%] relative ">
              <label className="absolute">Date of Acceptance</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={DateOfAcceptance}
                onChange={(e) => {
                  setDateofAcceptance(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-[80px] items-center ">
            <div className="w-[55%] relative">
              <label className="absolute">Port of Loading</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={PortOfLoading}
                onChange={(e) => {
                  setPlaceOfLoading(e.target.value);
                }}
              ></input>
            </div>
            <div className="w-[55%] relative">
              <label className="absolute">Port of Discharge</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={PortOfDischarge}
                onChange={(e) => {
                  setPlaceOfDischarge(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-[80px] items-center ">
            <div className="w-[55%] relative">
              <label className="absolute">Vessel & Voyage Np.</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={VesselVoyage}
                onChange={(e) => {
                  setVesselVoyage(e.target.value);
                }}
              ></input>
            </div>
            <div className="w-[55%] relative">
              <label className="absolute">Place of Delivery</label>
              <input
                type="text"
                className="w-[65%] ml-[200px]"
                value={PlaceOfDelivery}
                onChange={(e) => {
                  setPlaceOfDelivery(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-[80px] items-center ">
            <div className="w-[55%] relative">
              <label className="absolute">Date or Period of Delivery</label>
              <input
                type="text"
                className="w-[65%] ml-[260px]"
                value={DateOfDelivery}
                onChange={(e) => {
                  setDateOfDelivery(e.target.value);
                }}
              ></input>
            </div>
            <div className="w-[55%] relative">
              <label className="absolute">Modes means of transport</label>
              <input
                type="text"
                className="w-[65%] ml-[260px]"
                value={ModeOfTransport}
                onChange={(e) => {
                  setModeOfTransport(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-[80px] items-center ">
            <label>Route/place of transhipment</label>
            <input
              type="text"
              className=" ml-[10px] w-[32%]"
              value={Route}
              onChange={(e) => {
                setRoute(e.target.value);
              }}
            ></input>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-auto items-center justify-around">
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Container No.(s)</label>
              <textarea
                rows="25"
                cols="60"
                className="mt-[28px]"
                value={ContainerNo}
                onChange={(e) => {
                  setContainerNo(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Marks and Numbers</label>
              <textarea
                rows="25"
                cols="60"
                className="mt-[28px]"
                value={Marks}
                onChange={(e) => {
                  setMarks(e.target.value);
                }}
              ></textarea>
            </div>

            <div className="">
              <label className="mr-[20px]">
                <p className="text-center">
                  Number of Packages,kinds of packages<br></br>(General
                  description of goods said to contain)
                </p>
              </label>
              <textarea
                rows="25"
                cols="60"
                value={Description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              ></textarea>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-auto items-center justify-around">
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Attached Marks</label>
              <textarea
                rows="25"
                cols="60"
                className="mt-[28px]"
                value={attachedSheetMarks}
                onChange={(e) => {
                  setAttachedSheetMarks(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Attached Descriptiom</label>
              <textarea
                rows="25"
                cols="60"
                className="mt-[28px]"
                value={attachedSheetDescription}
                onChange={(e) => {
                  setAttachedSheetDescription(e.target.value);
                }}
              ></textarea>
            </div>
          </div>

          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-auto items-center justify-around">
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Gross Weight</label>
              <textarea
                rows="10"
                cols="50"
                className="mt-[28px]"
                value={GrossWeight}
                onChange={(e) => {
                  setGrossWeight(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Measurement</label>
              <textarea
                rows="10"
                cols="50"
                className="mt-[28px]"
                value={Measurement}
                onChange={(e) => {
                  setMeasurement(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="w-auto relative flex justify-center">
              <label className="absolute">Delivery agent</label>
              <textarea
                rows="10"
                cols="50"
                value={DeliveryAgent}
                className="mt-[28px]"
                onChange={(e) => {
                  setDeliveryAgent(e.target.value);
                }}
              ></textarea>
            </div>
          </div>
          <div className="p-[10px] relative border-2 border-solid mt-[20px] flex flex-row h-auto items-center justify-around">
            <div className="relative w-[22%] flex justify-center">
              <label className="absolute">Freight amount</label>
              <input
                type="text"
                className="mt-[28px] w-[80%]"
                value={FreightAmount}
                onChange={(e) => {
                  setFreightAmount(e.target.value);
                }}
              ></input>
            </div>
            <div className="relative w-[22%] flex justify-center">
              <label className="absolute">Number of Original Bl/Mtd(s)</label>
              <input
                type="text"
                className="mt-[28px] w-[80%]"
                value={NumberOfBl}
                onChange={(e) => {
                  setNumberOfBl(e.target.value);
                }}
              ></input>
            </div>
            <div className="relative w-[22%] flex justify-center">
              <label className="absolute">Place and date of issue</label>
              <input
                type="text"
                className="mt-[28px] w-[80%]"
                value={PlaceAndDate}
                onChange={(e) => {
                  setPlaceAndDate(e.target.value);
                }}
              ></input>
            </div>
            <div className="relative w-[22%] flex justify-center">
              <label className="absolute ">Freight payable</label>
              <input
                type="text"
                className="mt-[28px] w-[80%]"
                value={FreightPayable}
                onChange={(e) => {
                  setFreightPayable(e.target.value);
                }}
              ></input>
            </div>
          </div>
          <div className="ml-[10px] border-2 border-solid flex justify-center">
            <ComponentToPrint
              Consignee={Consignee}
              Consignor={Consignor}
              NotifyParty={NotifyParty}
              PlaceOfAcceptance={PlaceOfAcceptance}
              DateOfAcceptance={DateOfAcceptance}
              PortOfLoading={PortOfLoading}
              PortOfDischarge={PortOfDischarge}
              VesselVoyage={VesselVoyage}
              PlaceOfDelivery={PlaceOfDelivery}
              DateOfDelivery={DateOfDelivery}
              ModeOfTransport={ModeOfTransport}
              Route={Route}
              ContainerNo={ContainerNo}
              Marks={Marks}
              Description={Description}
              GrossWeight={GrossWeight}
              Measurement={Measurement}
              DeliveryAgent={DeliveryAgent}
              FreightAmount={FreightAmount}
              NumberOfBl={NumberOfBl}
              PlaceAndDate={PlaceAndDate}
              FreightPayable={FreightPayable}
              MTDNo={MTDNo}
              ShipmentRef={ShipmentRef}
              JobNo={JobNo}
              hidden={hidden}
              sign={sign}
              typeText={typeText}
              ref={componentRef}
            />
            <div className="flex flex-col">
              <div className="flex flex-row">
                <button
                  onClick={handlePrint}
                  className="border-2 border-solid mt-[150px] text-black-800 text-2xl font-black bg-green-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
                >
                  Print
                </button>
                <button
                  onClick={handleHidden}
                  className="border-2 border-solid mt-[150px] ml-[10px] h-[30px] w-[120px] text-black-800 text-2xl font-black bg-yellow-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
                >
                  {hidden ? "Show" : "Hide"}
                </button>
              </div>
              <div className="flex flex-row">
                <button
                  onClick={handleOriginal}
                  className="border-2 border-solid mt-[150px] text-black-800 text-2xl font-black bg-green-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
                >
                  Original
                </button>
                <button
                  onClick={handleBl}
                  className="border-2 border-solid mt-[150px] ml-[10px] h-[30px] w-[120px] text-black-800 text-2xl font-black bg-yellow-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
                >
                  Bl Draft
                </button>
                <button
                  onClick={handleNegotiable}
                  className="border-2 border-solid mt-[150px] ml-[10px] h-[30px] w-[150px] text-black-800 text-2xl font-black bg-yellow-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
                >
                  Negotiable
                </button>
              </div>
            </div>

            {/* <button
            onClick={handleEmail}
            className="border-2 border-solid mt-[150px] ml-[10px] h-[30px] w-[120px] text-black-800 text-2xl font-black bg-yellow-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
          >
            Send Mail
          </button> */}
            {/* <a href="mailto:email@example.com?subject='Hello from Abstract!'&body='Just popped in to say hello'">
            Click to Send an Email
          </a> */}
          </div>
          <div className="ml-[10px] border-2 border-solid flex justify-center">
            <AttachedSheet
              attachedSheetDescription={attachedSheetDescription}
              attachedSheetMarks={attachedSheetMarks}
              MTDNo={MTDNo}
              PortOfLoading={PortOfLoading}
              PortOfDischarge={PortOfDischarge}
              ref={attachedRef}
              sign={sign}
            />
            <div className="flex flex-row">
              <button
                onClick={handlePrintAttached}
                className="border-2 border-solid mt-[150px] text-black-800 text-2xl font-black bg-green-500 ml-[30px] h-[40px] w-[120px] rounded-[12px]"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
