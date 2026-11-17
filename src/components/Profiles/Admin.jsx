/*eslint-disable*/
import React, { useState, useEffect } from "react";
import Account from "../Account";
import { UserAuth } from "../../context/AuthContext";
import { onSnapshot, collection, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { ComponentToPrint } from "../ComponentToPrint/ComponentToPrint";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminList from "../AdminList";
import { AttachedSheet } from "../AttachedSheet/AttachedSheet";

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

const DEMO_LOCAL_DRAFTS = [
  {
    JobNo: "BL-1042",
    Consignor: "BluePeak Logistics",
    Consignee: "North Harbor Traders",
    NotifyParty: "OceanOps Ltd",
    PortOfLoading: "Jebel Ali",
    PortOfDischarge: "Hamburg",
    VesselVoyage: "MV Horizon 09",
    PlaceOfDelivery: "Hamburg Port",
    ModeOfTransport: "Sea",
    MTDNo: "MTD-1042",
    ShipmentRef: "SH-1042",
    status: "pending",
    sign: "false",
    lastEdited: "normal@gmail.com",
    createdAt: new Date().toISOString(),
  },
  {
    JobNo: "BL-1043",
    Consignor: "City Freight Co.",
    Consignee: "Delta Trade Hub",
    NotifyParty: "Global Cargo Services",
    PortOfLoading: "Qasim",
    PortOfDischarge: "Rotterdam",
    VesselVoyage: "MV Anchor 14",
    PlaceOfDelivery: "Rotterdam Gate",
    ModeOfTransport: "Sea",
    MTDNo: "MTD-1043",
    ShipmentRef: "SH-1043",
    status: "pending",
    sign: "false",
    lastEdited: "normal@gmail.com",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    JobNo: "BL-1038",
    Consignor: "Atlas Trading",
    Consignee: "Harbor Line",
    NotifyParty: "Westport LLC",
    PortOfLoading: "Karachi",
    PortOfDischarge: "Dubai",
    VesselVoyage: "MV Meridian 07",
    PlaceOfDelivery: "Dubai Terminal",
    ModeOfTransport: "Sea",
    MTDNo: "MTD-1038",
    ShipmentRef: "SH-1038",
    sign: "true",
    status: "approved",
    approvedBy: "admin@gmail.com",
    approvedAt: new Date(Date.now() - 172800000).toISOString(),
    lastEdited: "admin@gmail.com",
  },
];

const getLocalDrafts = () => {
  try {
    const stored = localStorage.getItem("blueDiamondLocalDrafts");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Unable to read local drafts", error);
  }

  localStorage.setItem("blueDiamondLocalDrafts", JSON.stringify(DEMO_LOCAL_DRAFTS));
  return [...DEMO_LOCAL_DRAFTS];
};

const saveLocalDrafts = (drafts) => {
  localStorage.setItem("blueDiamondLocalDrafts", JSON.stringify(drafts));
  return drafts;
};

const Admin = () => {
  const { user, createUser, listUsers, updateUser, removeUser } = UserAuth();
  const [BlDrafts, setBlDrafts] = useState([]);
  const [currJob, setCurrJob] = useState({});
  const [SearchText, setSearchText] = useState("");
  const [templateImage, setTemplateImage] = useState("");
  const [templateLayout, setTemplateLayout] = useState(DEFAULT_LAYOUT);
  const [selectedTemplateField, setSelectedTemplateField] = useState("Consignor");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprovalJob, setSelectedApprovalJob] = useState(null);
  const [activeAdminSection, setActiveAdminSection] = useState("document-setup");
  const [menuOpen, setMenuOpen] = useState(true);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionDraft, setRevisionDraft] = useState(null);
  const [revisionComment, setRevisionComment] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 20, 30, 50];
  const [localUsers, setLocalUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const refreshUserList = () => {
    setLocalUsers(listUsers());
  };

  const loadTemplateConfig = async () => {
    try {
      if (db) {
        const templateSnapshot = await getDoc(doc(db, "systemSettings", "billTemplate"));
        if (templateSnapshot.exists()) {
          const data = templateSnapshot.data();
          if (data?.image) setTemplateImage(data.image);
          if (data?.layout) setTemplateLayout({ ...DEFAULT_LAYOUT, ...data.layout });
          return;
        }
      }

      const saved = localStorage.getItem("blueDiamondBillTemplate");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.image) setTemplateImage(parsed.image);
        if (parsed?.layout) setTemplateLayout({ ...DEFAULT_LAYOUT, ...parsed.layout });
      }
    } catch (error) {
      console.error("Template config unavailable", error);
    }
  };

  useEffect(() => {
    loadTemplateConfig();
  }, []);

  const updateCurrJobField = (field, value) => {
    setCurrJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAttachedSheetField = (sheetIndex, field, value) => {
    setCurrJob((prev) => {
      const existingSheets = Array.isArray(prev.attachedSheets) && prev.attachedSheets.length
        ? prev.attachedSheets
        : [{ marks: prev.attachedSheetMarks || "", description: prev.attachedSheetDescription || "" }];

      const nextSheets = existingSheets.map((sheet, index) => {
        if (index !== sheetIndex) return sheet;
        return {
          ...sheet,
          [field]: value,
        };
      });

      return {
        ...prev,
        attachedSheets: nextSheets,
        attachedSheetMarks: nextSheets[0]?.marks || "",
        attachedSheetDescription: nextSheets[0]?.description || "",
      };
    });
  };

  const handleSaveAdjustment = async () => {
    if (!currJob.JobNo) {
      toast("Select a job before saving adjustments.");
      return;
    }

    const billRecord = {
      ...currJob,
      lastEdited: user ? user.email : "admin",
      sign: "false",
    };

    if (!db) {
      const nextDrafts = (getLocalDrafts() || []).map((entry) =>
        entry.JobNo === currJob.JobNo ? { ...entry, ...billRecord } : entry
      );
      setBlDrafts(saveLocalDrafts(nextDrafts));
      toast("Bill draft updated successfully");
      return;
    }

    await setDoc(doc(db, "bldraft", currJob.JobNo), billRecord);
    toast("Bill draft updated successfully");
  };

  const handleTemplateUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result;
      const payload = { image: imageUrl, layout: templateLayout };
      setTemplateImage(String(imageUrl));

      if (db) {
        await setDoc(doc(db, "systemSettings", "billTemplate"), payload, { merge: true });
      }

      localStorage.setItem("blueDiamondBillTemplate", JSON.stringify(payload));
      toast("New template image saved for the next user session");
    };
    reader.readAsDataURL(file);
  };

  const updateTemplateLayout = (field, axis, value) => {
    const parsedValue = Number(value) || 0;
    setTemplateLayout((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || DEFAULT_LAYOUT[field] || { top: 0, left: 0 }),
        [axis]: parsedValue,
      },
    }));
  };

  const moveTemplateField = (field, deltaLeft = 0, deltaTop = 0) => {
    setTemplateLayout((prev) => {
      const current = prev[field] || DEFAULT_LAYOUT[field] || { top: 0, left: 0 };
      return {
        ...prev,
        [field]: {
          top: (current.top ?? 0) + deltaTop,
          left: (current.left ?? 0) + deltaLeft,
        },
      };
    });
  };

  const resetFieldLayout = (field) => {
    setTemplateLayout((prev) => ({
      ...prev,
      [field]: { ...DEFAULT_LAYOUT[field] },
    }));
  };

  const resetAllLayout = () => {
    setTemplateLayout(DEFAULT_LAYOUT);
  };

  const saveTemplateLayout = async () => {
    const payload = { image: templateImage, layout: templateLayout };
    if (db) {
      await setDoc(doc(db, "systemSettings", "billTemplate"), payload, { merge: true });
    }
    localStorage.setItem("blueDiamondBillTemplate", JSON.stringify(payload));
    toast("Template alignment saved successfully");
  };

  useEffect(() => {
    if (!db) {
      const demoDrafts = getLocalDrafts();
      setBlDrafts(demoDrafts);
      return undefined;
    }

    return onSnapshot(collection(db, "bldraft"), (snapshot) => {
      setBlDrafts(snapshot.docs.map((document) => document.data()));
    });
  }, []);

  useEffect(() => {
    refreshUserList();
  }, []);

  useEffect(() => {
    setPendingPage(1);
    setApprovedPage(1);
  }, [pageSize]);

  const pendingDrafts = Array.isArray(BlDrafts)
    ? BlDrafts.filter((draft) => draft.sign === "false" || draft.sign === false)
    : [];

  const approvedDrafts = Array.isArray(BlDrafts)
    ? BlDrafts.filter((draft) => draft.sign === "true" || draft.sign === true)
    : [];

  const filteredPendingDrafts = pendingDrafts.filter((draft) => {
    const query = (SearchText || "").trim().toLowerCase();
    if (!query) return true;
    return (draft.JobNo || "").toLowerCase().includes(query) || (draft.Consignor || "").toLowerCase().includes(query);
  });

  const filteredApprovedDrafts = approvedDrafts.filter((draft) => {
    const query = (SearchText || "").trim().toLowerCase();
    if (!query) return true;
    return (draft.JobNo || "").toLowerCase().includes(query) || (draft.Consignor || "").toLowerCase().includes(query);
  });

  const totalPendingPages = Math.max(1, Math.ceil(filteredPendingDrafts.length / pageSize));
  const totalApprovedPages = Math.max(1, Math.ceil(filteredApprovedDrafts.length / pageSize));

  const paginatedPendingDrafts = filteredPendingDrafts.slice(
    (pendingPage - 1) * pageSize,
    pendingPage * pageSize
  );

  const paginatedApprovedDrafts = filteredApprovedDrafts.slice(
    (approvedPage - 1) * pageSize,
    approvedPage * pageSize
  );

  const handleSign = async () => {
    if (currJob.JobNo) {
      const payload = { ...currJob, sign: "true" };

      if (!db) {
        const nextDrafts = (getLocalDrafts() || []).map((entry) =>
          entry.JobNo === currJob.JobNo ? { ...entry, ...payload } : entry
        );
        setBlDrafts(saveLocalDrafts(nextDrafts));
        toast("Placed Sign and Saved SuccessFully");
        return;
      }

      const docRef = doc(db, "bldraft", currJob.JobNo);
      await setDoc(docRef, payload);
      toast("Placed Sign and Saved SuccessFully");
    } else {
      toast("Please Preview First");
    }
  };

  const handleClick = (draft) => {
    setCurrJob(draft);
    setSelectedApprovalJob(draft);
    setShowApprovalModal(true);
  };

  const handleApproveJob = async (draft) => {
    if (!draft?.JobNo) {
      toast("Select a valid job to approve.");
      return;
    }

    const payload = {
      ...draft,
      sign: "true",
      status: "approved",
      approvedBy: user ? user.email : "admin",
      approvedAt: new Date().toISOString(),
      revisionComment: draft.revisionComment || "",
    };

    if (!db) {
      const nextDrafts = (getLocalDrafts() || []).map((entry) =>
        entry.JobNo === draft.JobNo ? { ...entry, ...payload } : entry
      );
      setBlDrafts(saveLocalDrafts(nextDrafts));
      toast(`Job ${draft.JobNo} approved successfully`);
      return;
    }

    await setDoc(doc(db, "bldraft", draft.JobNo), payload);
    toast(`Job ${draft.JobNo} approved successfully`);
  };

  const handleSendForRevision = async (draft) => {
    if (!draft?.JobNo) {
      toast("Select a valid job to send back for revision.");
      return;
    }

    const recipient = draft.createdBy || draft.lastEdited || "normal@gmail.com";
    const notificationId = `${draft.JobNo}-revision-${Date.now()}`;
    const payload = {
      ...draft,
      sign: "false",
      status: "revision_requested",
      revisionComment: revisionComment.trim(),
      lastEdited: user ? user.email : "admin",
      updatedAt: new Date().toISOString(),
    };

    if (!db) {
      const nextDrafts = (getLocalDrafts() || []).map((entry) =>
        entry.JobNo === draft.JobNo ? { ...entry, ...payload } : entry
      );
      setBlDrafts(saveLocalDrafts(nextDrafts));

      const nextNotifications = JSON.parse(localStorage.getItem("blueDiamondLocalNotifications") || "[]");
      const notificationPayload = {
        id: notificationId,
        userEmail: recipient,
        title: "Changes requested",
        message: `Admin has requested changes for job ${draft.JobNo}.`,
        jobNo: draft.JobNo,
        comment: revisionComment.trim(),
        type: "revision",
        targetRoute: "/user",
        read: false,
        createdAt: new Date().toISOString(),
        adminEmail: user ? user.email : "admin",
      };
      localStorage.setItem("blueDiamondLocalNotifications", JSON.stringify([notificationPayload, ...nextNotifications]));
      setShowRevisionModal(false);
      setRevisionDraft(null);
      setRevisionComment("");
      toast(`Revision requested for ${draft.JobNo}`);
      return;
    }

    await setDoc(doc(db, "bldraft", draft.JobNo), payload);
    await setDoc(doc(db, "notifications", notificationId), {
      id: notificationId,
      userEmail: recipient,
      title: "Changes requested",
      message: `Admin has requested changes for job ${draft.JobNo}.`,
      jobNo: draft.JobNo,
      comment: revisionComment.trim(),
      type: "revision",
      targetRoute: "/user",
      read: false,
      createdAt: new Date().toISOString(),
      adminEmail: user ? user.email : "admin",
    });

    setShowRevisionModal(false);
    setRevisionDraft(null);
    setRevisionComment("");
    toast(`Revision requested for ${draft.JobNo}`);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedApprovalJob(null);
  };

  const handleSubmit = () => {
    setPendingPage(1);
    setApprovedPage(1);

    const query = (SearchText || "").trim();
    if (!query) {
      return;
    }

    const match = [...pendingDrafts, ...approvedDrafts].find((draft) =>
      (draft.JobNo || "").toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      setCurrJob(match);
      toast(`Showing results for ${match.JobNo}`);
      return;
    }

    toast("No matching job found in the approval queue");
  };

  const handleAddLocalUser = async () => {
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      toast("Email and password are required.");
      return;
    }

    try {
      await createUser(newUserEmail, newUserPassword, newUserRole);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");
      refreshUserList();
      toast("User added successfully");
    } catch (error) {
      toast(error.message || "Unable to add user");
    }
  };

  const handleUpdateUserPassword = async () => {
    if (!selectedUserEmail || !newPassword.trim()) {
      toast("Select a user and enter a new password.");
      return;
    }

    try {
      await updateUser(selectedUserEmail, { password: newPassword });
      setSelectedUserEmail("");
      setNewPassword("");
      refreshUserList();
      toast("Password updated successfully");
    } catch (error) {
      toast(error.message || "Unable to update password");
    }
  };

  const handleRemoveUser = async (email) => {
    try {
      await removeUser(email);
      refreshUserList();
      if (selectedUserEmail === email) {
        setSelectedUserEmail("");
      }
      toast("User removed successfully");
    } catch (error) {
      toast(error.message || "Unable to remove user");
    }
  };

  if (user && (user.role === "admin" || user.email === "admin@gmail.com")) {
    return (
      <div className="pb-10">
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

        <header className="sticky top-0 z-20 mb-6 rounded-[30px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
                BD
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Admin dashboard</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">BlueDiamond Control Center</h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 lg:hidden"
                aria-label={menuOpen ? "Collapse menu" : "Expand menu"}
              >
                <span>{menuOpen ? "Close" : "Menu"}</span>
                <span>☰</span>
              </button>

              <nav className={`${menuOpen ? "flex" : "hidden"} flex-wrap items-center gap-2 lg:flex`}>
                {[
                  { key: "document-setup", label: "Document setup", accent: "bg-blue-600 text-white border-blue-600" },
                  { key: "approval-queue", label: "Approval queue", accent: "bg-amber-500 text-white border-amber-500" },
                  { key: "user-management", label: "User management", accent: "bg-violet-600 text-white border-violet-600" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveAdminSection(item.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeAdminSection === item.key
                        ? item.accent
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {pendingDrafts.length} pending
              </div>
              <Account />
            </div>
          </div>
        </header>

        <div className="space-y-6">

          {activeAdminSection === "document-setup" ? (
            <div className="space-y-6">
              <div className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Section 1</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Document setup</h3>
                  </div>
                </div>

                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Template image</p>
                      <h5 className="mt-1 text-lg font-bold text-slate-900">Upload a new bill background</h5>
                    </div>
                    <label className="primary-button cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                      Upload image
                    </label>
                  </div>

                  {templateImage && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <img src={templateImage} alt="Bill template preview" className="h-28 w-full rounded-lg object-cover" />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h5 className="text-lg font-bold text-slate-900">Fine tune field placement</h5>
                      <p className="mt-1 text-sm text-slate-500">
                        Pick a field, adjust it with quick nudges, then save once.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={resetAllLayout} className="secondary-button">Reset all</button>
                      <button type="button" onClick={saveTemplateLayout} className="primary-button">Save alignment</button>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.keys(DEFAULT_LAYOUT).map((field) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => setSelectedTemplateField(field)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                          selectedTemplateField === field
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Selected field</p>
                        <h6 className="mt-1 text-lg font-bold text-slate-900">{selectedTemplateField}</h6>
                      </div>
                      <button
                        type="button"
                        onClick={() => resetFieldLayout(selectedTemplateField)}
                        className="secondary-button"
                      >
                        Reset this field
                      </button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveTemplateField(selectedTemplateField, 0, -5)} className="secondary-button !px-3 !py-2 text-xs">↑</button>
                      <button type="button" onClick={() => moveTemplateField(selectedTemplateField, 0, 5)} className="secondary-button !px-3 !py-2 text-xs">↓</button>
                      <button type="button" onClick={() => moveTemplateField(selectedTemplateField, -5, 0)} className="secondary-button !px-3 !py-2 text-xs">←</button>
                      <button type="button" onClick={() => moveTemplateField(selectedTemplateField, 5, 0)} className="secondary-button !px-3 !py-2 text-xs">→</button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                      {Object.keys(DEFAULT_LAYOUT).map((field) => (
                        <div
                          key={field}
                          onClick={() => setSelectedTemplateField(field)}
                          className={`cursor-pointer rounded-xl border p-3 transition ${
                            selectedTemplateField === field
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{field}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-xs text-slate-600">
                              <span className="mb-1 block">Top</span>
                              <input
                                type="number"
                                className="input-field !py-2 !px-2 text-xs"
                                value={templateLayout[field]?.top ?? DEFAULT_LAYOUT[field].top}
                                onChange={(e) => updateTemplateLayout(field, "top", e.target.value)}
                              />
                            </label>
                            <label className="text-xs text-slate-600">
                              <span className="mb-1 block">Left</span>
                              <input
                                type="number"
                                className="input-field !py-2 !px-2 text-xs"
                                value={templateLayout[field]?.left ?? DEFAULT_LAYOUT[field].left}
                                onChange={(e) => updateTemplateLayout(field, "left", e.target.value)}
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeAdminSection === "user-management" ? (
            <div className="space-y-6">
              <div className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Section 3</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">User management</h3>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="text-lg font-bold text-slate-900">Add user</h4>
                    <div className="mt-4 space-y-3">
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="input-field"
                        placeholder="user@company.com"
                      />
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="input-field"
                        placeholder="Password"
                      />
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="input-field"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="button" onClick={handleAddLocalUser} className="primary-button w-full">Add user</button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="text-lg font-bold text-slate-900">Reset password</h4>
                    <div className="mt-4 space-y-3">
                      <select
                        value={selectedUserEmail}
                        onChange={(e) => setSelectedUserEmail(e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select user</option>
                        {localUsers.map((entry) => (
                          <option key={entry.email} value={entry.email}>{entry.email}</option>
                        ))}
                      </select>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                        placeholder="New password"
                      />
                      <button type="button" onClick={handleUpdateUserPassword} className="secondary-button w-full">Update password</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Access list</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Users</h3>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead className="bg-violet-50 text-xs uppercase tracking-[0.15em] text-violet-700">
                        <tr>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localUsers.length ? (
                          localUsers.map((entry) => (
                            <tr key={entry.email} className="border-t border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-900">{entry.email}</td>
                              <td className="px-4 py-3">{entry.role || "user"}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUser(entry.email)}
                                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No users configured</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Section 2</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Approval queue</h3>
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <label className="text-sm font-medium text-slate-600">Search job no</label>
                    <input
                      type="text"
                      name="searchtext"
                      value={SearchText}
                      className="w-full border-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                      placeholder="Enter job number"
                      onChange={(e) => setSearchText(e.target.value)}
                    ></input>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-slate-600">Rows</label>
                      <select
                        value={pageSize}
                        onChange={(event) => setPageSize(Number(event.target.value))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none"
                      >
                        {pageSizeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={handleSubmit} className="primary-button sm:w-auto">Search</button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchText("");
                        setPendingPage(1);
                        setApprovedPage(1);
                      }}
                      className="secondary-button sm:w-auto"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">Pending</p>
                    <h4 className="mt-2 text-2xl font-bold text-slate-900">{filteredPendingDrafts.length}</h4>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Approved</p>
                    <h4 className="mt-2 text-2xl font-bold text-slate-900">{filteredApprovedDrafts.length}</h4>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Visible</p>
                    <h4 className="mt-2 text-2xl font-bold text-slate-900">{paginatedPendingDrafts.length + paginatedApprovedDrafts.length}</h4>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-100 text-xs uppercase tracking-[0.15em] text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Job no</th>
                          <th className="px-4 py-3">Consignor</th>
                          <th className="px-4 py-3">Updated by</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPendingDrafts.length ? (
                          paginatedPendingDrafts.map((draft) => (
                            <tr key={draft.JobNo} className="border-t border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-900">{draft.JobNo}</td>
                              <td className="px-4 py-3">{draft.Consignor || "—"}</td>
                              <td className="px-4 py-3">{draft.lastEdited || "N/A"}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                                  {draft.status === "revision_requested" ? "Revision" : "Pending"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button type="button" onClick={() => handleClick(draft)} className="primary-button !px-3 !py-2 text-xs">Review</button>
                                  <button type="button" onClick={() => handleApproveJob(draft)} className="secondary-button !px-3 !py-2 text-xs">Approve</button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRevisionDraft(draft);
                                      setRevisionComment(draft.revisionComment || "");
                                      setShowRevisionModal(true);
                                    }}
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                  >
                                    Revise
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No jobs waiting for review</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Page {pendingPage} of {totalPendingPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={pendingPage <= 1} onClick={() => setPendingPage((page) => Math.max(1, page - 1))} className="secondary-button !px-3 !py-2 text-xs disabled:opacity-50">Previous</button>
                    <button type="button" disabled={pendingPage >= totalPendingPages} onClick={() => setPendingPage((page) => Math.min(totalPendingPages, page + 1))} className="secondary-button !px-3 !py-2 text-xs disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent approvals</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">Approved jobs</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-600">Rows</label>
                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none"
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead className="bg-emerald-50 text-xs uppercase tracking-[0.15em] text-emerald-700">
                        <tr>
                          <th className="px-4 py-3">Job no</th>
                          <th className="px-4 py-3">Consignor</th>
                          <th className="px-4 py-3">Approved by</th>
                          <th className="px-4 py-3">Approved at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedApprovedDrafts.length ? (
                          paginatedApprovedDrafts.map((draft) => (
                            <tr key={draft.JobNo} className="border-t border-slate-200 hover:bg-emerald-50/40">
                              <td className="px-4 py-3 font-semibold text-slate-900">{draft.JobNo}</td>
                              <td className="px-4 py-3">{draft.Consignor || "—"}</td>
                              <td className="px-4 py-3">{draft.approvedBy || draft.lastEdited || "Admin"}</td>
                              <td className="px-4 py-3">{draft.approvedAt ? new Date(draft.approvedAt).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No approved jobs yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Page {approvedPage} of {totalApprovedPages}</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={approvedPage <= 1} onClick={() => setApprovedPage((page) => Math.max(1, page - 1))} className="secondary-button !px-3 !py-2 text-xs disabled:opacity-50">Previous</button>
                    <button type="button" disabled={approvedPage >= totalApprovedPages} onClick={() => setApprovedPage((page) => Math.min(totalApprovedPages, page + 1))} className="secondary-button !px-3 !py-2 text-xs disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRevisionModal && revisionDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Revision request</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">{revisionDraft.JobNo}</h3>
                </div>
                <button type="button" onClick={() => setShowRevisionModal(false)} className="secondary-button">Close</button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Job summary</p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{revisionDraft.Consignor || "No consignor"}</p>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Comments or suggestions</span>
                  <textarea
                    rows="5"
                    className="input-field min-h-[120px]"
                    value={revisionComment}
                    onChange={(e) => setRevisionComment(e.target.value)}
                    placeholder="Add reasons, missing details, or suggested edits for the user..."
                  />
                </label>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowRevisionModal(false)} className="secondary-button">Cancel</button>
                  <button type="button" onClick={() => handleSendForRevision(revisionDraft)} className="primary-button">Send for revise</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showApprovalModal && selectedApprovalJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Job approval</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedApprovalJob.JobNo}</h3>
                </div>
                <button type="button" onClick={closeApprovalModal} className="secondary-button">Close</button>
              </div>

              <div className="p-6">
                <div className="mb-5 flex flex-wrap gap-3">
                  <button type="button" onClick={handleSaveAdjustment} className="primary-button">Save edits</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!db || !selectedApprovalJob.JobNo) return;
                      await setDoc(doc(db, "bldraft", selectedApprovalJob.JobNo), { ...selectedApprovalJob, sign: "true" });
                      toast("Job approved and signed successfully");
                      closeApprovalModal();
                    }}
                    className="secondary-button"
                  >
                    Approve job
                  </button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-slate-900">Review draft</h4>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Pending</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Consignor</p><p className="mt-1 font-medium text-slate-800">{selectedApprovalJob.Consignor || "—"}</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Consignee</p><p className="mt-1 font-medium text-slate-800">{selectedApprovalJob.Consignee || "—"}</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">MTD No</p><p className="mt-1 font-medium text-slate-800">{selectedApprovalJob.MTDNo || "—"}</p></div>
                      <div className="rounded-xl bg-white p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Shipment</p><p className="mt-1 font-medium text-slate-800">{selectedApprovalJob.ShipmentRef || "—"}</p></div>
                      <div className="rounded-xl bg-white p-3 sm:col-span-2"><p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Notify party</p><p className="mt-1 font-medium text-slate-800">{selectedApprovalJob.NotifyParty || "—"}</p></div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <ComponentToPrint {...selectedApprovalJob} templateImage={templateImage} layout={templateLayout} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="panel max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Access denied
        </p>
        <h3 className="mt-3 text-2xl font-bold text-slate-900">You are not authorized to access this page</h3>
      </div>
    </div>
  );
};

export default Admin;
