import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  offset: number;
}

interface dateData {
  date: string;
  count: number;
}

const SessionsByDays = (props: Props) => {
  const { offset } = props;

  const [newDataArray, setNewDataArray] = useState<dateData[]>([])

  const sortDates = (a:dateData, b:dateData):number => {
    const dateA:Date = new Date(a.date.split('/').reverse().join('-'));
    const dateB:Date = new Date(b.date.split('/').reverse().join('-'));
    console.log(dateA, dateB)
    return dateA.getTime() - dateB.getTime();
  }

  useEffect(() => {
    fetch(`http://localhost:3001/events/by-days/${offset}`)
      .then((res) => res.json())
      .then((res) => {
        const sortedArr = res.sort(sortDates);
        // console.log("DATA ARRAY", sortedArr);
        setNewDataArray([...sortedArr]);
      });
  }, [offset]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* <h1>OFFSET: {offset}</h1> */}
        <LineChart
          data={newDataArray}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="maroon" />
        </LineChart>
    </ResponsiveContainer>
  );
};

export default SessionsByDays;