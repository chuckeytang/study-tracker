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
import BigCheckEdge from "@/components/Node/BigCheckEdge";
import MajorEdge from "@/components/Node/MajorEdge";
import {
  bigCheckRadius,
  majornodeRadius,
  minornodeRadius,
} from "@/types/Values";
import { calculateHandlePosition } from "@/tools/utils";

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
  const { courseId } = router.query;

  // 更新课程树的函数
  const updateSkillTree = async () => {
    try {
      // 第一步：获取所有的bigcheck节点
      const response = await fetch(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const data = await response.json();
      const bigChecks = data.data;

      const clusters: { nodes: Node[]; edges: Edge[] }[] = [];

      // 设置bigCheckNode的位置参数
      const bigCheckSpacingX = 800; // bigCheckNode之间的X轴间距
      const bigCheckBaseY = 0; // bigCheckNode的基础Y轴位置
      const bigCheckYOffset = 100; // bigCheckNode之间的Y轴偏移量

      // 第二步：为每个bigcheck节点创建一个cluster
      for (let i = 0; i < bigChecks.length; i++) {
        const bigCheckNode = bigChecks[i];

        // 设置bigCheckNode的位置
        const x = i * bigCheckSpacingX;
        const y = bigCheckBaseY + (i % 2) * bigCheckYOffset; // Y轴位置交替变化

        bigCheckNode.position = { x, y };

        // 将bigCheckNode传递给Cluster组件，获取该cluster的节点和边
        const clusterResult = await Cluster(bigCheckNode);
        clusters.push(clusterResult);
      }

      // 第三步：收集所有的节点和边
      const allNodes = clusters.flatMap((cluster) => cluster.nodes);
      const allEdges = clusters.flatMap((cluster) => cluster.edges);

      // 连接 BigCheckNode 之间
      bigChecks.forEach((bigCheckNode: any) => {
        if (bigCheckNode.unlockDependencies) {
          bigCheckNode.unlockDependencies.forEach((depNode: any) => {
            // 根据 depNode 的 nodeId 在 bigChecks 中找到相应的节点，并获取其 position
            const dependentNode = bigChecks.find(
              (n: any) => n.nodeId === depNode.nodeId
            );

            if (dependentNode) {
              const handleFromPos = calculateHandlePosition(
                bigCheckNode.position,
                dependentNode.position, // 使用找到的依赖节点的position
                bigCheckRadius
              );
              const handleToPos = calculateHandlePosition(
                dependentNode.position,
                bigCheckNode.position,
                bigCheckRadius
              );

              // 更新 BigCheckNode 的句柄信息
              const sourceNode = allNodes.find(
                (n) => n.id === String(bigCheckNode.nodeId)
              );
              const targetNode = allNodes.find(
                (n) => n.id === String(dependentNode.nodeId)
              );

              if (sourceNode && targetNode) {
                // 生成唯一的 Handle id
                const sourceHandleId = `handle-${sourceNode.data.nodeId}-source-${handleFromPos.x}-${handleFromPos.y}`;
                const targetHandleId = `handle-${targetNode.data.nodeId}-target-${handleToPos.x}-${handleToPos.y}`;

                sourceNode.data.handles.push({
                  type: "source",
                  position: handleFromPos,
                  id: sourceHandleId,
                });
                targetNode.data.handles.push({
                  type: "target",
                  position: handleToPos,
                  id: targetHandleId,
                });

                allEdges.push({
                  id: `e${sourceNode.data.nodeId}-${targetNode.data.nodeId}`,
                  source: String(sourceNode.data.nodeId),
                  target: String(targetNode.data.nodeId),
                  sourceHandle: sourceHandleId, // 指定 source 句柄 id
                  targetHandle: targetHandleId, // 指定 target 句柄 id
                  type: "majorEdge",
                  animated: true,
                });
              }
            }
          });
        }
      });

      setNodes(allNodes);
      setEdges(allEdges);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    updateSkillTree(); // 页面加载时更新一次课程树
  }, []);

  // 定义节点类型
  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => (
        <BigCheck
          {...params}
          updateSkillTree={updateSkillTree}
          data={params.data}
          radius={bigCheckRadius}
        />
      ),
      MAJOR_NODE: (params: any) => (
        <MajorNode {...params} data={params.data} radius={majornodeRadius} />
      ),
      MINOR_NODE: (params: any) => (
        <MinorNode {...params} data={params.data} radius={minornodeRadius} />
      ),
    }),
    [updateSkillTree]
  );

  const edgeTypes = useMemo(
    () => ({
      bigcheckEdge: BigCheckEdge,
      majorEdge: MajorEdge,
      minorEdge: MajorEdge,
    }),
    []
  );

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
            edgeTypes={edgeTypes}
            fitView
            style={{ background: "#000000" }}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default SkillTree;
