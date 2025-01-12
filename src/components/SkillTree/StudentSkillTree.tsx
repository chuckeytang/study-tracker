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
import { calculateHandlePosition } from "@/utils/utils";
import { apiRequest } from "@/utils/api";
import { FaHome } from "react-icons/fa";

// Define options for the course selection dropdown
const options = [
  { label: "Swimming", icon: null },
  { label: "Running", icon: null },
  { label: "Cycling", icon: null },
];

const StudentSkillTree = ({ courseName }: { courseName: string }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);

  const router = useRouter();
  const { userId, courseId } = router.query;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const apiUrl = `/api/student/getCourseList?userId=${userId}`;

      const data = await apiRequest(apiUrl);
      const filteredCourses = data.courses.filter(
        (course: any) => course.isLearning
      );

      setCourses(filteredCourses);
    } catch (error) {
      console.error("Error fetching course list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherStudents = async () => {
    if (courseId) {
      const data = await apiRequest(
        `/api/student/getOtherStudentListForCourse?courseId=${courseId}`
      );
      setOtherStudents(data.students);
    }
  };

  const handleSelectCourse = async (selectedCourseId: string) => {
    router.push(`/skillTree/${userId}?courseId=${selectedCourseId}`);
  };

  // Fetch and update the skill tree along with student progress
  const updateSkillTree = async () => {
    try {
      const userData = await apiRequest(`/api/users/getOne?id=${userId}`);
      setAvailableSkillPoints(userData.skillPt || 0);

      fetchOtherStudents();

      // Fetch course data
      const data = await apiRequest(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const bigChecks = data.data.map((node: any) => ({
        ...node,
        coolDown: node.coolDown,
        unlockDepTimeInterval: node.unlockDepTimeInterval,
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
        setAvailableSkillPoints(data.skillPt || 0); // 设置技能点数
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
    fetchCourses();
  }, [router.isReady, userId]);

  useEffect(() => {
    if (!router.isReady) return;

    updateSkillTree();
  }, [router.isReady, courseId]);

  const [otherStudents, setOtherStudents] = useState([]);

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
      const data = await apiRequest("/api/student/changeNodeLevel", "PUT", {
        nodeId: nodeId,
        points: delta, // delta 可为正或负数
        studentId: userId,
      });
      // 如果成功，更新可用技能点数
      setAvailableSkillPoints((prev) => prev - delta);
      updateSkillTree();
    } catch (error:any) {
      console.error("Error changing node level:", error);
      // Handle cooldown error
      if (error.response && error.response.data.error) {
        alert(error.response.data.error);
      }
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
    [courseId, handleLevelChange]
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
      className="flex items-center justify-center bg-[url('/images/bg_student.jpg')] h-screen w-screen bg-cover"
      onContextMenu={handleBlankContextMenu}
    >
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-[90vh] flex justify-center items-start">
        {/* Top navigation and course selection */}
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-start p-4 m-4 bg-amber-500 rounded-2xl">
            <button
              type="button"
              className="text-base items-center flex text-white"
              onClick={() => router.push("/myCourses")}
            >
              <FaHome className="mr-3" />
              Home Page
            </button>
          </div>

          <div className="flex justify-center m-4">
            <WidgetSelect
              options={courses.map((course: any) => ({
                label: course.name,
                value: course.id,
                icon: <img src={course.iconUrl}></img>,
              }))}
              value={courseId}
              onChange={(selectedCourse) => {
                handleSelectCourse(selectedCourse);
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Skill Points: {availableSkillPoints}
            </h3>
          </div>

          {/* Other students list */}
          <div className="flex flex-col items-center mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Other Students
            </h3>
            {otherStudents.length === 0 ? (
              <p className="text-gray-500">Empty</p>
            ) : (
              otherStudents.map((student: any) => (
                <button
                  key={student.id}
                  onClick={() =>
                    router.push(
                      `/skillTree/${student.id}?courseId=${courseId}&otherStudent=1&courseName=${courseName}`
                    )
                  }
                  className="text-blue-500 hover:underline mb-1"
                >
                  {student.name}
                </button>
              ))
            )}
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
