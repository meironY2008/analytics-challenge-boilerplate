import React, { useState } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import SessionsByDays from "../components/charts/SessionsByDays";
import SessionsByHours from "../components/charts/SessionsByHours";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const [daysOffset, setDaysOffset] = useState(0);
  const [hoursOffset, setHoursOffset] = useState([0, 0]);

  const calculateDateDiff = (date: Date): number => {
    const diffTime: number = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  };

  return (
    <>
      <div>
        {" "}
        {/* container for session by days */}
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setDaysOffset(calculateDateDiff(new Date(e.target.value)));
          }}
        />
        <SessionsByDays offset={daysOffset} />
      </div>
      <div>
        {" "}
        {/* container for session by hours */}
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setHoursOffset([calculateDateDiff(new Date(e.target.value)), hoursOffset[1]]);
          }}
        />
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setHoursOffset([hoursOffset[0], calculateDateDiff(new Date(e.target.value))]);
          }}
        />
        <SessionsByHours hoursOffset={hoursOffset} />
      </div>
    </>
  );
};

export default DashBoard;