import React, { useEffect, useMemo, useState } from "react";
import ReactFlow, { Node, Edge, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css"; // 导入ReactFlow的样式
import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import { useRouter } from "next/router";
import Cluster from "@/components/Node/Cluster"; // 导入Cluster组件
import NodeForm from "@/components/Form/NodeForm";

// 定义节点类型
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
import BigCheckForm from "@/components/Form/BigCheckConnectForm";

// 课程下拉菜单选项
const options = [
  { label: "Swimming", icon: null },
  { label: "Running", icon: null },
  { label: "Cycling", icon: null },
];

const SkillTree = (props) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null); // 当前选中的节点
  const [formVisible, setFormVisible] = useState(false);
  const [formType, setFormType] = useState<"create" | "edit" | null>(null);
  const [formData, setFormData] = useState<any>({}); // 用于存储表单数据
  const [bigCheckFormVisible, setBigCheckFormVisible] = useState(false);

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
      const bigChecks = data.data;

      const clusters: { nodes: Node[]; edges: Edge[] }[] = [];

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

  // 右键点击处理，显示菜单
  const handleNodeContextMenu = (event: React.MouseEvent, nodeData: any) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPosition({ x: event.pageX, y: event.pageY });
    setSelectedNode(nodeData); // 选中当前节点的数据
    setMenuVisible(true); // 显示菜单
  };

  // 右键点击空白区域处理
  const handleBlankContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuPosition({ x: event.pageX, y: event.pageY });
    setSelectedNode(null); // 取消选中节点，表示点击了空白区域
    setMenuVisible(true); // 显示空白区域的菜单
  };

  // 处理"Connect to other BigCheck"点击，弹出 BigCheckForm
  const handleConnectToBigCheck = () => {
    setBigCheckFormVisible(true); // 显示 BigCheckForm
  };

  const handleBigCheckDisconnect = async () => {
    try {
      // 调用后端 API 断开 BigCheck 的依赖关系
      const response = await fetch("/api/teacher/disconnectBigCheck", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bigCheckNodeId: selectedNode.nodeId, // 传递当前 BigCheck 节点的 ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("BigCheck node disconnected successfully:", data);
        updateSkillTree(); // 断开成功后刷新技能树
      } else {
        console.error("Failed to disconnect BigCheck node:", data.error);
      }
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
      const response = await fetch("/api/teacher/deleteNode", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          nodeId: nodeId,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete node");
      }

      const result = await response.json();
      console.log("Node deleted successfully:", result);

      // 可以在这里更新前端的视图或做其他处理
      alert("Node deleted successfully.");
      await updateSkillTree(); // 在删除后刷新课程树
      // 例如，刷新页面或重载节点列表
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  const handleBigcheckFormSubmit = async (selectedBigCheckId: any) => {
    try {
      const response = await fetch("/api/teacher/setUnlockBigcheckNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromNodeId: selectedBigCheckId, // 被依赖的BigCheck节点ID
          toNodeId: selectedNode.nodeId, // 本BigCheck节点ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("BigCheck nodes connected successfully:", data);
        setBigCheckFormVisible(false);
        updateSkillTree(); // 成功后刷新技能树
      } else {
        console.error("Failed to connect BigCheck nodes:", data.error);
      }
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
      const response = await fetch(url, {
        method: method,
        body: formData, // 使用 FormData 格式提交
      });

      if (!response.ok) {
        throw new Error(`Failed to update node: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Node updated successfully:", result);
      await updateSkillTree(); // 在删除后刷新课程树

      // 关闭表单并刷新视图（或执行其他后续操作）
      setFormVisible(false);
    } catch (error) {
      console.error("Error updating node:", error);
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-[url('/images/bg.jpg')] h-screen w-screen bg-cover"
      onContextMenu={handleBlankContextMenu}
    >
      <div className="rounded-2xl bg-stone-50 w-full m-10 h-full flex flex-col justify-between">
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
            className="bg-stone-50"
            style={{}}
          />
        </ReactFlowProvider>

        {/* 菜单 */}
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
              <li
                className="p-2 hover:bg-orange-400 text-gray-800"
                onClick={handleCreateNode}
              >
                Create BigCheck
              </li>
            )}
          </div>
        )}

        {/* NodeForm 弹出层 */}
        {formVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative w-1/2">
              <NodeForm
                onSubmit={handleFormSubmit}
                formType={formType}
                defaultValue={formData}
                nodeId={formType === "edit" ? selectedNode?.nodeId : null} // 编辑时传 nodeId
                parentNodeId={
                  formType === "create" && selectedNode
                    ? selectedNode.nodeId
                    : null
                } // 创建时传 parentNodeId
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

        {/* BigCheckForm 弹出层 */}
        {bigCheckFormVisible && selectedNode?.nodeType === "BIGCHECK" && (
          <BigCheckForm
            nodeId={selectedNode.nodeId}
            onClose={() => setBigCheckFormVisible(false)} // 关闭表单
            onSubmit={handleBigcheckFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default SkillTree;
