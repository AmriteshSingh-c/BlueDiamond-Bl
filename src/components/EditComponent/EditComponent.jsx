import "./EditComponent.css";
import { useState, useCallback } from "react";
import React, { useRef, useEffect } from "react";
import { UserAuth } from "../../context/AuthContext";
import {
  onSnapshot,
  collection,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ComponentToPrint } from "../ComponentToPrint/ComponentToPrint";
import { AttachedSheet } from "../AttachedSheet/AttachedSheet";
export const EditComponent = ({ selectedJobNo }) => {
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
  const [showSignature, setShowSignature] = useState(true);
  const [showStamp, setShowStamp] = useState(true);
  const [text, setText] = useState("New");
  const [attachedSheets, setAttachedSheets] = useState([
    { id: 1, marks: "", description: "" },
  ]);
  const [fieldSuggestions, setFieldSuggestions] = useState({});

  const { user } = UserAuth();

  const componentRef = useRef();
  const attachedSheetsRef = useRef();
  const [BlDrafts, setBlDrafts] = useState([]);
  const [SearchText, setSearchText] = useState("");

  const normalizeConsignorKey = (value) => {
    const normalized = (value || "").trim().toLowerCase();
    return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "new-consignor";
  };

  const saveConsignorFieldSuggestion = async (fieldName, fieldValue) => {
    const ignoredFields = ["Consignee", "NotifyParty", "Consignor"];
    if (
      ignoredFields.includes(fieldName) ||
      !db ||
      !fieldName ||
      !fieldValue ||
      !Consignor.trim()
    ) {
      return;
    }

    const key = normalizeConsignorKey(Consignor);
    const value = String(fieldValue).trim();
    if (!value) {
      return;
    }

    const docRef = doc(db, "consignorProfiles", key);
    const snapshot = await getDoc(docRef);
    const existing = snapshot.exists() ? snapshot.data().fieldValues || {} : {};
    const currentValues = Array.isArray(existing[fieldName]) ? existing[fieldName] : [];
    const mergedValues = [...new Set([value, ...currentValues])].slice(0, 25);

    const nextData = {
      consignor: Consignor.trim(),
      fieldValues: {
        ...existing,
        [fieldName]: mergedValues,
      },
    };

    await setDoc(docRef, nextData, { merge: true });
    setFieldSuggestions((prev) => ({
      ...prev,
      [fieldName]: mergedValues,
    }));
  };

  const normalizeAttachedSheets = (value) => {
    if (!Array.isArray(value) || value.length === 0) {
      return [{ id: 1, marks: "", description: "" }];
    }

    const normalized = value.map((sheet, index) => ({
      id: sheet.id ?? `${Date.now()}-${index}`,
      marks: sheet.marks ?? sheet.attachedSheetMarks ?? "",
      description: sheet.description ?? sheet.attachedSheetDescription ?? "",
    }));

    const cleaned = normalized.filter(
      (sheet, index) =>
        index === 0 ||
        sheet.marks.trim() ||
        sheet.description.trim() ||
        normalized.length === 1
    );

    return cleaned.length ? cleaned : [{ id: Date.now(), marks: "", description: "" }];
  };

  const addAttachedSheet = () => {
    setAttachedSheets((prev) => [
      ...normalizeAttachedSheets(prev),
      { id: Date.now() + Math.random(), marks: "", description: "" },
    ]);
  };

  const updateAttachedSheet = (sheetId, field, value) => {
    setAttachedSheets((prev) =>
      prev.map((sheet) =>
        sheet.id === sheetId ? { ...sheet, [field]: value } : sheet
      )
    );
  };

  const removeAttachedSheet = (sheetId) => {
    setAttachedSheets((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((sheet) => sheet.id !== sheetId);
    });
  };

  const openPrintableWindow = (node, title = "BlueDiamond BL") => {
    if (!node) {
      toast("Print preview is not available for this document yet.");
      return;
    }

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    document.body.appendChild(frame);

    const clone = node.cloneNode(true);
    const printMarkup = `
      <!doctype html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, sans-serif; background: #fff; }
            @page { size: A4 portrait; margin: 12mm; }
            .print-shell { width: 100%; display: flex; justify-content: center; }
            .print-shell > * { max-width: 100%; }
          </style>
        </head>
        <body>
          <div class="print-shell">${clone.outerHTML}</div>
        </body>
      </html>
    `;

    frame.srcdoc = printMarkup;
    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(frame);
        }, 900);
      }
    };
  };

  const handlePrint = () => {
    openPrintableWindow(componentRef.current, "BlueDiamond BL Print Preview");
  };

  const handlePrintAttached = () => {
    openPrintableWindow(attachedSheetsRef.current, "BlueDiamond Attached Sheets");
  };
  const handleHidden = () => {
    if (hidden === false) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  };

  useEffect(() => {
    if (!db) {
      setBlDrafts([]);
      setFieldSuggestions({});
      return undefined;
    }

    return onSnapshot(collection(db, "bldraft"), (snapshot) => {
      setBlDrafts(snapshot.docs.map((document) => document.data()));
    });
  }, []);

  useEffect(() => {
    if (!db || !Consignor.trim()) {
      setFieldSuggestions({});
      return undefined;
    }

    const fetchSuggestions = async () => {
      const profile = await getDoc(doc(db, "consignorProfiles", normalizeConsignorKey(Consignor)));
      if (profile.exists()) {
        setFieldSuggestions(profile.data().fieldValues || {});
      } else {
        setFieldSuggestions({});
      }
    };

    fetchSuggestions();
    return undefined;
  }, [Consignor]);

  const loadDraftByJobNo = useCallback((jobNo) => {
    const normalizedJobNo = (jobNo || "").trim();
    if (!normalizedJobNo) {
      return;
    }

    let curr = {};
    BlDrafts.forEach((docs) => {
      Object.keys(docs).forEach((key) => {
        if (key === "JobNo" && docs[key] === normalizedJobNo) {
          curr = { ...docs };
        }
      });
    });

    if (!curr.JobNo) {
      toast("No matching draft found for this job number.");
      return;
    }

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
    setShowSignature(curr.showSignature !== undefined ? curr.showSignature : true);
    setShowStamp(curr.showStamp !== undefined ? curr.showStamp : true);
    setTypeText(curr.typeText ? curr.typeText : "");
    setAttachedSheets(
      Array.isArray(curr.attachedSheets) && curr.attachedSheets.length
        ? normalizeAttachedSheets(curr.attachedSheets)
        : [
            {
              id: 1,
              marks: curr.attachedSheetMarks ? curr.attachedSheetMarks : "",
              description: curr.attachedSheetDescription
                ? curr.attachedSheetDescription
                : "",
            },
          ]
    );
    setText("Edit");
    toast("Fetched Sucessfully");
  }, [BlDrafts]);

  useEffect(() => {
    if (selectedJobNo) {
      setSearchText(selectedJobNo);
      loadDraftByJobNo(selectedJobNo);
    }
  }, [selectedJobNo, loadDraftByJobNo]);
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
    loadDraftByJobNo(SearchText);
  };
  const handleSave = async () => {
    const normalizedAttachedSheets = normalizeAttachedSheets(attachedSheets)
      .filter((sheet, index, list) => {
        const hasContent = Boolean(sheet.marks?.trim() || sheet.description?.trim());
        return hasContent || index === 0 || list.length === 1;
      })
      .map((sheet) => ({
        ...sheet,
        marks: sheet.marks || "",
        description: sheet.description || "",
      }));

    const payload = {
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
      showSignature: showSignature,
      showStamp: showStamp,
      lastEdited: user ? user.email : "demo-user",
      typeText: typeText,
      attachedSheets: normalizedAttachedSheets,
      attachedSheetDescription:
        normalizedAttachedSheets[0]?.description || "",
      attachedSheetMarks: normalizedAttachedSheets[0]?.marks || "",
    };

    if (!db) {
      const currentDrafts = JSON.parse(localStorage.getItem("blueDiamondLocalDrafts") || "[]");
      const nextDrafts = [...currentDrafts.filter((entry) => entry.JobNo !== JobNo), payload];
      localStorage.setItem("blueDiamondLocalDrafts", JSON.stringify(nextDrafts));
      toast("Saved locally in the preview environment.");
      return;
    }

    const docRef = doc(db, "bldraft", JobNo);
    await setDoc(docRef, payload);
    toast("Saved SuccessFully");
  };

  return (
    <div className="space-y-6 pb-8">
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

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="panel flex-1 overflow-hidden">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold text-slate-900">HOUSE B/L</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <label className="text-sm font-medium text-slate-600">Search JOB NO</label>
                <input
                  type="text"
                  name="searchtext"
                  className="w-36 border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Job no"
                  onChange={(e) => setSearchText(e.target.value)}
                ></input>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="primary-button"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="secondary-button"
              >
                Save
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-center">
            <h3 className="text-2xl font-bold text-slate-900">{text} B/L</h3>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Job NO</label>
              <input
                type="text"
                className="input-field"
                value={JobNo}
                onChange={(e) => {
                  setJobNO(e.target.value);
                }}
              ></input>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Consignor</label>
              <input
                type="text"
                className="input-field"
                value={Consignor}
                onChange={(e) => {
                  setConsignor(e.target.value);
                }}
              ></input>
              <p className="mt-2 text-xs text-slate-500">
                Saved suggestions are kept only for this consignor profile.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Consignee</label>
                <textarea
                  rows="5"
                  className="input-field min-h-[130px]"
                  value={Consignee}
                  onChange={(e) => {
                    setConsignee(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Notify party</label>
                <textarea
                  rows="5"
                  className="input-field min-h-[130px]"
                  value={NotifyParty}
                  onChange={(e) => {
                    setNotifyParty(e.target.value);
                  }}
                ></textarea>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">MTD NO</label>
                  <input
                    type="text"
                    className="input-field"
                    value={MTDNo}
                    onChange={(e) => {
                      setMTDNo(e.target.value);
                    }}
                  ></input>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Shipment reference</label>
                  <input
                    type="text"
                    className="input-field"
                    value={ShipmentRef}
                    onChange={(e) => {
                      setShipmentRef(e.target.value);
                    }}
                  ></input>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Place of Acceptance</label>
                <input
                  type="text"
                  className="input-field"
                  value={PlaceOfAcceptance}
                  onChange={(e) => {
                    setPlaceOfAcceptance(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Date of Acceptance</label>
                <input
                  type="text"
                  className="input-field"
                  value={DateOfAcceptance}
                  onChange={(e) => {
                    setDateofAcceptance(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Port of Loading</label>
                <input
                  type="text"
                  className="input-field"
                  value={PortOfLoading}
                  list="port-of-loading-suggestions"
                  onChange={(e) => {
                    setPlaceOfLoading(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("PortOfLoading", e.target.value);
                    }
                  }}
                ></input>
                {fieldSuggestions.PortOfLoading && (
                  <datalist id="port-of-loading-suggestions">
                    {fieldSuggestions.PortOfLoading.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Port of Discharge</label>
                <input
                  type="text"
                  className="input-field"
                  value={PortOfDischarge}
                  list="port-of-discharge-suggestions"
                  onChange={(e) => {
                    setPlaceOfDischarge(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("PortOfDischarge", e.target.value);
                    }
                  }}
                ></input>
                {fieldSuggestions.PortOfDischarge && (
                  <datalist id="port-of-discharge-suggestions">
                    {fieldSuggestions.PortOfDischarge.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Vessel & Voyage Np.</label>
                <input
                  type="text"
                  className="input-field"
                  value={VesselVoyage}
                  list="vessel-voyage-suggestions"
                  onChange={(e) => {
                    setVesselVoyage(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("VesselVoyage", e.target.value);
                    }
                  }}
                ></input>
                {fieldSuggestions.VesselVoyage && (
                  <datalist id="vessel-voyage-suggestions">
                    {fieldSuggestions.VesselVoyage.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Place of Delivery</label>
                <input
                  type="text"
                  className="input-field"
                  value={PlaceOfDelivery}
                  list="place-of-delivery-suggestions"
                  onChange={(e) => {
                    setPlaceOfDelivery(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("PlaceOfDelivery", e.target.value);
                    }
                  }}
                ></input>
                {fieldSuggestions.PlaceOfDelivery && (
                  <datalist id="place-of-delivery-suggestions">
                    {fieldSuggestions.PlaceOfDelivery.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Date or Period of Delivery</label>
                <input
                  type="text"
                  className="input-field"
                  value={DateOfDelivery}
                  onChange={(e) => {
                    setDateOfDelivery(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Modes means of transport</label>
                <input
                  type="text"
                  className="input-field"
                  value={ModeOfTransport}
                  list="mode-of-transport-suggestions"
                  onChange={(e) => {
                    setModeOfTransport(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("ModeOfTransport", e.target.value);
                    }
                  }}
                ></input>
                {fieldSuggestions.ModeOfTransport && (
                  <datalist id="mode-of-transport-suggestions">
                    {fieldSuggestions.ModeOfTransport.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Route/place of transhipment</label>
              <input
                type="text"
                className="input-field"
                value={Route}
                list="route-suggestions"
                onChange={(e) => {
                  setRoute(e.target.value);
                  if (e.target.value.trim()) {
                    saveConsignorFieldSuggestion("Route", e.target.value);
                  }
                }}
              ></input>
              {fieldSuggestions.Route && (
                <datalist id="route-suggestions">
                  {fieldSuggestions.Route.map((value) => (
                    <option key={value} value={value} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Container No.(s)</label>
                <textarea
                  rows="8"
                  className="input-field min-h-[160px]"
                  value={ContainerNo}
                  onChange={(e) => {
                    setContainerNo(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Marks and Numbers</label>
                <textarea
                  rows="8"
                  className="input-field min-h-[160px]"
                  value={Marks}
                  onChange={(e) => {
                    setMarks(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Number of Packages / description</label>
                <textarea
                  rows="8"
                  className="input-field min-h-[160px]"
                  value={Description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                ></textarea>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Gross Weight</label>
                <textarea
                  rows="5"
                  className="input-field min-h-[110px]"
                  value={GrossWeight}
                  onChange={(e) => {
                    setGrossWeight(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Measurement</label>
                <textarea
                  rows="5"
                  className="input-field min-h-[110px]"
                  value={Measurement}
                  onChange={(e) => {
                    setMeasurement(e.target.value);
                  }}
                ></textarea>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Delivery agent</label>
                <textarea
                  rows="5"
                  className="input-field min-h-[110px]"
                  value={DeliveryAgent}
                  list="delivery-agent-suggestions"
                  onChange={(e) => {
                    setDeliveryAgent(e.target.value);
                    if (e.target.value.trim()) {
                      saveConsignorFieldSuggestion("DeliveryAgent", e.target.value);
                    }
                  }}
                ></textarea>
                {fieldSuggestions.DeliveryAgent && (
                  <datalist id="delivery-agent-suggestions">
                    {fieldSuggestions.DeliveryAgent.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Freight amount</label>
                <input
                  type="text"
                  className="input-field"
                  value={FreightAmount}
                  onChange={(e) => {
                    setFreightAmount(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Original BL/Mtd(s)</label>
                <input
                  type="text"
                  className="input-field"
                  value={NumberOfBl}
                  onChange={(e) => {
                    setNumberOfBl(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Place and date of issue</label>
                <input
                  type="text"
                  className="input-field"
                  value={PlaceAndDate}
                  onChange={(e) => {
                    setPlaceAndDate(e.target.value);
                  }}
                ></input>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Freight payable</label>
                <input
                  type="text"
                  className="input-field"
                  value={FreightPayable}
                  onChange={(e) => {
                    setFreightPayable(e.target.value);
                  }}
                ></input>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Attached sheets
                  </p>
                  <h4 className="mt-1 text-xl font-bold text-slate-900">
                    Additional document pages
                  </h4>
                </div>
                <button type="button" onClick={addAttachedSheet} className="primary-button">
                  Add sheet
                </button>
              </div>

              <div className="space-y-4">
                {attachedSheets.map((sheet, index) => (
                  <div key={sheet.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                        Sheet {index + 1}
                      </span>
                      {attachedSheets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAttachedSheet(sheet.id)}
                          className="secondary-button !px-3 !py-2 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Attached marks
                        </label>
                        <textarea
                          rows="7"
                          className="input-field min-h-[150px]"
                          value={sheet.marks}
                          onChange={(e) =>
                            updateAttachedSheet(sheet.id, "marks", e.target.value)
                          }
                        ></textarea>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Attached description
                        </label>
                        <textarea
                          rows="7"
                          className="input-field min-h-[150px]"
                          value={sheet.description}
                          onChange={(e) =>
                            updateAttachedSheet(
                              sheet.id,
                              "description",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:max-w-[440px]">
          <div className="panel sticky top-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Live preview</h3>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">
                Live
              </div>
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mx-auto w-[300px] origin-top scale-[0.82] sm:scale-100">
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
                  showSignature={showSignature}
                  showStamp={showStamp}
                  typeText={typeText}
                  ref={componentRef}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handlePrint} className="primary-button">
                Print
              </button>
              <button onClick={handleHidden} className="secondary-button">
                {hidden ? "Show" : "Hide"}
              </button>
              <button onClick={handleOriginal} className="secondary-button">
                Original
              </button>
              <button onClick={handleBl} className="secondary-button">
                BL Draft
              </button>
              <button onClick={handleNegotiable} className="secondary-button">
                Negotiable
              </button>
              <button
                type="button"
                onClick={() => setShowSignature((prev) => !prev)}
                className="secondary-button"
              >
                {showSignature ? "Hide sign" : "Show sign"}
              </button>
              <button
                type="button"
                onClick={() => setShowStamp((prev) => !prev)}
                className="secondary-button"
              >
                {showStamp ? "Hide stamp" : "Show stamp"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-900">
                  Attached sheets ({attachedSheets.length})
                </h4>
                <button onClick={handlePrintAttached} className="primary-button">
                  Print
                </button>
              </div>

              <div
                ref={attachedSheetsRef}
                className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-2"
              >
                {attachedSheets.map((sheet, index) => (
                  <AttachedSheet
                    key={sheet.id}
                    attachedSheetDescription={sheet.description}
                    attachedSheetMarks={sheet.marks}
                    MTDNo={MTDNo}
                    PortOfLoading={PortOfLoading}
                    PortOfDischarge={PortOfDischarge}
                    sign={sign}
                    showSignature={showSignature}
                    showStamp={showStamp}
                    sheetNumber={index + 1}
                    sheetTotal={attachedSheets.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
