import React, { useEffect, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css"; // 导入ReactFlow的样式
import BigCheck from "@/components/Node/BigCheck";
import MajorNode from "@/components/Node/MajorNode";
import MinorNode from "@/components/Node/MinorNode";
import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { useRouter } from "next/router";

// 创建自定义节点的渲染方式
const bigCheckNode = ({ data, updateSkillTree }: any) => (
  <BigCheck
    name={data.name}
    description={data.description}
    courseId={data.courseId}
    unlocked={data.unlocked}
    level={data.level}
    maxLevel={data.maxLevel}
    updateSkillTree={updateSkillTree}
  />
);
const majorNode = ({ data }: any) => <MajorNode name={data.label} />;
const minorNode = ({ data }: any) => <MinorNode name={data.label} />;

// 定义节点类型
const nodeTypes = {
  BIGCHECK: bigCheckNode,
  MAJOR_NODE: majorNode,
  MINOR_NODE: minorNode,
};

// 课程下拉菜单选项
const options = [
  { label: "Swimming", icon: null },
  { label: "Running", icon: null },
  { label: "Cycling", icon: null },
];

const SkillTree = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const router = useRouter();
  const { userId, courseId } = router.query;

  // 更新课程树的函数
  const updateSkillTree = () => {
    fetch(`/api/student/getStudentCourseInfo?studentId=${userId}&&courseId=1`)
      .then((response) => response.json())
      .then((data) => {
        const formattedNodes: Node[] = data.data.map((node: any) => {
          return {
            id: String(node.nodeId),
            type: node.nodeType,
            position: { x: Math.random() * 400, y: Math.random() * 400 }, // 这里你可以根据API数据决定位置
            data: node,
          };
        });

        // 创建相应的 edges
        const formattedEdges: Edge[] = formattedNodes
          .filter((node) => node.data.unlocked)
          .map((node) => ({
            id: `e${node.id}`,
            source: "1", // 假设有默认source和target值
            target: node.id,
            animated: true,
          }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      })
      .catch((error) =>
        console.error("Error fetching student course info:", error)
      );
  };

  useEffect(() => {
    updateSkillTree(); // 页面加载时更新一次课程树
  }, []);

  return (
    <div className="flex items-center justify-center bg-[url('/images/bg.jpg')] h-screen w-screen bg-cover">
      <div className="rounded-2xl bg-stone-200 w-full m-10 h-full flex flex-col justify-between">
        {/* 左上角返回主页按钮 */}
        <div className="flex justify-start p-4">
          <WidgetButton
            style="primary"
            type="button"
            className="text-base items-center"
          >
            <img src="/icons/home.svg" alt="Home" className="mr-2" />
            Home Page
          </WidgetButton>
        </div>

        {/* 课程选择下拉控件 */}
        <div className="flex justify-center mb-4">
          <WidgetSelect
            options={options}
            // value={selectedCourse}
            // onChange={(e: any) => setSelectedCourse(e.target.value)}
          />
        </div>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{
              BIGCHECK: (params) =>
                bigCheckNode({ ...params, updateSkillTree }),
              MAJOR_NODE: majorNode,
              MINOR_NODE: minorNode,
            }}
            fitView
            style={{ background: "#000000" }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default SkillTree;
