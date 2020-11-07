import React, { useState, useCallback } from "react";
import { Event } from "../../models";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  allEvents: Event[];
}

const OSUsage = (props: Props) => {
  const { allEvents } = props;

  const [hover, setHover] = useState<number>(0);

  const browsers = [
    { name: "Chrome", value: allEvents.filter((event) => event.browser === "chrome").length },
    { name: "Safari", value: allEvents.filter((event) => event.browser === "safari").length },
    { name: "Firefox", value: allEvents.filter((event) => event.browser === "firefox").length },
    { name: "Internet Exp.", value: allEvents.filter((event) => event.browser === "ie").length },
    { name: "Edge", value: allEvents.filter((event) => event.browser === "edge").length },
    { name: "Other", value: allEvents.filter((event) => event.browser === "other").length },
  ];

  const colors = ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7", "#3241AE"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        {browsers &&
          browsers
            .sort((a, b) => b.value - a.value)
            .map((browser, index) => {
              return (
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  animationEasing="ease-in-out"
                  animationBegin={500}
                  animationDuration={1500}
                  data={[browsers[index]]}
                  cx="50%"
                  cy="50%"
                  outerRadius={130 - 20 * index}
                  fill={colors[index]}
                  blendStroke
                  startAngle={90 + index * 10}
                  innerRadius={115 - 20 * index}
                />
              );
            })}
        <Legend
          verticalAlign="middle"
          layout="vertical"
          align="left"
          iconSize={10}
          iconType="circle"
        />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default OSUsage;