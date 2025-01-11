import { calculateHandlePosition } from "@/utils/utils";
import {
  bigCheckRadius,
  clusterBaseDistance,
  clusterDistanceDecrease,
  clusterMinDistance,
  majornodeRadius,
  minornodeRadius,
} from "@/types/Values";
import { Node, Edge, Position } from "reactflow";
import { apiRequest } from "@/utils/api";

// 定义Cluster函数，接受一个bigCheckNode，返回该Cluster的nodes和edges
const Cluster = async (
  bigCheckNode: any,
  studentProgress?: { [key: number]: { unlocked: boolean; level: number } },
  userRole: string = "teacher"
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const visitedNodes = new Set<number>(); // 用于防止循环依赖造成的无限递归

  // 用于查找已存在的节点，便于更新句柄
  const nodeMap: { [key: string]: Node } = {};

  // 递归获取依赖节点的函数
  const fetchDepNodes = async (
    currentNode: any,
    parentNode: any,
    parentPos: { x: number; y: number } | null,
    incomingAngle: number,
    level: number
  ) => {
    if (visitedNodes.has(currentNode.nodeId)) {
      return; // Avoid processing already visited nodes
    }
    visitedNodes.add(currentNode.nodeId);

    // Set distance parameters
    const baseDistance = clusterBaseDistance; // 基础距离
    const minDistance = clusterMinDistance; // 最小距离
    const distanceDecrease = clusterDistanceDecrease; // 每层递减的距离

    const distance = Math.max(
      baseDistance - (level - 1) * distanceDecrease,
      minDistance
    );

    // Calculate the position of the current node
    let position: { x: number; y: number };
    if (parentPos) {
      // Non-root node
      const angleRad = (incomingAngle * Math.PI) / 180;
      position = {
        x: parentPos.x + distance * Math.cos(angleRad),
        y: parentPos.y + distance * Math.sin(angleRad),
      };
    } else {
      // Root node
      position = currentNode.position || { x: 0, y: 0 };
    }

    // Initialize handles array
    let handles: {
      type: string;
      position: { x: number; y: number };
      id: string;
    }[] = [];

    // If there's a parent node, calculate handle positions
    if (parentNode && parentPos) {
      let parentRadius = 0;
      let selfRadius = 0;
      if (parentNode.nodeType == "BIGCHECK") {
        parentRadius = bigCheckRadius;
        selfRadius = majornodeRadius;
      } else if (parentNode.nodeType == "MAJOR_NODE") {
        parentRadius = majornodeRadius;
        selfRadius = minornodeRadius;
      } else if (parentNode.nodeType == "MINOR_NODE") {
        parentRadius = minornodeRadius;
        selfRadius = minornodeRadius;
      }
      // 计算当前节点到父节点的句柄位置
      const handleFromPos = calculateHandlePosition(
        position,
        parentPos,
        selfRadius
      );
      const handleToPos = calculateHandlePosition(
        parentPos,
        position,
        parentRadius
      );

      // Generate unique handle IDs
      const sourceHandleId = `handle-${currentNode.nodeId}-source-${handleFromPos.x}-${handleFromPos.y}`;
      const targetHandleId = `handle-${parentNode.nodeId}-target-${handleToPos.x}-${handleToPos.y}`;

      // Add source handle to current node
      handles.push({
        type: "source",
        position: handleFromPos,
        id: sourceHandleId,
      });

      // Add target handle to parent node
      if (nodeMap[parentNode.nodeId]) {
        nodeMap[parentNode.nodeId].data.handles.push({
          type: "target",
          position: handleToPos,
          id: targetHandleId,
        });
      }

      // Dynamically set edge type based on parent node type
      let edgeType = "minorEdge"; // 默认情况下为 minorEdge
      if (parentNode.nodeType === "BIGCHECK") {
        edgeType = "majorEdge";
      }

      // Add edge connecting current node and parent node
      edges.push({
        id: `e${currentNode.nodeId}-${parentNode.nodeId}`,
        source: String(currentNode.nodeId),
        target: String(parentNode.nodeId),
        sourceHandle: sourceHandleId,
        targetHandle: targetHandleId,
        type: edgeType,
        animated: true,
      });
    }

    // Merge student progress data if userRole is 'student'
    if (
      (userRole === "student" || userRole === "otherStudent") &&
      studentProgress
    ) {
      const progress = studentProgress[currentNode.nodeId] || {
        unlocked: false,
        level: 0,
      };
      currentNode.unlocked = progress.unlocked;
      currentNode.level = progress.level;
    }

    // Add current node to nodes array and nodeMap
    const newNode = {
      id: String(currentNode.nodeId),
      type: currentNode.nodeType,
      position: position,
      data: {
        ...currentNode,
        position,
        handles,
      },
    };

    nodes.push(newNode);
    nodeMap[currentNode.nodeId] = newNode;

    // 获取当前节点的依赖节点
    try {
      const depData = await apiRequest(
        `/api/courses/getDepNodes?nodeId=${currentNode.nodeId}`
      );
      const depNodes = depData.data.map((node: any) => ({
        ...node,
        coolDown: node.coolDown / 3600, // Convert to hours
        unlockDepTimeInterval: node.unlockDepTimeInterval / 3600, // Convert to hours
      })) || [];

      const numChildren = depNodes.length;

      if (numChildren > 0) {
        let totalEdges;
        if (parentPos) {
          totalEdges = numChildren + 1; // 包括入射边
        } else {
          totalEdges = numChildren;
        }

        const angleBetweenEdges = 360 / totalEdges;

        let startAngle;
        if (parentPos) {
          // 非根节点
          startAngle =
            incomingAngle +
            (0.5 * angleBetweenEdges) / 3 -
            ((numChildren - 1) * angleBetweenEdges) / 2;
        } else {
          // 根节点
          startAngle = 0;
        }

        // Process all dependent nodes
        await Promise.all(
          depNodes.map(async (depNode: any, i: any) => {
            const angle = (startAngle + i * angleBetweenEdges) % 360;
            // Only process if the node is not a BIGCHECK node
            if (depNode.nodeType != "BIGCHECK") {
              await fetchDepNodes(
                depNode,
                currentNode,
                position,
                angle,
                level + 1
              );
            }
          })
        );
      }
    } catch (error) {
      console.error("Error fetching dependent nodes:", error);
    }
  };

  // 开始递归，从bigCheckNode开始
  await fetchDepNodes(bigCheckNode, null, null, 0, 1);

  return { nodes, edges };
};

export default Cluster;
