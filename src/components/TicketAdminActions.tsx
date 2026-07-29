"use client";

import { useState } from "react";
import { ticketStatusOptions, type TicketStatus } from "@/lib/tickets";

export function TicketAdminActions({ ticketId, currentStatus }: { ticketId: string; currentStatus: TicketStatus }) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/tickets/${encodeURIComponent(ticketId)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    const result = await response.json() as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setMessage(result.error || "保存失败。");
      return;
    }
    setMessage("已保存并写入审计记录。");
    setNote("");
  }

  return <div className="ticket-admin-actions">
    <select className="field" value={status} onChange={(event) => setStatus(event.target.value as TicketStatus)}>{ticketStatusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
    <input className="field" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder="内部备注（选填）" />
    <button className="btn" type="button" disabled={saving} onClick={save}>{saving ? "保存中…" : "保存"}</button>
    {message && <small>{message}</small>}
  </div>;
}
