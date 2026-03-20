import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { apiRequest } from "@/utils/api";
import WebUser from "@/utils/user";
import {
  buildExpenseCategoryIdMap,
  type ExpenseCategoryRecord,
} from "@/lib/expense-categories";
// [*] 淇敼锛氬紩鍏?Repeat 鍜?LogOut 鍥炬爣鐢ㄤ簬涓嬫媺鑿滃崟
import {
  Settings,
  ChevronDown,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Calendar as CalendarIcon,
  Repeat,
  LogOut,
} from "lucide-react";

// --- 鑷畾涔変晶杈规爮鍥炬爣缁勪欢 ---

const IconExpenses = ({ active }: { active?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M12.9167 14.1665H17.9167"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8333 16.2502L17.9166 14.1668L15.8334 12.0835"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.9166 10.8332V4.1665C17.9166 3.47615 17.357 2.9165 16.6666 2.9165H3.33325C2.6429 2.9165 2.08325 3.47615 2.08325 4.1665V15.8332C2.08325 16.5235 2.6429 17.0832 3.33325 17.0832H11.8627"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 6.25L8.33333 8.75L10.4167 6.25"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83325 11.25H10.8333"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83325 8.75H10.8333"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.33325 8.75V13.75"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconIncome = ({ active }: { active?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M12.9167 14.1665H17.9167"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.9166 10.8332V4.1665C17.9166 3.47615 17.357 2.9165 16.6666 2.9165H3.33325C2.6429 2.9165 2.08325 3.47615 2.08325 4.1665V15.8332C2.08325 16.5235 2.6429 17.0832 3.33325 17.0832H11.8627"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.0001 16.2502L12.9167 14.1668L14.9999 12.0835"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.25 6.25L8.33333 8.75L10.4167 6.25"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83325 11.25H10.8333"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.83325 8.75H10.8333"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.33325 8.75V13.75"
      stroke={active ? "white" : "#565656"}
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CustomCalendarIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M2.5 9.5H21.5V20.5C21.5 21.0523 21.0523 21.5 20.5 21.5H3.5C2.94771 21.5 2.5 21.0523 2.5 20.5V9.5Z"
      stroke="#565656"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M2.5 5C2.5 4.44771 2.94771 4 3.5 4H20.5C21.0523 4 21.5 4.44771 21.5 5V9.5H2.5V5Z"
      fill="#5D84FF"
      stroke="#565656"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 2.5V6.5"
      stroke="#565656"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 2.5V6.5"
      stroke="#565656"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CATEGORIES = [
  {
    id: "housing",
    name: "Housing",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIyIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTggMTkuNjQ4Nkg0QzMuNDQ3NzIgMTkuNjQ4NiAzIDE5LjIwMDkgMyAxOC42NDg2VjkuNjQ4NTZIMC4zMjczIDAuMjYwMDYyQzEwLjcwODcgLTAuMDg2Njg3NSAxMS4yOTEzIC0wLjA4NjY4NzUgMTEuNjcyNyAwLjI2MDA2MkwyMiA5LjY0ODU2SDE5VjE4LjY0ODZDMTkgMTkuMjAwOSAxOC41NTIzIDE5LjY0ODYgMTggMTkuNjQ4NlpNMTIgMTcuNjQ4NkgxN1Y3LjgwNjAxTDExIDIuMzUxNDZMNSA3LjgwNjAxVjE3LjY0ODZIMTBWMTEuNjQ4NkgxMlYxNy42NDg2WiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=",
    tags: ["Rent/mortgage", "Property Tax", "Home Insurance", "Maintenance"],
  },
  {
    id: "utilities",
    name: "Utilities",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTAgMjBDNC40NzcxNSAyMCAwIDE1LjUyMjggMCAxMEMwIDQuNDc3MTUgNC40NzcxNSAwIDEwIDBDMTUuNTIyOCAwIDIwIDQuNDc3MTUgMjAgMTBDMjAgMTUuNTIyOCAxNS41MjI4IDIwIDEwIDIwWk03LjcxMDAyIDE3LjY2NzRDNi43NDc0MyAxNS42MjU5IDYuMTU3MzIgMTMuMzc0MiA2LjAyNzMxIDExSDIuMDYxODlDMi40NTggMTQuMTc2NSA0LjcxNjM5IDE2Ljc3NDcgNy43MTAwMiAxNy42Njc0Wk04LjAzMDcgMTFDOC4xODExIDEzLjQzODggOC44Nzc4IDE1LjcyOTcgMTAgMTcuNzUyQzExLjEyMjIgMTUuNzI5NyAxMS44MTg5IDEzLjQzODggMTEuOTY5MyAxMUg4LjAzMDdaTTE3LjkzODEgMTFIMTMuOTcyN0MxMy44NDI3IDEzLjM3NDIgMTMuMjUyNiAxNS42MjU5IDEyLjI5IDE3LjY2NzRDMTUuMjgzNiAxNi43NzQ3IDE3LjU0MiAxNC4xNzY1IDE3LjkzODEgMTFaTTIuMDYxODkgOUg2LjAyNzMxQzYuMTU3MzIgNi42MjU3NyA2Ljc0NzQzIDQuMzc0MDcgNy43MTAwMiAyLjMzMjU2QzQuNzE2MzkgMy4yMjUzMyAyLjQ1OCA1LjgyMzUgMi4wNjE4OSA5Wk04LjAzMDcgOUgxMS45NjkzQzExLjgxODkgNi41NjEyMiAxMS4xMjIyIDQuMjcwMjUgMTAgMi4yNDc5OUM4Ljg3NzggNC4yNzAyNSA4LjE4MTEgNi41NjEyMiA4LjAzMDcgOVpNMTIuMjkgMi4zMzI1NkMxMy4yNTI2IDQuMzc0MDcgMTMuODQyNyA2LjYyNTc3IDEzLjk3MjcgOUgxNy45MzgxQzE3LjU0MiA1LjgyMzUgMTUuMjgzNiAzLjIyNTMzIDEyLjI5IDIuMzMyNTZaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==",
    tags: ["Electricity", "Water", "Gas", "Internet"],
  },
  {
    id: "transport",
    name: "Transport",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDIwIDE4IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTcgMTZIM1YxN0MzIDE3LjU1MjMgMi41NTIyOCAxOCAyIDE4SDFDMC40NDc3MiAxOCAwIDE3LjU1MjMgMCAxN1Y3TDIuNDgwNSAxLjIxMjE2QzIuNzk1NjYgMC40NzY3OSAzLjUxODc0IDAgNC4zMTg3OSAwSDE1LjY4MTJDMTY0ODEzIDAgMTcuMjA0MyAwLjQ3Njc5IDE3LjUxOTUgMS4yMTIxNkwyMCA3VjE3QzIwIDE3LjU1MjMgMTkuNTUyMyAxOCAxOSAxOEgxOEMxNy40NDc3IDE4IDE3IDE3LjU1MjMgMTcgMTdWMTZaTTE4IDlIMlYxNEgxOFY5Wk0yLjE3NTk0IDdIMTcuODI0MUwxNS42ODEyIDJINC4zMTg3OUwyLjE3NTk0IDdaTTQuNSAxM0MzLjY3MTU3IDEzIDMgMTIuMzI4NCAzIDExLjVDMyAxMC42NzE2IDMuNjcxNTcgMTAgNC41IDEwQzUuMzI4NDMgMTAgNiAxMC42NzE2IDYgMTEuNUM2IDEyLjMyODQgNS4zMjg0MyAxMyA0LjUgMTNaTTE1LjUgMTNDMTQuNjcxNiAxMyAxNCAxMi4zMjg0IDE0IDExLjVDMTQgMTAuNjcxNiAxNC42NzE2IDEwIDE1LjUgMTBDMTYuMzI4NCAxMCAxNyAxMC42NzE2IDE3IDExLjVDMTcgMTIuMzI4NCAxNi4zMjg0IDEzIDE1LjUgMTNaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==",
    tags: ["Fuel", "Parking", "Public Transit", "Repairs"],
  },
  {
    id: "personal",
    name: "Personal",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDIwIDE4IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMCAxNkgyMFYxOEgwVjE2Wk05LjAwMDAyIDVIMTFWMTNIOS4wMDAwMlY1Wk01Ljk2NTEzIDVMNC4xMDQyNCAxMC4xMTI3TDIuMjQzMzYgNUgwLjExODQ2TDMuMTA0MjQgMTIuOTYzN0g1LjEwNDI0TDguMDkwMDIgNUg1Ljk2NTEzWk0xNSAxMVYxM0gxM1Y1SDE3QzE4LjY1NjggNSAyMCA2LjM0MzE1IDIwIDhDMjAgOS42NTY5IDE4LjY1NjggMTEgMTcgMTFIMTVaTTE1IDdWOUgxN0MxNy41NTIzIDkgMTggOC41NTIzIDE4IDhDMTggNy40NDc3IDE3LjU1MjMgNyAxNyA3SDE1Wk0wIDBIMjBWMkgwVjBaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==",
    tags: ["Haircut", "Clothing", "Gym", "Gifts"],
  },
  {
    id: "medical",
    name: "Medical",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDE4IDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTQgMFYySDE3QzE3LjU1MjMgMiAxOCAyLjQ0NzcyIDE4IDNWMTlDMTggMTkuNTUyMyAxNy41NTIzIDIwIDE3IDIwSDFDMC40NDc3MiAyMCAwIDE5LjU1MjMgMCAxOVYzQzAgMi40NDc3MiAwLjQ0NzcyIDIgMSAySDRWMEgxNFpNNCA0SDJWMThIMTZWNEgxNFY2SDRWNFpNMTAgOVYxMUgxMlYxM0g5Ljk5OUwxMCAxNUg4TDcuOTk5IDEzSDZWMTFIOFY5SDEwWk0xMiAySDZWNEgxMlYyWiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=",
    tags: ["Checkup", "Medicine", "Dental", "Vision"],
  },
  {
    id: "loans",
    name: "Loans",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDE4IDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTMuOTk5OCAxNEgxNS45OTk4VjJINS45OTk4VjRIMTMuOTk5OFYxNFpNMTMuOTk5OCAxNlYxOC45OTkxQzEzLjk5OTggMTkuNTUxOSAxMy41NDk4IDIwIDEyLjk5MjkgMjBIMS4wMDY2NkMwLjQ1MDYgMjAgMCAxOS41NTU0IDAgMTguOTk5MUwwLjAwMjYgNS4wMDA4N0MwLjAwMjcgNC40NDgxIDAuNDUyNiA0IDEuMDA5NCA0SDMuOTk5OFYxQzMuOTk5OCAwLjQ0NzcxIDQuNDQ3NSAwIDQuOTk5OCAwSDE2Ljk5OThDMTcuNTUyMSAwIDE3Ljk5OTggMC40NDc3MSAxNy45OTk4IDFWMTVDMTcuOTk5OCAxNS41NTIzIDE3LjU1MjEgMTYgMTYuOTk5OCAxNkgxMy45OTk4Wk0yLjAwMjQyIDZMMi4wMDAyIDE4SDExLjk5OThWNkgyLjAwMjQyWk0zLjk5OTggMTRIOC40OTk4MkM4Ljc3NTkyIDE0IDguOTk5ODIgMTMuNzc2MSA4Ljk5OTgyIDEzLjVDOC45OTk4MiAxMy4yMjM5IDguNzc1OTIgMTMgOC40OTk4MiAxM0g1LjQ5OThDNC4xMTkwOSAxMyAyLjk5OTggMTEuODgwNyAyLjk5OTggMTAuNUMyLjk5OTggOS4xMTkyOSA0LjExOTA5IDcuOTk5OTkgNS40OTk4IDcuOTk5OTlINS45OTk4VjdINy45OTk4MlY3Ljk5OTk5SDkuOTk5ODJWMTBINS40OTk4QzUuMjIzNjYgMTAgNC45OTk4IDEwLjIzMzkgNC45OTk4IDEwLjVDNC45OTk4IDEwLjc3NjEgNS4yMjM2NiAxMSA1LjQ5OTggMTFIOC40OTk4MkM5Ljg4MDUyIDExIDEwLjk5OTggMTIuMTE5MyAxMC45OTk4IDEzLjVDMTAuOTk5OCAxNC44ODA3IDkuODgwNTIgMTYgOC40OTk4MiAxNkg3Ljk5OTgyVjE3SDUuOTk5OFYxNkgzLjk5OThWMTRaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==",
    tags: ["Student Loan", "Credit Card", "Personal Loan"],
  },
  {
    id: "obligations",
    name: "Obligations",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDE4IDIyIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMC43ODMwNyAxLjgyNTk4TDkgMEwxNy4yMTY5IDEuODI1OThDMTcuNjc0NSAxLjkyNzY2IDE4IDIuMzMzNDcgMTggMi44MDIxN1YxMi43ODg5QzE4IDE0Ljc5NSAxNi45OTc0IDE2LjY2ODQgMTUuMzI4MiAxNy43ODEyTDkgMjJMMi42NzE4IDE3Ljc4MTJDMS4wMDI2MSAxNi42Njg0IDAgMTQuNzk1IDAgMTIuNzg4OVYyLjgwMjE3QzAgMi4zMzM0NyAwLjMyNTUzIDEuOTI3NjYgMC43ODMwNyAxLjgyNTk4Wk0yIDMuNjA0MzRWMTIuNzg4OUMyIDE0LjEyNjMgMi42Njg0IDE1LjM3NTIgMy43ODEyIDE2LjExNzFMOSAxOS41OTYzTDE0LjIxODggMTYuMTE3MUMxNS4zMzE2IDE1LjM3NTIgMTYgMTQuMTI2MyAxNiAxMi43ODg5VjMuNjA0MzRMOSAyLjA0ODc5TDIgMy42MDQzNFpNOSAxMEM3LjYxOTMgMTAgNi41IDguODgwNzEgNi41IDcuNUM2LjUgNi4xMTkyOSA3LjYxOTMgNSA5IDVDMTAuMzgwNyA1IDExLjUgNi4xMTkyOSAxMS41IDcuNUMxMS41IDguODgwNzEgMTAuMzgwNyAxMCA5IDEwWk00LjUyNzQ2IDE1QzQuNzc2MTkgMTIuNzUgNi42ODM3MiAxMSA5IDExQzExLjMxNjMgMTEgMTMuMjIzOCAxMi43NSAxMy40NzI1IDE1SDQuNTI3NDZaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==",
    tags: ["Taxes", "Legal Fees", "Insurance"],
  },
  {
    id: "discretionary",
    name: "Discretionary",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='21' viewBox='0 0 18 21' fill='none'><path d='M6 5H12C12 3.34315 10.6569 2 9 2C7.3431 2 6 3.34315 6 5ZM4 5C4 2.23858 6.23858 0 9 0C11.7614 0 14 2.23858 14 5H17C17.5523 5 18 5.44772 18 6V20C18 20.5523 17.5523 21 17 21H1C0.44772 21 0 20.5523 0 20V6C0 5.44772 0.44772 5 1 5H4ZM2 7V19H16V7H2ZM6 9C6 10.6569 7.3431 12 9 12C10.6569 12 12 10.6569 12 9H14C14 11.7614 11.7614 14 9 14C6.23858 14 4 11.7614 4 9H6Z' fill='%23303236'/></svg>",
    tags: ["Dining Out", "Coffee", "Movies", "Hobbies"],
  },
  {
    id: "career",
    name: "Career",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNNSA0VjFDNSAwLjQ0NzcyIDUuNDQ3NzIgMCA2IDBIMTRDMTQuNTUyMyAwIDE1IDAuNDQ3NzIgMTUgMVY0SDE5QzE5LjU1MjMgNCAyMCA0LjQ0NzcyIDIwIDVWMTlDMjAgMTkuNTUyMyAxOS41NTIzIDIwIDE5IDIwSDFDMC40NDc3MiAyMCAwIDE5LjU1MjMgMCAxOVY1QzAgNC40NDc3MiAwLjQ0NzcyIDQgMSA0SDVaTTcgMTJIMlYxOEgxOFYxMkgxM1YxNUg3VjEyWk0xOCA2SDJWMTBIN1Y4SDEzVjEwSDE4VjZaTTkgMTBWMTNIMTFWMTBIOVpNNyAyVjRIMTNWMkg3WiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=",
    tags: ["Courses", "Books", "Software"],
  },
];

type ExpenseCategory = {
  id: number;
  name: string;
  iconUrl?: string | null;
};

type ExpenseItem = {
  id: number;
  amount: number;
  note: string | null;
  categoryId: number;
  category?: ExpenseCategory | null;
  incurredAt: string;
};

type DateRange = {
  from: Date;
  to: Date;
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  housing: ["housing"],
  utilities: ["utilities"],
  transport: ["transport", "transportation"],
  personal: ["personal", "personalcare"],
  medical: ["medical", "health", "healthcare"],
  loans: ["loan", "loans"],
  obligations: ["obligation", "tax", "insurance"],
  discretionary: ["discretionary", "entertainment"],
  career: ["career", "education"],
};

const normalizeCategoryKey = (value?: string | null) =>
  (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const formatInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatInputTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const getInitialDateRange = (): DateRange => {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setMonth(from.getMonth() - 1);
  from.setHours(0, 0, 0, 0);
  return { from, to };
};

const findUiCategoryByName = (categoryName?: string | null) => {
  const normalized = normalizeCategoryKey(categoryName);
  if (!normalized) return null;

  for (const cat of CATEGORIES) {
    const aliases = [
      normalizeCategoryKey(cat.id),
      normalizeCategoryKey(cat.name),
      ...(CATEGORY_ALIASES[cat.id] ?? []),
    ].map(normalizeCategoryKey);

    if (
      aliases.some(
        (alias) =>
          alias && (normalized.includes(alias) || alias.includes(normalized)),
      )
    ) {
      return cat;
    }
  }

  return null;
};

export default function MyExpenses() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Expenses");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<{
    name?: string | null;
    email?: string | null;
    avartarPicUrl?: string | null;
  } | null>(null);

  const initialRangeRef = useRef<DateRange>(getInitialDateRange());
  const [dateRange, setDateRange] = useState<DateRange>(
    initialRangeRef.current,
  );
  const [pickerMonth, setPickerMonth] = useState<Date>(
    new Date(
      initialRangeRef.current.to.getFullYear(),
      initialRangeRef.current.to.getMonth(),
      1,
    ),
  );
  const [tempFromDate, setTempFromDate] = useState<Date | null>(
    initialRangeRef.current.from,
  );
  const [tempToDate, setTempToDate] = useState<Date | null>(
    initialRangeRef.current.to,
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryIdMap, setCategoryIdMap] = useState<Record<string, number>>(
    {},
  );

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [selectedTag, setSelectedTag] = useState(CATEGORIES[0].tags[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [amount, setAmount] = useState("0.00");
  const [note, setNote] = useState("");
  const [expenseDate, setExpenseDate] = useState(formatInputDate(new Date()));
  const [expenseTime, setExpenseTime] = useState(formatInputTime(new Date()));
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
  const [pendingDeleteExpenseIds, setPendingDeleteExpenseIds] = useState<
    number[]
  >([]);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [isInnerCalendarOpen, setIsInnerCalendarOpen] = useState(false);
  const [isInnerTimeOpen, setIsInnerTimeOpen] = useState(false);
  const [innerCalendarMonth, setInnerCalendarMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const calendarPopRef = useRef<HTMLDivElement>(null);
  const timePopRef = useRef<HTMLDivElement>(null);
  const selectAllExpensesRef = useRef<HTMLInputElement>(null);

  const isEditMode = editingExpenseId !== null;
  const selectedExpenseIdSet = new Set(selectedExpenseIds);
  const visibleExpenseIds = expenses.map((expense) => expense.id);
  const hasSelectedExpenses = selectedExpenseIds.length > 0;
  const allVisibleSelected =
    expenses.length > 0 &&
    visibleExpenseIds.every((id) => selectedExpenseIdSet.has(id));
  const hasSomeVisibleSelected = visibleExpenseIds.some((id) =>
    selectedExpenseIdSet.has(id),
  );
  const pendingDeleteCount = pendingDeleteExpenseIds.length;
  const isBulkDeletePending = pendingDeleteCount > 1;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const resolveCategoryIdForUi = (
    uiCategory: (typeof CATEGORIES)[number],
    categories: ExpenseCategory[] = expenseCategories,
  ) => {
    const keys = [
      normalizeCategoryKey(uiCategory.id),
      normalizeCategoryKey(uiCategory.name),
      ...(CATEGORY_ALIASES[uiCategory.id] ?? []).map(normalizeCategoryKey),
    ];

    for (const key of keys) {
      if (key && categoryIdMap[key]) {
        return categoryIdMap[key];
      }
    }

    const fallbackMap = buildExpenseCategoryIdMap(
      categories as ExpenseCategoryRecord[],
    );
    for (const key of keys) {
      if (key && fallbackMap[key]) {
        return fallbackMap[key];
      }
    }

    return null;
  };

  const syncCategoryIdMap = (
    items: ExpenseItem[],
    categories: ExpenseCategory[] = expenseCategories,
  ) => {
    setCategoryIdMap((prev) => {
      const next = {
        ...prev,
        ...buildExpenseCategoryIdMap(categories as ExpenseCategoryRecord[]),
      };
      for (const item of items) {
        if (!item.categoryId) continue;
        const nameKey = normalizeCategoryKey(item.category?.name);
        if (nameKey) {
          next[nameKey] = item.categoryId;
        }
        const matchedUi = findUiCategoryByName(item.category?.name);
        if (!matchedUi) continue;
        next[normalizeCategoryKey(matchedUi.id)] = item.categoryId;
        next[normalizeCategoryKey(matchedUi.name)] = item.categoryId;
        for (const alias of CATEGORY_ALIASES[matchedUi.id] ?? []) {
          next[normalizeCategoryKey(alias)] = item.categoryId;
        }
      }
      return next;
    });
  };

  const fetchExpenseCategories = async () => {
    try {
      const response = await apiRequest("/api/expenses/categories");
      const categories: ExpenseCategory[] = Array.isArray(response?.data)
        ? response.data
        : [];

      setExpenseCategories(categories);
      setCategoryIdMap((prev) => ({
        ...prev,
        ...buildExpenseCategoryIdMap(categories as ExpenseCategoryRecord[]),
      }));

      return categories;
    } catch (error) {
      console.error("Fetch expense categories failed:", error);
      return [];
    }
  };

  const fetchExpenses = async (
    range: DateRange = dateRange,
    keyword: string = searchKeyword,
  ) => {
    setLoadingExpenses(true);
    try {
      const params = new URLSearchParams({
        _start: "0",
        _end: "200",
        _sort: "incurredAt",
        _order: "DESC",
        startDate: range.from.toISOString(),
        endDate: range.to.toISOString(),
      });
      if (keyword.trim()) {
        params.set("q", keyword.trim());
      }

      const response = await apiRequest(
        `/api/expenses/search?${params.toString()}`,
      );
      const list: ExpenseItem[] = Array.isArray(response?.data)
        ? response.data
        : [];
      setExpenses(list);
      setTotalExpenses(Number(response?.sum ?? 0));
      syncCategoryIdMap(list);
    } catch (error) {
      console.error("Fetch expenses failed:", error);
      setExpenses([]);
      setTotalExpenses(0);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const closeExpenseModal = () => {
    setIsAddExpenseOpen(false);
    setEditingExpenseId(null);
    setIsSubmittingExpense(false);
    setIsInnerCalendarOpen(false);
    setIsInnerTimeOpen(false);
  };

  const resetExpenseForm = (
    categories: ExpenseCategory[] = expenseCategories,
  ) => {
    const now = new Date();
    setEditingExpenseId(null);
    setSelectedCat(CATEGORIES[0]);
    setSelectedTag(CATEGORIES[0].tags[0]);
    setSelectedCategoryId(resolveCategoryIdForUi(CATEGORIES[0], categories));
    setAmount("0.00");
    setNote("");
    setExpenseDate(formatInputDate(now));
    setExpenseTime(formatInputTime(now));
    setInnerCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsInnerCalendarOpen(false);
    setIsInnerTimeOpen(false);
  };

  const handleOpenAddExpense = async () => {
    const categories =
      expenseCategories.length > 0
        ? expenseCategories
        : await fetchExpenseCategories();
    resetExpenseForm(categories);
    setIsAddExpenseOpen(true);
  };

  const handleOpenEditExpense = (expense: ExpenseItem) => {
    const targetDate = new Date(expense.incurredAt);
    const matchedCategory =
      findUiCategoryByName(expense.category?.name) ?? CATEGORIES[0];
    const matchedTag =
      matchedCategory.tags.find(
        (tag) => tag.toLowerCase() === (expense.note ?? "").toLowerCase(),
      ) ?? matchedCategory.tags[0];

    setEditingExpenseId(expense.id);
    setSelectedCat(matchedCategory);
    setSelectedTag(matchedTag);
    setSelectedCategoryId(expense.categoryId);
    setAmount(Number(expense.amount || 0).toFixed(2));
    setNote(expense.note ?? "");
    setExpenseDate(formatInputDate(targetDate));
    setExpenseTime(formatInputTime(targetDate));
    setInnerCalendarMonth(
      new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
    );
    setIsInnerCalendarOpen(false);
    setIsInnerTimeOpen(false);
    setIsAddExpenseOpen(true);
  };

  const handleSelectCategory = (cat: (typeof CATEGORIES)[number]) => {
    setSelectedCat(cat);
    setSelectedTag(cat.tags[0]);
    setSelectedCategoryId(resolveCategoryIdForUi(cat));
  };

  const handleToggleExpenseSelection = (id: number) => {
    if (isDeletingExpense) return;

    setSelectedExpenseIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAllExpenses = () => {
    if (isDeletingExpense || visibleExpenseIds.length === 0) return;

    setSelectedExpenseIds((prev) => {
      const prevSet = new Set(prev);
      const next = prev.filter((id) => !visibleExpenseIds.includes(id));

      if (visibleExpenseIds.every((id) => prevSet.has(id))) {
        return next;
      }

      return [...next, ...visibleExpenseIds];
    });
  };

  const handleDeleteExpense = (id: number) => {
    setPendingDeleteExpenseIds([id]);
  };

  const handleDeleteSelectedExpenses = () => {
    if (!hasSelectedExpenses || isDeletingExpense) return;
    setPendingDeleteExpenseIds([...selectedExpenseIds]);
  };

  const closeDeleteExpenseDialog = () => {
    if (isDeletingExpense) return;
    setPendingDeleteExpenseIds([]);
  };

  const handleConfirmDeleteExpense = async () => {
    if (pendingDeleteExpenseIds.length === 0) return;

    setIsDeletingExpense(true);
    try {
      const idsToDelete = [...pendingDeleteExpenseIds];

      if (idsToDelete.length === 1) {
        await apiRequest("/api/expenses/delete", "POST", {
          id: idsToDelete[0],
        });
      } else {
        await apiRequest("/api/expenses/deleteMany", "DELETE", {
          ids: idsToDelete,
        });
      }

      setSelectedExpenseIds((prev) =>
        prev.filter((id) => !idsToDelete.includes(id)),
      );
      setPendingDeleteExpenseIds([]);
      await fetchExpenses();
    } catch (error) {
      console.error("Delete expense failed:", error);
      window.alert("Delete failed, please try again.");
    } finally {
      setIsDeletingExpense(false);
    }
  };
  const handleConfirmExpense = async () => {
    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      window.alert("Please enter a valid amount.");
      return;
    }

    let finalCategoryId =
      selectedCategoryId ?? resolveCategoryIdForUi(selectedCat);
    if (!finalCategoryId) {
      const categories =
        expenseCategories.length > 0
          ? expenseCategories
          : await fetchExpenseCategories();
      finalCategoryId = resolveCategoryIdForUi(selectedCat, categories);
    }

    if (!finalCategoryId) {
      window.alert(
        "Cannot resolve category ID because expense categories are unavailable. Please refresh and try again.",
      );
      return;
    }

    const effectiveDate = expenseDate || formatInputDate(new Date());
    const effectiveTime = expenseTime || "00:00";
    const incurredAt = new Date(`${effectiveDate}T${effectiveTime}:00`);
    if (Number.isNaN(incurredAt.getTime())) {
      window.alert("Please select a valid date and time.");
      return;
    }

    const payload = {
      amount: amountNumber,
      categoryId: finalCategoryId,
      note: note.trim() || selectedTag || null,
      incurredAt: incurredAt.toISOString(),
    };

    setIsSubmittingExpense(true);
    try {
      if (isEditMode && editingExpenseId !== null) {
        await apiRequest("/api/expenses/update", "POST", {
          id: editingExpenseId,
          ...payload,
        });
      } else {
        await apiRequest("/api/expenses/add", "POST", payload);
      }
      closeExpenseModal();
      await fetchExpenses();
    } catch (error) {
      console.error("Save expense failed:", error);
      window.alert("Save failed, please try again.");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleApply = () => {
    if (!tempFromDate) {
      window.alert("Please select a date.");
      return;
    }

    let from = new Date(tempFromDate);
    let to = new Date(tempToDate ?? tempFromDate);
    if (from > to) {
      const tmp = from;
      from = to;
      to = tmp;
    }
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (from > to) {
      window.alert("From date cannot be after To date.");
      return;
    }

    setDateRange({ from, to });
    setIsDatePickerOpen(false);
  };

  const toggleDatePicker = () => {
    if (!isDatePickerOpen) {
      setTempFromDate(new Date(dateRange.from));
      setTempToDate(new Date(dateRange.to));
      setPickerMonth(
        new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), 1),
      );
    }
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      day,
    );

    if (!tempFromDate || (tempFromDate && tempToDate)) {
      setTempFromDate(clickedDate);
      setTempToDate(null);
      return;
    }

    if (clickedDate < tempFromDate) {
      setTempToDate(tempFromDate);
      setTempFromDate(clickedDate);
    } else {
      setTempToDate(clickedDate);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setIsDatePickerOpen(false);
      }
      if (calendarPopRef.current && !calendarPopRef.current.contains(target)) {
        setIsInnerCalendarOpen(false);
      }
      if (timePopRef.current && !timePopRef.current.contains(target)) {
        setIsInnerTimeOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCurrentUser = async () => {
      try {
        const userDetails = await WebUser.getInstance().getUserData();
        if (mounted && userDetails) {
          setCurrentUser(userDetails);
        }
      } catch (error) {
        console.error("Failed to load current user in myExpenses:", error);
      }
    };
    void loadCurrentUser();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void fetchExpenseCategories();
  }, []);

  useEffect(() => {
    void fetchExpenses(dateRange, searchKeyword);
  }, [dateRange, searchKeyword]);

  useEffect(() => {
    setSelectedExpenseIds((prev) =>
      prev.filter((id) => expenses.some((expense) => expense.id === id)),
    );
  }, [expenses]);

  useEffect(() => {
    if (!selectAllExpensesRef.current) return;
    selectAllExpensesRef.current.indeterminate =
      hasSomeVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, hasSomeVisibleSelected]);

  const menuItems = [
    {
      name: "Expenses",
      icon: <IconExpenses active={activeMenu === "Expenses"} />,
    },
    { name: "Income", icon: <IconIncome active={activeMenu === "Income"} /> },
    {
      name: "Budgets",
      icon: (
        <Settings
          size={20}
          color={activeMenu === "Budgets" ? "white" : "#565656"}
        />
      ),
    },
    {
      name: "Dashboard",
      icon: (
        <Settings
          size={20}
          color={activeMenu === "Dashboard" ? "white" : "#565656"}
        />
      ),
    },
    {
      name: "Accounts",
      icon: (
        <Settings
          size={20}
          color={activeMenu === "Accounts" ? "white" : "#565656"}
        />
      ),
    },
    {
      name: "Settings",
      icon: (
        <Settings
          size={20}
          color={activeMenu === "Settings" ? "white" : "#565656"}
        />
      ),
    },
  ];

  return (
    <div className="h-screen w-screen bg-[#F5F6FA] flex overflow-hidden font-nunito text-[#202224]">
      <Head>
        {" "}
        <title>Trackahabit | {activeMenu}</title>{" "}
      </Head>

      <style jsx global>{`
        .font-sf {
          font-family:
            "SF Pro",
            -apple-system,
            sans-serif;
        }
        .font-nunito {
          font-family: "Nunito Sans", sans-serif;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .icon-gray {
          filter: brightness(0) saturate(100%) invert(18%) sepia(5%)
            saturate(417%) hue-rotate(182deg) brightness(91%) contrast(92%);
        }
        .icon-white {
          filter: brightness(0) saturate(100%) invert(100%);
        }
      `}</style>

      <aside className="w-[240px] bg-white border-r border-[#E0E0E0] flex flex-col shrink-0 h-full">
        <div
          className="p-8 cursor-pointer"
          onClick={() => router.push("/selection")}
        >
          <h1 className="text-[#202224] text-[24px] font-bold font-sf">
            Trackahabit
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className={`w-full flex items-center gap-4 px-6 py-3 rounded-[8px] transition-all font-sf font-medium ${activeMenu === item.name ? "bg-[#4880FF] text-white shadow-md" : "text-[#202224] opacity-70 hover:bg-gray-100"}`}
            >
              <div className="flex items-center justify-center w-5 h-5">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-[60px] bg-white flex items-center justify-end px-10 shrink-0 border-b border-gray-100">
          <div className="relative" ref={profileMenuRef}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src={
                  currentUser?.avartarPicUrl ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Tracka"
                }
                alt="Avatar"
                className="w-9 h-9 rounded-full border border-gray-100"
              />
              <div className="flex flex-col text-right">
                <span className="text-[13px] font-bold text-[#202224] font-sf">
                  {currentUser?.name || "Guest User"}
                </span>
                <span className="text-[11px] text-gray-500 font-nunito">
                  {currentUser?.email || "No Email"}
                </span>
              </div>
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-gray-100 rounded-[12px] shadow-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    router.push("/home");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Repeat size={18} className="text-gray-500" />
                  <span className="text-[14px] font-bold font-sf text-gray-700">
                    Switch Module
                  </span>
                </button>
                <div className="h-[1px] bg-gray-100 mx-2"></div>
                <button
                  onClick={() => {
                    router.push("/");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={18} className="text-gray-500" />
                  <span className="text-[14px] font-bold font-sf text-gray-700">
                    Log Out
                  </span>
                </button>
              </div>
            )}
          </div>
        </header>

        {activeMenu === "Expenses" ? (
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-[28px] font-bold text-[#202224] font-sf">
                Expenses
              </h2>
              <button
                onClick={() => void handleOpenAddExpense()}
                className="bg-[#4880FF] hover:bg-blue-600 text-white px-6 py-2 rounded-[8px] flex items-center gap-2 font-sf font-semibold shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} /> <span>Add Expense</span>
              </button>
            </div>

            <section className="bg-white rounded-[16px] border border-[#D8D8D8] flex items-center justify-between py-3 px-6 shrink-0 relative">
              <div className="flex items-center gap-6">
                <span className="text-[#202224] font-bold text-[16px] font-nunito opacity-80">
                  Date Range
                </span>
                <div
                  className={`flex items-center gap-4 px-4 py-2 bg-[#F1F4F9] border rounded-[8px] cursor-pointer transition-all ${isDatePickerOpen ? "border-[#4880FF] bg-white shadow-sm" : "border-[#D8D8D8]"}`}
                  onClick={toggleDatePicker}
                >
                  <span className="text-[14px] text-[#202224] font-semibold font-nunito">
                    {formatDateLabel(dateRange.from)}
                  </span>
                  <span className="opacity-40 text-[14px]">→</span>
                  <span className="text-[14px] text-[#202224] font-semibold font-nunito">
                    {formatDateLabel(dateRange.to)}
                  </span>
                  <div className="ml-4 flex items-center gap-2 border-l border-gray-300 pl-4">
                    <CustomCalendarIcon />
                  </div>
                </div>

                {isDatePickerOpen && (
                  <div
                    ref={datePickerRef}
                    className="absolute top-[calc(100%+8px)] left-[120px] w-[380px] bg-white border border-[#E0E0E0] rounded-[20px] shadow-2xl z-[100] p-6 animate-in fade-in zoom-in duration-200"
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <label className="text-[12px] text-gray-400 font-bold block mb-1">
                          From
                        </label>
                        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white">
                          <span className="text-[13px] font-bold text-[#202224]">
                            {tempFromDate
                              ? formatDateLabel(tempFromDate)
                              : "--"}
                          </span>
                          <CustomCalendarIcon size={14} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[12px] text-gray-400 font-bold block mb-1">
                          To
                        </label>
                        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white">
                          <span className="text-[13px] font-bold text-[#202224]">
                            {tempToDate
                              ? formatDateLabel(tempToDate)
                              : tempFromDate
                                ? formatDateLabel(tempFromDate)
                                : "--"}
                          </span>
                          <CustomCalendarIcon size={14} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-[15px] font-bold text-[#202224]">
                        {pickerMonth.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setPickerMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() - 1,
                                  1,
                                ),
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setPickerMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() + 1,
                                  1,
                                ),
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[13px] mb-2 font-bold text-gray-400">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} className="py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 text-center text-[13px] gap-y-1 relative">
                      {Array.from({
                        length: new Date(
                          pickerMonth.getFullYear(),
                          pickerMonth.getMonth(),
                          1,
                        ).getDay(),
                      }).map((_, i) => (
                        <div key={`empty-${i}`} className="py-2"></div>
                      ))}

                      {Array.from(
                        {
                          length: new Date(
                            pickerMonth.getFullYear(),
                            pickerMonth.getMonth() + 1,
                            0,
                          ).getDate(),
                        },
                        (_, i) => i + 1,
                      ).map((day) => {
                        const dayDate = new Date(
                          pickerMonth.getFullYear(),
                          pickerMonth.getMonth(),
                          day,
                        );
                        const isStart = tempFromDate
                          ? isSameDay(dayDate, tempFromDate)
                          : false;
                        const isEnd = tempToDate
                          ? isSameDay(dayDate, tempToDate)
                          : false;
                        const inRange =
                          tempFromDate &&
                          tempToDate &&
                          dayDate > tempFromDate &&
                          dayDate < tempToDate;

                        return (
                          <div
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`py-2 cursor-pointer transition-all relative z-10 group rounded-[12px] ${isStart || isEnd ? "bg-[#6085FF] text-white" : "hover:bg-gray-100"}`}
                          >
                            <span className="relative z-20 font-bold">
                              {day}
                            </span>
                            {inRange && (
                              <div className="absolute inset-0 bg-[#4880FF] opacity-10 rounded-[12px] z-[5]" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                      <button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="w-[80px] h-[32px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center text-[13px] font-bold hover:bg-[#EBEBEB] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApply}
                        className="w-[80px] h-[32px] rounded-[8px] bg-[#4880FF] flex items-center justify-center text-[13px] font-bold text-white hover:bg-blue-600 shadow-sm transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <span className="text-[#202224] font-bold text-[16px] font-nunito opacity-80">
                  Total Expenses
                </span>
                <span className="text-[24px] font-bold text-[#202224] font-nunito">
                  ${Number(totalExpenses).toFixed(2)}
                </span>
              </div>
            </section>

            <section className="flex-1 bg-white rounded-[16px] border border-[#D8D8D8] overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-gray-100 shrink-0">
                <div className="relative w-full max-w-[500px]">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search keywords"
                    className="w-full pl-12 pr-6 py-2 bg-[#F1F4F9] border border-[#D8D8D8] rounded-full focus:outline-none focus:border-[#4880FF] transition-all font-nunito text-[13px]"
                  />
                </div>
                <button
                  onClick={handleDeleteSelectedExpenses}
                  disabled={!hasSelectedExpenses || isDeletingExpense}
                  className={`min-w-[150px] h-[36px] px-4 rounded-[10px] text-[13px] font-bold font-sf transition-all ${
                    hasSelectedExpenses && !isDeletingExpense
                      ? "bg-[#FFF1F4] border border-[#F4C5CE] text-[#D33D5C] hover:bg-[#FFE7ED]"
                      : "bg-[#FAFBFD] border border-[#D5D5D5] text-[#202224] opacity-40 cursor-not-allowed"
                  }`}
                >
                  {hasSelectedExpenses
                    ? `Delete Selected (${selectedExpenseIds.length})`
                    : "Delete Selected"}
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                    <tr className="text-[#202224] font-bold text-[12px] font-sf opacity-80 uppercase tracking-wider">
                      <th className="pl-6 py-5 w-[60px]">
                        <div className="flex items-center justify-center">
                          <input
                            ref={selectAllExpensesRef}
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={handleToggleSelectAllExpenses}
                            className={`w-4 h-4 rounded border-gray-300 accent-[#4880FF] ${
                              expenses.length === 0 || isDeletingExpense
                                ? "cursor-default opacity-40"
                                : "cursor-pointer"
                            }`}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-5">CATEGORY</th>
                      <th className="px-4 py-5">NOTES</th>
                      <th className="px-4 py-5 text-center">AMOUNT</th>
                      <th className="px-4 py-5 text-center">DATE</th>
                      <th className="px-4 py-5 text-center">TIME</th>
                      <th className="pr-10 py-5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => {
                      const incurredAt = new Date(expense.incurredAt);
                      const safeDate = Number.isNaN(incurredAt.getTime())
                        ? null
                        : incurredAt;
                      const categoryIcon =
                        findUiCategoryByName(expense.category?.name)?.icon ??
                        expense.category?.iconUrl ??
                        CATEGORIES[0].icon;

                      return (
                        <tr
                          key={expense.id}
                          className={`border-b border-gray-100 transition-colors ${
                            selectedExpenseIdSet.has(expense.id)
                              ? "bg-[#F7FAFF]"
                              : "hover:bg-[#FAFBFD]"
                          }`}
                        >
                          <td className="pl-6 py-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={selectedExpenseIdSet.has(expense.id)}
                                onChange={() =>
                                  handleToggleExpenseSelection(expense.id)
                                }
                                className={`w-4 h-4 rounded border-gray-300 accent-[#4880FF] ${
                                  isDeletingExpense
                                    ? "cursor-default opacity-40"
                                    : "cursor-pointer"
                                }`}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#F5F6FA] flex items-center justify-center">
                                <img
                                  src={categoryIcon}
                                  alt={expense.category?.name || "Category"}
                                  className="w-4 h-4 object-contain icon-gray"
                                />
                              </div>
                              <span className="text-[14px] font-semibold text-[#202224]">
                                {expense.category?.name ?? "Uncategorized"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-[14px] text-[#202224] opacity-80">
                            {expense.note || "-"}
                          </td>
                          <td className="px-4 py-4 text-center text-[14px] font-semibold text-[#202224]">
                            ${Number(expense.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-center text-[14px] text-[#202224]">
                            {safeDate ? formatDateLabel(safeDate) : "-"}
                          </td>
                          <td className="px-4 py-4 text-center text-[14px] text-[#202224]">
                            {safeDate ? formatTimeLabel(safeDate) : "-"}
                          </td>
                          <td className="pr-10 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditExpense(expense)}
                                className="px-3 h-[30px] rounded-[8px] border border-[#D5D5D5] text-[12px] font-bold text-[#202224] hover:bg-[#F1F4F9] transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="px-3 h-[30px] rounded-[8px] border border-[#F4C5CE] text-[12px] font-bold text-[#D33D5C] hover:bg-[#FFF1F4] transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!loadingExpenses && expenses.length === 0 && (
                  <div className="h-[280px] flex flex-col items-center justify-center opacity-25">
                    <IconExpenses active={false} />
                    <p className="mt-3 text-[15px] font-sf font-semibold">
                      No records found
                    </p>
                  </div>
                )}

                {loadingExpenses && (
                  <div className="h-[280px] flex flex-col items-center justify-center text-[14px] text-gray-400 font-semibold">
                    Loading expenses...
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                <button className="w-8 h-8 flex items-center justify-center border border-[#D8D8D8] rounded-[6px] text-gray-400 hover:bg-gray-50">
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-[#D8D8D8] rounded-[6px] text-[#4880FF] border-[#4880FF] hover:bg-blue-50 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[#4880FF]/10 rounded-full flex items-center justify-center mb-6">
              <Clock size={40} className="text-[#4880FF] animate-pulse" />
            </div>
            <h2 className="text-[28px] font-bold text-[#202224] font-sf mb-2">
              {activeMenu}
            </h2>
            <p className="text-[#202224] opacity-50 text-[16px] font-nunito max-w-[400px]">
              Coming Soon!
            </p>
          </div>
        )}
      </main>

      {pendingDeleteCount > 0 && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={closeDeleteExpenseDialog}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[520px] bg-white rounded-[28px] shadow-2xl relative animate-in zoom-in-95 duration-200 px-10 py-9"
          >
            <button
              onClick={closeDeleteExpenseDialog}
              disabled={isDeletingExpense}
              className="absolute right-7 top-7 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
              <X size={22} />
            </button>

            <div className="w-full flex flex-col items-start">
              <h3 className="text-[24px] font-bold text-[#202224] font-sf mb-3">
                {isBulkDeletePending ? "Delete Expenses" : "Delete Expense"}
              </h3>
              <p className="text-[15px] leading-7 text-[#202224] opacity-75 font-nunito mb-10">
                {isBulkDeletePending
                  ? `Delete the selected ${pendingDeleteCount} expense records?`
                  : "Delete this expense record?"}
              </p>
            </div>

            <div className="flex justify-end items-center gap-4">
              <button
                onClick={closeDeleteExpenseDialog}
                disabled={isDeletingExpense}
                className="h-[43px] min-w-[140px] px-6 rounded-[8px] bg-[#F4F4F4] border border-[#D5D5D5] text-[#202224] text-[15px] font-bold transition-all hover:bg-[#ECECEC] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirmDeleteExpense()}
                disabled={isDeletingExpense}
                className="h-[43px] min-w-[160px] px-6 rounded-[8px] bg-[#D33D5C] text-white text-[15px] font-bold shadow-lg shadow-rose-100 transition-all hover:bg-[#BE2F4D] disabled:opacity-50"
              >
                {isDeletingExpense ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddExpenseOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={closeExpenseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "681px",
              padding: "40px 58px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "10px",
            }}
            className="bg-white rounded-[32px] shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={closeExpenseModal}
              className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8 w-full">
              <h3 className="text-[20px] font-bold text-[#202224] font-sf mb-8">
                {isEditMode ? "Edit Expense" : "Select Category"}
              </h3>
              <div className="flex justify-between items-start w-full">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <button
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "35px",
                        backgroundColor:
                          selectedCat.id === cat.id ? "#4880FF" : "#F5F5F5",
                      }}
                      className={`flex items-center justify-center transition-all ${selectedCat.id === cat.id ? "shadow-md" : "hover:bg-[#EEEEEE]"}`}
                    >
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className={`w-4 h-4 object-contain ${selectedCat.id === cat.id ? "icon-white" : "icon-gray"}`}
                      />
                    </button>
                    <span
                      className={`text-[10px] font-bold font-sf text-center w-full truncate ${selectedCat.id === cat.id ? "text-[#4880FF]" : "text-gray-400"}`}
                    >
                      {cat.id === "discretionary"
                        ? "Discre.."
                        : cat.id === "transport"
                          ? "Trans.."
                          : cat.id === "personal"
                            ? "Perso.."
                            : cat.id === "obligations"
                              ? "Obli.."
                              : cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8 pt-6 border-t border-gray-50 w-full">
              {selectedCat.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(tag);
                    setNote(tag);
                  }}
                  className={`px-5 py-2.5 rounded-full text-[13px] font-bold border transition-all ${selectedTag === tag ? "bg-gray-100 border-transparent text-[#202224]" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="w-full flex flex-col gap-8 mb-10">
              <div className="w-full">
                <h4 className="text-[16px] font-bold text-[#202224] font-sf mb-4">
                  Add Notes
                </h4>
                <input
                  type="text"
                  placeholder="Add an optional note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full py-3 border-b border-gray-100 focus:border-[#4880FF] outline-none text-[14px] font-sf"
                />
              </div>
              <div className="w-full">
                <h4 className="text-[16px] font-bold text-[#202224] font-sf mb-4">
                  Enter Amount
                </h4>
                <div className="flex items-end justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[36px] font-bold text-[#FF718B]">
                      $
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-[36px] font-bold text-[#FF718B] bg-transparent outline-none w-full"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex gap-3 mb-2 shrink-0 ml-4 relative">
                    <div
                      onClick={() =>
                        setIsInnerCalendarOpen(!isInnerCalendarOpen)
                      }
                      className="px-4 py-2 bg-[#F5F6FA] rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all"
                    >
                      <CalendarIcon size={14} className="text-gray-400" />
                      <span className="text-[12px] font-bold text-gray-600 font-sf">
                        {expenseDate || "--"}
                      </span>
                    </div>

                    <div
                      onClick={() => setIsInnerTimeOpen(!isInnerTimeOpen)}
                      className="px-4 py-2 bg-[#F5F6FA] rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all"
                    >
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[12px] font-bold text-gray-600 font-sf">
                        {expenseTime || "--:--"}
                      </span>
                    </div>

                    {isInnerCalendarOpen && (
                      <div
                        ref={calendarPopRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full right-0 mb-4 w-[280px] bg-white border border-gray-200 rounded-[12px] shadow-2xl z-[300] p-4 animate-in slide-in-from-bottom-2"
                      >
                        <div className="flex items-center justify-between mb-4 px-1">
                          <button className="text-[14px] font-bold flex items-center gap-1 hover:text-[#4880FF]">
                            {innerCalendarMonth.toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            <ChevronDown size={14} />
                          </button>
                          <div className="flex gap-3 text-gray-400">
                            <ChevronLeft
                              size={16}
                              className="cursor-pointer hover:text-[#4880FF]"
                              onClick={() =>
                                setInnerCalendarMonth(
                                  (prev) =>
                                    new Date(
                                      prev.getFullYear(),
                                      prev.getMonth() - 1,
                                      1,
                                    ),
                                )
                              }
                            />
                            <ChevronRight
                              size={16}
                              className="cursor-pointer hover:text-[#4880FF]"
                              onClick={() =>
                                setInnerCalendarMonth(
                                  (prev) =>
                                    new Date(
                                      prev.getFullYear(),
                                      prev.getMonth() + 1,
                                      1,
                                    ),
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 mb-2">
                          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                            (d) => (
                              <div key={d}>{d}</div>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-1">
                          {Array.from({
                            length:
                              (new Date(
                                innerCalendarMonth.getFullYear(),
                                innerCalendarMonth.getMonth(),
                                1,
                              ).getDay() +
                                6) %
                              7,
                          }).map((_, i) => (
                            <div key={`pre-${i}`} className="py-2"></div>
                          ))}
                          {Array.from(
                            {
                              length: new Date(
                                innerCalendarMonth.getFullYear(),
                                innerCalendarMonth.getMonth() + 1,
                                0,
                              ).getDate(),
                            },
                            (_, i) => i + 1,
                          ).map((d) => {
                            const candidate = new Date(
                              innerCalendarMonth.getFullYear(),
                              innerCalendarMonth.getMonth(),
                              d,
                            );
                            const selectedDate =
                              expenseDate &&
                              !Number.isNaN(
                                new Date(`${expenseDate}T00:00:00`).getTime(),
                              )
                                ? new Date(`${expenseDate}T00:00:00`)
                                : null;
                            const isSelected =
                              selectedDate !== null &&
                              isSameDay(candidate, selectedDate);
                            return (
                              <div
                                key={d}
                                onClick={() => {
                                  setExpenseDate(formatInputDate(candidate));
                                  setIsInnerCalendarOpen(false);
                                }}
                                className={`py-2 text-[12px] font-bold rounded-lg cursor-pointer transition-all ${isSelected ? "bg-[#4880FF] text-white" : "hover:bg-gray-100"}`}
                              >
                                {d}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-between border-t border-gray-100 mt-4 pt-3">
                          <button
                            onClick={() => setExpenseDate("")}
                            className="text-[#4880FF] text-[12px] font-bold hover:underline"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              const now = new Date();
                              setExpenseDate(formatInputDate(now));
                              setInnerCalendarMonth(
                                new Date(now.getFullYear(), now.getMonth(), 1),
                              );
                            }}
                            className="text-[#4880FF] text-[12px] font-bold hover:underline"
                          >
                            Today
                          </button>
                        </div>
                      </div>
                    )}

                    {isInnerTimeOpen && (
                      <div
                        ref={timePopRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full right-0 mb-4 w-[160px] bg-white border border-gray-200 rounded-[16px] shadow-2xl z-[300] p-1 flex animate-in slide-in-from-bottom-2"
                      >
                        <div className="flex-1 max-h-[220px] overflow-y-auto no-scrollbar py-1 border-r border-gray-50">
                          {Array.from({ length: 24 }).map((_, h) => {
                            const hh = String(h).padStart(2, "0");
                            const isSelected = expenseTime.startsWith(hh);
                            return (
                              <div
                                key={`h-${h}`}
                                onClick={() =>
                                  setExpenseTime(
                                    `${hh}:${expenseTime.split(":")[1] || "00"}`,
                                  )
                                }
                                className={`h-[36px] flex items-center justify-center text-[13px] font-bold cursor-pointer transition-all ${isSelected ? "bg-gray-100 text-[#4880FF]" : "hover:bg-gray-50 text-gray-600"}`}
                              >
                                {hh}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex-1 max-h-[220px] overflow-y-auto no-scrollbar py-1">
                          {Array.from({ length: 60 }).map((_, m) => {
                            const mm = String(m).padStart(2, "0");
                            const isSelected = expenseTime.endsWith(mm);
                            return (
                              <div
                                key={`m-${m}`}
                                onClick={() =>
                                  setExpenseTime(
                                    `${expenseTime.split(":")[0] || "00"}:${mm}`,
                                  )
                                }
                                className={`h-[36px] flex items-center justify-center text-[13px] font-bold cursor-pointer transition-all ${isSelected ? "bg-gray-100 text-[#4880FF]" : "hover:bg-gray-50 text-gray-600"}`}
                              >
                                {mm}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center w-full gap-10 mt-6 pb-2">
              <button
                onClick={closeExpenseModal}
                disabled={isSubmittingExpense}
                className="flex items-center justify-center opacity-90 transition-all active:scale-[0.98] hover:opacity-100 disabled:opacity-50"
                style={{
                  width: "191px",
                  height: "43px",
                  backgroundColor: "#F4F4F4",
                  border: "0.3px solid #757575",
                  borderRadius: "8px",
                }}
              >
                <span className="text-[#202224] font-bold text-[15px]">
                  Cancel
                </span>
              </button>

              <button
                onClick={() => void handleConfirmExpense()}
                disabled={isSubmittingExpense}
                className="flex items-center justify-center opacity-90 text-white font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-blue-100 hover:opacity-100 disabled:opacity-50"
                style={{
                  width: "191px",
                  height: "43px",
                  backgroundColor: "#4880FF",
                  borderRadius: "8px",
                }}
              >
                {isSubmittingExpense
                  ? "Saving..."
                  : isEditMode
                    ? "Save"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
