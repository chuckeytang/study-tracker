import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
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
import { calculateHandlePosition, getRestoredPosition } from "@/utils/utils";
import { apiRequest } from "@/utils/api";

interface Props {
  userId: number;
  courseId: number;
}

const BareStudentSkillTree: React.FC<Props> = ({ userId, courseId }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [experience, setExperience] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState(1);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardLevel, setRewardLevel] = useState(1);
  const [experienceConfig, setExperienceConfig] = useState<number[]>([]);
  const [rewardConfig, setRewardConfig] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLevelChange = async (nodeId: string, delta: number) => {
    try {
      await apiRequest("/api/student/changeNodeLevel", "PUT", {
        nodeId,
        points: delta,
        studentId: userId,
      });
      updateSkillTree();
    } catch (error: any) {
      console.error("Error changing node level:", error);
      // ✅ 错误来源：可能是 Fetch API 的自定义封装，error.response 不存在
      const errMsg =
        error?.response?.data?.error || // Axios 风格
        error?.data?.error || // 自定义 fetch 封装返回
        error?.message || // JS 错误
        "An unknown error occurred."; // 兜底
      setErrorMessage(errMsg);
    }
  };

  const handleUpdateSkillTreeStatus = async (nodeId?: string) => {
    try {
      await apiRequest("/api/student/updateSkillTreeStatus", "POST", {
        studentId: userId,
        courseId,
        nodeId,
      });
      updateSkillTree();
    } catch (error) {
      console.error("Error updating skill tree status:", error);
    }
  };

  const calculateProgress = (
    current: number,
    level: number,
    config: number[]
  ) => {
    if (level <= 1) return Math.min(current / (config[0] || 1), 1);
    const previousLevelTotal = config
      .slice(0, level - 1)
      .reduce((a, b) => a + b, 0);
    const progress = (current - previousLevelTotal) / (config[level - 1] || 1);
    return Math.min(progress, 1);
  };

  const updateSkillTree = async () => {
    try {
      const userRes = await apiRequest(`/api/users/getOne?id=${userId}`);
      setExperience(userRes.experience || 0);
      setExperienceLevel(userRes.experienceLevel || 1);
      setRewardPoints(userRes.rewardPoints || 0);
      setRewardLevel(userRes.rewardLevel || 1);

      const expConf = await apiRequest("/api/experienceConfig/search");
      const rewConf = await apiRequest("/api/rewardConfig/search");
      setExperienceConfig(expConf.data.map((d: any) => d.expPoints));
      setRewardConfig(rewConf.data.map((d: any) => d.rewardPoints));

      const data = await apiRequest(
        `/api/courses/getBigChecks?courseId=${courseId}&studentId=${userId}`
      );
      const progressData = await apiRequest(
        `/api/student/getStudentCourseInfo?studentId=${userId}&courseId=${courseId}`
      );

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

      const bigChecks = data.data.map((node: any, i: number) => {
        node.position = getRestoredPosition(node, {
          x: i * bigCheckSpacingX,
          y: bigCheckBaseY + (i % 2) * bigCheckYOffset,
        });
        const progress = studentProgress[node.nodeId];
        if (progress) {
          node.unlocked = progress.unlocked;
          node.level = progress.level;
          node.progress =
            progress.clusterSkillPt / node.unlockDepClusterTotalSkillPt;
        } else {
          node.unlocked = false;
          node.level = 0;
          node.progress = 0;
        }
        return node;
      });

      const clusters = await Promise.all(
        bigChecks.map((n: any) => Cluster(n, studentProgress, "student"))
      );
      const allNodes = clusters.flatMap((c) => c.nodes);
      const allEdges = clusters.flatMap((c) => c.edges);

      // bigcheck 间连接
      bigChecks.forEach((n: any) => {
        n.unlockDependencies?.forEach((dep: any) => {
          const from = allNodes.find((x) => x.id === String(n.nodeId));
          const to = allNodes.find((x) => x.id === String(dep.nodeId));
          if (from && to) {
            const sourceHandle = calculateHandlePosition(
              n.position,
              to.position,
              bigCheckRadius
            );
            const targetHandle = calculateHandlePosition(
              to.position,
              n.position,
              bigCheckRadius
            );
            from.data.handles.push({ type: "source", position: sourceHandle });
            to.data.handles.push({ type: "target", position: targetHandle });

            allEdges.push({
              id: `e${from.id}-${to.id}`,
              source: from.id,
              target: to.id,
              type: "bigcheckEdge",
              data: { userRole: "student", progress: n.progress },
            });
          }
        });
      });

      setNodes(allNodes);
      setEdges(allEdges);
    } catch (err) {
      console.error("Error loading tree:", err);
    }
  };

  useEffect(() => {
    updateSkillTree();
  }, [userId, courseId]);

  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => (
        <BigCheck
          {...params}
          radius={bigCheckRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          handleUpdateSkillTreeStatus={handleUpdateSkillTreeStatus}
        />
      ),
      MAJOR_NODE: (params: any) => (
        <MajorNode
          {...params}
          radius={majornodeRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          handleUpdateSkillTreeStatus={handleUpdateSkillTreeStatus}
        />
      ),
      MINOR_NODE: (params: any) => (
        <MinorNode
          {...params}
          radius={minornodeRadius}
          userRole="student"
          handleLevelChange={handleLevelChange}
          handleUpdateSkillTreeStatus={handleUpdateSkillTreeStatus}
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
    <div className="w-full h-[90vh] relative">
      {/* 🧩 插入错误提示框 */}
      {errorMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow z-50 max-w-[80%]">
          <div className="flex justify-between items-center space-x-4">
            <span>{errorMessage}</span>
            <button
              className="text-red-700 font-bold"
              onClick={() => setErrorMessage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          className="bg-white"
        />
      </ReactFlowProvider>

      {/* Progress Bars */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white shadow-md">
        <div className="w-full mx-auto">
          <div className="mb-2 flex justify-between">
            <div className="text-sm font-bold w-32 text-purple-600">
              Exp Level: {experienceLevel}
            </div>
            <div className="text-sm font-bold text-gray-700">Experience</div>
            <div className="w-5/6 bg-gray-200 rounded-full h-4">
              <div
                className="bg-purple-600 h-4 rounded-full"
                style={{
                  width: `${
                    calculateProgress(
                      experience,
                      experienceLevel,
                      experienceConfig
                    ) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm font-bold w-32 text-amber-600">
              Reward Level: {rewardLevel}
            </div>
            <div className="text-sm font-bold text-gray-700">Reward</div>
            <div className="w-5/6 bg-gray-200 rounded-full h-4">
              <div
                className="bg-amber-500 h-4 rounded-full"
                style={{
                  width: `${
                    calculateProgress(rewardPoints, rewardLevel, rewardConfig) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BareStudentSkillTree;
