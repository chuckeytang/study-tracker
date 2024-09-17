import React, { useEffect, useState } from "react";
import WidgetButton from "@/components/Widget/WidgetButton";
import WidgetSelect from "@/components/Widget/WidgetSelect";
import ReactECharts from "echarts-for-react"; // 引入ECharts组件

// 模拟数据
const bigChecks = [
  { id: 1, name: "BigCheck 1", children: [] },
  { id: 2, name: "BigCheck 2", children: [] },
];

const majorNodes = [
  { id: 3, name: "MajorNode 1", parent: 1 },
  { id: 4, name: "MajorNode 2", parent: 2 },
];

const minorNodes = [
  { id: 5, name: "MinorNode 1", parent: 3 },
  { id: 6, name: "MinorNode 2", parent: 4 },
];

// 课程下拉菜单选项
const options = [
  { label: "Swimming", icon: null },
  { label: "Running", icon: null },
  { label: "Cycling", icon: null },
];

const SkillTree: React.FC = (props) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("Swimming");

  // 初始化ECharts配置
  const getOption = () => ({
    series: [
      {
        type: "graph",
        layout: "force",
        data: [
          {
            name: "BigCheck 1",
            symbolSize: 70,
            itemStyle: { color: "#FF9900" },
          },
          {
            name: "BigCheck 2",
            symbolSize: 70,
            itemStyle: { color: "#FFCC00" },
          },
          {
            name: "MajorNode 1",
            symbolSize: 50,
            itemStyle: { color: "#FF6600" },
          },
          {
            name: "MajorNode 2",
            symbolSize: 50,
            itemStyle: { color: "#FF6600" },
          },
          {
            name: "MinorNode 1",
            symbolSize: 30,
            itemStyle: { color: "#FF3300" },
          },
          {
            name: "MinorNode 2",
            symbolSize: 30,
            itemStyle: { color: "#FF3300" },
          },
        ],
        links: [
          { source: "BigCheck 1", target: "MajorNode 1" },
          { source: "BigCheck 2", target: "MajorNode 2" },
          { source: "MajorNode 1", target: "MinorNode 1" },
          { source: "MajorNode 2", target: "MinorNode 2" },
        ],
        roam: true,
        label: {
          show: true,
          position: "right",
        },
        lineStyle: {
          color: "source",
          curveness: 0.3, // 设置曲线连线
        },
        force: {
          edgeLength: [50, 100],
          repulsion: 200,
        },
      },
    ],
  });

  // 渲染组件
  return (
    <div>
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

      {/* ECharts技能树 */}
      <div className="flex justify-center">
        <ReactECharts
          option={getOption()}
          style={{ height: "600px", width: "80%" }}
        />
      </div>
    </div>
  );
};

export default SkillTree;
