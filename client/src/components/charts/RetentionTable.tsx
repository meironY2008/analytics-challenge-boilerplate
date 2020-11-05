import React, { useState, useEffect } from "react";
import { weeklyRetentionObject } from "../../models";

interface Props {
  dayZero: number;
}

const RetentionTable = (props: Props) => {
  const { dayZero } = props;

  const [retentionArr, setRetentionArr] = useState<weeklyRetentionObject[]>([]);

  useEffect(() => {
    console.log("dayZero: ", dayZero);
    fetch(`http://localhost:3001/events/retention?dayZero=${dayZero}`)
      .then((res) => res.json())
      .then((res) => {
        console.log("Response Mate :D", res);
        setRetentionArr(res);
      });
  }, [dayZero]);

  const makeDataRow = (data: weeklyRetentionObject) => {
    const { start, end, weeklyRetention, registrationWeek, newUsers } = data;
    return (
      <tr key={start}>
        <td>
          {start} - {end} <br />
          <sub>{newUsers} users</sub>
        </td>
        {weeklyRetention.map((week) => (
          <td>
            {week}% <br />
            <sub>{Math.round((newUsers * week) / 100)} new users</sub>
          </td>
        ))}
      </tr>
    );
  };

  const makeSumRow = (table: weeklyRetentionObject[]) => {
    const sumWeek: number[] = [];
    let sumUsers: number = 0;
    for (let i = 0; i < table.length; i++) sumWeek[i] = 0;
    table.forEach((data) => {
      sumUsers += data.newUsers;
      data.weeklyRetention.forEach((percent, index) => {
        sumWeek[index] += Math.round((data.newUsers * percent) / 100);
      });
    });
    return (
      <tr>
        <td>
          All Users <br />
          <sub>{sumUsers}</sub>
        </td>
        {sumWeek.map((week) => {
          return (
            <td>
              {!Math.round(week / sumUsers * 100) ? 0 : Math.round(week / sumUsers * 100)}% <br />
              <sub>{week} users</sub>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div>
      <table>
        <tr key="Headers">
          {retentionArr &&
            retentionArr.map((data, index) => {
              return index === 0 ? (
                <>
                  <th key={`header${index}`}>Counts</th>
                  <th key={`week${index}`}>Week {index}</th>
                </>
              ) : (
                <th key={`week${index}`}>Week {index}</th>
              );
            })}
        </tr>
        {makeSumRow(retentionArr)}
        {retentionArr.map((data) => makeDataRow(data))}
      </table>
    </div>
  );
};

export default RetentionTable;