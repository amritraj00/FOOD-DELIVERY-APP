import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantAuth } from '../../context/RestaurantAuthContext';
import {
  getMyOrders, confirmPayment, updateOrderStatus, updateProfile,
  getMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
} from '../../services/restaurantAuthService';

//  Constants 
const STATUS_COLORS = {
  Placed: '#fbbf24', Confirmed: '#38bdf8', Preparing: '#a78bfa',
  'Out for Delivery': '#34d399', Delivered: '#4ade80', Cancelled: '#f87171',
};
const STATUS_FLOW = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
const CATEGORIES = [
  'Veg', 'Non-Veg', 'Street Food', 'Breads', 'Beverages', 'Desserts',
  'Starters', 'Main Course', 'Rice Dishes', 'Sides', 'Combos', 'Other',
];
const BLANK_ITEM = {
  name: '', price: '', category: 'Main Course',
  description: '', isVeg: true, image: '', isAvailable: true,
};
const TABS = [
  { id: 'overview',  label: 'Overview',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'orders',    label: 'Orders',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'menu',      label: 'My Menu',   icon: 'M9 5l7 7-7 7' },
  { id: 'profile',   label: 'Profile',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'payment',   label: 'Payments',  icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

//  Shared styles 
const labelSt = {
  display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 700,
  color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px',
};
const inputSt = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const mInputSt = {
  width: '100%', padding: '10px 12px',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box',
};
const darkSelectSt = {
  width: '100%', padding: '10px 12px',
  background: '#0f0a1e', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', cursor: 'pointer',
};

//  SVG Icon 
function Icon({ d, size = 20, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

//  MenuModal 
const RESIZE_OPTIONS = [
  { label: 'Original', value: 'original' },
  { label: '1920 px', value: 1920 },
  { label: '1280 px', value: 1280 },
  { label: '800 px',  value: 800  },
  { label: '400 px',  value: 400  },
];

function resizeImageCanvas(file, maxWidth) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const newW = maxWidth && origW > maxWidth ? maxWidth : origW;
      const newH = Math.round((origH / origW) * newW);
      const canvas = document.createElement('canvas');
      canvas.width = newW; canvas.height = newH;
      canvas.getContext('2d').drawImage(img, 0, 0, newW, newH);
      canvas.toBlob(blob => {
        resolve({ file: new File([blob], file.name, { type: 'image/jpeg' }), origW, origH, newW, newH });
      }, 'image/jpeg', 0.92);
    };
    img.src = url;
  });
}

function ArrowBtn({ onClick, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title} style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '7px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
      {children}
    </button>
  );
}

function MenuModal({ item, onClose, onSave, saving }) {
  const [form, setForm]               = useState(item || BLANK_ITEM);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || '');
  const [originalFile, setOriginalFile] = useState(null);
  const [resizeOption, setResizeOption] = useState('original');
  const [fileInfo, setFileInfo]       = useState(null); // { origSize, newSize, origW, origH, newW, newH }
  const [imgPos, setImgPos]           = useState({ x: 50, y: 50 });
  const dragRef = useRef({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyResize = async (file, option) => {
    const origSize = file.size;
    const maxWidth = option === 'original' ? null : option;
    const result = await resizeImageCanvas(file, maxWidth);
    setImageFile(result.file);
    setFileInfo({ origSize, newSize: result.file.size, origW: result.origW, origH: result.origH, newW: result.newW, newH: result.newH });
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(result.file);
    set('image', '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOriginalFile(file);
    setResizeOption('original');
    setImgPos({ x: 50, y: 50 });
    applyResize(file, 'original');
  };

  const handleResizeChange = (option) => {
    setResizeOption(option);
    if (originalFile) applyResize(originalFile, option);
  };

  const handleUrlChange = (e) => {
    set('image', e.target.value);
    setOriginalFile(null); setImageFile(null); setFileInfo(null);
    setImagePreview(e.target.value || '');
    setImgPos({ x: 50, y: 50 });
  };

  const removeImage = () => {
    setOriginalFile(null); setImageFile(null); setImagePreview(''); setFileInfo(null);
    setImgPos({ x: 50, y: 50 }); set('image', '');
  };

  const nudge = (dx, dy) => setImgPos(p => ({ x: Math.min(100,Math.max(0,p.x+dx)), y: Math.min(100,Math.max(0,p.y+dy)) }));

  const onDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, startPosX: imgPos.x, startPosY: imgPos.y };
    e.preventDefault();
  };
  const onDragMove = (e) => {
    if (!dragRef.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = (clientX - dragRef.current.startX) / 3;
    const dy = (clientY - dragRef.current.startY) / 3;
    setImgPos({ x: Math.min(100,Math.max(0,dragRef.current.startPosX + dx)), y: Math.min(100,Math.max(0,dragRef.current.startPosY + dy)) });
  };
  const onDragEnd = () => { dragRef.current.dragging = false; };

  const previewSrc = imagePreview || form.image;

  const fmtSize = (bytes) => bytes < 1024*1024 ? (bytes/1024).toFixed(0)+'KB' : (bytes/(1024*1024)).toFixed(1)+'MB';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'linear-gradient(145deg,#1e1e35,#16162a)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {item && item._id ? 'Edit Menu Item' : 'Add New Item'}
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>x</button>
        </div>

        {[{ label: 'ITEM NAME *', key: 'name', placeholder: 'e.g. Butter Chicken' }, { label: 'PRICE (Rs.) *', key: 'price', placeholder: '250', type: 'number' }].map(({ label, key, placeholder, type }) => (
          <div key={key} style={{ marginBottom: '14px' }}>
            <label style={labelSt}>{label}</label>
            <input type={type||'text'} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={mInputSt} />
          </div>
        ))}

        {/* Image section */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelSt}>ITEM IMAGE</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px' }}>Paste URL</div>
              <input value={form.image} onChange={handleUrlChange} placeholder='https://...' style={mInputSt} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px' }}>Upload File</div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '9px 10px', background: originalFile ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1.5px dashed ${originalFile ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.18)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: originalFile ? '#4ade80' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg>
                {originalFile ? (originalFile.name.length > 12 ? originalFile.name.slice(0,10)+'...' : originalFile.name) : 'Choose file'}
                <input type='file' accept='image/*' onChange={handleFileChange} style={{ display:'none' }} />
              </label>
            </div>
          </div>

          {/* Resize options — only shown when a file is selected */}
          {originalFile && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '7px' }}>Resize Before Upload</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {RESIZE_OPTIONS.map(opt => (
                  <button type='button' key={opt.value} onClick={() => handleResizeChange(opt.value)}
                    style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: resizeOption === opt.value ? '1.5px solid #7c3aed' : '1px solid rgba(255,255,255,0.14)', background: resizeOption === opt.value ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)', color: resizeOption === opt.value ? '#7c3aed' : 'rgba(255,255,255,0.55)', transition: 'all 0.15s' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {fileInfo && (
                <div style={{ marginTop: '7px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>Size: <b style={{ color: '#4ade80' }}>{fmtSize(fileInfo.origSize)}</b> &rarr; <b style={{ color: '#38bdf8' }}>{fmtSize(fileInfo.newSize)}</b></span>
                  <span>Dimensions: <b style={{ color: 'rgba(255,255,255,0.7)' }}>{fileInfo.newW}&times;{fileInfo.newH}px</b></span>
                </div>
              )}
            </div>
          )}

          {/* Image preview with drag-to-reposition */}
          {previewSrc && (
            <div style={{ marginBottom: '10px' }}>
              <div
                onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
                onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
                style={{ position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'grab', userSelect: 'none' }}>
                <img src={previewSrc} alt='preview' style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${imgPos.x}% ${imgPos.y}%`, pointerEvents:'none' }} onError={e => { e.target.style.display='none'; }} />
                <div style={{ position:'absolute', bottom:'8px', left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.6)', borderRadius:'6px', padding:'3px 10px', fontSize:'10px', color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap', pointerEvents:'none' }}>Drag to reposition</div>
                <button type='button' onClick={removeImage} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', color:'#fff', cursor:'pointer', fontSize:'11px', padding:'3px 8px', fontWeight:700 }}>Remove</button>
              </div>

              {/* Arrow pad */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '8px 12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,30px)', gridTemplateRows: 'repeat(3,30px)', gap: '3px' }}>
                  <div/>
                  <ArrowBtn onClick={() => nudge(0,-8)} title="Up">
                    <Icon d="M5 15l7-7 7 7" size={13} />
                  </ArrowBtn>
                  <div/>
                  <ArrowBtn onClick={() => nudge(-8,0)} title="Left">
                    <Icon d="M15 19l-7-7 7-7" size={13} />
                  </ArrowBtn>
                  <button type="button" onClick={() => setImgPos({x:50,y:50})} title="Center" style={{ width:'30px', height:'30px', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'7px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#7c3aed' }} />
                  </button>
                  <ArrowBtn onClick={() => nudge(8,0)} title="Right">
                    <Icon d="M9 5l7 7-7 7" size={13} />
                  </ArrowBtn>
                  <div/>
                  <ArrowBtn onClick={() => nudge(0,8)} title="Down">
                    <Icon d="M19 9l-7 7-7-7" size={13} />
                  </ArrowBtn>
                  <div/>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginBottom: '2px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Position</div>
                  <div>X: <b style={{ color: '#7c3aed' }}>{Math.round(imgPos.x)}%</b></div>
                  <div>Y: <b style={{ color: '#7c3aed' }}>{Math.round(imgPos.y)}%</b></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelSt}>CATEGORY</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={darkSelectSt}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0f0a1e', color: '#fff' }}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelSt}>DESCRIPTION</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Short description of the dish..." style={{ ...mInputSt, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[{ v: true, label: 'Veg', color: '#4ade80' }, { v: false, label: 'Non-Veg', color: '#f87171' }].map(o => (
            <label key={String(o.v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              <input type="radio" checked={form.isVeg === o.v || form.isVeg === String(o.v)} onChange={() => set('isVeg', o.v)} />
              <span style={{ color: o.color, fontWeight: 700 }}>{o.label}</span>
            </label>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
            <input type="checkbox" checked={!!form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} />
            Available now
          </label>
        </div>

        <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          <button onClick={() => onSave(form, imageFile)} disabled={saving || !form.name || !form.price} style={{ flex: 2, padding: '12px', background: saving ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '14px', boxShadow: saving ? 'none' : '0 4px 16px rgba(109,40,217,0.4)' }}>
            {saving ? 'Saving...' : (item && item._id ? 'Update Item' : 'Add to Menu')}
          </button>
        </div>
      </div>
    </div>
  );
}

//  StatCard 
function StatCard({ label, value, sub, color, iconPath }) {
  return (
    <div style={{ background: `linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))`, border: `1px solid ${color}30`, borderRadius: '20px', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      {/* top glow line */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '2px', background: `linear-gradient(90deg,transparent,${color},transparent)`, borderRadius: '2px' }} />
      {/* background icon */}
      <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', opacity: 0.08 }}>
        <Icon d={iconPath} size={72} color={color} strokeWidth={1.2} />
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 900, color, lineHeight: 1, marginTop: '2px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

//  Main Dashboard 
export default function RestaurantDashboard() {
  const { restaurantOwner, logout } = useRestaurantAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState('overview');
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [orders, setOrders]             = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [menuItems, setMenuItems]       = useState([]);
  const [loadingMenu, setLoadingMenu]   = useState(false);
  const [menuFilter, setMenuFilter]     = useState('All');
  const [menuModal, setMenuModal]       = useState(null);
  const [modalSaving, setModalSaving]   = useState(false);
  const [profileForm, setProfileForm]   = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [profileMsg, setProfileMsg]     = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const restaurant = restaurantOwner?.restaurant || {};

  useEffect(() => {
    if (!restaurantOwner) { navigate('/restaurant/login'); return; }
    setProfileForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      cuisine: restaurant.cuisine || '',
      city: restaurant.city || '',
      deliveryTime: restaurant.deliveryTime || '',
      minOrder: restaurant.minOrder || 99,
      isOpen: restaurant.isOpen !== false,
      ownerPhone: restaurant.ownerPhone || '',
      upiId: restaurant.upiId || '',
      upiName: restaurant.upiName || '',
      bankName: restaurant.bankName || '',
      accountNumber: restaurant.accountNumber || '',
      ifscCode: restaurant.ifscCode || '',
      accountHolder: restaurant.accountHolder || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantOwner]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try { setOrders(await getMyOrders()); } catch { } finally { setLoadingOrders(false); }
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoadingMenu(true);
    try { setMenuItems(await getMenu()); } catch { } finally { setLoadingMenu(false); }
  }, []);

  useEffect(() => {
    if (restaurantOwner) { fetchOrders(); fetchMenu(); }
  }, [restaurantOwner, fetchOrders, fetchMenu]);

  const handleConfirmPayment = async (orderId) => {
    setActionLoading(orderId + '_pay');
    try { await confirmPayment(orderId); fetchOrders(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setActionLoading(''); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setActionLoading(orderId + '_status');
    try { await updateOrderStatus(orderId, status); fetchOrders(); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setActionLoading(''); }
  };

  const handleMenuSave = async (form, imageFile) => {
    setModalSaving(true);
    try {
      if (menuModal && menuModal._id) { await updateMenuItem(menuModal._id, form, imageFile); }
      else { await addMenuItem(form, imageFile); }
      await fetchMenu(); setMenuModal(null);
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    finally { setModalSaving(false); }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleMenuItemAvailability(id);
      setMenuItems(m => m.map(i => i._id === id ? updated : i));
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from your menu?')) return;
    try { await deleteMenuItem(id); setMenuItems(m => m.filter(i => i._id !== id)); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleProfileSave = async () => {
    setProfileLoading(true); setProfileMsg('');
    try { await updateProfile(profileForm, profileImageFile); setProfileMsg('Saved successfully!'); }
    catch (e) { setProfileMsg('Error: ' + (e.response?.data?.message || 'Update failed')); }
    finally { setProfileLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/restaurant/login'); };

  const totalRevenue   = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingPayments = orders.filter(o => ['UPI', 'Online'].includes(o.paymentMethod) && o.paymentStatus !== 'paid').length;
  const activeOrders   = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const availableItems = menuItems.filter(i => i.isAvailable).length;

  const filteredMenu = menuFilter === 'All'      ? menuItems
    : menuFilter === 'Veg'     ? menuItems.filter(i => i.isVeg)
    : menuFilter === 'Non-Veg' ? menuItems.filter(i => !i.isVeg)
    : menuItems.filter(i => i.category === menuFilter);

  if (!restaurantOwner) return null;

  const initial = (restaurant.name || 'R').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d1a', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/*  Modal  */}
      {menuModal && (
        <MenuModal
          item={menuModal === 'add' ? null : menuModal}
          onClose={() => setMenuModal(null)}
          onSave={handleMenuSave}
          saving={modalSaving}
        />
      )}

      {/*  Top Header  */}
      <header style={{ background: 'linear-gradient(135deg,#0f0f24,#161630)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 200, flexShrink: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '16px' }}>
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: i === 1 ? '14px' : '18px', height: '2px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />)}
          </button>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 4px 16px rgba(109,40,217,0.4)' }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{restaurant.name || 'My Restaurant'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                {restaurant.cuisine} {restaurant.city ? ` ${restaurant.city}` : ''}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Status badge */}
            <div style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', background: restaurant.isOpen !== false ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: restaurant.isOpen !== false ? '#4ade80' : '#f87171', border: `1px solid ${restaurant.isOpen !== false ? 'rgba(74,222,128,0.35)' : 'rgba(248,113,113,0.35)'}` }}>
              {restaurant.isOpen !== false ? ' OPEN' : ' CLOSED'}
            </div>
            {/* Email (hidden on small) */}
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'none' }} className="hide-sm">{restaurant.ownerEmail}</div>
            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/*  Body  */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/*  Sidebar  */}
        <aside style={{
          width: sidebarOpen ? '220px' : '68px',
          flexShrink: 0,
          background: 'linear-gradient(180deg,#0f0f22 0%,#0d0d1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          minHeight: '100%',
        }}>
          {TABS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            const badge = id === 'orders' && activeOrders > 0 ? activeOrders : (id === 'menu' ? menuItems.length : null);
            return (
              <button key={id} onClick={() => setActiveTab(id)} title={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: sidebarOpen ? '12px 14px' : '12px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                background: active ? 'linear-gradient(135deg,rgba(124,58,237,0.18),rgba(124,58,237,0.06))' : 'transparent',
                border: active ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
                borderRadius: '12px',
                color: active ? '#7c3aed' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                {/* Left accent bar */}
                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', background: 'linear-gradient(180deg,#7c3aed,#6d28d9)', borderRadius: '0 4px 4px 0' }} />}
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}><Icon d={icon} size={18} color={active ? '#7c3aed' : 'currentColor'} /></span>
                {sidebarOpen && <span style={{ flex: 1 }}>{label}</span>}
                {sidebarOpen && badge !== null && (
                  <span style={{ background: id === 'orders' ? '#7c3aed' : 'rgba(255,255,255,0.12)', color: id === 'orders' ? '#fff' : 'rgba(255,255,255,0.5)', borderRadius: '10px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, padding: '0 5px' }}>{badge}</span>
                )}
                {!sidebarOpen && badge !== null && id === 'orders' && (
                  <span style={{ position: 'absolute', top: '6px', right: '6px', background: '#7c3aed', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>{badge}</span>
                )}
              </button>
            );
          })}

          {/* Sidebar bottom  logout shortcut */}
          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} title="Logout" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: sidebarOpen ? '11px 14px' : '11px',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.15)',
            borderRadius: '12px', color: '#f87171', cursor: 'pointer', fontSize: '14px',
            fontWeight: 600, width: '100%', whiteSpace: 'nowrap', transition: 'all 0.18s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.07)'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </aside>

        {/*  Main Content  */}
        <main style={{ flex: 1, padding: '28px 28px 48px', overflowX: 'hidden', overflowY: 'auto' }}>

          {/*  OVERVIEW  */}
          {activeTab === 'overview' && (
            <div>
              {/* Hero Banner */}
              <div style={{ borderRadius: '22px', overflow: 'hidden', marginBottom: '28px', position: 'relative', minHeight: '160px', background: 'linear-gradient(135deg,#1a1a35,#111128)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {restaurant.image && (
                  <img src={restaurant.image} alt={restaurant.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} onError={e => e.target.style.display='none'} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(13,13,26,0.95) 40%,rgba(13,13,26,0.4))' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{ width: '70px', height: '70px', borderRadius: '18px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 900, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(109,40,217,0.5)', border: '2px solid rgba(255,255,255,0.15)' }}>
                    {(restaurant.name || 'R').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '-0.3px' }}>{restaurant.name || 'My Restaurant'}</h1>
                      <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: restaurant.isOpen !== false ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.18)', color: restaurant.isOpen !== false ? '#4ade80' : '#f87171', border: `1px solid ${restaurant.isOpen !== false ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}` }}>
                        {restaurant.isOpen !== false ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {restaurant.cuisine && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}><Icon d="M5 3h14M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2M5 3l7 9 7-9" size={13} color='rgba(124,58,237,0.7)'/>{restaurant.cuisine}</span>}
                      {restaurant.city && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}><Icon d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" size={13} color='rgba(124,58,237,0.7)'/>{restaurant.city}</span>}
                      {restaurant.deliveryTime && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}><Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={13} color='rgba(124,58,237,0.7)'/>{restaurant.deliveryTime}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 18px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', color: '#38bdf8', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>View Orders</button>
                    <button onClick={() => setActiveTab('menu')} style={{ padding: '10px 18px', background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(124,58,237,0.1))', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '12px', color: '#7c3aed', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Manage Menu</button>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px', marginBottom: '32px' }}>
                <StatCard label="Total Orders"       value={orders.length}                         sub="All time"          color="#38bdf8" iconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <StatCard label="Active Orders"      value={activeOrders}                          sub="Right now"         color="#fbbf24" iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <StatCard label="Pending Payments"   value={pendingPayments}                       sub="Awaiting confirm"  color="#f87171" iconPath="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                <StatCard label="Revenue Confirmed"  value={'Rs. ' + totalRevenue.toLocaleString('en-IN')} sub="Paid orders"  color="#4ade80" iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <StatCard label="Menu Items"         value={menuItems.length}                      sub={availableItems + ' available'} color="#a78bfa" iconPath="M9 5l7 7-7 7" />
              </div>

              {/* Recent orders */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <h3 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800 }}>Recent Orders</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{orders.length > 0 ? `Latest ${Math.min(orders.length,6)} of ${orders.length}` : 'No orders yet'}</p>
                  </div>
                  <button onClick={() => setActiveTab('orders')} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '10px', color: '#7c3aed', cursor: 'pointer', fontSize: '12px', fontWeight: 700, padding: '7px 14px' }}>View All &rarr;</button>
                </div>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '52px 40px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" size={24} color='rgba(255,255,255,0.2)' />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>No orders yet</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Orders will appear here once customers place them.</div>
                  </div>
                ) : (
                  <div>
                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 1fr 1fr', gap: '12px', padding: '10px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['ORDER','CUSTOMER','ITEMS','AMOUNT','STATUS'].map(h => (
                        <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.8px' }}>{h}</div>
                      ))}
                    </div>
                    {orders.slice(0, 6).map((o, idx) => (
                      <div key={o._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 1fr 1fr', gap: '12px', padding: '14px 24px', borderBottom: idx < Math.min(orders.length,6)-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background=''}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#7c3aed' }}>#{o._id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.user?.name || '-'}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</div>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#4ade80' }}>Rs. {o.total?.toFixed(0)}</div>
                        <span style={{ padding: '4px 10px', background: `${STATUS_COLORS[o.status] || '#888'}18`, border: `1px solid ${STATUS_COLORS[o.status] || '#888'}40`, borderRadius: '20px', fontSize: '11px', color: STATUS_COLORS[o.status] || '#888', fontWeight: 700, display: 'inline-block' }}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/*  ORDERS  */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800 }}>Incoming Orders</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{orders.length} total &bull; {activeOrders} active</p>
                </div>
                <button onClick={fetchOrders} style={{ padding: '9px 20px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', color: '#38bdf8', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Refresh</button>
              </div>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" size={28} color='rgba(255,255,255,0.25)' />
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>No orders yet</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Orders will appear here once customers place them.</div>
                </div>
              ) : orders.map(order => (
                <div key={order._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `4px solid ${STATUS_COLORS[order.status] || '#888'}`, borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '15px' }}>Order #{order._id.slice(-8).toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{new Date(order.createdAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <span style={{ padding: '4px 12px', background: `${STATUS_COLORS[order.status] || '#888'}20`, border: `1px solid ${STATUS_COLORS[order.status] || '#888'}50`, borderRadius: '20px', fontSize: '12px', color: STATUS_COLORS[order.status] || '#888', fontWeight: 800 }}>{order.status}</span>
                      <span style={{ padding: '4px 12px', background: order.paymentStatus === 'paid' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${order.paymentStatus === 'paid' ? 'rgba(74,222,128,0.4)' : 'rgba(251,191,36,0.4)'}`, borderRadius: '20px', fontSize: '12px', color: order.paymentStatus === 'paid' ? '#4ade80' : '#fbbf24', fontWeight: 800 }}>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '4px' }}>CUSTOMER</div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{order.user?.name || '-'}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '4px' }}>PAYMENT METHOD</div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{order.paymentMethod}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)' }}>{item.quantity}x {item.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Rs. {(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '15px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#7c3aed' }}>
                      <span>Total</span><span>Rs. {order.total.toFixed(0)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['UPI', 'Online'].includes(order.paymentMethod) && order.paymentStatus !== 'paid' && (
                      <button onClick={() => handleConfirmPayment(order._id)} disabled={actionLoading === order._id + '_pay'} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#4ade80,#22c55e)', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}>
                        {actionLoading === order._id + '_pay' ? '...' : 'Confirm Payment'}
                      </button>
                    )}
                    {!['Delivered', 'Cancelled'].includes(order.status) && (
                      <select onChange={e => e.target.value && handleStatusUpdate(order._id, e.target.value)} defaultValue="" disabled={actionLoading === order._id + '_status'} style={{ padding: '9px 12px', background: '#162032', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '10px', color: '#38bdf8', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                        <option value="" disabled style={{ background: '#162032' }}>Update Status...</option>
                        {STATUS_FLOW.filter(s => STATUS_FLOW.indexOf(s) > STATUS_FLOW.indexOf(order.status)).map(s => <option key={s} value={s} style={{ background: '#162032', color: '#fff' }}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*  MENU  */}
          {activeTab === 'menu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800 }}>My Menu</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{menuItems.length} items &bull; {availableItems} available</p>
                </div>
                <button onClick={() => setMenuModal('add')} style={{ padding: '11px 24px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 20px rgba(109,40,217,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  + Add Item
                </button>
              </div>

              {/* Filter chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
                {['All', 'Veg', 'Non-Veg', ...CATEGORIES].map(f => (
                  <button key={f} onClick={() => setMenuFilter(f)} style={{ padding: '6px 14px', background: menuFilter === f ? '#7c3aed' : 'rgba(255,255,255,0.06)', border: `1px solid ${menuFilter === f ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', color: menuFilter === f ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', fontWeight: menuFilter === f ? 700 : 500 }}>{f}</button>
                ))}
              </div>

              {loadingMenu ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.35)' }}>Loading menu...</div>
              ) : filteredMenu.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon d="M9 5l7 7-7 7" size={28} color='rgba(255,255,255,0.25)' />
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>No items yet</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '20px' }}>Start building your menu by adding food items.</div>
                  <button onClick={() => setMenuModal('add')} style={{ padding: '12px 30px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 20px rgba(109,40,217,0.35)' }}>+ Add First Item</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                  {filteredMenu.map(item => (
                    <div key={item._id}
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.isAvailable ? 'rgba(255,255,255,0.08)' : 'rgba(248,113,113,0.2)'}`, borderRadius: '18px', overflow: 'hidden', opacity: item.isAvailable ? 1 : 0.68, transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                      {/* Image */}
                      <div style={{ height: '155px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,#14142a,#1e1e3a)' }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" size={30} color="rgba(255,255,255,0.12)" strokeWidth={1.2} />
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>No Image</span>
                            </div>
                        }
                        {/* Veg/Non-Veg dot */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', width: '22px', height: '22px', border: `2px solid ${item.isVeg ? '#4ade80' : '#f87171'}`, borderRadius: '4px', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.isVeg ? '#4ade80' : '#f87171' }} />
                        </div>
                        {/* Unavailable overlay */}
                        {!item.isAvailable && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ background: '#f87171', color: '#fff', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>Unavailable</span>
                          </div>
                        )}
                      </div>
                      {/* Details */}
                      <div style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 800, fontSize: '15px', flex: 1, paddingRight: '8px' }}>{item.name}</div>
                          <div style={{ fontWeight: 900, fontSize: '15px', color: '#7c3aed', flexShrink: 0 }}>Rs. {item.price}</div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {item.isVeg ? 'Veg' : 'Non-Veg'} &bull; {item.category}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '7px' }}>
                          <button onClick={() => handleToggle(item._id)} style={{ flex: 1, padding: '7px', background: item.isAvailable ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${item.isAvailable ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: '8px', color: item.isAvailable ? '#4ade80' : '#f87171', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
                            {item.isAvailable ? 'Active' : 'Inactive'}
                          </button>
                          <button onClick={() => setMenuModal(item)} style={{ padding: '7px 14px', background: 'rgba(168,139,250,0.1)', border: '1px solid rgba(168,139,250,0.3)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Edit</button>
                          <button onClick={() => handleDelete(item._id)} style={{ padding: '7px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>Del</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/*  PROFILE  */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '580px' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800 }}>Restaurant Profile</h2>
              <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Update your public information that customers see.</p>
              {profileMsg && <div style={{ background: profileMsg.startsWith('Saved') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${profileMsg.startsWith('Saved') ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`, borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', fontSize: '14px', fontWeight: 700 }}>{profileMsg}</div>}

              {/* Restaurant Image */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>RESTAURANT IMAGE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px' }}>Paste URL</div>
                    <input
                      value={profileForm.image || ''}
                      onChange={e => { setProfileForm(f => ({...f, image: e.target.value})); if (e.target.value) { setProfileImageFile(null); setProfileImagePreview(e.target.value); } else setProfileImagePreview(''); }}
                      placeholder='https://yourimage.com/photo.jpg'
                      style={inputSt}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px' }}>Upload Photo</div>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 12px', background: profileImageFile ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', border: `1.5px dashed ${profileImageFile ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: profileImageFile ? '#4ade80' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                      <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg>
                      {profileImageFile ? (profileImageFile.name.length > 16 ? profileImageFile.name.slice(0,14)+'...' : profileImageFile.name) : 'Choose file'}
                      <input type='file' accept='image/*' onChange={e => { const f = e.target.files[0]; if (!f) return; setProfileImageFile(f); const r = new FileReader(); r.onload = ev => setProfileImagePreview(ev.target.result); r.readAsDataURL(f); setProfileForm(pf => ({...pf, image:''})); }} style={{ display:'none' }} />
                    </label>
                  </div>
                </div>
                {(profileImagePreview || profileForm.image) && (
                  <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={profileImagePreview || profileForm.image} alt='preview' style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                    <button type='button' onClick={() => { setProfileImageFile(null); setProfileImagePreview(''); setProfileForm(f => ({...f, image:''})); }} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.7)', border:'none', borderRadius:'6px', color:'#fff', cursor:'pointer', fontSize:'11px', padding:'4px 10px', fontWeight:700 }}>Remove</button>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { label: 'RESTAURANT NAME', key: 'name' },
                  { label: 'CUISINE TYPE', key: 'cuisine' },
                  { label: 'CITY', key: 'city' },
                  { label: 'DELIVERY TIME', key: 'deliveryTime', placeholder: '30-40 min' },
                  { label: 'MIN ORDER (Rs.)', key: 'minOrder', type: 'number' },
                  { label: 'OWNER PHONE', key: 'ownerPhone' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={labelSt}>{label}</label>
                    <input type={type || 'text'} value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder || ''} style={inputSt} />
                  </div>
                ))}
                <div>
                  <label style={labelSt}>DESCRIPTION</label>
                  <textarea value={profileForm.description || ''} onChange={e => setProfileForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputSt, resize: 'vertical' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <input type="checkbox" checked={!!profileForm.isOpen} onChange={e => setProfileForm(f => ({ ...f, isOpen: e.target.checked }))} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>Restaurant is open for orders</span>
                  <span style={{ fontSize: '12px', color: profileForm.isOpen ? '#4ade80' : '#f87171', fontWeight: 800 }}>{profileForm.isOpen ? 'OPEN' : 'CLOSED'}</span>
                </label>
                <button onClick={handleProfileSave} disabled={profileLoading} style={{ padding: '14px', background: profileLoading ? 'rgba(124,58,237,0.35)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '15px', boxShadow: profileLoading ? 'none' : '0 4px 20px rgba(109,40,217,0.35)' }}>
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/*  PAYMENT  */}
          {activeTab === 'payment' && (
            <div style={{ maxWidth: '580px' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800 }}>Payment & Bank Settings</h2>
              <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Private and secure. Customers pay directly to your UPI ID.</p>
              {profileMsg && <div style={{ background: profileMsg.startsWith('Saved') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${profileMsg.startsWith('Saved') ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`, borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', fontSize: '14px', fontWeight: 700 }}>{profileMsg}</div>}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#7c3aed', fontSize: '15px', marginBottom: '4px' }}>UPI Details</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>This UPI ID is displayed to customers as the payment QR code.</div>
                </div>
                {[
                  { label: 'UPI ID', key: 'upiId', placeholder: '9876543210@ybl' },
                  { label: 'NAME ON UPI', key: 'upiName', placeholder: 'PRIYA SHARMA' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={labelSt}>{label}</label>
                    <input value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inputSt} />
                  </div>
                ))}
                <div style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '14px', padding: '16px', marginTop: '4px' }}>
                  <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '15px', marginBottom: '4px' }}>Bank Account</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>For settlement records and payouts.</div>
                </div>
                {[
                  { label: 'BANK NAME', key: 'bankName', placeholder: 'State Bank of India' },
                  { label: 'ACCOUNT NUMBER', key: 'accountNumber', placeholder: '1234567890' },
                  { label: 'IFSC CODE', key: 'ifscCode', placeholder: 'SBIN0001234' },
                  { label: 'ACCOUNT HOLDER', key: 'accountHolder', placeholder: 'Priya Sharma' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={labelSt}>{label}</label>
                    <input value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inputSt} />
                  </div>
                ))}
                <button onClick={handleProfileSave} disabled={profileLoading} style={{ padding: '14px', background: profileLoading ? 'rgba(124,58,237,0.35)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '15px', boxShadow: profileLoading ? 'none' : '0 4px 20px rgba(109,40,217,0.35)' }}>
                  {profileLoading ? 'Saving...' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

