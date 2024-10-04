import { calculateHandlePosition } from "@/tools/utils";
import {
  bigCheckRadius,
  majornodeRadius,
  minornodeRadius,
} from "@/types/Values";
import { Node, Edge, Position } from "reactflow";

// 定义Cluster函数，接受一个bigCheckNode，返回该Cluster的nodes和edges
const Cluster = async (
  bigCheckNode: any
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
    console.log(
      "递归：currentNode-",
      currentNode.nodeId,
      " parentNode-",
      parentNode != null ? parentNode.nodeId : 0,
      " level-",
      level
    );
    if (visitedNodes.has(currentNode.nodeId)) {
      return; // 已访问过，避免重复处理
    }
    visitedNodes.add(currentNode.nodeId);

    // 设置距离参数
    const baseDistance = 200; // 基础距离
    const minDistance = 100; // 最小距离
    const distanceDecrease = 50; // 每层递减的距离

    const distance = Math.max(
      baseDistance - (level - 1) * distanceDecrease,
      minDistance
    );

    // 计算当前节点的位置
    let position: { x: number; y: number };
    if (parentPos) {
      // 非根节点，根据父节点位置、入射角度和距离计算位置
      const angleRad = (incomingAngle * Math.PI) / 180;
      position = {
        x: parentPos.x + distance * Math.cos(angleRad),
        y: parentPos.y + distance * Math.sin(angleRad),
      };
    } else {
      // 根节点，使用默认位置
      position = currentNode.position || { x: 0, y: 0 };
    }

    // 初始化句柄数组
    let handles: {
      type: string;
      position: { x: number; y: number };
      id: string;
    }[] = [];

    // 如果有父节点，计算与父节点的句柄位置
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

      // 生成唯一的 Handle id
      const sourceHandleId = `handle-${currentNode.nodeId}-source-${handleFromPos.x}-${handleFromPos.y}`;
      const targetHandleId = `handle-${parentNode.nodeId}-target-${handleToPos.x}-${handleToPos.y}`;

      // 添加当前节点的 source 句柄
      handles.push({
        type: "source",
        position: handleFromPos,
        id: sourceHandleId,
      });

      // 为父节点添加 target 句柄
      if (nodeMap[parentNode.nodeId]) {
        nodeMap[parentNode.nodeId].data.handles.push({
          type: "target",
          position: handleToPos,
          id: targetHandleId,
        });
      }

      // 动态设置 edgeType，依据父节点的类型
      let edgeType = "minorEdge"; // 默认情况下为 minorEdge
      if (parentNode.nodeType === "BIGCHECK") {
        edgeType = "majorEdge";
      }

      // 添加边，连接当前节点与父节点
      edges.push({
        id: `e${currentNode.nodeId}-${parentNode.nodeId}`,
        source: String(currentNode.nodeId),
        target: String(parentNode.nodeId),
        sourceHandle: sourceHandleId, // 指定 source 句柄 id
        targetHandle: targetHandleId, // 指定 target 句柄 id
        type: edgeType, // 动态设置的 edgeType
        animated: true,
      });
    }

    // 添加当前节点到 nodes 数组，并存储在 nodeMap 中
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
      const response = await fetch(
        `/api/courses/getDepNodes?nodeId=${currentNode.nodeId}`
      );
      const depData = await response.json();

      const depNodes = depData.data || [];
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
            incomingAngle + 180 - ((numChildren - 1) * angleBetweenEdges) / 2;
        } else {
          // 根节点
          startAngle = 0;
        }

        // 等待所有依赖节点异步处理完成
        await Promise.all(
          depNodes.map(async (depNode: any, i: any) => {
            const angle = (startAngle + i * angleBetweenEdges) % 360;
            // 递归处理每个依赖节点，确保依赖节点处理完成后才进行下一次递归
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
