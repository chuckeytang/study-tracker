import { Node, Edge } from "reactflow";

// 定义Cluster函数，接受一个bigCheckNode，返回该Cluster的nodes和edges
const Cluster = async (
  bigCheckNode: any
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const visitedNodes = new Set<number>(); // 用于防止循环依赖造成的无限递归

  // 递归获取依赖节点的函数
  const fetchDepNodes = async (currentNode: any) => {
    if (visitedNodes.has(currentNode.nodeId)) {
      return; // 已访问过，避免重复处理
    }
    visitedNodes.add(currentNode.nodeId);

    // 添加当前节点到nodes数组
    nodes.push({
      id: String(currentNode.nodeId),
      type: currentNode.nodeType,
      position: currentNode.position || {
        x: Math.random() * 800,
        y: Math.random() * 600,
      },
      data: currentNode,
    });

    // 获取当前节点的依赖节点
    try {
      const response = await fetch(
        `/api/courses/getDepNodes?nodeId=${currentNode.nodeId}`
      );
      const depData = await response.json();

      const depNodes = depData.data || [];
      for (const depNode of depNodes) {
        // 添加边，从当前节点指向依赖节点
        edges.push({
          id: `e${currentNode.nodeId}-${depNode.nodeId}`,
          source: String(currentNode.nodeId),
          target: String(depNode.nodeId),
          animated: true,
        });

        // 递归处理依赖节点
        await fetchDepNodes(depNode);
      }
    } catch (error) {
      console.error("Error fetching dependent nodes:", error);
    }
  };

  // 开始递归，从bigCheckNode开始
  await fetchDepNodes(bigCheckNode);

  return { nodes, edges };
};

export default Cluster;
