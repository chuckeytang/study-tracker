import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
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
import { calculateHandlePosition } from "@/utils/utils";
import { apiRequest } from "@/utils/api";

const OtherStudentSkillTree = ({ courseName }: { courseName: string }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [name, setName] = useState("");

  const router = useRouter();
  const { userId, courseId } = router.query;

  // Fetch and update the skill tree along with student progress
  const updateSkillTree = async () => {
    try {
      // Fetch course data
      const data = await apiRequest(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const bigChecks = data.data.map((node: any) => ({
        ...node,
        coolDown: node.coolDown / 3600, // Convert to hours
        unlockDepTimeInterval: node.unlockDepTimeInterval / 3600, // Convert to hours
      }));

      // Fetch student progress data
      const progressData = await apiRequest(
        `/api/student/getStudentCourseInfo?studentId=${userId}&courseId=${courseId}`
      );

      // Create a mapping from nodeId to progress data
      const studentProgress = progressData.data.reduce(
        (acc: any, node: any) => {
          acc[node.nodeId] = {
            unlocked: node.unlocked,
            level: node.level,
            clusterSkillPt: node.clusterSkillPt,
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
          bigCheckNode.progress =
            studentProgress[bigCheckNode.nodeId].clusterSkillPt /
            bigCheckNode.unlockDepClusterTotalSkillPt;
        } else {
          bigCheckNode.unlocked = false;
          bigCheckNode.level = 0;
          bigCheckNode.progress = 0;
        }

        // Get the cluster nodes and edges
        const clusterResult = await Cluster(
          bigCheckNode,
          studentProgress,
          "otherStudent"
        );
        clusters.push(clusterResult);
      }

      // Collect all nodes and edges
      const allNodes = clusters.flatMap((cluster) => cluster.nodes);
      const allEdges = clusters.flatMap((cluster) => cluster.edges);

      // Connect BigCheck nodes
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
                    userRole: "otherStudent",
                    progress: bigCheckNode.progress,
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
        const data = await apiRequest(`/api/users/getOne?id=${userId}`);
        setName(data.name);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
    updateSkillTree();
  }, [router.isReady, userId]);

  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => (
        <BigCheck
          {...params}
          data={params.data}
          radius={bigCheckRadius}
          userRole="otherStudent"
          onContextMenu={(e) => e.preventDefault()} // Disable context menu
        />
      ),
      MAJOR_NODE: (params: any) => (
        <MajorNode
          {...params}
          data={params.data}
          radius={majornodeRadius}
          userRole="otherStudent"
          onContextMenu={(e) => e.preventDefault()} // Disable context menu
        />
      ),
      MINOR_NODE: (params: any) => (
        <MinorNode
          {...params}
          data={params.data}
          radius={minornodeRadius}
          userRole="otherStudent"
          onContextMenu={(e) => e.preventDefault()} // Disable context menu
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
    <div className="flex items-center justify-center bg-[url('/images/bg_student.jpg')] h-screen w-screen bg-cover">
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-[90vh] flex justify-center items-start">
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-start p-4 m-4 bg-amber-500 rounded-2xl w-40">
            {name}'s {courseName}
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
      <button
        onClick={() => router.back()}
        className="fixed bottom-4 right-4 bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold"
      >
        Back
      </button>
    </div>
  );
};

export default OtherStudentSkillTree;
