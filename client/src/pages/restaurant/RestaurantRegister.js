import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRestaurantAuth } from "../../context/RestaurantAuthContext";

const STEPS = [
  { label: "Restaurant\nInfo", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { label: "Owner\nDetails", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" },
  { label: "Payment\n/ UPI",  icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { label: "Review\n& Submit", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const defaultForm = {
  name: "", description: "", cuisine: "", address: "", city: "", state: "",
  pincode: "", phone: "", deliveryTime: "30-45 min", minOrder: 99, image: "",
  ownerName: "", ownerEmail: "", ownerPassword: "", ownerPhone: "",
  upiId: "", upiName: "", bankName: "", accountNumber: "", ifscCode: "", accountHolder: "",
};

const cuisineOptions = [
  "North Indian","South Indian","Mughlai","Biryani","Chinese","Indo-Chinese",
  "Street Food","Fast Food","Pizza","Seafood","Bengali","Gujarati",
  "Rajasthani","Punjabi","Kerala","Hyderabadi","Goan","Continental",
  "Desserts & Sweets","Healthy & Salads","Breakfast","Multi-Cuisine",
];

function Icon({ d, size = 18, color = "currentColor", sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px",
        fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{hint}</p>}
    </div>
  );
}

const inp = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.15)",
  borderRadius: "10px", color: "#fff", fontSize: "14px", outline: "none",
  boxSizing: "border-box", transition: "border 0.2s",
};

export default function RestaurantRegister() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [originalFile, setOriginalFile] = useState(null);
  const [resizeOption, setResizeOption] = useState("original");
  const [fileInfo, setFileInfo] = useState(null); // { origSize, newSize, origW, origH, newW, newH }
  const [imgPos, setImgPos] = useState({ x: 50, y: 50 });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useRestaurantAuth();
  const navigate = useNavigate();
  const dragRef = useRef({ active: false, startX: 0, startY: 0, posX: 50, posY: 50 });

  const nudge = (dx, dy) => setImgPos((p) => ({
    x: Math.min(100, Math.max(0, p.x + dx)),
    y: Math.min(100, Math.max(0, p.y + dy)),
  }));

  const onDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { active: true, startX: clientX, startY: clientY, posX: imgPos.x, posY: imgPos.y };
    e.preventDefault();
  };
  const onDragMove = (e) => {
    if (!dragRef.current.active) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((dragRef.current.startX - clientX) / rect.width) * 100;
    const dy = ((dragRef.current.startY - clientY) / rect.height) * 100;
    setImgPos({
      x: Math.min(100, Math.max(0, dragRef.current.posX + dx)),
      y: Math.min(100, Math.max(0, dragRef.current.posY + dy)),
    });
  };
  const onDragEnd = () => { dragRef.current.active = false; };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ── Image resize helpers ──────────────────────────────────────
  const resizeImage = (file, maxWidth) =>
    new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        const origW = width, origH = height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve({ file: new File([blob], file.name, { type: "image/jpeg" }), origW, origH, newW: width, newH: height }),
          "image/jpeg", 0.92
        );
      };
      img.src = url;
    });

  const applyResize = async (file, option) => {
    const maxWidths = { original: null, "1920": 1920, "1280": 1280, "800": 800, "400": 400 };
    const maxWidth = maxWidths[option];
    if (!maxWidth) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setFileInfo({ origSize: file.size, newSize: file.size, origW: null, origH: null, newW: null, newH: null });
      return;
    }
    const { file: resized, origW, origH, newW, newH } = await resizeImage(file, maxWidth);
    setImageFile(resized);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(resized);
    setFileInfo({ origSize: file.size, newSize: resized.size, origW, origH, newW, newH });
  };

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOriginalFile(file);
    setResizeOption("original");
    await applyResize(file, "original");
    setForm((f) => ({ ...f, image: "" }));
  };

  const handleResizeChange = async (option) => {
    if (!originalFile) return;
    setResizeOption(option);
    await applyResize(originalFile, option);
    setForm((f) => ({ ...f, image: "" }));
  };

  const handleImageUrl = (e) => {
    setForm((f) => ({ ...f, image: e.target.value }));
    if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); setOriginalFile(null); setFileInfo(null); setResizeOption("original"); setImgPos({ x: 50, y: 50 }); }
    else setImagePreview("");
  };

  const fmtSize = (bytes) => bytes < 1024 * 1024 ? (bytes / 1024).toFixed(0) + " KB" : (bytes / (1024 * 1024)).toFixed(1) + " MB";

  const previewSrc = imagePreview || form.image;

  const next = () => {
    setError("");
    if (step === 0 && (!form.name || !form.description || !form.city))
      return setError("Restaurant Name, Description, and City are required.");
    if (step === 1) {
      if (!form.ownerName || !form.ownerEmail || !form.ownerPassword)
        return setError("Owner Name, Email, and Password are required.");
      if (form.ownerPassword.length < 6)
        return setError("Password must be at least 6 characters.");
    }
    setStep((s) => s + 1);
  };

  const back = () => { setError(""); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      await register({ ...form, minOrder: Number(form.minOrder) }, imageFile);
      navigate("/restaurant/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 16px", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* Brand bar */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "28px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.6 8M17 13l1.6 8M9 21h.01M15 21h.01" color="#fff" size={20} />
        </div>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "#7c3aed", letterSpacing: "-0.5px" }}>BiteBuddy</span>
      </Link>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: "640px", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

        {/* Card header */}
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(247,197,159,0.08))", borderBottom: "1px solid rgba(124,58,237,0.15)", padding: "28px 36px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" color="#fff" size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>Register Your Restaurant</h1>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>Join BiteBuddy and start accepting orders</p>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: "24px", position: "relative" }}>
            {/* Progress line */}
            <div style={{ position: "absolute", top: "16px", left: "4%", right: "4%", height: "2px", background: "rgba(255,255,255,0.1)" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)", width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.4s ease" }} />
            </div>
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: i < step ? "linear-gradient(135deg,#4ade80,#22c55e)" : i === step ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(255,255,255,0.1)", border: `2px solid ${i <= step ? "transparent" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", boxShadow: i === step ? "0 0 0 4px rgba(124,58,237,0.25)" : "none" }}>
                  {i < step
                    ? <Icon d="M20 6L9 17l-5-5" color="#fff" size={14} sw={2.5} />
                    : <span style={{ fontSize: "12px", fontWeight: 700, color: i === step ? "#0f0a1e" : "rgba(255,255,255,0.5)" }}>{i + 1}</span>
                  }
                </div>
                <span style={{ marginTop: "6px", fontSize: "10px", fontWeight: 600, color: i <= step ? (i === step ? "#7c3aed" : "#4ade80") : "rgba(255,255,255,0.35)", textAlign: "center", whiteSpace: "pre-line", lineHeight: 1.3 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "32px 36px" }}>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,82,82,0.12)", border: "1px solid rgba(255,82,82,0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "24px" }}>
              <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" color="#ff5252" size={18} />
              <span style={{ fontSize: "13px", color: "#ff8a80" }}>{error}</span>
            </div>
          )}

          {/*  STEP 0: Restaurant Info  */}
          {step === 0 && (
            <div>
              <SectionHeading icon="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" title="Restaurant Information" />

              <Field label="Restaurant Name *">
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Spice Garden" style={inp} />
              </Field>

              {/* Image row */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Restaurant Image</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Paste URL</p>
                    <input name="image" value={form.image} onChange={handleImageUrl} placeholder="https://image.com/photo.jpg" style={inp} />
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Upload Photo</p>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 14px", background: originalFile ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)", border: `1.5px dashed ${originalFile ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.2)"}`, borderRadius: "10px", cursor: "pointer", fontSize: "13px", color: originalFile ? "#4ade80" : "rgba(255,255,255,0.5)", fontWeight: 600, transition: "all 0.2s" }}>
                      <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" size={16} color={originalFile ? "#4ade80" : "rgba(255,255,255,0.5)"} />
                      {originalFile ? (originalFile.name.length > 16 ? originalFile.name.slice(0,14)+"..." : originalFile.name) : "Choose file"}
                      <input type="file" accept="image/*" onChange={handleImageFile} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                {/* Resize options – shown after file is picked */}
                {originalFile && (
                  <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Resize / Quality</span>
                      {fileInfo && (
                        <span style={{ fontSize: "11px", color: resizeOption === "original" ? "rgba(255,255,255,0.45)" : "#4ade80", fontWeight: 600 }}>
                          {fmtSize(fileInfo.origSize)}
                          {resizeOption !== "original" && <> → <span style={{ color: "#4ade80" }}>{fmtSize(fileInfo.newSize)}</span></>}
                          {fileInfo.newW && resizeOption !== "original" && <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: "6px" }}>{fileInfo.newW}×{fileInfo.newH}px</span>}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {[
                        { key: "original", label: "Original", sub: "Full quality" },
                        { key: "1920",     label: "1920px",   sub: "Large HD" },
                        { key: "1280",     label: "1280px",   sub: "Medium" },
                        { key: "800",      label: "800px",    sub: "Small" },
                        { key: "400",      label: "400px",    sub: "Thumbnail" },
                      ].map(({ key, label, sub }) => (
                        <button key={key} type="button" onClick={() => handleResizeChange(key)}
                          style={{ padding: "6px 12px", borderRadius: "8px", border: `1.5px solid ${resizeOption === key ? "#7c3aed" : "rgba(255,255,255,0.12)"}`, background: resizeOption === key ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.04)", color: resizeOption === key ? "#7c3aed" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "12px", fontWeight: resizeOption === key ? 700 : 500, transition: "all 0.15s", lineHeight: 1.2, textAlign: "center" }}>
                          <div>{label}</div>
                          <div style={{ fontSize: "10px", opacity: 0.7 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {previewSrc && (
                  <div style={{ marginTop: "12px" }}>
                    {/* Drag-to-pan preview box */}
                    <div
                      onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
                      onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
                      style={{ position: "relative", height: "180px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", cursor: "grab", userSelect: "none" }}>
                      <img src={previewSrc} alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${imgPos.x}% ${imgPos.y}%`, pointerEvents: "none", transition: dragRef.current.active ? "none" : "object-position 0.1s" }}
                        onError={(e) => (e.target.style.display = "none")} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.45),transparent)" }} />
                      {/* drag hint */}
                      <div style={{ position: "absolute", top: "10px", left: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: "6px", padding: "3px 8px", fontSize: "10px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "4px", pointerEvents: "none" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M12 12h.01"/></svg>
                        Drag to reposition
                      </div>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setOriginalFile(null); setFileInfo(null); setResizeOption("original"); setImgPos({ x: 50, y: 50 }); setForm((f) => ({ ...f, image: "" })); }}
                        style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", fontSize: "12px", padding: "5px 10px", fontWeight: 700, backdropFilter: "blur(4px)" }}>Remove</button>
                    </div>

                    {/* Arrow controls */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", gap: "8px" }}>
                      {/* Arrow pad */}
                      <div style={{ display: "grid", gridTemplateColumns: "32px 32px 32px", gridTemplateRows: "32px 32px 32px", gap: "3px" }}>
                        {/* row 1: empty, up, empty */}
                        <div />
                        <ArrowBtn onClick={() => nudge(0, -8)} title="Up">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                        </ArrowBtn>
                        <div />
                        {/* row 2: left, center-reset, right */}
                        <ArrowBtn onClick={() => nudge(-8, 0)} title="Left">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </ArrowBtn>
                        <ArrowBtn onClick={() => setImgPos({ x: 50, y: 50 })} title="Center" accent>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="4"/></svg>
                        </ArrowBtn>
                        <ArrowBtn onClick={() => nudge(8, 0)} title="Right">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </ArrowBtn>
                        {/* row 3: empty, down, empty */}
                        <div />
                        <ArrowBtn onClick={() => nudge(0, 8)} title="Down">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </ArrowBtn>
                        <div />
                      </div>

                      {/* Position readout + hint */}
                      <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Position</div>
                        <div style={{ display: "flex", gap: "16px" }}>
                          <div><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>X </span><span style={{ fontSize: "14px", fontWeight: 700, color: "#7c3aed" }}>{Math.round(imgPos.x)}%</span></div>
                          <div><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Y </span><span style={{ fontSize: "14px", fontWeight: 700, color: "#7c3aed" }}>{Math.round(imgPos.y)}%</span></div>
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "10px", color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>Drag image or use arrows to frame the best part</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Field label="Description *">
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your restaurant, specialties, ambiance..." rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} />
              </Field>

              <Field label="Cuisine Type">
                <select name="cuisine" value={form.cuisine} onChange={handleChange} style={{ ...inp, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}>
                  <option value="">-- Select Cuisine --</option>
                  {cuisineOptions.map((c) => <option key={c} value={c} style={{ background: "#0f0a1e" }}>{c}</option>)}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="City *">
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Delhi" style={inp} />
                </Field>
                <Field label="State">
                  <input name="state" value={form.state} onChange={handleChange} placeholder="Delhi" style={inp} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Delivery Time">
                  <input name="deliveryTime" value={form.deliveryTime} onChange={handleChange} placeholder="30-45 min" style={inp} />
                </Field>
                <Field label="Min Order (Rs.)">
                  <input name="minOrder" type="number" value={form.minOrder} onChange={handleChange} style={inp} />
                </Field>
              </div>

              <Field label="Street Address">
                <input name="address" value={form.address} onChange={handleChange} placeholder="123, MG Road..." style={inp} />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Pincode">
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="110001" style={inp} />
                </Field>
                <Field label="Restaurant Phone">
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" style={inp} />
                </Field>
              </div>
            </div>
          )}

          {/*  STEP 1: Owner Details  */}
          {step === 1 && (
            <div>
              <SectionHeading icon="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" title="Owner / Login Details" />
              <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px", fontSize: "13px", color: "rgba(255,255,255,0.55)", display: "flex", gap: "10px" }}>
                <Icon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="#7c3aed" size={18} />
                These credentials will be used to log into the restaurant portal.
              </div>
              <Field label="Owner Full Name *">
                <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Priya Sharma" style={inp} />
              </Field>
              <Field label="Owner Email *">
                <input type="email" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} placeholder="owner@restaurant.com" style={inp} />
              </Field>
              <Field label="Password *" hint="Minimum 6 characters">
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} name="ownerPassword" value={form.ownerPassword} onChange={handleChange} placeholder="Min 6 characters" style={{ ...inp, paddingRight: "46px" }} />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", padding: 0, display: "flex" }}>
                    <Icon d={showPass ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"} size={18} color="rgba(255,255,255,0.5)" />
                  </button>
                </div>
              </Field>
              <Field label="Owner Phone">
                <input type="tel" name="ownerPhone" value={form.ownerPhone} onChange={handleChange} placeholder="9876543210" style={inp} />
              </Field>
            </div>
          )}

          {/*  STEP 2: Payment / UPI  */}
          {step === 2 && (
            <div>
              <SectionHeading icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" title="Payment & UPI Details" />

              <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.1),rgba(247,197,159,0.05))", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "14px", padding: "16px 18px", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" color="#7c3aed" size={18} />
                  <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: "14px" }}>UPI Details</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>Customers will scan a QR or copy your UPI ID to pay you directly. This is required to receive orders.</p>
              </div>

              <Field label="UPI ID *">
                <input name="upiId" value={form.upiId} onChange={handleChange} placeholder="9876543210@ybl or name@upi" style={inp} />
              </Field>
              <Field label="Name on UPI">
                <input name="upiName" value={form.upiName} onChange={handleChange} placeholder="PRIYA SHARMA" style={inp} />
              </Field>

              <Divider label="Bank Account (Optional)" />

              <div style={{ background: "rgba(126,185,255,0.08)", border: "1px solid rgba(126,185,255,0.2)", borderRadius: "14px", padding: "16px 18px", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <Icon d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" color="#7eb9ff" size={18} />
                  <span style={{ fontWeight: 700, color: "#7eb9ff", fontSize: "14px" }}>Bank Account</span>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>For settlement and reconciliation. Fill once you are approved.</p>
              </div>

              <Field label="Bank Name">
                <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="State Bank of India" style={inp} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Account Number">
                  <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="1234567890" style={inp} />
                </Field>
                <Field label="IFSC Code">
                  <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" style={inp} />
                </Field>
              </div>
              <Field label="Account Holder Name">
                <input name="accountHolder" value={form.accountHolder} onChange={handleChange} placeholder="Priya Sharma" style={inp} />
              </Field>
            </div>
          )}

          {/*  STEP 3: Review  */}
          {step === 3 && (
            <div>
              <SectionHeading icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" title="Review & Submit" />
              {previewSrc && (
                <div style={{ height: "140px", borderRadius: "14px", overflow: "hidden", marginBottom: "20px", position: "relative" }}>
                  <img src={previewSrc} alt="restaurant" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: `${imgPos.x}% ${imgPos.y}%` }} onError={(e) => (e.target.style.display = "none")} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.6),transparent)" }} />
                  <span style={{ position: "absolute", bottom: "12px", left: "16px", fontWeight: 700, fontSize: "16px", color: "#fff" }}>{form.name}</span>
                </div>
              )}

              <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                {[
                  { icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", label: "Restaurant", value: form.name },
                  { icon: "M5 3h14M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2M5 3l7 9 7-9", label: "Cuisine", value: form.cuisine || "Multi-Cuisine" },
                  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", label: "City", value: form.city },
                  { icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z", label: "Owner", value: form.ownerName },
                  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email", value: form.ownerEmail },
                  { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "UPI ID", value: form.upiId || "(not set)" },
                  { icon: "M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11", label: "Bank", value: form.bankName || "(not set)" },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <Icon d={icon} size={16} color="rgba(124,58,237,0.8)" />
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{label}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
                  </div>
                ))}
              </div>

              <p style={{ margin: 0, textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>By registering, you agree to BiteBuddy terms. Payment details are encrypted and visible only to you and admin.</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
            {step > 0 ? (
              <button onClick={back} style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
                <Icon d="M19 12H5M12 19l-7-7 7-7" size={16} color="#fff" />
                Back
              </button>
            ) : (
              <Link to="/restaurant/login" style={{ flex: 1, padding: "13px", borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none" }}>
                Login Instead
              </Link>
            )}
            {step < 3 ? (
              <button onClick={next} style={{ flex: 2, padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#0f0a1e", cursor: "pointer", fontSize: "14px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "all 0.2s" }}>
                Continue
                <Icon d="M5 12h14M12 5l7 7-7 7" size={16} color="#0f0a1e" sw={2.5} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "13px", borderRadius: "12px", border: "none", background: loading ? "rgba(124,58,237,0.35)" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: "#0f0a1e", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: loading ? "none" : "0 4px 20px rgba(124,58,237,0.35)", transition: "all 0.2s" }}>
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f0a1e" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <Icon d="M5 12h14M12 5l7 7-7 7" size={16} color="#0f0a1e" sw={2.5} />
                    Register Restaurant
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
        Already registered?{" "}
        <Link to="/restaurant/login" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>Login here</Link>
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #0f0a1e; color: #fff; }
        input:focus, textarea:focus, select:focus { border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
      `}</style>
    </div>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
      </div>
      <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#fff" }}>{title}</h3>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function ArrowBtn({ onClick, title, accent, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${accent ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.12)"}`, background: accent ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.06)", color: accent ? "#7c3aed" : "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", padding: 0 }}>
      {children}
    </button>
  );
}
