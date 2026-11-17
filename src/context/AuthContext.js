import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser as deleteFirebaseUser,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../firebase";

const defaultAuthContext = {
  user: null,
  signIn: async () => ({ user: null }),
  logout: async () => undefined,
  createUser: async () => ({ user: null }),
  updateUser: async () => undefined,
  removeUser: async () => undefined,
  listUsers: () => [],
};

const UserContext = createContext(defaultAuthContext);
const LOCAL_USERS_KEY = "blueDiamondUsers";
const DEFAULT_USERS = [
  {
    email: "admin@gmail.com",
    passwordHash: "e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7",
    role: "admin",
  },
  {
    email: "normal@gmail.com",
    passwordHash: "7e2a6c2c0a9bd4e9e5bb2b83cf5c0ba72ee74e73d98f26e7c86236707c461228",
    role: "user",
  },
];

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const getStoredUsers = () => {
  try {
    const existing = localStorage.getItem(LOCAL_USERS_KEY);
    const fallbackUsers = [...DEFAULT_USERS];

    if (!existing) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(fallbackUsers));
      return fallbackUsers;
    }

    const parsed = JSON.parse(existing);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const hasAdmin = parsed.some((entry) => normalizeEmail(entry.email) === "admin@gmail.com");
      const hasNormal = parsed.some((entry) => normalizeEmail(entry.email) === "normal@gmail.com");

      if (!hasAdmin || !hasNormal) {
        const merged = [...fallbackUsers, ...parsed.filter((entry) => !fallbackUsers.some((fallback) => normalizeEmail(fallback.email) === normalizeEmail(entry.email)))];
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(merged));
        return merged;
      }

      return parsed;
    }
  } catch (error) {
    console.error("Unable to read local users", error);
  }

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return [...DEFAULT_USERS];
};

async function hashPassword(password) {
  const value = String(password || "");
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const persistUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const persistCredential = (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !String(password || "").trim()) {
    return;
  }

  try {
    const existing = JSON.parse(localStorage.getItem("blueDiamondAuthCredentials") || "{}");
    const next = { ...existing, [normalizedEmail]: password };
    localStorage.setItem("blueDiamondAuthCredentials", JSON.stringify(next));
  } catch (error) {
    console.error("Unable to persist auth credentials", error);
  }
};

const syncAppUserRecord = async (email, role, password = "") => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const users = getStoredUsers();
  const existingIndex = users.findIndex((entry) => normalizeEmail(entry.email) === normalizedEmail);
  const passwordHash = password ? await hashPassword(password) : users[existingIndex]?.passwordHash;
  const nextUsers = [...users];

  if (existingIndex >= 0) {
    nextUsers[existingIndex] = {
      ...nextUsers[existingIndex],
      email: normalizedEmail,
      role,
      ...(passwordHash ? { passwordHash } : {}),
    };
  } else {
    nextUsers.push({ email: normalizedEmail, role, passwordHash: passwordHash || "" });
  }

  persistUsers(nextUsers);

  if (db) {
    await setDoc(doc(db, "appUsers", normalizedEmail), {
      email: normalizedEmail,
      role,
      updatedAt: new Date().toISOString(),
    });
  }
};

const determineUserRole = (email, fallback = "user") => {
  const normalizedEmail = normalizeEmail(email);
  const storedUsers = getStoredUsers();
  const storedMatch = storedUsers.find((entry) => normalizeEmail(entry.email) === normalizedEmail);

  if (storedMatch?.role) {
    return storedMatch.role;
  }

  if (normalizedEmail === "admin@gmail.com") {
    return "admin";
  }

  return fallback;
};

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const listUsers = () => getStoredUsers().map(({ email, role }) => ({ email, role }));

  const createUser = async (email, password, role = "user") => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !String(password || "").trim()) {
      throw new Error("Email and password are required.");
    }

    if (!auth) {
      const users = getStoredUsers();
      const alreadyExists = users.some((entry) => normalizeEmail(entry.email) === normalizedEmail);
      if (alreadyExists) {
        throw new Error("A user with this email already exists.");
      }

      const passwordHash = await hashPassword(password);
      const updatedUsers = [...users, { email: normalizedEmail, passwordHash, role }];
      persistUsers(updatedUsers);
      return { user: { email: normalizedEmail, uid: `local-${normalizedEmail}`, role } };
    }

    const previousUser = auth.currentUser;
    const previousUserEmail = normalizeEmail(previousUser?.email || "");
    const previousPassword = previousUserEmail
      ? JSON.parse(localStorage.getItem("blueDiamondAuthCredentials") || "{}")?.[previousUserEmail]
      : "";

    const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    await syncAppUserRecord(normalizedEmail, role, password);

    if (previousUserEmail && previousPassword) {
      await signOut(auth);
      await signInWithEmailAndPassword(auth, previousUserEmail, previousPassword);
      const restoredUser = auth.currentUser;
      if (restoredUser) {
        const restoredSessionUser = {
          ...restoredUser,
          email: previousUserEmail,
          role: determineUserRole(previousUserEmail, restoredUser?.role || "user"),
        };
        setUser(restoredSessionUser);
      }
    }

    return result;
  };

  const updateUser = async (email, updates = {}) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new Error("User email is required.");
    }

    const users = getStoredUsers();
    const index = users.findIndex((entry) => normalizeEmail(entry.email) === normalizedEmail);
    if (index === -1) {
      throw new Error("User not found.");
    }

    const nextUsers = [...users];
    const current = nextUsers[index];
    const nextUser = {
      ...current,
      ...updates,
      email: normalizedEmail,
      ...(updates.password && { passwordHash: await hashPassword(updates.password) }),
    };
    nextUsers[index] = nextUser;
    persistUsers(nextUsers);

    if (db && nextUser.role) {
      await setDoc(doc(db, "appUsers", normalizedEmail), {
        email: normalizedEmail,
        role: nextUser.role,
        updatedAt: new Date().toISOString(),
      });
    }

    return nextUser;
  };

  const removeUser = async (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw new Error("User email is required.");
    }

    const users = getStoredUsers();
    const filtered = users.filter((entry) => normalizeEmail(entry.email) !== normalizedEmail);
    if (filtered.length === users.length) {
      throw new Error("User not found.");
    }

    const currentAuthUserEmail = normalizeEmail(auth?.currentUser?.email || "");
    if (auth && currentAuthUserEmail === normalizedEmail) {
      await deleteFirebaseUser(auth.currentUser);
      await signOut(auth);
      setUser(null);
    }

    persistUsers(filtered);

    if (db) {
      try {
        await setDoc(doc(db, "appUsers", normalizedEmail), {
          email: normalizedEmail,
          deleted: true,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Unable to update user profile record", error);
      }
    }

    if (functions && currentAuthUserEmail !== normalizedEmail) {
      try {
        const deleteUserCallable = httpsCallable(functions, "deleteUserAccount");
        const result = await deleteUserCallable({ email: normalizedEmail });
        if (!result?.data?.success) {
          throw new Error("Backend delete failed.");
        }
      } catch (error) {
        console.error("Firebase backend delete failed", error);
        throw error;
      }
    }

    return filtered;
  };

  const signIn = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !String(password || "").trim()) {
      throw new Error("Email and password are required.");
    }

    const loginWithLocalFallback = async () => {
      const users = getStoredUsers();
      let record = users.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
      const passwordHash = await hashPassword(password);

      if (!record) {
        const fallbackSeed = DEFAULT_USERS.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
        if (fallbackSeed && fallbackSeed.passwordHash === passwordHash) {
          record = fallbackSeed;
          const nextUsers = [...users.filter((entry) => normalizeEmail(entry.email) !== normalizedEmail), record];
          persistUsers(nextUsers);
        }
      }

      if (!record) {
        return null;
      }

      if (record.passwordHash !== passwordHash) {
        const defaultUser = DEFAULT_USERS.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
        if (!defaultUser || defaultUser.passwordHash !== passwordHash) {
          return null;
        }

        const nextUsers = [...users.filter((entry) => normalizeEmail(entry.email) !== normalizedEmail), { ...record, passwordHash }];
        persistUsers(nextUsers);
      }

      persistCredential(normalizedEmail, password);
      const sessionUser = {
        email: normalizedEmail,
        uid: `local-${normalizedEmail}`,
        role: determineUserRole(normalizedEmail, record.role || "user"),
      };
      setUser(sessionUser);
      return { user: sessionUser };
    };

    if (!auth) {
      const fallbackResult = await loginWithLocalFallback();
      if (fallbackResult) {
        return fallbackResult;
      }
      throw new Error("Invalid email or password.");
    }

    try {
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      persistCredential(normalizedEmail, password);
      const sessionUser = {
        ...result.user,
        email: normalizedEmail,
        role: determineUserRole(normalizedEmail, result.user?.role || "user"),
      };
      setUser(sessionUser);
      return { ...result, user: sessionUser };
    } catch (error) {
      const fallbackResult = await loginWithLocalFallback();
      if (fallbackResult) {
        return fallbackResult;
      }
      throw error;
    }
  };

  const logout = () => {
    if (!auth) {
      setUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
      const storedUser = localStorage.getItem("blueDiamondSession");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const normalizedEmail = normalizeEmail(parsedUser?.email || "");
          setUser({
            ...parsedUser,
            email: normalizedEmail,
            role: determineUserRole(normalizedEmail, parsedUser?.role || "user"),
          });
        } catch (error) {
          localStorage.removeItem("blueDiamondSession");
        }
      }
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        return;
      }

      const normalizedEmail = normalizeEmail(currentUser.email || "");
      setUser({
        ...currentUser,
        email: normalizedEmail,
        role: determineUserRole(normalizedEmail, currentUser?.role || "user"),
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("blueDiamondSession", JSON.stringify(user));
    } else {
      localStorage.removeItem("blueDiamondSession");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ createUser, listUsers, updateUser, removeUser, user, logout, signIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(UserContext);
  return context || defaultAuthContext;
};
