// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const allUsers = [
  { email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active" },
  { email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active" },
  { email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave" },
  { email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active" },
  { email: "emily@acme.com", id: 5, name: "Emily Davis", role: "Product Manager", status: "Inactive" },
  { email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "Lead Designer", status: "Active" },
  { email: "olivia@acme.com", id: 7, name: "Olivia Martinez", role: "Frontend Engineer", status: "Active" },
  { email: "james@acme.com", id: 8, name: "James Taylor", role: "Backend Engineer", status: "Active" },
  { email: "sophia@acme.com", id: 9, name: "Sophia Anderson", role: "QA Engineer", status: "On Leave" },
  { email: "liam@acme.com", id: 10, name: "Liam Thomas", role: "DevOps Engineer", status: "Active" },
  { email: "lucas@acme.com", id: 11, name: "Lucas Martinez", role: "Product Manager", status: "Active" },
  { email: "emma@acme.com", id: 12, name: "Emma Johnson", role: "Frontend Engineer", status: "Active" },
  { email: "noah@acme.com", id: 13, name: "Noah Davis", role: "Backend Engineer", status: "Active" },
  { email: "ava@acme.com", id: 14, name: "Ava Wilson", role: "Lead Designer", status: "Active" },
  { email: "oliver@acme.com", id: 15, name: "Oliver Martinez", role: "Frontend Engineer", status: "Active" },
  { email: "isabella@acme.com", id: 16, name: "Isabella Johnson", role: "Backend Engineer", status: "Active" },
  { email: "mia@acme.com", id: 17, name: "Mia Davis", role: "Lead Designer", status: "Active" },
  { email: "william@acme.com", id: 18, name: "William Wilson", role: "Frontend Engineer", status: "Active" },
];

const ITEMS_PER_PAGE = 6;
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 44;

const initialColumns = [
  { id: "name",   label: "Name",   defaultWidth: 160 },
  { id: "role",   label: "Role",   defaultWidth: 180 },
  { id: "status", label: "Status", defaultWidth: 130 },
  { id: "email",  label: "Email",  defaultWidth: 200 },
];

const getBadgeStyle = (status) => {
  if (status === "Active")   return { background: "#dcfce7", color: "#16a34a" };
  if (status === "Inactive") return { background: "#fee2e2", color: "#dc2626" };
  return { background: "#fef9c3", color: "#ca8a04" };
};

export function App() {
  // ── Data / infinite scroll ──────────────────────────────────────────────────
  const [items, setItems] = useState(() => allUsers.slice(0, ITEMS_PER_PAGE));
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const hasMore = items.length < allUsers.length;
  const scrollRef = useRef(null);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      setItems((prev) => allUsers.slice(0, prev.length + ITEMS_PER_PAGE));
      setIsLoading(false);
      requestAnimationFrame(() => { isLoadingRef.current = false; });
    }, 1500);
  }, [hasMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) loadMore();
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [loadMore]);

  // ── Column order & widths ───────────────────────────────────────────────────
  const [columns, setColumns] = useState(initialColumns);
  const [colWidths, setColWidths] = useState(initialColumns.map((c) => c.defaultWidth));

  // ── Column resize ───────────────────────────────────────────────────────────
  const resizingCol = useRef(null);

  const onResizeMouseDown = (e, ci) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger column drag
    resizingCol.current = { index: ci, startX: e.clientX, startWidth: colWidths[ci] };

    const onMove = (ev) => {
      if (!resizingCol.current) return;
      const delta = ev.clientX - resizingCol.current.startX;
      const newWidth = Math.max(60, resizingCol.current.startWidth + delta);
      setColWidths((prev) => {
        const next = [...prev];
        next[resizingCol.current.index] = newWidth;
        return next;
      });
    };
    const onUp = () => {
      resizingCol.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Column drag-and-drop ────────────────────────────────────────────────────
  const draggingCol = useRef(null);
  const [colDragOver, setColDragOver] = useState(null);
  // pending confirmation
  const [pendingSwap, setPendingSwap] = useState(null); // { from, to }

  const onColDragStart = (e, ci) => {
    if (resizingCol.current) { e.preventDefault(); return; }
    draggingCol.current = ci;
    e.dataTransfer.effectAllowed = "move";
    // invisible ghost
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:absolute;top:-9999px;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const onColDragOver = (e, ci) => {
    e.preventDefault();
    if (draggingCol.current === null || draggingCol.current === ci) return;
    setColDragOver(ci);
  };

  const onColDrop = (e, ci) => {
    e.preventDefault();
    const from = draggingCol.current;
    draggingCol.current = null;
    setColDragOver(null);
    if (from === null || from === ci) return;
    // show confirmation popup
    setPendingSwap({ from, to: ci });
  };

  const onColDragEnd = () => {
    draggingCol.current = null;
    setColDragOver(null);
  };

  const confirmSwap = () => {
    if (!pendingSwap) return;
    const { from, to } = pendingSwap;
    setColumns((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setColWidths((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setPendingSwap(null);
  };

  const cancelSwap = () => setPendingSwap(null);

  // ── Layout ──────────────────────────────────────────────────────────────────
  const containerHeight = HEADER_HEIGHT + ROW_HEIGHT * 3;
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  return (
    <>
      {/* ── Confirmation Modal ── */}
      {pendingSwap && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
          onClick={cancelSwap}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              padding: "28px 32px",
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#eff6ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006FEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#18181b" }}>
              Reorder Columns?
            </h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#71717a", lineHeight: 1.5 }}>
              Swap{" "}
              <strong style={{ color: "#18181b" }}>{columns[pendingSwap.from].label}</strong>
              {" "}and{" "}
              <strong style={{ color: "#18181b" }}>{columns[pendingSwap.to].label}</strong>
              {" "}column positions?
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={cancelSwap}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: "1px solid #e4e4e7", background: "#fafafa",
                  fontSize: 14, fontWeight: 600, color: "#52525b",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f4f4f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fafafa")}
              >
                Cancel
              </button>
              <button
                onClick={confirmSwap}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: "none", background: "#006FEE",
                  fontSize: 14, fontWeight: 600, color: "#fff",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0057cc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#006FEE")}
              >
                OK, Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ borderRadius: 12, border: "1px solid #e4e4e7", overflow: "hidden", width: "100%" }}>
        <div style={{ height: containerHeight, display: "flex", flexDirection: "column" }}>
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                tableLayout: "fixed",
                width: "100%",
                minWidth: tableWidth,
              }}
            >
              <colgroup>
                {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>

              {/* ── Header ── */}
              <thead>
                <tr>
                  {columns.map((col, ci) => (
                    <th
                      key={col.id}
                      draggable
                      onDragStart={(e) => onColDragStart(e, ci)}
                      onDragOver={(e) => onColDragOver(e, ci)}
                      onDrop={(e) => onColDrop(e, ci)}
                      onDragEnd={onColDragEnd}
                      style={{
                        height: HEADER_HEIGHT,
                        padding: "0 12px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colDragOver === ci ? "#006FEE" : "#71717a",
                        background: colDragOver === ci ? "#eff6ff" : "#f4f4f5",
                        borderBottom: colDragOver === ci ? "2px solid #006FEE" : "1px solid #e4e4e7",
                        borderRight: ci < columns.length - 1 ? "1px solid #e4e4e7" : "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        userSelect: "none",
                        cursor: "grab",
                        transition: "background 0.15s, color 0.15s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, height: "100%" }}>
                        {/* drag dots icon */}
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="#c4c4c8" style={{ flexShrink: 0 }}>
                          <circle cx="3" cy="2.5" r="1.1" />
                          <circle cx="3" cy="7"   r="1.1" />
                          <circle cx="3" cy="11.5" r="1.1" />
                          <circle cx="7" cy="2.5" r="1.1" />
                          <circle cx="7" cy="7"   r="1.1" />
                          <circle cx="7" cy="11.5" r="1.1" />
                        </svg>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{col.label}</span>

                        {/* Resize handle */}
                        <div
                          onMouseDown={(e) => onResizeMouseDown(e, ci)}
                          style={{
                            position: "absolute", right: -6, top: 0,
                            width: 12, height: "100%",
                            cursor: "col-resize", zIndex: 20,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <div
                            style={{ width: 2, height: "55%", borderRadius: 1, background: "#d4d4d8", transition: "background 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#006FEE")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#d4d4d8")}
                          />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody>
                {items.map((user, rowIndex) => (
                  <tr
                    key={user.id}
                    style={{
                      height: ROW_HEIGHT,
                      background: rowIndex % 2 === 0 ? "#ffffff" : "#fafafa",
                      borderBottom: "1px solid #f4f4f5",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = rowIndex % 2 === 0 ? "#ffffff" : "#fafafa")}
                  >
                    {columns.map((col, ci) => (
                      <td
                        key={col.id}
                        style={{
                          padding: "0 12px",
                          borderRight: ci < columns.length - 1 ? "1px solid #f4f4f5" : "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          verticalAlign: "middle",
                        }}
                      >
                        {col.id === "status" ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "2px 10px", borderRadius: 999,
                            fontSize: 12, fontWeight: 500,
                            ...getBadgeStyle(user.status),
                          }}>
                            {user.status}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 14,
                            fontWeight: col.id === "name" ? 500 : 400,
                            color: col.id === "email" ? "#71717a" : col.id === "role" ? "#52525b" : "#18181b",
                          }}>
                            {user[col.id]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Load more */}
                {hasMore && (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: "center", padding: "12px 0" }}>
                      {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, color: "#a1a1aa", fontSize: 13 }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                            <path d="M16 9a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          Loading…
                        </div>
                      ) : (
                        <span style={{ color: "#d4d4d8", fontSize: 12 }}>Scroll for more</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}