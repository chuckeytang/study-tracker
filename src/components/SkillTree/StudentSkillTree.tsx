import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { useRouter } from "next/router";
import Cluster from "@/components/Node/Cluster";
import BigCheck from "@/components/Node/BigCheck";
import MajorNode from "@/components/Node/MajorNode";
import MinorNode from "@/components/Node/MinorNode";
import BigCheckEdge from "@/components/Node/BigCheckEdge";
import MajorEdge from "@/components/Node/MajorEdge";
import {
  bigCheckBaseY,
  bigCheckRadius,
  bigCheckSpacingX,
  bigCheckYOffset,
  majornodeRadius,
  minornodeRadius,
} from "@/types/Values";
import { calculateHandlePosition } from "@/tools/utils";

// Define options for the course selection dropdown
const options = [
  { label: "Swimming", icon: null },
  { label: "Running", icon: null },
  { label: "Cycling", icon: null },
];

const StudentSkillTree = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);

  const router = useRouter();
  const { userId, courseId } = router.query;

  // Fetch and update the skill tree along with student progress
  const updateSkillTree = async () => {
    try {
      // Fetch course data
      const response = await fetch(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const data = await response.json();
      const bigChecks = data.data;

      // Fetch student progress data
      const progressResponse = await fetch(
        `/api/student/getStudentCourseInfo?studentId=${userId}&courseId=${courseId}`
      );
      const progressData = await progressResponse.json();

      // Create a mapping from nodeId to progress data
      const studentProgress = progressData.data.reduce(
        (acc: any, node: any) => {
          acc[node.nodeId] = {
            unlocked: node.unlocked,
            level: node.level,
          };
          return acc;
        },
        {}
      );

      const clusters: { nodes: Node[]; edges: Edge[] }[] = [];

      // Create clusters for each BigCheck node
      for (let i = 0; i < bigChecks.length; i++) {
        const bigCheckNode = bigChecks[i];

        // Set the position of the BigCheck node
        const x = i * bigCheckSpacingX;
        const y = bigCheckBaseY + (i % 2) * bigCheckYOffset;

        bigCheckNode.position = { x, y };

        // Merge progress data
        if (studentProgress[bigCheckNode.nodeId]) {
          bigCheckNode.unlocked = studentProgress[bigCheckNode.nodeId].unlocked;
          bigCheckNode.level = studentProgress[bigCheckNode.nodeId].level;
        } else {
          bigCheckNode.unlocked = false;
          bigCheckNode.level = 0;
        }

        // Get the cluster nodes and edges
        const clusterResult = await Cluster(
          bigCheckNode,
          studentProgress,
          "student"
        );
        clusters.push(clusterResult);
      }

      // Collect all nodes and edges
      const allNodes = clusters.flatMap((cluster) => cluster.nodes);
      const allEdges = clusters.flatMap((cluster) => cluster.edges);

      // Connect BigCheck nodes (similar to teacher's code)
      bigChecks.forEach((bigCheckNode: any) => {
        if (bigCheckNode.unlockDependencies) {
          bigCheckNode.unlockDependencies.forEach((depNode: any) => {
            const dependentNode = bigChecks.find(
              (n: any) => n.nodeId === depNode.nodeId
            );

            if (dependentNode) {
              const handleFromPos = calculateHandlePosition(
                bigCheckNode.position,
                dependentNode.position,
                bigCheckRadius
              );
              const handleToPos = calculateHandlePosition(
                dependentNode.position,
                bigCheckNode.position,
                bigCheckRadius
              );

              const sourceNode = allNodes.find(
                (n) => n.id === String(bigCheckNode.nodeId)
              );
              const targetNode = allNodes.find(
                (n) => n.id === String(dependentNode.nodeId)
              );

              if (sourceNode && targetNode) {
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
                  sourceHandle: sourceHandleId,
                  targetHandle: targetHandleId,
                  type: "bigcheckEdge",
                  animated: false,
                  data: {
                    userRole: "student",
                    progress: 0,
                  },
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
    if (!router.isReady || !userId) return;

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/users/getOne?id=${userId}`);
        const data = await response.json();

        if (response.ok) {
          setAvailableSkillPoints(data.skillPt || 0); // 设置技能点数
        } else {
          console.error("Failed to fetch user info:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, [router.isReady, userId]);

  useEffect(() => {
    if (!router.isReady) return;

    updateSkillTree();
  }, [router.isReady]);

  const handleNodeContextMenu = (event: React.MouseEvent, nodeData: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleBlankContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  // Handle level changes
  // 修改后的handleLevelChange函数
  const handleLevelChange = async (nodeId: string, delta: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const currentLevel = node.data.level || 0;
          let newLevel = currentLevel + delta;

          // 本地验证，避免无效操作
          if (newLevel < 0) {
            newLevel = 0; // 不能降低到 0 以下
            return node;
          } else if (newLevel > node.data.maxLevel) {
            newLevel = node.data.maxLevel; // 不能超过最大等级
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              level: newLevel,
            },
          };
        }
        return node;
      })
    );

    try {
      // 调用后端 API，传递 nodeId、points（可为负数） 和 studentId
      const response = await fetch("/api/student/changeNodeLevel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodeId: nodeId,
          points: delta, // delta 可为正或负数
          studentId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to change node level:", data.error);
      } else {
        // 如果成功，更新可用技能点数
        setAvailableSkillPoints((prev) => prev - delta);
        updateSkillTree();
      }
    } catch (error) {
      console.error("Error changing node level:", error);
    }
  };

  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => (
        <BigCheck
          {...params}
          data={params.data}
          radius={bigCheckRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          onContextMenu={handleNodeContextMenu}
        />
      ),
      MAJOR_NODE: (params: any) => (
        <MajorNode
          {...params}
          data={params.data}
          radius={majornodeRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          onContextMenu={handleNodeContextMenu}
        />
      ),
      MINOR_NODE: (params: any) => (
        <MinorNode
          {...params}
          data={params.data}
          radius={minornodeRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          onContextMenu={handleNodeContextMenu}
        />
      ),
    }),
    []
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
    <div
      className="flex items-center justify-center bg-[url('/images/bg.jpg')] h-screen w-screen bg-cover"
      onContextMenu={handleBlankContextMenu}
    >
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-full flex flex-col justify-between">
        {/* Top navigation and course selection */}
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

        <div className="flex justify-center space-x-10 items-center">
          <WidgetSelect options={options} />
          <div className="text-gray-800">
            Available Skill Points: {availableSkillPoints}
          </div>
        </div>

        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-stone-50"
            style={{}}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default StudentSkillTree;
