import React from "react";

const AdminList = ({ draft, handleClick }) => {
  return (
    <div
      key={draft.JobNo}
      className="ml-[30px] max-w-[50%] flex flex-row justify-evenly border-2 border-solid border-blue-600 my-[20px] p-[5px] text-2xl"
    >
      <div>
        JobNo:<span className="font-bold text-2xl">{draft.JobNo}</span>
      </div>
      <div>
        <button
          className="border-2 border-solid bg-green-500 p-[5px] rounded-[10%] font-bold"
          onClick={() => {
            handleClick(draft);
          }}
        >
          Check Preview
        </button>
      </div>
      <div>
        Last Edited By <span className="font-bold">{draft.lastEdited}</span>
      </div>
    </div>
  );
};

export default AdminList;
