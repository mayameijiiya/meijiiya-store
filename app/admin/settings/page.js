"use client";

import { useEffect, useState } from "react";

const SOCIAL_FIELDS = [
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "shopee", label: "Shopee" },
  { key: "lemon8", label: "Lemon8" },
  { key: "youtube", label: "YouTube" },
  { key: "email", label: "Email" },
  { key: "phone", label: "เบอร์โทรศัพท์" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  if (!settings) return <p className="text-graytext text-sm">กำลังโหลด...</p>;

  function update(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
  }

  function updateSocial(key, value) {
    setSettings((s) => ({ ...s, socials: { ...s.socials, [key]: value } }));
  }

  function updateStep(idx, value) {
    const steps = [...settings.howToOrderSteps];
    steps[idx] = value;
    update("howToOrderSteps", steps);
  }

  function addStep() {
    update("howToOrderSteps", [...settings.howToOrderSteps, ""]);
  }

  function removeStep(idx) {
    update(
      "howToOrderSteps",
      settings.howToOrderSteps.filter((_, i) => i !== idx)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = { ...settings };
    if (newPassword.trim()) {
      payload.adminPassword = newPassword.trim();
    }
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      setNewPassword("");
    } else {
      setMessage("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl text-ink mb-1">ตั้งค่าร้าน</h1>
      <p className="text-sm text-graytext mb-8">แก้ไขข้อมูลแบรนด์ ลิงก์ LINE ช่องทางติดต่อ และข้อความต่างๆ บนเว็บไซต์</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <SettingsSection title="ข้อมูลร้าน">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="ชื่อร้าน (English)">
              <input value={settings.shopNameEn} onChange={(e) => update("shopNameEn", e.target.value)} className="input-base" />
            </Field>
            <Field label="ชื่อร้าน (ไทย)">
              <input value={settings.shopNameTh} onChange={(e) => update("shopNameTh", e.target.value)} className="input-base" />
            </Field>
            <Field label="Tagline">
              <input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} className="input-base" />
            </Field>
            <Field label="โลโก้ (path ไฟล์ใน public/ เช่น /logo.png)">
              <input value={settings.logoPath} onChange={(e) => update("logoPath", e.target.value)} className="input-base" placeholder="/logo.png" />
            </Field>
          </div>
          <Field label="ข้อความแนะนำร้านสั้นๆ (Hero section)">
            <textarea value={settings.shortIntro} onChange={(e) => update("shortIntro", e.target.value)} rows={2} className="input-base" />
          </Field>
          <Field label="ข้อความแนะนำร้านแบบเต็ม">
            <textarea value={settings.aboutText} onChange={(e) => update("aboutText", e.target.value)} rows={3} className="input-base" />
          </Field>
        </SettingsSection>

        <SettingsSection title="LINE & ช่องทางติดต่อ">
          <Field label="ลิงก์ LINE Official Account">
            <input value={settings.lineLink} onChange={(e) => update("lineLink", e.target.value)} className="input-base" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SOCIAL_FIELDS.map((s) => (
              <Field key={s.key} label={s.label}>
                <input
                  value={settings.socials?.[s.key] || ""}
                  onChange={(e) => updateSocial(s.key, e.target.value)}
                  className="input-base"
                />
              </Field>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection title="การจัดส่งและวิธีสั่งซื้อ">
          <Field label="ข้อความข้อมูลการจัดส่ง">
            <input value={settings.shippingText} onChange={(e) => update("shippingText", e.target.value)} className="input-base" />
          </Field>
          <Field label="ขั้นตอนวิธีสั่งซื้อ">
            <div className="flex flex-col gap-2">
              {settings.howToOrderSteps.map((step, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-graytext w-6">{i + 1}.</span>
                  <input value={step} onChange={(e) => updateStep(i, e.target.value)} className="input-base flex-1" />
                  <button type="button" onClick={() => removeStep(i)} className="text-red-600 text-xs px-2">
                    ลบ
                  </button>
                </div>
              ))}
              <button type="button" onClick={addStep} className="btn-outline text-xs self-start mt-1">
                + เพิ่มขั้นตอน
              </button>
            </div>
          </Field>
          <Field label="ข้อความแจ้งลูกค้าเรื่องไม่มีระบบชำระเงินอัตโนมัติ">
            <textarea value={settings.noOnlinePaymentNotice} onChange={(e) => update("noOnlinePaymentNotice", e.target.value)} rows={3} className="input-base" />
          </Field>
          <Field label="ข้อความ Footer">
            <textarea value={settings.footerNote} onChange={(e) => update("footerNote", e.target.value)} rows={2} className="input-base" />
          </Field>
        </SettingsSection>

        <SettingsSection title="ความปลอดภัย">
          <Field label="เปลี่ยนรหัสผ่าน Admin (เว้นว่างถ้าไม่ต้องการเปลี่ยน)">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              className="input-base"
            />
          </Field>
        </SettingsSection>

        {message && <p className="text-sm text-ink">{message}</p>}

        <div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsSection({ title, children }) {
  return (
    <div className="bg-white brand-border p-6 flex flex-col gap-5">
      <h2 className="text-sm tracking-wide2 uppercase text-graytext">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-graytext">{label}</label>
      {children}
    </div>
  );
}
