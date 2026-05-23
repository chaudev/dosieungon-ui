import React from "react";

export type ButtonIconName =
  | "plus"
  | "download"
  | "upload"
  | "import"
  | "export"
  | "close"
  | "save"
  | "delete"
  | "arrow-right"
  | "arrow-left"
  | "arrow-top"
  | "arrow-down";

const S = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2 as number,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function renderButtonIcon(name: string): React.ReactElement | null {
  switch (name) {
    case "plus":
      return <svg {...S}><path d="M8 3v10M3 8h10" /></svg>;
    case "close":
      return <svg {...S}><path d="M4 4l8 8M12 4l-8 8" /></svg>;
    case "arrow-right":
      return <svg {...S}><path d="M3 8h10M9 4l4 4-4 4" /></svg>;
    case "arrow-left":
      return <svg {...S}><path d="M13 8H3M7 4L3 8l4 4" /></svg>;
    case "arrow-top":
      return <svg {...S}><path d="M8 13V3M4 7l4-4 4 4" /></svg>;
    case "arrow-down":
      return <svg {...S}><path d="M8 3v10M4 9l4 4 4-4" /></svg>;
    case "download":
      return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '1.2em', height: '1.2em' }}>
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5z" />
        </svg>
      );
    case "upload":
      return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" style={{ width: '1.2em', height: '1.2em' }}>
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zM7 9l1.41 1.41L11 7.83V16h2V7.83l2.59 2.58L17 9l-5-5-5 5z" />
        </svg>
      );
    case "import":
      return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em">
          <path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3s-3.582-3-8-3s-8 1.343-8 3" />
          <path d="M4 6v6c0 1.657 3.582 3 8 3c.856 0 1.68-.05 2.454-.144m5.546-2.856v-6" />
          <path d="M4 12v6c0 1.657 3.582 3 8 3c.171 0 .341-.002.51-.006" />
          <path d="M19 22v-6" />
          <path d="M22 19l-3-3-3 3" />
        </svg>
      );
    case "export":
      return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em">
          <path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3s-3.582-3-8-3s-8 1.343-8 3" />
          <path d="M4 6v6c0 1.657 3.582 3 8 3c1.118 0 2.183-.086 3.15-.241" />
          <path d="M20 12v-6" />
          <path d="M4 12v6c0 1.657 3.582 3 8 3c.157 0 .312-.002.466-.005" />
          <path d="M16 19h6" />
          <path d="M19 16l3 3-3 3" />
        </svg>
      );
    case "save":
      return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em">
          <path d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z" />
        </svg>
      );
    case "delete":
      return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em">
          <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" />
        </svg>
      );
    default:
      return null;
  }
}
