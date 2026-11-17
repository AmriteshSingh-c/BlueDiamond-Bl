const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUserAccount = onCall(async (request) => {
  const callerEmail = request.auth?.token?.email || "";
  const isAdminUser = callerEmail === "admin@gmail.com" || request.auth?.token?.admin === true;

  if (!request.auth || !isAdminUser) {
    throw new HttpsError(
      "permission-denied",
      "Only the admin account can delete users."
    );
  }

  const email = String(request.data?.email || "").trim().toLowerCase();

  if (!email) {
    throw new HttpsError("invalid-argument", "Email is required.");
  }

  if (email === "admin@gmail.com") {
    throw new HttpsError("failed-precondition", "The admin account cannot be deleted.");
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);

    return {
      success: true,
      email,
      uid: user.uid,
    };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return {
        success: true,
        email,
        message: "User was already missing from Firebase Auth.",
      };
    }

    throw new HttpsError("internal", error.message || "Unable to delete the user.");
  }
});
