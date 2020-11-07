import React, { useState, useCallback } from "react";
import { Event } from "../../models";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  allEvents: Event[];
}

const PageViews = (props: Props) => {
    const { allEvents } = props;

    let urls:string[] = allEvents.map(event => event.url);
    urls = urls.filter((value, index) => urls.indexOf(value) === index);

    const dataArray = urls.map((url, index) => {
        return {
            name: url,
            value: allEvents.filter(event => event.url === url).length
        }
    })

    const colors = ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7", "#3241AE"];

    return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {dataArray &&
              dataArray
                .sort((a, b) => b.value - a.value)
                .map((url, index) => {
                  return (
                    <Pie
                      dataKey="value"
                      isAnimationActive={true}
                      animationEasing="ease-in-out"
                      animationBegin={500}
                      animationDuration={1500}
                      data={[dataArray[index]]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100 - 20 * index}
                      fill={colors[index]}
                      blendStroke
                      startAngle={90 + (index * 10)}
                    //   innerRadius={100 - 20 * index}
                    />
                  );
                })}
            <Legend verticalAlign="middle" layout="vertical" align="left" iconSize={10} iconType="circle" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    };

export default PageViews;