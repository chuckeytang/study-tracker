import dynamic from "next/dynamic";

// 动态导入 AdminPanel 并禁用 SSR
const AdminPanel = dynamic(() => import("@/components/AdminPanel"), {
  ssr: false,
});

const AdminPage = (props: any) => {
  return <AdminPanel />;
};

export default AdminPage;
