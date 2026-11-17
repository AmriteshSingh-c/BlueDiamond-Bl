import React, { useEffect, useMemo, useState } from "react";
import Account from "../Account";
import { UserAuth } from "../../context/AuthContext";
import { EditComponent } from "../EditComponent/EditComponent";
import { onSnapshot, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const User = () => {
  const { user } = UserAuth();
  const [notifications, setNotifications] = useState([]);
  const [selectedJobNo, setSelectedJobNo] = useState("");
  const [activeUserSection, setActiveUserSection] = useState("workspace");
  const [menuOpen, setMenuOpen] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setNotifications([]);
      return undefined;
    }

    if (!db) {
      const stored = JSON.parse(localStorage.getItem("blueDiamondLocalNotifications") || "[]");
      const items = stored
        .filter((item) => item.userEmail === user.email)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(items);
      return undefined;
    }

    return onSnapshot(collection(db, "notifications"), (snapshot) => {
      const items = snapshot.docs
        .map((document) => ({ id: document.id, ...document.data() }))
        .filter((item) => item.userEmail === user.email)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setNotifications(items);
    });
  }, [user?.email]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markNotificationRead = async (notification) => {
    if (!notification?.id) {
      return;
    }

    if (!db) {
      const stored = JSON.parse(localStorage.getItem("blueDiamondLocalNotifications") || "[]");
      const updated = stored.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      );
      localStorage.setItem("blueDiamondLocalNotifications", JSON.stringify(updated));
      setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
      return;
    }

    await setDoc(
      doc(db, "notifications", notification.id),
      { ...notification, read: true },
      { merge: true }
    );
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.jobNo) {
      return;
    }

    await markNotificationRead(notification);
    setSelectedJobNo(notification.jobNo);
    setActiveUserSection("workspace");
  };

  const markAllRead = async () => {
    if (!notifications.length) {
      return;
    }

    if (!db) {
      const stored = JSON.parse(localStorage.getItem("blueDiamondLocalNotifications") || "[]");
      const updated = stored.map((item) => ({ ...item, read: true }));
      localStorage.setItem("blueDiamondLocalNotifications", JSON.stringify(updated));
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      return;
    }

    await Promise.all(
      notifications.map((notification) =>
        setDoc(
          doc(db, "notifications", notification.id),
          { ...notification, read: true },
          { merge: true }
        )
      )
    );
  };

  if (user && user.role !== "admin") {
    return (
      <div className="pb-10">
        <header className="sticky top-0 z-20 mb-6 rounded-[30px] border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
                BL
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Operations</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">House B/L Portal</h2>
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
                  { key: "workspace", label: "Draft workspace", accent: "bg-blue-600 text-white border-blue-600" },
                  { key: "notifications", label: "Revision center", accent: "bg-amber-500 text-white border-amber-500" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveUserSection(item.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeUserSection === item.key
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
              <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                {unreadCount} unread
              </div>
              <Account />
            </div>
          </div>
        </header>

        <div className="space-y-6">

          {activeUserSection === "notifications" ? (
            <div className="panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Notifications
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">Revision center</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                    {unreadCount} unread
                  </span>
                  <button type="button" onClick={markAllRead} className="secondary-button !px-3 !py-2 text-xs">
                    Mark all read
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        notification.read
                          ? "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          : "border-blue-200 bg-blue-50 hover:bg-blue-100"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {notification.type === "revision" ? "Revision requested" : notification.title}
                          </p>
                          <h4 className="mt-1 text-lg font-bold text-slate-900">Job {notification.jobNo}</h4>
                        </div>
                        {!notification.read && (
                          <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-slate-700">{notification.message}</p>

                      {notification.comment && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          <p className="font-semibold">Admin note</p>
                          <p className="mt-1">{notification.comment}</p>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                    No revision alerts yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EditComponent selectedJobNo={selectedJobNo} />
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

export default User;
