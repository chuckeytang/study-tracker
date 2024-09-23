import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css"; // 导入ReactFlow的样式
import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { useRouter } from "next/router";
import Cluster from "@/components/Node/Cluster"; // 导入Cluster组件

// 定义节点类型
import BigCheck from "@/components/Node/BigCheck";
import MajorNode from "@/components/Node/MajorNode";
import MinorNode from "@/components/Node/MinorNode";

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
const majorNode = ({ data }: any) => <MajorNode name={data.name} />;
const minorNode = ({ data }: any) => <MinorNode name={data.name} />;

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

const SkillTree = (props) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const router = useRouter();
  const { userId, courseId } = router.query;

  // 更新课程树的函数
  const updateSkillTree = async () => {
    try {
      // 第一步：获取所有的bigcheck节点
      const response = await fetch(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const data = await response.json();
      const bigChecks = data.data; // 假设API返回的是bigcheck节点的数组

      const clusters: { nodes: Node[]; edges: Edge[] }[] = [];

      // 第二步：为每个bigcheck节点创建一个cluster
      for (const bigCheckNode of bigChecks) {
        // 将bigCheckNode传递给Cluster组件，获取该cluster的节点和边
        const clusterResult = await Cluster(bigCheckNode);
        clusters.push(clusterResult);
      }

      // 第三步：收集所有的节点和边
      const allNodes = clusters.flatMap((cluster) => cluster.nodes);
      const allEdges = clusters.flatMap((cluster) => cluster.edges);

      // 第四步：手动建立Cluster之间的连接（bigcheck节点之间）
      bigChecks.forEach((bigCheckNode: any) => {
        if (
          bigCheckNode.unlockDepNodes &&
          bigCheckNode.unlockDepNodes.length > 0
        ) {
          bigCheckNode.unlockDepNodes.forEach((depNode: any) => {
            allEdges.push({
              id: `e${depNode.nodeId}-${bigCheckNode.nodeId}`,
              source: String(depNode.nodeId),
              target: String(bigCheckNode.nodeId),
              animated: true,
            });
          });
        }
      });

      setNodes(allNodes);
      setEdges(allEdges);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => bigCheckNode({ ...params, updateSkillTree }),
      MAJOR_NODE: majorNode,
      MINOR_NODE: minorNode,
    }),
    [updateSkillTree]
  );

  useEffect(() => {
    if (!router.isReady) return;

    console.log("router.query:", router.query);
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
            nodeTypes={nodeTypes}
            fitView
            style={{ background: "#000000" }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default SkillTree;
