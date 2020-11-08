import React, { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  hoursOffset: number[];
}

interface hourData {
  hour: string;
  count: number;
}

interface hourObject {
  hour: string;
  line1: number;
  line2: number;
}

const SessionsByHours = (props: Props) => {
  const { hoursOffset } = props;

  const [newDataArray, setNewDataArray] = useState<hourData[]>([]);
  const [newDataArray2, setNewDataArray2] = useState<hourData[]>([]);
  const [chartData, setChartData] = useState<hourObject[]>([]);

  const sortHours = (a: hourData, b: hourData): number => {
    const numA: number = parseInt(a.hour.substring(0, 2));
    const numB: number = parseInt(b.hour.substring(0, 2));
    return numA - numB;
  };

  useEffect(() => {
    fetch(`http://localhost:3001/events/by-hours/${hoursOffset[0]}`)
      .then((res) => res.json())
      .then((res) => {
        // console.log("DATA ARRAY-1", res.sort(sortHours));
        setNewDataArray(res.sort(sortHours));
      });
    fetch(`http://localhost:3001/events/by-hours/${hoursOffset[1]}`)
      .then((res) => res.json())
      .then((res) => {
        // console.log("DATA ARRAY-2", res.sort(sortHours));
        setNewDataArray2(res.sort(sortHours));
      });
  }, [hoursOffset]);

  useEffect(() => {
    let newArr: hourObject[] = [];
    for (let i = 0; i < newDataArray.length; i++) {
      newArr.push({
        hour: newDataArray[i].hour,
        line1: newDataArray[i].count,
        line2: newDataArray2[i] ? newDataArray2[i].count : 0
      });
    }
    setChartData(newArr);
  }, [newDataArray, newDataArray2]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData && (
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 25, left: 60, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorFirst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="purple" stopOpacity={0.8} />
              <stop offset="95%" stopColor="purple" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSecond" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="orange" stopOpacity={0.8} />
              <stop offset="95%" stopColor="orange" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="hour" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="line1"
            stroke="purple"
            fillOpacity={1}
            fill="url(#colorFirst)"
          />
          <Area
            type="monotone"
            dataKey="line2"
            stroke="orange"
            fillOpacity={1}
            fill="url(#colorSecond)"
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

export default SessionsByHours;