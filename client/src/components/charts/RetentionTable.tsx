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
        <td style={{ padding: "5px", backgroundColor: "#D4D2EC" }}>
          {start} - {end} <br />
          <sub>{newUsers} users</sub>
        </td>
        {weeklyRetention.map((week) => (
          <td
            style={{
              padding: "5px",
              backgroundColor:
                week >= 0 && week < 20
                  ? "#D4D2EC"
                  : week >= 20 && week < 40
                  ? "#B1B3DF"
                  : week >= 40 && week < 60
                  ? "#755BCF"
                  : week >= 60 && week < 80
                  ? "#5427DA"
                  : week >= 80 && week < 100
                  ? "#2F2692"
                  : "gold",
            }}
          >
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
        <td style={{ padding: "5px", fontWeight: "bold", backgroundColor: "#D4D2EC" }}>
          All Users <br />
          <sub>{sumUsers}</sub>
        </td>
        {sumWeek.map((week) => {
          return (
            <td
              style={{
                padding: "5px",
                backgroundColor:
                  Math.round((week / sumUsers) * 100) >= 0 &&
                  Math.round((week / sumUsers) * 100) < 20
                    ? "#D4D2EC"
                    : Math.round((week / sumUsers) * 100) >= 20 &&
                      Math.round((week / sumUsers) * 100) < 40
                    ? "#B1B3DF"
                    : Math.round((week / sumUsers) * 100) >= 40 &&
                      Math.round((week / sumUsers) * 100) < 60
                    ? "#755BCF"
                    : Math.round((week / sumUsers) * 100) >= 60 &&
                      Math.round((week / sumUsers) * 100) < 80
                    ? "#5427DA"
                    : Math.round((week / sumUsers) * 100) >= 80 &&
                      Math.round((week / sumUsers) * 100) < 100
                    ? "#2F2692"
                    : "gold",
              }}
            >
              {!Math.round((week / sumUsers) * 100) ? 0 : Math.round((week / sumUsers) * 100)}%{" "}
              <br />
              <sub>{week} users</sub>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <table style={{ width: "100%", height: "100%" }}>
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
  );
};

export default RetentionTable;