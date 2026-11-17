import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

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

    return createUserWithEmailAndPassword(auth, normalizedEmail, password);
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
    nextUsers[index] = {
      ...current,
      ...updates,
      email: normalizedEmail,
      ...(updates.password && { passwordHash: await hashPassword(updates.password) }),
    };
    persistUsers(nextUsers);
    return nextUsers[index];
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
    persistUsers(filtered);
    return filtered;
  };

  const signIn = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !String(password || "").trim()) {
      throw new Error("Email and password are required.");
    }

    if (!auth) {
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
        throw new Error("Invalid email or password.");
      }

      if (record.passwordHash !== passwordHash) {
        const defaultUser = DEFAULT_USERS.find((entry) => normalizeEmail(entry.email) === normalizedEmail);
        if (!defaultUser || defaultUser.passwordHash !== passwordHash) {
          throw new Error("Invalid email or password.");
        }

        const nextUsers = [...users.filter((entry) => normalizeEmail(entry.email) !== normalizedEmail), { ...record, passwordHash }];
        persistUsers(nextUsers);
      }

      const sessionUser = {
        email: normalizedEmail,
        uid: `local-${normalizedEmail}`,
        role: record.role || "user",
      };
      setUser(sessionUser);
      return { user: sessionUser };
    }

    const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    setUser(result.user);
    return result;
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
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem("blueDiamondSession");
        }
      }
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
