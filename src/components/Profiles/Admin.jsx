/*eslint-disable*/
import React, { useState, useEffect } from "react";
import Account from "../Account";
import { UserAuth } from "../../context/AuthContext";
import { onSnapshot, collection, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { ComponentToPrint } from "../ComponentToPrint/ComponentToPrint";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminList from "../AdminList";
import { AttachedSheet } from "../AttachedSheet/AttachedSheet";

const Admin = () => {
  const { user } = UserAuth();
  const [BlDrafts, setBlDrafts] = useState({});
  const [currJob, setCurrJob] = useState({});
  const [SearchText, setSearchText] = useState("");

  useEffect(
    () =>
      onSnapshot(collection(db, "bldraft"), (snapshot) =>
        setBlDrafts(snapshot.docs.map((document) => document.data()))
      ),

    []
  );
  const handleSign = async () => {
    if (currJob.JobNo) {
      const docRef = doc(db, "bldraft", currJob.JobNo);
      const payload = { ...currJob, sign: "true" };

      await setDoc(docRef, payload);
      toast("Placed Sign and Saved SuccessFully");
    } else {
      toast("Please Preview First");
    }
  };
  const handleClick = (draft) => {
    // console.log(draft.JobNo);
    setCurrJob(draft);
  };
  const handleSubmit = () => {
    BlDrafts.forEach((docs) => {
      Object.keys(docs).forEach((key) => {
        if (key === "JobNo" && docs[key] === SearchText) {
          setCurrJob({ ...docs });
        }
      });
    });
  };

  if (user && user.email === "admin@gmail.com") {
    return (
      <div>
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
        <div>
          <Account></Account>
        </div>
        <div className="flex flex-col mb-[20px]">
          <p className="ml-[200px] text-3xl font-bold">LIST OF UNSIGNED JOBS</p>
          {BlDrafts ? (
            Object.values(BlDrafts).map((draft) => {
              // console.log(draft.sign, draft.JobNo);
              if (draft.sign === "false" || draft.sign === false) {
                return (
                  <AdminList
                    key={draft.JobNo}
                    draft={draft}
                    handleClick={handleClick}
                  />
                );
              }
            })
          ) : (
            <div>
              <p className="text-3xl text-bold">No Job to Sign</p>
            </div>
          )}
        </div>
        <div className="w-full relative border-2 border-solid flex flex-row items-center mb-[20px]">
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
        </div>
        <div>
          {currJob ? (
            <div>
              <ComponentToPrint {...currJob}> </ComponentToPrint>
              <AttachedSheet
                attachedSheetDescription={currJob.attachedSheetDescription}
                attachedSheetMarks={currJob.attachedSheetMarks}
                MTDNo={currJob.MTDNo}
                PortOfLoading={currJob.PortOfLoading}
                PortOfDischarge={currJob.PortOfDischarge}
                ref={currJob.attachedRef}
                sign={currJob.sign}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <div>
          {currJob && (currJob.sign === "false" || currJob.sign === false) ? (
            <div className="flex flex-row justify-evenly">
              <div>
                <button
                  className="border-2 p-[4px] text-2xl font-bold rounded-[10px] border-solid bg-green-500"
                  onClick={handleSign}
                >
                  Place Sign
                </button>
              </div>
              <div>
                <p className="text-2xl">
                  LAST EDITED BY{" "}
                  <span className="font-bold text-3xl">
                    {currJob.lastEdited}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  } else {
    return <div>You are not authorized to access this page</div>;
  }
};

export default Admin;
