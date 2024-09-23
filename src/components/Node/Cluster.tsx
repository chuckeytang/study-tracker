import { Node, Edge, Position } from "reactflow";

// 定义Cluster函数，接受一个bigCheckNode，返回该Cluster的nodes和edges
const Cluster = async (
  bigCheckNode: any
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const visitedNodes = new Set<number>(); // 用于防止循环依赖造成的无限递归

  // 计算角度对应的句柄位置
  function getHandlePosition(angle: number): Position {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    if (normalizedAngle >= 45 && normalizedAngle < 135) {
      return Position.Bottom;
    } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
      return Position.Left;
    } else if (normalizedAngle >= 225 && normalizedAngle < 315) {
      return Position.Top;
    } else {
      return Position.Right;
    }
  }

  // 递归获取依赖节点的函数
  const fetchDepNodes = async (
    currentNode: any,
    parentNode: any,
    parentPos: { x: number; y: number } | null,
    incomingAngle: number,
    level: number
  ) => {
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

    // 添加当前节点到nodes数组
    nodes.push({
      id: String(currentNode.nodeId),
      type: currentNode.nodeType,
      position: position,
      data: {
        ...currentNode,
      },
      style: {
        position: "absolute",
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: `rotate(${incomingAngle}deg)`, // 旋转角度控制
      },
    });

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

        for (let i = 0; i < depNodes.length; i++) {
          const depNode = depNodes[i];
          const angle = (startAngle + i * angleBetweenEdges) % 360;

          // 确定边的类型
          let edgeType = "minorEdge";
          if (
            currentNode.nodeType === "BIGCHECK" &&
            depNode.nodeType === "MAJOR_NODE"
          ) {
            edgeType = "majorEdge";
          }

          // 添加边，从当前节点指向依赖节点
          edges.push({
            id: `e${currentNode.nodeId}-${depNode.nodeId}`,
            source: String(currentNode.nodeId),
            target: String(depNode.nodeId),
            type: edgeType,
            animated: true,
          });

          // 递归处理依赖节点
          await fetchDepNodes(depNode, currentNode, position, angle, level + 1);
        }
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
