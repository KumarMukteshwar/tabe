"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const allUsers = [
  { email: "kate@acme.com",     id: 1,  name: "Kate Moore",       role: "CEO",               status: "Active",   department: "Executive",   location: "New York",      joined: "2018-03-01" },
  { email: "john@acme.com",     id: 2,  name: "John Smith",       role: "CTO",               status: "Active",   department: "Engineering", location: "San Francisco", joined: "2019-01-15" },
  { email: "sara@acme.com",     id: 3,  name: "Sara Johnson",     role: "CMO",               status: "On Leave", department: "Marketing",   location: "Chicago",       joined: "2020-06-10" },
  { email: "michael@acme.com",  id: 4,  name: "Michael Brown",    role: "CFO",               status: "Active",   department: "Finance",     location: "Boston",        joined: "2017-09-20" },
  { email: "emily@acme.com",    id: 5,  name: "Emily Davis",      role: "Product Manager",   status: "Inactive", department: "Product",     location: "Austin",        joined: "2021-02-28" },
  { email: "davis@acme.com",    id: 6,  name: "Davis Wilson",     role: "Lead Designer",     status: "Active",   department: "Design",      location: "Seattle",       joined: "2020-11-05" },
  { email: "olivia@acme.com",   id: 7,  name: "Olivia Martinez",  role: "Frontend Engineer", status: "Active",   department: "Engineering", location: "Denver",        joined: "2022-03-14" },
  { email: "james@acme.com",    id: 8,  name: "James Taylor",     role: "Backend Engineer",  status: "Active",   department: "Engineering", location: "Portland",      joined: "2021-07-19" },
  { email: "sophia@acme.com",   id: 9,  name: "Sophia Anderson",  role: "QA Engineer",       status: "On Leave", department: "Engineering", location: "Miami",         joined: "2022-01-03" },
  { email: "liam@acme.com",     id: 10, name: "Liam Thomas",      role: "DevOps Engineer",   status: "Active",   department: "Engineering", location: "Atlanta",       joined: "2020-08-22" },
  { email: "lucas@acme.com",    id: 11, name: "Lucas Martinez",   role: "Product Manager",   status: "Active",   department: "Product",     location: "Dallas",        joined: "2021-05-17" },
  { email: "emma@acme.com",     id: 12, name: "Emma Johnson",     role: "Frontend Engineer", status: "Active",   department: "Engineering", location: "Phoenix",       joined: "2022-09-01" },
  { email: "noah@acme.com",     id: 13, name: "Noah Davis",       role: "Backend Engineer",  status: "Active",   department: "Engineering", location: "Las Vegas",     joined: "2023-01-10" },
  { email: "ava@acme.com",      id: 14, name: "Ava Wilson",       role: "Lead Designer",     status: "Active",   department: "Design",      location: "Nashville",     joined: "2021-11-30" },
  { email: "oliver@acme.com",   id: 15, name: "Oliver Martinez",  role: "Frontend Engineer", status: "Active",   department: "Engineering", location: "Minneapolis",   joined: "2022-06-15" },
  { email: "isabella@acme.com", id: 16, name: "Isabella Johnson", role: "Backend Engineer",  status: "Active",   department: "Engineering", location: "Detroit",       joined: "2023-03-22" },
  { email: "mia@acme.com",      id: 17, name: "Mia Davis",        role: "Lead Designer",     status: "Active",   department: "Design",      location: "San Diego",     joined: "2020-04-08" },
  { email: "william@acme.com",  id: 18, name: "William Wilson",   role: "Frontend Engineer", status: "Active",   department: "Engineering", location: "Philadelphia",  joined: "2022-12-01" },
];

const ITEMS_PER_PAGE  = 6;
const ROW_HEIGHT      = 56;
const HEADER_HEIGHT   = 48;
const STICKY_COUNT    = 3;
const CHECKBOX_WIDTH  = 44;
const ACTION_WIDTH    = 68;

const BASE_COLUMNS = [
  { id: "name",       label: "Name",       defaultWidth: 170 },
  { id: "role",       label: "Role",       defaultWidth: 170 },
  { id: "status",     label: "Status",     defaultWidth: 130 },
  { id: "email",      label: "Email",      defaultWidth: 210 },
  { id: "department", label: "Department", defaultWidth: 150 },
  { id: "location",   label: "Location",   defaultWidth: 140 },
  { id: "joined",     label: "Joined",     defaultWidth: 130 },
];

const getBadgeStyle = (status) => {
  if (status === "Active")   return { background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" };
  if (status === "Inactive") return { background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" };
  return { background: "#fef9c3", color: "#ca8a04", border: "1px solid #fef08a" };
};

const CheckboxIcon = ({ checked }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <rect x="0.5" y="0.5" width="13" height="13" rx="3.5"
      stroke={checked ? "#6366f1" : "#d4d4d8"} fill={checked ? "#6366f1" : "#ffffff"} />
    {checked && <path d="M3 7l2.5 2.5L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

const MENU_ITEMS = [
  {
    key: "view", label: "View", color: "#3b82f6", hoverBg: "#eff6ff",
    icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/></svg>,
  },
  {
    key: "edit", label: "Edit", color: "#f59e0b", hoverBg: "#fffbeb",
    icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  },
  {
    key: "delete", label: "Delete", color: "#ef4444", hoverBg: "#fef2f2",
    icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2.5h4v1M5 6v3.5M8 6v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="2.5" y="3.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  },
];

// ── Portal Dropdown ───────────────────────────────────────────────────────────
function DropdownPortal({ anchorRef, open, onClose, userName, userId, onAction }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Recompute position whenever opened
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top:  rect.bottom + window.scrollY + 6,
      left: rect.right  + window.scrollX - 144, // 144 = minWidth of dropdown
    });
  }, [open, anchorRef]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current   && !menuRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  // Close on scroll inside the table
  useEffect(() => {
    if (!open) return;
    const handler = () => onClose();
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute",
        top: pos.top,
        left: Math.max(8, pos.left),
        zIndex: 99999,
        background: "#ffffff",
        border: "1px solid #e4e4e7",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
        minWidth: 144,
        overflow: "hidden",
        animation: "dropdownIn 0.14s ease",
      }}
    >
      {/* Name label */}
      <div style={{
        padding: "8px 12px 6px",
        fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
        color: "#a1a1aa", textTransform: "uppercase",
        borderBottom: "1px solid #f4f4f5",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {userName.split(" ")[0]}
      </div>

      {MENU_ITEMS.map((item, idx) => (
        <button
          key={item.key}
          onClick={() => { onAction(item.key, userId, userName); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            width: "100%", padding: "9px 12px",
            border: "none", background: "transparent",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 500,
            color: item.key === "delete" ? item.color : "#18181b",
            borderTop: idx > 0 && item.key === "delete" ? "1px solid #f4f4f5" : "none",
            transition: "background 0.1s, color 0.1s",
            textAlign: "left",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = item.hoverBg; e.currentTarget.style.color = item.color; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.key === "delete" ? item.color : "#18181b"; }}
        >
          <span style={{ color: item.color, display: "flex", alignItems: "center", flexShrink: 0 }}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}

// ── Three-dot Action Menu ─────────────────────────────────────────────────────
function ActionMenu({ userId, userName, onAction }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          width: 30, height: 30, borderRadius: 6,
          border: open ? "1px solid #c7d2fe" : "1px solid transparent",
          background: open ? "#eef2ff" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column", gap: 3,
          transition: "all 0.15s", padding: 0,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = "#f4f4f5"; e.currentTarget.style.border = "1px solid #e4e4e7"; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; } }}
        title="Actions"
      >
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 3.5, height: 3.5, borderRadius: "50%",
            background: open ? "#6366f1" : "#71717a",
            display: "block", flexShrink: 0, transition: "background 0.15s",
          }} />
        ))}
      </button>

      <DropdownPortal
        anchorRef={btnRef}
        open={open}
        onClose={close}
        userName={userName}
        userId={userId}
        onAction={onAction}
      />
    </div>
  );
}

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ from, to, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)",
      animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 14,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        width: 380, padding: "28px 28px 24px",
        animation: "slideUp 0.18s ease",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 7h16M3 11h10M3 15h7" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M16 13l4 4m0 0l-4 4m4-4H13" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#18181b", marginBottom: 6 }}>Move Column</div>
        <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6, marginBottom: 22 }}>
          Move <strong style={{ color: "#18181b" }}>"{from.label}"</strong> to position{" "}
          <strong style={{ color: "#18181b" }}>#{to.index + 1}</strong>
          {" "}(before <strong style={{ color: "#18181b" }}>"{to.label}"</strong>)?
          <br />This will reorder the visible columns.
        </div>
        <div style={{
          background: "#f8f8fb", border: "1px solid #e4e4e7",
          borderRadius: 8, padding: "10px 12px", marginBottom: 22,
          display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, color: "#a1a1aa", marginRight: 2 }}>Moving:</span>
          <span style={{ background: "#6366f1", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{from.label}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M3 7h8M8 4l3 3-3 3" stroke="#a1a1aa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, color: "#52525b" }}>before</span>
          <span style={{ background: "#f4f4f5", color: "#52525b", border: "1px solid #e4e4e7", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 500 }}>{to.label}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e4e4e7",
            background: "#ffffff", color: "#52525b", fontSize: 13, fontWeight: 500,
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#f4f4f5"}
            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
            background: "#6366f1", color: "#ffffff", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", transition: "background 0.12s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
            onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
          >Confirm Move</button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 2000, background: "#18181b", color: "#fff",
      borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
      animation: "slideUp 0.18s ease", whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function App() {
  const [items, setItems]               = useState(() => allUsers.slice(0, ITEMS_PER_PAGE));
  const [isLoading, setIsLoading]       = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [hoveredRow, setHoveredRow]     = useState(null);
  const [toast, setToast]               = useState(null);
  const isLoadingRef = useRef(false);
  const hasMore      = items.length < allUsers.length;
  const scrollRef    = useRef(null);

  const [columns, setColumns]     = useState(BASE_COLUMNS);
  const [colWidths, setColWidths] = useState(BASE_COLUMNS.map(c => c.defaultWidth));

  const dragCol      = useRef(null);
  const [dragOver, setDragOver]     = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      setItems(prev => allUsers.slice(0, prev.length + ITEMS_PER_PAGE));
      setIsLoading(false);
      requestAnimationFrame(() => { isLoadingRef.current = false; });
    }, 1500);
  }, [hasMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => { if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) loadMore(); };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [loadMore]);

  // Resize
  const resizingCol = useRef(null);
  const onResizeMouseDown = (e, ci) => {
    e.preventDefault(); e.stopPropagation();
    resizingCol.current = { index: ci, startX: e.clientX, startWidth: colWidths[ci] };
    const onMove = (ev) => {
      if (!resizingCol.current) return;
      const delta = ev.clientX - resizingCol.current.startX;
      const nw = Math.max(60, resizingCol.current.startWidth + delta);
      setColWidths(prev => { const next = [...prev]; next[resizingCol.current.index] = nw; return next; });
    };
    const onUp = () => {
      resizingCol.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const stickyLeftOf = (ci) => {
    let left = CHECKBOX_WIDTH;
    for (let i = 0; i < ci; i++) left += colWidths[i];
    return left;
  };

  const totalScrollWidth = colWidths.reduce((a, b) => a + b, 0);

  // Row selection
  const toggleRow = (id) => setSelectedRows(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const allSelected = items.length > 0 && items.every(u => selectedRows.has(u.id));
  const toggleAll = () => setSelectedRows(prev => {
    const next = new Set(prev);
    if (allSelected) items.forEach(u => next.delete(u.id));
    else             items.forEach(u => next.add(u.id));
    return next;
  });

  // Drag-and-drop
  const onDragStart = (e, ci) => {
    dragCol.current = ci; setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    const ghost = document.createElement("div");
    ghost.style.cssText = "position:fixed;top:-100px;left:-100px;width:1px;height:1px;";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };
  const onDragOver  = (e, ci) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (ci !== dragCol.current) setDragOver(ci); };
  const onDragLeave = () => setDragOver(null);
  const onDrop = (e, ci) => {
    e.preventDefault();
    const fromIdx = dragCol.current;
    if (fromIdx === null || fromIdx === ci) { onDragEnd(); return; }
    setPendingMove({ fromIdx, toIdx: ci });
    setDragOver(null); setIsDragging(false); dragCol.current = null;
  };
  const onDragEnd = () => { dragCol.current = null; setDragOver(null); setIsDragging(false); };

  const applyMove = () => {
    if (!pendingMove) return;
    const { fromIdx, toIdx } = pendingMove;
    setColumns(prev => { const next = [...prev]; const [m] = next.splice(fromIdx, 1); next.splice(toIdx, 0, m); return next; });
    setColWidths(prev => { const next = [...prev]; const [m] = next.splice(fromIdx, 1); next.splice(toIdx, 0, m); return next; });
    setPendingMove(null);
  };

  const handleAction = (action, userId, userName) => {
    const msgs = { view: `👁  Viewing ${userName}`, edit: `✏️  Editing ${userName}`, delete: `🗑  Deleted ${userName}` };
    setToast(msgs[action] || action);
  };

  const containerHeight = HEADER_HEIGHT + ROW_HEIGHT * 6 + 20;
  const totalWidth = CHECKBOX_WIDTH + totalScrollWidth + ACTION_WIDTH;

  const BG_ROW_EVEN = "#ffffff", BG_ROW_ODD   = "#fafafa";
  const BG_STK_EVEN = "#f8f8fb", BG_STK_ODD   = "#f3f3f7";
  const BG_HOV_NORM = "#eff6ff", BG_HOV_STK   = "#e8f0fe";
  const BG_SEL_NORM = "#eef2ff", BG_SEL_STK   = "#e5e9ff";
  const BG_SEL_HOV_N = "#e0e7ff", BG_SEL_HOV_S = "#d9e0ff";
  const BG_HDR      = "#f4f4f5", BG_HDR_STK   = "#ececf0";
  const BORDER      = "#e4e4e7", BORDER_STK   = "#d4d4d8";
  const ACCENT      = "#6366f1";
  const TEXT_PRIMARY = "#18181b", TEXT_ROLE = "#52525b", TEXT_SEC = "#71717a", TEXT_MUTED = "#a1a1aa";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes fadeIn     { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes rowIn      { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:none; } }
        @keyframes dropdownIn { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:none; } }
        .user-row { animation: rowIn 0.18s ease both; }
        .resize-handle-inner { width:2px; height:55%; border-radius:1px; background:#d4d4d8; transition:background 0.15s; }
        .resize-handle:hover .resize-handle-inner { background:#6366f1; }
        .drag-handle { opacity:0; transition:opacity 0.15s; cursor:grab; }
        th:hover .drag-handle { opacity:1; }
        .drag-handle:active { cursor:grabbing; }
        .tbl-scroll::-webkit-scrollbar        { width:6px; height:6px; }
        .tbl-scroll::-webkit-scrollbar-track  { background:#f4f4f5; }
        .tbl-scroll::-webkit-scrollbar-thumb  { background:#d4d4d8; border-radius:3px; }
        .tbl-scroll::-webkit-scrollbar-thumb:hover { background:#a1a1aa; }
        .tbl-scroll::-webkit-scrollbar-corner { background:#f4f4f5; }
      `}</style>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {pendingMove && (
        <ConfirmModal
          from={{ label: columns[pendingMove.fromIdx].label }}
          to={{ index: pendingMove.toIdx, label: columns[pendingMove.toIdx].label }}
          onConfirm={applyMove}
          onCancel={() => setPendingMove(null)}
        />
      )}

      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: "#ffffff", borderRadius: 12,
        border: `1px solid ${BORDER}`, overflow: "hidden", width: "100%",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, background: BG_HDR,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="1" width="12" height="14" rx="2" stroke={ACCENT} strokeWidth="1.5"/>
              <path d="M5 5h6M5 8h6M5 11h4" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="5" y="0" width="6" height="3" rx="1" fill={ACCENT}/>
            </svg>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>
              Team Directory
            </span>
            <span style={{ background: "#eef2ff", color: ACCENT, border: "1px solid #c7d2fe", borderRadius: 999, fontSize: 11, fontWeight: 600, padding: "1px 8px" }}>
              {allUsers.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>⠿ Drag headers to reorder</span>
            {["Filter", "Export"].map(label => (
              <button key={label} style={{
                background: "#ffffff", border: `1px solid ${BORDER}`,
                color: TEXT_SEC, borderRadius: 6, padding: "4px 10px",
                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ height: containerHeight }}>
          <div ref={scrollRef} className="tbl-scroll" style={{ height: "100%", overflowY: "auto", overflowX: "auto" }}>
            <table style={{
              borderCollapse: "separate", borderSpacing: 0,
              tableLayout: "fixed", width: totalWidth, minWidth: "100%",
            }}>
              <colgroup>
                <col style={{ width: CHECKBOX_WIDTH }} />
                {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                <col style={{ width: ACTION_WIDTH }} />
              </colgroup>

              <thead>
                <tr>
                  <th style={{
                    height: HEADER_HEIGHT, padding: "0 14px",
                    background: BG_HDR_STK, borderBottom: `1px solid ${BORDER}`,
                    borderRight: `1px solid ${BORDER_STK}`,
                    position: "sticky", top: 0, left: 0, zIndex: 31, cursor: "pointer",
                  }} onClick={toggleAll}>
                    <CheckboxIcon checked={allSelected} />
                  </th>

                  {columns.map((col, ci) => {
                    const isSticky       = ci < STICKY_COUNT;
                    const isLastSticky   = ci === STICKY_COUNT - 1;
                    const isBeingDragged = isDragging && dragCol.current === ci;
                    const isDropTarget   = dragOver === ci;
                    return (
                      <th key={col.id} draggable
                        onDragStart={e => onDragStart(e, ci)}
                        onDragOver={e  => onDragOver(e, ci)}
                        onDragLeave={onDragLeave}
                        onDrop={e      => onDrop(e, ci)}
                        onDragEnd={onDragEnd}
                        style={{
                          height: HEADER_HEIGHT, padding: "0 14px",
                          textAlign: "left", fontSize: 11, fontWeight: 600,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                          color: isSticky ? "#52525b" : TEXT_MUTED,
                          background: isDropTarget ? "#eef2ff" : isBeingDragged ? "#f0f0ff" : isSticky ? BG_HDR_STK : BG_HDR,
                          borderBottom: `1px solid ${BORDER}`,
                          borderRight: isLastSticky ? `1px solid ${BORDER_STK}` : `1px solid ${BORDER}`,
                          borderLeft: isDropTarget ? `2px solid ${ACCENT}` : undefined,
                          position: "sticky", top: 0,
                          left: isSticky ? stickyLeftOf(ci) : undefined,
                          zIndex: isSticky ? 30 : 10,
                          userSelect: "none", whiteSpace: "nowrap", overflow: "hidden",
                          cursor: "grab", opacity: isBeingDragged ? 0.45 : 1,
                          transition: "background 0.12s, opacity 0.12s, border-left 0.1s",
                          ...(isLastSticky ? { boxShadow: "4px 0 8px -2px rgba(0,0,0,0.10), 2px 0 0 0 #e4e4e7" } : {}),
                        }}
                      >
                        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 5, height: "100%" }}>
                          <span className="drag-handle" title="Drag to reorder" style={{ lineHeight: 0, marginRight: 2 }}>
                            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                              <circle cx="3" cy="3"  r="1.2" fill="#a1a1aa"/>
                              <circle cx="7" cy="3"  r="1.2" fill="#a1a1aa"/>
                              <circle cx="3" cy="7"  r="1.2" fill="#a1a1aa"/>
                              <circle cx="7" cy="7"  r="1.2" fill="#a1a1aa"/>
                              <circle cx="3" cy="11" r="1.2" fill="#a1a1aa"/>
                              <circle cx="7" cy="11" r="1.2" fill="#a1a1aa"/>
                            </svg>
                          </span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'IBM Plex Mono', monospace" }}>{col.label}</span>
                          <div className="resize-handle"
                            onMouseDown={e => onResizeMouseDown(e, ci)}
                            onClick={e => e.stopPropagation()}
                            onDragStart={e => e.stopPropagation()}
                            style={{ position: "absolute", right: -6, top: 0, width: 12, height: "100%", cursor: "col-resize", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <div className="resize-handle-inner" />
                          </div>
                        </div>
                      </th>
                    );
                  })}

                  {/* Actions header — sticky right */}
                  <th style={{
                    height: HEADER_HEIGHT, padding: "0 10px",
                    textAlign: "center", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: TEXT_MUTED, background: BG_HDR_STK,
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: `1px solid ${BORDER_STK}`,
                    position: "sticky", top: 0, right: 0, zIndex: 31,
                    userSelect: "none", whiteSpace: "nowrap",
                    boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.10), -2px 0 0 0 #e4e4e7",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((user, rowIndex) => {
                  const isSelected = selectedRows.has(user.id);
                  const isHovered  = hoveredRow === user.id;

                  const stickyBg = (() => {
                    if (isSelected && isHovered) return BG_SEL_HOV_S;
                    if (isSelected)              return BG_SEL_STK;
                    if (isHovered)               return BG_HOV_STK;
                    return rowIndex % 2 === 0 ? BG_STK_EVEN : BG_STK_ODD;
                  })();
                  const normalBg = (() => {
                    if (isSelected && isHovered) return BG_SEL_HOV_N;
                    if (isSelected)              return BG_SEL_NORM;
                    if (isHovered)               return BG_HOV_NORM;
                    return rowIndex % 2 === 0 ? BG_ROW_EVEN : BG_ROW_ODD;
                  })();

                  return (
                    <tr key={user.id} className="user-row"
                      style={{ height: ROW_HEIGHT, animationDelay: `${rowIndex * 0.04}s` }}
                      onMouseEnter={() => setHoveredRow(user.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td onClick={() => toggleRow(user.id)} style={{
                        padding: "0 14px", borderBottom: `1px solid ${BORDER}`,
                        borderRight: `1px solid ${BORDER_STK}`, background: stickyBg,
                        position: "sticky", left: 0, zIndex: 5,
                        cursor: "pointer", verticalAlign: "middle",
                      }}>
                        <CheckboxIcon checked={isSelected} />
                      </td>

                      {columns.map((col, ci) => {
                        const isSticky     = ci < STICKY_COUNT;
                        const isLastSticky = ci === STICKY_COUNT - 1;
                        const cellBg       = isSticky ? stickyBg : normalBg;
                        const isDropCol    = dragOver === ci;
                        return (
                          <td key={col.id} style={{
                            padding: "0 14px", fontSize: 13,
                            borderBottom: `1px solid ${BORDER}`,
                            borderRight: isLastSticky ? `1px solid ${BORDER_STK}` : `1px solid ${BORDER}`,
                            borderLeft: isDropCol ? `2px solid ${ACCENT}` : undefined,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            verticalAlign: "middle", background: cellBg,
                            position: isSticky ? "sticky" : undefined,
                            left: isSticky ? stickyLeftOf(ci) : undefined,
                            zIndex: isSticky ? 5 : undefined,
                            ...(isLastSticky ? { boxShadow: "4px 0 8px -2px rgba(0,0,0,0.10), 2px 0 0 0 #e4e4e7" } : {}),
                          }}>
                            {col.id === "status" ? (
                              <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500, ...getBadgeStyle(user.status) }}>{user.status}</span>
                            ) : (
                              <span style={{ fontWeight: col.id === "name" ? 600 : 400, color: col.id === "name" ? TEXT_PRIMARY : col.id === "role" ? TEXT_ROLE : TEXT_SEC }}>
                                {user[col.id]}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Actions cell — sticky right, overflow visible so portal dropdown renders above */}
                      <td style={{
                        padding: "0 10px",
                        borderBottom: `1px solid ${BORDER}`,
                        borderLeft: `1px solid ${BORDER_STK}`,
                        background: stickyBg,
                        position: "sticky", right: 0, zIndex: 6,
                        verticalAlign: "middle", textAlign: "center",
                        boxShadow: "-4px 0 8px -2px rgba(0,0,0,0.10), -2px 0 0 0 #e4e4e7",
                      }}>
                        <ActionMenu userId={user.id} userName={user.name} onAction={handleAction} />
                      </td>
                    </tr>
                  );
                })}

                {hasMore && (
                  <tr>
                    <td colSpan={columns.length + 2} style={{
                      textAlign: "center", padding: "14px 0",
                      background: BG_HDR, borderTop: `1px solid ${BORDER}`,
                    }}>
                      {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, color: TEXT_MUTED, fontSize: 12 }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                            <circle cx="8" cy="8" r="6" stroke="#d4d4d8" strokeWidth="2"/>
                            <path d="M14 8a6 6 0 0 0-6-6" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Loading more…
                        </div>
                      ) : (
                        <span style={{ color: TEXT_MUTED, fontSize: 11 }}>↓ Scroll for more</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderTop: `1px solid ${BORDER}`, background: BG_HDR,
        }}>
          <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>
            {selectedRows.size > 0
              ? `${selectedRows.size} of ${items.length} selected`
              : `Showing ${items.length} of ${allUsers.length} members`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: TEXT_MUTED }}>
              {allUsers.filter(u => u.status === "Active").length} active
            </span>
          </div>
        </div>
      </div>
    </>
  );
}