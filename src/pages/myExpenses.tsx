import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
// [*] 修改：引入 Repeat 和 LogOut 图标用于下拉菜单
import { Settings, ChevronDown, Plus, Search, ChevronLeft, ChevronRight, Clock, X, Calendar as CalendarIcon, Repeat, LogOut } from "lucide-react";

// --- 自定义侧边栏图标组件 ---

const IconExpenses = ({ active }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12.9167 14.1665H17.9167" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.8333 16.2502L17.9166 14.1668L15.8334 12.0835" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.9166 10.8332V4.1665C17.9166 3.47615 17.357 2.9165 16.6666 2.9165H3.33325C2.6429 2.9165 2.08325 3.47615 2.08325 4.1665V15.8332C2.08325 16.5235 2.6429 17.0832 3.33325 17.0832H11.8627" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 6.25L8.33333 8.75L10.4167 6.25" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.83325 11.25H10.8333" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.83325 8.75H10.8333" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33325 8.75V13.75" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconIncome = ({ active }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12.9167 14.1665H17.9167" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.9166 10.8332V4.1665C17.9166 3.47615 17.357 2.9165 16.6666 2.9165H3.33325C2.6429 2.9165 2.08325 3.47615 2.08325 4.1665V15.8332C2.08325 16.5235 2.6429 17.0832 3.33325 17.0832H11.8627" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.0001 16.2502L12.9167 14.1668L14.9999 12.0835" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 6.25L8.33333 8.75L10.4167 6.25" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.83325 11.25H10.8333" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.83325 8.75H10.8333" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33325 8.75V13.75" stroke={active ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomCalendarIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2.5 9.5H21.5V20.5C21.5 21.0523 21.0523 21.5 20.5 21.5H3.5C2.94771 21.5 2.5 21.0523 2.5 20.5V9.5Z" stroke="#565656" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2.5 5C2.5 4.44771 2.94771 4 3.5 4H20.5C21.0523 4 21.5 4.44771 21.5 5V9.5H2.5V5Z" fill="#5D84FF" stroke="#565656" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M8 2.5V6.5" stroke="#565656" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 2.5V6.5" stroke="#565656" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CATEGORIES = [
	{ id: 'housing', name: 'Housing', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIyIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTggMTkuNjQ4Nkg0QzMuNDQ3NzIgMTkuNjQ4NiAzIDE5LjIwMDkgMyAxOC42NDg2VjkuNjQ4NTZIMC4zMjczIDAuMjYwMDYyQzEwLjcwODcgLTAuMDg2Njg3NSAxMS4yOTEzIC0wLjA4NjY4NzUgMTEuNjcyNyAwLjI2MDA2MkwyMiA5LjY0ODU2SDE5VjE4LjY0ODZDMTkgMTkuMjAwOSAxOC41NTIzIDE5LjY0ODYgMTggMTkuNjQ4NlpNMTIgMTcuNjQ4NkgxN1Y3LjgwNjAxTDExIDIuMzUxNDZMNSA3LjgwNjAxVjE3LjY0ODZIMTBWMTEuNjQ4NkgxMlYxNy42NDg2WiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=", tags: ['Rent/mortgage', 'Property Tax', 'Home Insurance', 'Maintenance'] },
	{ id: 'utilities', name: 'Utilities', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTAgMjBDNC40NzcxNSAyMCAwIDE1LjUyMjggMCAxMEMwIDQuNDc3MTUgNC40NzcxNSAwIDEwIDBDMTUuNTIyOCAwIDIwIDQuNDc3MTUgMjAgMTBDMjAgMTUuNTIyOCAxNS41MjI4IDIwIDEwIDIwWk03LjcxMDAyIDE3LjY2NzRDNi43NDc0MyAxNS42MjU5IDYuMTU3MzIgMTMuMzc0MiA2LjAyNzMxIDExSDIuMDYxODlDMi40NTggMTQuMTc2NSA0LjcxNjM5IDE2Ljc3NDcgNy43MTAwMiAxNy42Njc0Wk04LjAzMDcgMTFDOC4xODExIDEzLjQzODggOC44Nzc4IDE1LjcyOTcgMTAgMTcuNzUyQzExLjEyMjIgMTUuNzI5NyAxMS44MTg5IDEzLjQzODggMTEuOTY5MyAxMUg4LjAzMDdaTTE3LjkzODEgMTFIMTMuOTcyN0MxMy44NDI3IDEzLjM3NDIgMTMuMjUyNiAxNS42MjU5IDEyLjI5IDE3LjY2NzRDMTUuMjgzNiAxNi43NzQ3IDE3LjU0MiAxNC4xNzY1IDE3LjkzODEgMTFaTTIuMDYxODkgOUg2LjAyNzMxQzYuMTU3MzIgNi42MjU3NyA2Ljc0NzQzIDQuMzc0MDcgNy43MTAwMiAyLjMzMjU2QzQuNzE2MzkgMy4yMjUzMyAyLjQ1OCA1LjgyMzUgMi4wNjE4OSA5Wk04LjAzMDcgOUgxMS45NjkzQzExLjgxODkgNi41NjEyMiAxMS4xMjIyIDQuMjcwMjUgMTAgMi4yNDc5OUM4Ljg3NzggNC4yNzAyNSA4LjE4MTEgNi41NjEyMiA4LjAzMDcgOVpNMTIuMjkgMi4zMzI1NkMxMy4yNTI2IDQuMzc0MDcgMTMuODQyNyA2LjYyNTc3IDEzLjk3MjcgOUgxNy45MzgxQzE3LjU0MiAxNC4xNzY1IDE1LjIgzM6AzLjIyNTMzIDEyLjI5IDIuMzMyNTZaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==", tags: ['Electricity', 'Water', 'Gas', 'Internet'] },
	{ id: 'transport', name: 'Transport', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDIwIDE4IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTcgMTZIM1YxN0MzIDE3LjU1MjMgMi41NTIyOCAxOCAyIDE4SDFDMC40NDc3MiAxOCAwIDE3LjU1MjMgMCAxN1Y3TDIuNDgwNSAxLjIxMjE2QzIuNzk1NjYgMC40NzY3OSAzLjUxODc0IDAgNC4zMTg3OSAwSDE1LjY4MTJDMTY0ODEzIDAgMTcuMjA0MyAwLjQ3Njc5IDE3LjUxOTUgMS4yMTIxNkwyMCA3VjE3QzIwIDE3LjU1MjMgMTkuNTUyMyAxOCAxOSAxOEgxOEMxNy40NDc3IDE4IDE3IDE3LjU1MjMgMTcgMTdWMTZaTTE4IDlIMlYxNEgxOFY5Wk0yLjE3NTk0IDdIMTcuODI0MUwxNS42ODEyIDJINC4zMTg3OUwyLjE3NTk0IDdaTTQuNSAxM0MzLjY3MTU3IDEzIDMgMTIuMzI4NCAzIDExLjVDMyAxMC42NzE2IDMuNjcxNTcgMTAgNC41IDEwQzUuMzI4NDMgMTAgNiAxMC42NzE2IDYgMTEuNUM2IDEyLjMyODQgNS4zMjg0MyAxMyA0LjUgMTNaTTE1LjUgMTNDMTQuNjcxNiAxMyAxNCAxMi4zMjg0IDE0IDExLjVDMTQgMTAuNjcxNiAxNC42NzE2IDEwIDE1LjUgMTBDMTYuMzI4NCAxMCAxNyAxMC42NzE2IDE3IDExLjVDMTcgMTIuMzI4NCAxNi4zMjg0IDEzIDE1LjUgMTNaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==", tags: ['Fuel', 'Parking', 'Public Transit', 'Repairs'] },
	{ id: 'personal', name: 'Personal', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDIwIDE4IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMCAxNkgyMFYxOEgwVjE2Wk05LjAwMDAyIDVIMTFWMTNIOS4wMDAwMlY1Wk01Ljk2NTEzIDVMNC4xMDQyNCAxMC4xMTI3TDIuMjQzMzYgNUgwLjExODQ2TDMuMTA0MjQgMTIuOTYzN0g1LjEwNDI0TDguMDkwMDIgNUg1Ljk2NTEzWk0xNSAxMVYxM0gxM1Y1SDE3QzE4LjY1NjggNSAyMCA2LjM0MzE1IDIwIDhDMjAgOS42NTY5IDE4LjY1NjggMTEgMTcgMTFIMTVaTTE1IDdWOUgxN0MxNy41NTIzIDkgMTggOC41NTIzIDE4IDhDMTggNy40NDc3IDE3LjU1MjMgNyAxNyA3SDE1Wk0wIDBIMjBWMkgwVjBaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==", tags: ['Haircut', 'Clothing', 'Gym', 'Gifts'] },
	{ id: 'medical', name: 'Medical', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDE4IDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTQgMFYySDE3QzE3LjU1MjMgMiAxOCAyLjQ0NzcyIDE4IDNWMTlDMTggMTkuNTUyMyAxNy41NTIzIDIwIDE3IDIwSDFDMC40NDc3MiAyMCAwIDE5LjU1MjMgMCAxOVYzQzAgMi40NDc3MiAwLjQ0NzcyIDIgMSAySDRWMEgxNFpNNCA0SDJWMThIMTZWNEgxNFY2SDRWNFpNMTAgOVYxMUgxMlYxM0g5Ljk5OUwxMCAxNUg4TDcuOTk5IDEzSDZWMTFIOFY5SDEwWk0xMiAySDZWNEgxMlYyWiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=", tags: ['Checkup', 'Medicine', 'Dental', 'Vision'] },
	{ id: 'loans', name: 'Loans', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDE4IDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTMuOTk5OCAxNEgxNS45OTk4VjJINS45OTk4VjRIMTMuOTk5OFYxNFpNMTMuOTk5OCAxNlYxOC45OTkxQzEzLjk5OTggMTkuNTUxOSAxMy41NDk4IDIwIDEyLjk5MjkgMjBIMS4wMDY2NkMwLjQ1MDYgMjAgMCAxOS41NTU0IDAgMTguOTk5MUwwLjAwMjYgNS4wMDA4N0MwLjAwMjcgNC40NDgxIDAuNDUyNiA0IDEuMDA5NCA0SDMuOTk5OFYxQzMuOTk5OCAwLjQ0NzcxIDQuNDQ3NSAwIDQuOTk5OCAwSDE2Ljk5OThDMTcuNTUyMSAwIDE3Ljk5OTggMC40NDc3MSAxNy45OTk4IDFWMTVDMTcuOTk5OCAxNS41NTIzIDE3LjU1MjEgMTYgMTYuOTk5OCAxNkgxMy45OTk4Wk0yLjAwMjQyIDZMMi4wMDAyIDE4SDExLjk5OThWNkgyLjAwMjQyWk0zLjk5OTggMTRIOC40OTk4MkM4Ljc3NTkyIDE0IDguOTk5ODIgMTMuNzc2MSA4Ljk5OTgyIDEzLjVDOC45OTk4MiAxMy4yMjM5IDguNzc1OTIgMTMgOC40OTk4MiAxM0g1LjQ5OThDNC4xMTkwOSAxMyAyLjk5OTggMTEuODgwNyAyLjk5OTggMTAuNUMyLjk5OTggOS4xMTkyOSA0LjExOTA5IDcuOTk5OTkgNS40OTk4IDcuOTk5OTlINS45OTk4VjdINy45OTk4MlY3Lj Redmond 99OTk5OUgxOS45OTk4MlYxMEg1LjQ5OThDNS4yMjM2NiAxMCA0Ljk5OTggMTAuMjIzOSA0Ljk5OTggMTAuNUM0Ljk5OTggMTAuNzc2MSA1LjIyMzY2IDExIDUuNDk5OCAxM0g4LjQ5OTgyQzkuODgwNTIgMTEgMTAuOTk5OCAxMi4xMTkzIDEwLjk5OTggMTMuNUMxMC45OTk4IDE0Ljg4MDcgOS44ODA1MiAxNiA4LjQ5OTgyIDE2SDcuOTk5ODJWMTdINS45OTk4VjE2SDMuOTk5OFYxNFaIIGZpbGw9IiMzMDMyMzYiLz48L3N2Zz4=", tags: ['Student Loan', 'Credit Card', 'Personal Loan'] },
	{ id: 'obligations', name: 'Obligations', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDE4IDIyIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMC43ODMwNyAxLjgyNTk4TDkgMEwxNy4yMTY5IDEuODI1OThDMTcuNjc0NSAxLjkyNzY2IDE4IDIuMzMzNDcgMTggMi44MDIxN1YxMi43ODg5QzE4IDE0Ljc5NSAxNi45OTc0IDE2LjY2ODQgMTUuMzI4MiAxNy43ODEyTDkgMjJMMi42NzE4IDE3Ljc4MTJDMS4wMDI2MSAxNi42Njg0IDAgMTQuNzk1IDAgMTIuNzg4OVYyLjgwMjE3QzAgMi4zMzM0NyAwLjMyNTUzIDEuOTI3NjYgMC43ODMwNyAxLjgyNTk4Wk0yIDMuNjA0MzRWMTIuNzg4OUMyIDE0LjEyNjMgMi42Njg0IDE1LjM3NTIgMy43ODEyIDE2LjExNzFMOSAxOS41OTYzTDE0LjIxODggMTYuMTE3MUMxNS4zMzE2IDE1LjM3NTIgMTYgMTQuMTI2MyAxNiAxMi43ODg5VjMuNjA0MzRMOSAyLjA0ODc5TDIgMy42MDQzNFpNOSAxMEM3LjYxOTMgMTAgNi41IDguODgwNzEgNi41IDcuNUM2LjUgNi4xMTkyOSA3LjYxOTMgNSA5IDVDMTAuMzgwNyA1IDExLjUgNi4xMTkyOSAAxMS41IDcuNUMxMS41IDguODgwNzEgMTAuMzgwNyAxMCA5IDEwWk00LjUyNzQ2IDE1QzQuNzc2MTkgMTIuNzUgNi42ODM3MiAxMSA5IDExQzExLjMxNjMgMTEgMTMuMjIzOCAxMi43NSAxMy40NzI1IDE1SDQuNTI3NDZaIiBmaWxsPSIjMzAzMjM2Ii8+Cjwvc3ZnPg==", tags: ['Taxes', 'Legal Fees', 'Insurance'] },
	{ id: 'discretionary', name: 'Discretionary', icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='21' viewBox='0 0 18 21' fill='none'><path d='M6 5H12C12 3.34315 10.6569 2 9 2C7.3431 2 6 3.34315 6 5ZM4 5C4 2.23858 6.23858 0 9 0C11.7614 0 14 2.23858 14 5H17C17.5523 5 18 5.44772 18 6V20C18 20.5523 17.5523 21 17 21H1C0.44772 21 0 20.5523 0 20V6C0 5.44772 0.44772 5 1 5H4ZM2 7V19H16V7H2ZM6 9C6 10.6569 7.3431 12 9 12C10.6569 12 12 10.6569 12 9H14C14 11.7614 11.7614 14 9 14C6.23858 14 4 11.7614 4 9H6Z' fill='%23303236'/></svg>", tags: ['Dining Out', 'Coffee', 'Movies', 'Hobbies'] },
	{ id: 'career', name: 'Career', icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNNSA0VjFDNSAwLjQ0NzcyIDUuNDQ3NzIgMCA2IDBIMTRDMTQuNTUyMyAwIDE1IDAuNDQ3NzIgMTUgMVY0SDE5QzE5LjU1MjMgNCAyMCA0LjQ0NzcyIDIwIDVWMTlDMjAgMTkuNTUyMyAxOS41NTIzIDIwIDE5IDIwSDFDMC40NDc3MiAyMCAwIDE5LjU1MjMgMCAxOVYzQzAgMi40NDc3MiAwLjQ0NzcyIDIgMSAySDRWMEgxNFpNNCA0SDJWMThIMTZWNEgxNFY2SDRWNFpNMTAgOVYxMUgxMlYxM0g5Ljk5OUwxMCAxNUg4TDcuOTk5IDEzSDZWMTFIOFY5SDEwWk0xMiAySDZWNEgxMlYyWiIgZmlsbD0iIzMwMzIzNiIvPgo8L3N2Zz4=", tags: ['Courses', 'Books', 'Software'] }
];

export default function MyExpenses() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Expenses");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // [+] 新增：头像下拉菜单状态和 Ref
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 弹窗状态管理
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [selectedTag, setSelectedTag] = useState(CATEGORIES[0].tags[0]);
  const [amount, setAmount] = useState("0.00");
  const [note, setNote] = useState("");
  
  // 时间与日期状态
  const [expenseDate, setExpenseDate] = useState("2026-03-14");
  const [expenseTime, setExpenseTime] = useState("19:05");
  const [isInnerCalendarOpen, setIsInnerCalendarOpen] = useState(false);
  const [isInnerTimeOpen, setIsInnerTimeOpen] = useState(false);
  const calendarPopRef = useRef<HTMLDivElement>(null);
  const timePopRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = useState({ from: "Oct. 14th 2025", to: "Oct. 14th 2025" });
  const [tempFrom, setTempFrom] = useState<number | null>(14);
  const [tempTo, setTempTo] = useState<number | null>(14);

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
      // [+] 处理头像下拉菜单点击外部关闭
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDayClick = (day: number) => {
    if (!tempFrom || (tempFrom && tempTo)) {
      setTempFrom(day);
      setTempTo(null);
    } else {
      if (day < tempFrom) {
        setTempTo(tempFrom);
        setTempFrom(day);
      } else {
        setTempTo(day);
      }
    }
  };

  const handleApply = () => {
    if (tempFrom && tempTo) {
      setDateRange({ from: `Oct. ${tempFrom}th 2025`, to: `Oct. ${tempTo}th 2025` });
    } else if (tempFrom) {
      setDateRange({ from: `Oct. ${tempFrom}th 2025`, to: `Oct. ${tempFrom}th 2025` });
    }
    setIsDatePickerOpen(false);
  };

  const menuItems = [
    { name: "Expenses", icon: <IconExpenses active={activeMenu === "Expenses"} /> },
    { name: "Income", icon: <IconIncome active={activeMenu === "Income"} /> },
    { name: "Budgets", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.5001 4.1665H2.50008C2.03984 4.1665 1.66675 4.5396 1.66675 4.99984V15.8332C1.66675 16.2934 2.03984 16.6665 2.50008 16.6665H17.5001C17.9603 16.6665 18.3334 16.2934 18.3334 15.8332V4.99984C18.3334 4.5396 17.9603 4.1665 17.5001 4.1665Z" stroke={activeMenu === "Budgets" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.83325 2.5V5.83333" stroke={activeMenu === "Budgets" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round"/><path d="M10.4166 9.5835H5.83325" stroke={activeMenu === "Budgets" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round"/><path d="M14.1666 12.9165H5.83325" stroke={activeMenu === "Budgets" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round"/><path d="M14.1667 2.5V5.83333" stroke={activeMenu === "Budgets" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round"/></svg> },
    { name: "Dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.624 7.82422C12.624 7.82422 11.2784 11.6168 10.639 12.279C9.99962 12.9411 8.94449 12.9595 8.28237 12.3201C7.6202 11.6807 7.60179 10.6256 8.2412 9.96343C8.88062 9.3013 12.624 7.82422 12.624 7.82422Z" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinejoin="round"/><path d="M16.1872 16.1872C17.7706 14.6038 18.75 12.4162 18.75 10C18.75 5.1675 14.8325 1.25 10 1.25C5.1675 1.25 1.25 5.1675 1.25 10C1.25 12.4162 2.22938 14.6038 3.81282 16.1872" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1.6665V3.33317" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.1856 4.64258L14.8904 5.69141" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M17.7177 11.3471L16.0938 10.9722" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.28223 11.3471L3.90618 10.9722" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.81445 4.64258L5.10969 5.69145" stroke={activeMenu === "Dashboard" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { name: "Accounts", icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.0848 17.5965C2.0848 17.7734 2.23245 17.9168 2.41459 17.9168L17.5842 17.9168C17.7663 17.9168 17.914 17.7734 17.914 17.5965V17.214C17.9216 17.0987 17.937 16.5233 17.5578 15.8872C17.3186 15.4861 16.9715 15.1396 16.5261 14.8574C15.9873 14.5159 15.3018 14.2685 14.4727 14.1195C14.4666 14.1187 13.8518 14.0372 13.222 13.8764C12.1253 13.5963 12.0295 13.3484 12.0288 13.346C12.0224 13.3215 12.013 13.2979 12.0011 13.2758C11.9921 13.2295 11.97 13.0555 12.0123 12.5892C12.1199 11.4047 12.7553 10.7047 13.2658 10.1423C13.4268 9.96495 13.5788 9.79741 13.6959 9.63312C14.201 8.92437 14.2479 8.11845 14.25 8.0685C14.25 7.96729 14.2384 7.88408 14.2135 7.80695C14.164 7.65262 14.0707 7.55645 14.0025 7.48625L14.0025 7.48625C13.9849 7.46808 13.9687 7.45133 13.9555 7.43595C13.9504 7.43008 13.937 7.41454 13.9492 7.33475C13.994 7.04104 14.021 6.79512 14.0339 6.56083C14.0569 6.14341 14.0748 5.51916 13.9672 4.91162C13.9539 4.80787 13.931 4.69829 13.8955 4.56775C13.7818 4.14939 13.599 3.79171 13.3451 3.49651C13.3014 3.449 12.2398 2.3305 9.15775 2.101C8.73159 2.06927 8.3103 2.08636 7.89559 2.10756C7.79563 2.1125 7.65875 2.11928 7.53067 2.15247C7.21246 2.2349 7.12754 2.43659 7.10525 2.54947C7.06829 2.73645 7.13325 2.88189 7.17621 2.97815C7.18246 2.99211 7.19017 3.00938 7.17671 3.05432C7.10517 3.16511 6.99263 3.265 6.87788 3.35963C6.84471 3.38782 6.07188 4.0542 6.02938 4.9247C5.9148 5.58675 5.92346 6.61825 6.05896 7.33116C6.06684 7.37054 6.07846 7.42883 6.05959 7.4682C5.91388 7.59879 5.74871 7.74679 5.74913 8.0845C5.75088 8.11845 5.79775 8.92437 6.30292 9.63312C6.41992 9.79729 6.57184 9.9647 6.73271 10.142L6.73309 10.1423C7.24359 10.7047 7.87888 11.4047 7.9865 12.5891C8.02884 13.0555 8.00667 13.2295 7.99771 13.2757C7.98575 13.2979 7.97642 13.3214 7.97 13.3459C7.96934 13.3483 7.87384 13.5955 6.78209 13.875C6.15225 14.0363 5.53221 14.1187 5.51371 14.1214C4.708 14.2574 4.02675 14.4986 3.48888 14.8383C3.04497 15.1187 2.69723 15.4658 2.45529 15.87C2.06874 16.516 2.07919 17.1042 2.0848 17.2116V17.5965Z" stroke={activeMenu === "Accounts" ? "white" : "#565656"} strokeWidth="1.66667" strokeLinejoin="round"/></svg> },
    { name: "Settings", icon: <Settings size={20} color={activeMenu === "Settings" ? "white" : "#565656"} /> },
  ];

  return (
    <div className="h-screen w-screen bg-[#F5F6FA] flex overflow-hidden font-nunito text-[#202224]">
      <Head> <title>Trackahabit | {activeMenu}</title> </Head>

      <style jsx global>{`
        .font-sf { font-family: "SF Pro", -apple-system, sans-serif; }
        .font-nunito { font-family: "Nunito Sans", sans-serif; }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .icon-gray { filter: brightness(0) saturate(100%) invert(18%) sepia(5%) saturate(417%) hue-rotate(182deg) brightness(91%) contrast(92%); }
        .icon-white { filter: brightness(0) saturate(100%) invert(100%); }
      `}</style>

      <aside className="w-[240px] bg-white border-r border-[#E0E0E0] flex flex-col shrink-0 h-full">
        <div className="p-8 cursor-pointer" onClick={() => router.push("/selection")}>
          <h1 className="text-[#202224] text-[24px] font-bold font-sf">Trackahabit</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => setActiveMenu(item.name)} className={`w-full flex items-center gap-4 px-6 py-3 rounded-[8px] transition-all font-sf font-medium ${activeMenu === item.name ? "bg-[#4880FF] text-white shadow-md" : "text-[#202224] opacity-70 hover:bg-gray-100"}`}>
              <div className="flex items-center justify-center w-5 h-5">{item.icon}</div>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* [*] 修改：Header 部分增加了下拉菜单逻辑 */}
        <header className="h-[60px] bg-white flex items-center justify-end px-10 shrink-0 border-b border-gray-100">
          <div className="relative" ref={profileMenuRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Moni" alt="Avatar" className="w-9 h-9 rounded-full border border-gray-100"/>
              <div className="flex flex-col text-right">
                <span className="text-[13px] font-bold text-[#202224] font-sf">Moni Roy</span>
                <span className="text-[11px] text-gray-500 font-nunito">Moni Roy@gmail.com</span>
              </div>
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* [+] 新增：头像下拉菜单 (对齐 image_e2431c.png) */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-[200px] bg-white border border-gray-100 rounded-[12px] shadow-xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => { router.push("/home"); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Repeat size={18} className="text-gray-500" />
                  <span className="text-[14px] font-bold font-sf text-gray-700">Switch Module</span>
                </button>
                <div className="h-[1px] bg-gray-100 mx-2"></div>
                <button 
                  onClick={() => { router.push("/"); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={18} className="text-gray-500" />
                  <span className="text-[14px] font-bold font-sf text-gray-700">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {activeMenu === "Expenses" ? (
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-[28px] font-bold text-[#202224] font-sf">Expenses</h2>
              <button 
                onClick={() => setIsAddExpenseOpen(true)}
                className="bg-[#4880FF] hover:bg-blue-600 text-white px-6 py-2 rounded-[8px] flex items-center gap-2 font-sf font-semibold shadow-sm transition-all active:scale-95"
              >
                <Plus size={18} /> <span>Add Expense</span>
              </button>
            </div>

            <section className="bg-white rounded-[16px] border border-[#D8D8D8] flex items-center justify-between py-3 px-6 shrink-0 relative">
              <div className="flex items-center gap-6">
                <span className="text-[#202224] font-bold text-[16px] font-nunito opacity-80">Date Range</span>
                <div 
                  className={`flex items-center gap-4 px-4 py-2 bg-[#F1F4F9] border rounded-[8px] cursor-pointer transition-all ${isDatePickerOpen ? 'border-[#4880FF] bg-white shadow-sm' : 'border-[#D8D8D8]'}`}
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                >
                  <span className="text-[14px] text-[#202224] font-semibold font-nunito">{dateRange.from}</span>
                  <span className="opacity-40 text-[14px]">→</span>
                  <span className="text-[14px] text-[#202224] font-semibold font-nunito">{dateRange.to}</span>
                  <div className="ml-4 flex items-center gap-2 border-l border-gray-300 pl-4">
                    <CustomCalendarIcon />
                  </div>
                </div>

                {isDatePickerOpen && (
                  <div ref={datePickerRef} className="absolute top-[calc(100%+8px)] left-[120px] w-[380px] bg-white border border-[#E0E0E0] rounded-[20px] shadow-2xl z-[100] p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <label className="text-[12px] text-gray-400 font-bold block mb-1">From</label>
                        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white">
                          <span className="text-[13px] font-bold text-[#202224]">Oct. {tempFrom}th 2025</span>
                          <CustomCalendarIcon size={14} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-[12px] text-gray-400 font-bold block mb-1">To</label>
                        <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white">
                          <span className="text-[13px] font-bold text-[#202224]">Oct. {tempTo || tempFrom}th 2025</span>
                          <CustomCalendarIcon size={14} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 px-1">
                      <span className="text-[15px] font-bold text-[#202224]">October 2025</span>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft size={16} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-[13px] mb-2 font-bold text-gray-400">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="py-1">{day}</div>)}
                    </div>
                    
                    <div className="grid grid-cols-7 text-center text-[13px] gap-y-1 relative">
                      {Array(3).fill(null).map((_, i) => <div key={`empty-${i}`} className="py-2"></div>)}
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const isStart = day === tempFrom;
                        const isEnd = day === tempTo;
                        const isInRange = tempFrom && tempTo && day > tempFrom && day < tempTo;
                        return (
                          <div 
                            key={day} 
                            onClick={() => handleDayClick(day)}
                            className={`py-2 cursor-pointer transition-all relative z-10 group rounded-[12px] ${isStart || isEnd ? 'bg-[#6085FF] text-white' : 'hover:bg-gray-100'}`}
                          >
                            <span className="relative z-20 font-bold">{day}</span>
                            {isInRange && (
                              <div className="absolute inset-0 bg-[#4880FF] opacity-10 rounded-[12px] z-[5]" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                      <button onClick={() => setIsDatePickerOpen(false)} className="w-[80px] h-[32px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center text-[13px] font-bold hover:bg-[#EBEBEB] transition-all">Cancel</button>
                      <button onClick={handleApply} className="w-[80px] h-[32px] rounded-[8px] bg-[#4880FF] flex items-center justify-center text-[13px] font-bold text-white hover:bg-blue-600 shadow-sm transition-all">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <span className="text-[#202224] font-bold text-[16px] font-nunito opacity-80">Total Expenses</span>
                <span className="text-[24px] font-bold text-[#202224] font-nunito">$0</span>
              </div>
            </section>

            <section className="flex-1 bg-white rounded-[16px] border border-[#D8D8D8] overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-gray-100 shrink-0">
                <div className="relative w-full max-w-[500px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search keywords" className="w-full pl-12 pr-6 py-2 bg-[#F1F4F9] border border-[#D8D8D8] rounded-full focus:outline-none focus:border-[#4880FF] transition-all font-nunito text-[13px]"/>
                </div>
                <button className="w-[150px] h-[36px] bg-[#FAFBFD] border border-[#D5D5D5] rounded-[10px] text-[#202224] font-bold font-sf text-[13px] hover:bg-[#F1F4F9] transition-all">Delete Selected</button>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100 sticky top-0 z-10">
                    <tr className="text-[#202224] font-bold text-[12px] font-sf opacity-80 uppercase tracking-wider">
                      <th className="pl-6 py-5 w-[60px]">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#4880FF] cursor-pointer" />
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
                </table>
                <div className="flex-1 flex flex-col items-center justify-center opacity-25">
                  <IconExpenses active={false} />
                  <p className="mt-3 text-[15px] font-sf font-semibold">No records found</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                <button className="w-8 h-8 flex items-center justify-center border border-[#D8D8D8] rounded-[6px] text-gray-400 hover:bg-gray-50"><ChevronLeft size={16} /></button>
                <button className="w-8 h-8 flex items-center justify-center border border-[#D8D8D8] rounded-[6px] text-[#4880FF] border-[#4880FF] hover:bg-blue-50 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[#4880FF]/10 rounded-full flex items-center justify-center mb-6">
               <Clock size={40} className="text-[#4880FF] animate-pulse" />
            </div>
            <h2 className="text-[28px] font-bold text-[#202224] font-sf mb-2">{activeMenu}</h2>
            <p className="text-[#202224] opacity-50 text-[16px] font-nunito max-w-[400px]">Coming Soon!</p>
          </div>
        )}
      </main>

      {/* Add Expense 弹窗 */}
      {isAddExpenseOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '681px', padding: '40px 58px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}
            className="bg-white rounded-[32px] shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <button onClick={() => setIsAddExpenseOpen(false)} className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>

            <div className="mb-8 w-full">
              <h3 className="text-[20px] font-bold text-[#202224] font-sf mb-8">Select Category</h3>
              <div className="flex justify-between items-start w-full">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => { setSelectedCat(cat); setSelectedTag(cat.tags[0]); }}
                      style={{ width: '35px', height: '35px', borderRadius: '35px', backgroundColor: selectedCat.id === cat.id ? '#4880FF' : '#F5F5F5' }}
                      className={`flex items-center justify-center transition-all ${selectedCat.id === cat.id ? 'shadow-md' : 'hover:bg-[#EEEEEE]'}`}
                    >
                      <img 
                        src={cat.icon} 
                        alt={cat.name} 
                        className={`w-4 h-4 object-contain ${selectedCat.id === cat.id ? 'icon-white' : 'icon-gray'}`} 
                      />
                    </button>
                    <span className={`text-[10px] font-bold font-sf text-center w-full truncate ${selectedCat.id === cat.id ? 'text-[#4880FF]' : 'text-gray-400'}`}>
                      {cat.id === 'discretionary' ? 'Discre..' : (cat.id === 'transport' ? 'Trans..' : (cat.id === 'personal' ? 'Perso..' : (cat.id === 'obligations' ? 'Obli..' : cat.name)))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8 pt-6 border-t border-gray-50 w-full">
              {selectedCat.tags.map(tag => (
                <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-5 py-2.5 rounded-full text-[13px] font-bold border transition-all ${selectedTag === tag ? 'bg-gray-100 border-transparent text-[#202224]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="w-full flex flex-col gap-8 mb-10">
              <div className="w-full">
                <h4 className="text-[16px] font-bold text-[#202224] font-sf mb-4">Add Notes</h4>
                <input type="text" placeholder="Add an optional note" value={note} onChange={(e) => setNote(e.target.value)} className="w-full py-3 border-b border-gray-100 focus:border-[#4880FF] outline-none text-[14px] font-sf" />
              </div>
              <div className="w-full">
                <h4 className="text-[16px] font-bold text-[#202224] font-sf mb-4">Enter Amount</h4>
                <div className="flex items-end justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[36px] font-bold text-[#FF718B]">$</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-[36px] font-bold text-[#FF718B] bg-transparent outline-none w-full" placeholder="0.00" />
                  </div>
                  
                  <div className="flex gap-3 mb-2 shrink-0 ml-4 relative">
                    <div onClick={() => setIsInnerCalendarOpen(!isInnerCalendarOpen)} className="px-4 py-2 bg-[#F5F6FA] rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all">
                      <CalendarIcon size={14} className="text-gray-400" />
                      <span className="text-[12px] font-bold text-gray-600 font-sf">{expenseDate}</span>
                    </div>

                    <div onClick={() => setIsInnerTimeOpen(!isInnerTimeOpen)} className="px-4 py-2 bg-[#F5F6FA] rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 border border-gray-200 transition-all">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[12px] font-bold text-gray-600 font-sf">{expenseTime}</span>
                    </div>

                    {isInnerCalendarOpen && (
                      <div ref={calendarPopRef} onClick={(e) => e.stopPropagation()} className="absolute bottom-full right-0 mb-4 w-[280px] bg-white border border-gray-200 rounded-[12px] shadow-2xl z-[300] p-4 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-4 px-1">
                          <button className="text-[14px] font-bold flex items-center gap-1 hover:text-[#4880FF]">March 2026 <ChevronDown size={14} /></button>
                          <div className="flex gap-3 text-gray-400">
                            <ChevronLeft size={16} className="cursor-pointer hover:text-[#4880FF]" />
                            <ChevronRight size={16} className="cursor-pointer hover:text-[#4880FF]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 mb-2">
                          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-1">
                          {Array(5).fill(null).map((_, i) => <div key={`pre-${i}`} className="py-2 text-gray-300 text-[12px] font-bold">{23 + i}</div>)}
                          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                            <div key={d} onClick={() => { setExpenseDate(`2026-03-${String(d).padStart(2, '0')}`); setIsInnerCalendarOpen(false); }} className={`py-2 text-[12px] font-bold rounded-lg cursor-pointer transition-all ${d === Number(expenseDate.split('-')[2]) ? 'bg-[#4880FF] text-white' : 'hover:bg-gray-100'}`}>{d}</div>
                          ))}
                        </div>
                        <div className="flex justify-between border-t border-gray-100 mt-4 pt-3">
                          <button onClick={() => setExpenseDate("")} className="text-[#4880FF] text-[12px] font-bold hover:underline">Clear</button>
                          <button onClick={() => setExpenseDate("2026-03-14")} className="text-[#4880FF] text-[12px] font-bold hover:underline">Today</button>
                        </div>
                      </div>
                    )}

                    {isInnerTimeOpen && (
                      <div ref={timePopRef} onClick={(e) => e.stopPropagation()} className="absolute bottom-full right-0 mb-4 w-[160px] bg-white border border-gray-200 rounded-[16px] shadow-2xl z-[300] p-1 flex animate-in slide-in-from-bottom-2">
                        <div className="flex-1 max-h-[220px] overflow-y-auto no-scrollbar py-1 border-r border-gray-50">
                          {Array.from({ length: 24 }).map((_, h) => {
                            const hh = String(h).padStart(2, '0');
                            const isSelected = expenseTime.startsWith(hh);
                            return <div key={`h-${h}`} onClick={() => setExpenseTime(`${hh}:${expenseTime.split(':')[1]}`)} className={`h-[36px] flex items-center justify-center text-[13px] font-bold cursor-pointer transition-all ${isSelected ? 'bg-gray-100 text-[#4880FF]' : 'hover:bg-gray-50 text-gray-600'}`}>{hh}</div>;
                          })}
                        </div>
                        <div className="flex-1 max-h-[220px] overflow-y-auto no-scrollbar py-1">
                          {Array.from({ length: 60 }).map((_, m) => {
                            const mm = String(m).padStart(2, '0');
                            const isSelected = expenseTime.endsWith(mm);
                            return <div key={`m-${m}`} onClick={() => setExpenseTime(`${expenseTime.split(':')[0]}:${mm}`)} className={`h-[36px] flex items-center justify-center text-[13px] font-bold cursor-pointer transition-all ${isSelected ? 'bg-gray-100 text-[#4880FF]' : 'hover:bg-gray-50 text-gray-600'}`}>{mm}</div>;
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
                onClick={() => setIsAddExpenseOpen(false)} 
                className="flex items-center justify-center opacity-90 transition-all active:scale-[0.98] hover:opacity-100"
                style={{ width: '191px', height: '43px', backgroundColor: '#F4F4F4', border: '0.3px solid #757575', borderRadius: '8px' }}
              >
                <span className="text-[#202224] font-bold text-[15px]">Cancel</span>
              </button>
              
              <button 
                onClick={() => setIsAddExpenseOpen(false)} 
                className="flex items-center justify-center opacity-90 text-white font-bold text-[15px] transition-all active:scale-[0.98] shadow-lg shadow-blue-100 hover:opacity-100"
                style={{ width: '191px', height: '43px', backgroundColor: '#4880FF', borderRadius: '8px' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}