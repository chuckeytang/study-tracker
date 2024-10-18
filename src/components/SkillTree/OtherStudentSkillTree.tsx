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
import { calculateHandlePosition } from "@/tools/utils";

const OtherStudentSkillTree = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
    <div className="flex items-center justify-center bg-[url('/images/bg.jpg')] h-screen w-screen bg-cover">
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-full flex flex-col justify-between">
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

export default OtherStudentSkillTree;
