import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { useRouter } from "next/router";
import Cluster from "@/components/Node/Cluster";
import NodeForm from "@/components/Form/NodeForm";
import BigCheck from "@/components/Node/BigCheck";
import MajorNode from "@/components/Node/MajorNode";
import MinorNode from "@/components/Node/MinorNode";
import BigCheckEdge from "@/components/Node/BigCheckEdge";
import MajorEdge from "@/components/Node/MajorEdge";
import BigCheckForm from "@/components/Form/BigCheckConnectForm";
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
import { toast } from "react-toastify";
import { Dialog } from "@headlessui/react";

const TeacherSkillTree = ({ courseName }: { courseName: string }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formType, setFormType] = useState<"create" | "edit" | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [bigCheckFormVisible, setBigCheckFormVisible] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [courses, setCourses] = useState([]);


  const router = useRouter();
  const { userId, courseId } = router.query;

  // 处理"Connect to other BigCheck"点击，弹出 BigCheckForm
  const handleConnectToBigCheck = () => {
    setBigCheckFormVisible(true); // 显示 BigCheckForm
  };

  // Fetch and update the skill tree
  const updateSkillTree = async () => {
    try {
      const data = await apiRequest(
        `/api/courses/getBigChecks?courseId=${courseId}`
      );
      const bigChecks = data.data.map((node: any) => ({
        ...node,
        coolDown: node.coolDown,
        unlockDepTimeInterval: node.unlockDepTimeInterval,
      }));

      const clusters: { nodes: Node[]; edges: Edge[] }[] = [];

      // Create clusters for each BigCheck node
      for (let i = 0; i < bigChecks.length; i++) {
        const bigCheckNode = bigChecks[i];

        // Set the position of the BigCheck node
        const x = i * bigCheckSpacingX;
        const y = bigCheckBaseY + (i % 2) * bigCheckYOffset;

        bigCheckNode.position = { x, y };

        // Get the cluster nodes and edges
        const clusterResult = await Cluster(bigCheckNode);
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
                    unlockDepNodeCount: bigCheckNode.unlockDepNodeCount,
                    unlockDepClusterTotalSkillPt:
                      bigCheckNode.unlockDepClusterTotalSkillPt,
                    userRole: "teacher",
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
    if (!router.isReady) return;

    updateSkillTree();
  }, [router.isReady, courseId]);

  const nodeTypes = useMemo(
    () => ({
      BIGCHECK: (params: any) => (
        <BigCheck
          {...params}
          updateSkillTree={updateSkillTree}
          data={params.data}
          radius={bigCheckRadius}
          onContextMenu={handleNodeContextMenu}
        />
      ),
      MAJOR_NODE: (params: any) => (
        <MajorNode
          {...params}
          data={params.data}
          radius={majornodeRadius}
          onContextMenu={handleNodeContextMenu}
        />
      ),
      MINOR_NODE: (params: any) => (
        <MinorNode
          {...params}
          data={params.data}
          radius={minornodeRadius}
          onContextMenu={handleNodeContextMenu}
        />
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuVisible) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuVisible]);

  // Context menu handlers
  const handleNodeContextMenu = (event: React.MouseEvent, nodeData: any) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ x: event.pageX, y: event.pageY });
    setSelectedNode(nodeData);
    setMenuVisible(true);
  };

  const handleBlankContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.pageX, y: event.pageY });
    setSelectedNode(null);
    setMenuVisible(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的是菜单以外的地方，就隐藏菜单
      if (menuVisible) {
        setMenuVisible(false);
      }
    };

    // 监听整个页面的点击事件
    document.addEventListener("click", handleClickOutside);

    // 清理事件监听器
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuVisible]);

  const handleBigCheckDisconnect = async () => {
    try {
      // 调用后端 API 断开 BigCheck 的依赖关系
      const data = await apiRequest(
        "/api/teacher/disconnectBigCheck",
        "DELETE",
        {
          bigCheckNodeId: selectedNode.nodeId, // 传递当前 BigCheck 节点的 ID
        }
      );

      console.log("BigCheck node disconnected successfully:", data);
      updateSkillTree(); // 断开成功后刷新技能树
    } catch (error) {
      console.error("Error disconnecting BigCheck node:", error);
    }
  };

  // 处理创建新节点
  const handleCreateNode = () => {
    let nodeType = "BIGCHECK"; // 默认情况是创建 BIGCHECK

    if (selectedNode) {
      if (selectedNode.nodeType === "BIGCHECK") {
        nodeType = "MAJOR_NODE"; // 如果是 BIGCHECK，创建 MAJOR_NODE
      } else if (
        selectedNode.nodeType === "MAJOR_NODE" ||
        selectedNode.nodeType === "MINOR_NODE"
      ) {
        nodeType = "MINOR_NODE"; // 如果是 MAJOR_NODE 或 MINOR_NODE，创建 MINOR_NODE
      }
    }
    setFormType("create");
    setFormData({ nodeType }); // 清空表单数据
    setFormVisible(true);
    setMenuVisible(false); // 隐藏菜单
  };

  // 处理编辑节点
  const handleEditNode = () => {
    setFormType("edit");
    setFormData(selectedNode); // 填充当前节点数据
    setFormVisible(true);
    setMenuVisible(false); // 隐藏菜单
  };

  //删除node
  const handleDeleteNode = async (nodeId: number, userId: number) => {
    if (!window.confirm("Are you sure you want to delete this node?")) {
      return; // 用户取消了删除操作
    }

    try {
      // 调用后端删除节点的 API
      const data = await apiRequest("/api/teacher/deleteNode", "DELETE", {
        userId: userId,
        nodeId: nodeId,
      });

      alert("Node deleted successfully.");
      await updateSkillTree();
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  const handleBigcheckFormSubmit = async (
    selectedBigCheckId: any,
    unlockDepNodeCount: number,
    unlockDepClusterTotalSkillPt: number,
    lockDepNodeCount: number
  ) => {
    try {
      const data = await apiRequest(
        "/api/teacher/setUnlockBigcheckNode",
        "POST",
        {
          fromNodeId: selectedBigCheckId, // 被依赖的BigCheck节点ID
          toNodeId: selectedNode.nodeId, // 本BigCheck节点ID
          unlockDepNodeCount,
          unlockDepClusterTotalSkillPt,
          lockDepNodeCount,
        }
      );
      console.log("BigCheck nodes connected successfully:", data);
      setBigCheckFormVisible(false);
      updateSkillTree(); // 成功后刷新技能树
    } catch (error) {
      console.error("Error connecting BigCheck nodes:", error);
    }
  };

  // 提交表单后的处理
  const handleFormSubmit = async (
    formType: "create" | "edit" | null,
    nodeData: any
  ) => {
    const formData = new FormData();

    // 添加基础字段
    formData.append("id", nodeData.nodeId);
    formData.append("name", nodeData.name);
    formData.append("description", nodeData.description);
    formData.append("nodeType", nodeData.nodeType);
    if (typeof courseId === "string") {
      formData.append("courseId", courseId);
    } else {
      console.error("courseId is undefined or not a string");
    }
    formData.append("maxLevel", nodeData.maxLevel.toString());
    formData.append("unlockDepNodeCount", nodeData.unlockDepNodeCount || 0);
    formData.append("lockDepNodeCount", nodeData.lockDepNodeCount || 0);

    // 添加解锁和锁定依赖的节点数组
    formData.append(
      "unlockDepNodes",
      JSON.stringify(nodeData.selectedUnlockNodes)
    );
    formData.append("lockDepNodes", JSON.stringify(nodeData.selectedLockNodes));

    // 添加图标文件（如果有）
    if (nodeData.iconFile) {
      formData.append("icon", nodeData.iconFile);
    }

    // 添加新的字段
    formData.append("coolDown", nodeData.coolDown.toString());
    formData.append("unlockType", nodeData.unlockType);
    if (nodeData.unlockDepTimeInterval !== undefined) {
      formData.append(
        "unlockDepTimeInterval",
        nodeData.unlockDepTimeInterval.toString()
      );
    }
    formData.append("exp", nodeData.exp.toString());
    formData.append("rewardPt", nodeData.rewardPt.toString());

    try {
      let url = "";
      let method = "POST"; // 默认创建新节点

      if (formType === "edit") {
        url = `/api/teacher/updateNode?nodeId=${nodeData.nodeId}`;
        method = "PUT"; // 更新操作
      } else if (formType === "create") {
        url = "/api/teacher/createNode";
      } else {
        throw new Error("Invalid form type");
      }

      // 调用后端接口进行创建或更新
      const data = await apiRequest(url, method, formData);
      await updateSkillTree(); // 在删除后刷新课程树

      // 关闭表单并刷新视图（或执行其他后续操作）
      setFormVisible(false);
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error updating node:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const apiUrl = `/api/teacher/getCourseList?userId=${userId}`;
      const data = await apiRequest(apiUrl);
      const filteredCourses = data.courses.filter(
        (course: any) => course.isLearning
      );

      setCourses(filteredCourses);

      // Set isPublished based on the selected course's published status
      const selectedCourse = filteredCourses.find(
        (course: any) => course.id === Number(courseId)
      );
      if (selectedCourse) {
        setIsPublished(selectedCourse.published);
      }
    } catch (error) {
      console.error("Error fetching course list:", error);
    } finally {
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    fetchCourses();
  }, [router.isReady, userId, courseId]);

  const handlePublishCourse = async () => {
    try {
      await apiRequest(`/api/teacher/publishCourse`, "POST", { courseId });
      setIsPublished(true);
      alert("Course published successfully!");
    } catch (error) {
      console.error("Error publishing course:", error);
    }
  };

  const openPublishDialog = () => setIsPublishDialogOpen(true);
  const closePublishDialog = () => setIsPublishDialogOpen(false);

  return (
    <div
      className="flex items-center justify-center bg-[url('/images/bg_teacher.jpg')] h-screen w-screen bg-cover"
      onContextMenu={handleBlankContextMenu}
    >
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-[90vh] flex justify-center items-start">
        <div className="flex flex-col justify-center items-center">
          <div className="flex justify-start p-4 m-4 bg-purple-700 rounded-2xl">
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
                router.push(`/skillTree/${userId}?courseId=${selectedCourse}`);
              }}
            />
          </div>
        </div>

        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
            className="bg-stone-50"
            style={{}}
          />
        </ReactFlowProvider>

        {/* Publish Button or Published Text */}
        <div className="fixed bottom-4 right-4 px-4">
          {isPublished ? (
            <span className="text-green-600 font-bold">Published</span>
          ) : (
            <button
              onClick={openPublishDialog}
              className="bg-purple-600 text-white p-2 rounded px-4"
            >
              Publish
            </button>
          )}
        </div>

        {/* Publish Confirmation Dialog */}
        <Dialog
          open={isPublishDialogOpen}
          onClose={closePublishDialog}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            aria-hidden="true"
          />
          <div className="relative bg-white p-6 rounded-xl shadow-lg text-center w-1/2 h-1/3">
            <Dialog.Panel>
              <Dialog.Title>
                <h2 className="text-2xl font-bold text-gray-800">
                  Publish Course
                </h2>
              </Dialog.Title>
              <div className="mt-6 text-gray-800 mb-10">
                <p>Are you sure you want to publish this course?</p>
              </div>
              <div className="mt-4 flex justify-around">
                <button
                  onClick={() => {
                    handlePublishCourse();
                    closePublishDialog();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Publish
                </button>
                <button
                  onClick={closePublishDialog}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Context Menu */}
        {menuVisible && (
          <div
            className="absolute bg-white shadow-lg p-2 rounded-lg z-50"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            {selectedNode ? (
              <>
                {selectedNode.nodeType === "BIGCHECK" && (
                  <>
                    <li
                      className="p-2 hover:bg-orange-400 text-gray-800"
                      onClick={handleConnectToBigCheck}
                    >
                      Connect to other BigCheck
                    </li>
                    <li
                      className="p-2 hover:bg-orange-400 text-gray-800"
                      onClick={handleBigCheckDisconnect}
                    >
                      Disconnect to others
                    </li>
                  </>
                )}
                <li
                  className="p-2 hover:bg-orange-400 text-gray-800"
                  onClick={handleCreateNode}
                >
                  Create New Sub Course
                </li>
                <li
                  className="p-2 hover:bg-orange-400 text-gray-800"
                  onClick={handleEditNode}
                >
                  Edit This Course
                </li>
                <li
                  className="p-2 hover:bg-orange-400 text-gray-800"
                  onClick={() =>
                    handleDeleteNode(selectedNode?.nodeId, Number(userId))
                  }
                >
                  Delete This Course
                </li>
              </>
            ) : (
              <>
                <li
                  className="p-2 hover:bg-orange-400 text-gray-800"
                  onClick={handleCreateNode}
                >
                  Create BigCheck
                </li>
              </>
            )}
          </div>
        )}

        {/* NodeForm and BigCheckForm */}
        {formVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative w-1/2">
              <NodeForm
                onSubmit={handleFormSubmit}
                formType={formType}
                defaultValue={formData}
                nodeId={formType === "edit" ? selectedNode?.nodeId : null}
                parentNodeId={
                  formType === "create" && selectedNode
                    ? selectedNode.nodeId
                    : null
                }
              />
              <button
                onClick={() => setFormVisible(false)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {bigCheckFormVisible && selectedNode?.nodeType === "BIGCHECK" && (
          <BigCheckForm
            nodeId={selectedNode.nodeId}
            onClose={() => setBigCheckFormVisible(false)}
            onSubmit={handleBigcheckFormSubmit}
            courseId={Array.isArray(courseId) ? courseId[0] : courseId || ""}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherSkillTree;
