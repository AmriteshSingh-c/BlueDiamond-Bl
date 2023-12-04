import React from "react";
import Account from "../Account";
import { UserAuth } from "../../context/AuthContext";
import { EditComponent } from "../EditComponent/EditComponent";

const User = () => {
  const { user } = UserAuth();
  if (user && user.email === "normal@gmail.com") {
    return (
      <div>
        <div>
          <Account></Account>
        </div>

        <div>
          <EditComponent />
        </div>
      </div>
    );
  } else {
    return <div>You are not authorized to access this page</div>;
  }
};

export default User;
