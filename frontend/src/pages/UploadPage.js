import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  File,
  Loader,
} from "lucide-react";
import { documentApi } from "../lib/api";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/bmp",
  "image/webp",
];

function getFileIcon(file) {
  if (file.type === "application/pdf")
    return { icon: FileText, color: "var(--red)", bg: "rgba(239,68,68,0.12)" };
  if (file.type.startsWith("image/"))
    return { icon: Image, color: "var(--accent)", bg: "var(--accent-glow)" };
  return { icon: File, color: "var(--text-muted)", bg: "var(--bg-hover)" };
}

function formatSize(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function UploadItem({ item, onRemove }) {
  const { file, status, progress, error, result } = item;
  const { icon: Icon, color, bg } = getFileIcon(file);
  const pct = Math.round(progress);

  return (
    <div className="upload-item">
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 9,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div className="upload-item-info">
        <div className="upload-item-name">{file.name}</div>
        <div className="upload-item-meta">
          {formatSize(file.size)} ·{" "}
          {file.type.split("/")[1]?.toUpperCase() || "FILE"}
        </div>
        {status === "uploading" && (
          <div style={{ marginTop: 6 }}>
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: pct + "%" }} />
            </div>
          </div>
        )}
        {status === "done" && result && (
          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>
              Score:{" "}
              <strong
                style={{
                  color:
                    result.confidenceScore >= 70
                      ? "var(--green)"
                      : "var(--red)",
                }}
              >
                {Math.round(result.confidenceScore)}
              </strong>
            </span>
            <span
              className={`badge ${result.status === "APPROVED" ? "badge-green" : "badge-red"}`}
              style={{ padding: "1px 8px", fontSize: 11 }}
            >
              {result.status === "APPROVED" ? "✓ Approved" : "✗ Rejected"}
            </span>
            {result.blurry && (
              <span className="blur-badge blur-yes">⚠ Blurry</span>
            )}
            {result.pages > 0 && (
              <span style={{ color: "var(--text-muted)" }}>
                {result.pages} page{result.pages > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
        {status === "error" && (
          <div style={{ marginTop: 4, fontSize: 12, color: "var(--red)" }}>
            {error}
          </div>
        )}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        {status === "uploading" && (
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              minWidth: 32,
              textAlign: "right",
            }}
          >
            {pct}%
          </span>
        )}
        {status === "done" && <CheckCircle size={18} color="var(--green)" />}
        {status === "error" && <AlertCircle size={18} color="var(--red)" />}
        {status === "queued" && <Loader size={16} color="var(--text-muted)" />}
        <button
          onClick={() => onRemove(item.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: 4,
            borderRadius: 6,
          }}
          className="sign-out"
          style={{ width: "auto", marginTop: 0, padding: "4px" }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const inputRef = useRef();

  const processFiles = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      status: "queued",
      progress: 0,
      error: null,
      result: null,
    }));

    setUploads((prev) => [...prev, ...newItems]);

    // Upload sequentially to avoid overwhelming the server
    newItems.forEach((item, idx) => {
      setTimeout(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "uploading" } : u,
          ),
        );
        documentApi
          .upload(item.file, (e) => {
            const pct = e.total ? (e.loaded / e.total) * 100 : 0;
            setUploads((prev) =>
              prev.map((u) => (u.id === item.id ? { ...u, progress: pct } : u)),
            );
          })
          .then((res) => {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: "done", progress: 100, result: res.data }
                  : u,
              ),
            );
          })
          .catch((err) => {
            const msg = err.response?.data?.error || "Upload failed";
            setUploads((prev) =>
              prev.map((u) =>
                u.id === item.id ? { ...u, status: "error", error: msg } : u,
              ),
            );
          });
      }, idx * 300);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeItem = (id) =>
    setUploads((prev) => prev.filter((u) => u.id !== id));
  const clearDone = () =>
    setUploads((prev) => prev.filter((u) => u.status !== "done"));

  const done = uploads.filter((u) => u.status === "done").length;
  const inProgress = uploads.filter((u) => u.status === "uploading").length;
  const errors = uploads.filter((u) => u.status === "error").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Upload</h1>
        {uploads.length > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {done > 0 && <span className="badge badge-green">{done} done</span>}
            {inProgress > 0 && (
              <span className="badge badge-blue">{inProgress} uploading</span>
            )}
            {errors > 0 && (
              <span className="badge badge-red">{errors} failed</span>
            )}
            <button className="btn btn-secondary" onClick={clearDone}>
              <X size={13} /> Clear done
            </button>
          </div>
        )}
      </div>

      <div className="page-body" style={{ maxWidth: 680 }}>
        <div
          className={`upload-zone${dragging ? " dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
        >
          <Upload
            size={44}
            color={dragging ? "var(--accent)" : "var(--text-muted)"}
            style={{ marginBottom: 16 }}
          />
          <h3>
            {dragging ? "Drop files to upload" : "Drag & drop files here"}
          </h3>
          <p>
            or <span className="link">click to browse</span>
          </p>
          <p style={{ marginTop: 8 }}>
            PDF, PNG, JPG, GIF, BMP, WEBP — up to 100 MB each
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              processFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[
            {
              icon: "📄",
              title: "PDF Analysis",
              desc: "Extracts pages, author, metadata via PDFBox",
            },
            {
              icon: "🖼️",
              title: "Image Vision",
              desc: "Blur detection via Python OpenCV",
            },
            {
              icon: "🧠",
              title: "AI Scoring",
              desc: "Fuzzy logic scores 0–100, flags < 70",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {uploads.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Uploads ({uploads.length})
              </span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "5px 12px" }}
                onClick={() => setUploads([])}
              >
                <X size={12} /> Clear all
              </button>
            </div>
            {uploads.map((u) => (
              <UploadItem key={u.id} item={u} onRemove={removeItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
