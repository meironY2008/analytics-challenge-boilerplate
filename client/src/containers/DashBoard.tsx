import React, { useState, useRef } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import SessionsByDays from "../components/charts/SessionsByDays";
import SessionsByHours from "../components/charts/SessionsByHours";
import EventLog from "../components/charts/EventLog";
import EventMap from "../components/charts/EventMap";
import RetentionTable from "../components/charts/RetentionTable";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const weekAgoMS = new Date().setDate(new Date().getDate() - 6);
  const [daysOffset, setDaysOffset] = useState<number>(0);
  const [hoursOffset, setHoursOffset] = useState<number[]>([0, 0]);
  const [dayZero, setDayZero] = useState<number>(weekAgoMS);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortValue, setSortValue] = useState<string>("-date");
  const [typeValue, setTypeValue] = useState<string>("");
  const [browserValue, setBrowserValue] = useState<string>("");

  const searchRef = useRef<any>();
  const typeRef = useRef<any>();
  const sortRef = useRef<any>();
  const browserRef = useRef<any>();

  const calculateDateDiff = (date: Date): number => {
    const diffTime: number = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  };

  const clearOptions = () => {
    setSearchValue("");
    setSortValue("-date");
    setTypeValue("");
    setBrowserValue("");
    searchRef.current.value = "";
    typeRef.current.value = "";
    sortRef.current.value = "";
    browserRef.current.value = "";
  };

  return (
    <>
      {/* container for retention table */}
      <div>
        <input
          key="dayZero"
          type="date"
          min={new Date(1601543622678).toISOString().split("T")[0]}
          max={new Date(weekAgoMS).toISOString().split("T")[0]}
          defaultValue={new Date(weekAgoMS).toISOString().split("T")[0]}
          onChange={(e) => {
            setDayZero(new Date(e.target.value).getTime());
          }}
        />
        <RetentionTable dayZero={dayZero} />
      </div>


      {/* container for map */}
      <div>
        <EventMap />
      </div>

      {/* container for session by days */}
      <div>
        <input
          key="daysOffset"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setDaysOffset(calculateDateDiff(new Date(e.target.value)));
          }}
        />
        <SessionsByDays offset={daysOffset} />
      </div>

      {/* container for session by hours */}
      <div>
        <input
          key="hoursOffset1"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setHoursOffset([calculateDateDiff(new Date(e.target.value)), hoursOffset[1]]);
          }}
        />
        <input
          key="hoursOffset2"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            setHoursOffset([hoursOffset[0], calculateDateDiff(new Date(e.target.value))]);
          }}
        />
        <SessionsByHours hoursOffset={hoursOffset} />
      </div>

      {/* container for event log */}
      <div>
        <input
          key="search"
          placeholder="Search..."
          ref={searchRef}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <select key="sort" ref={sortRef} onChange={(e) => setSortValue(e.target.value)}>
          <option key="emptySort" value="" disabled selected hidden>
            Sort...
          </option>
          <option key="desc" value="-date">
            Newest
          </option>
          <option key="asc" value="%2Bdate">
            Oldest
          </option>
        </select>
        <select key="type" ref={typeRef} onChange={(e) => setTypeValue(e.target.value)}>
          <option key="emptyType" value="" disabled selected hidden>
            Type...
          </option>
          {["login", "signup", "admin"].map((value) => {
            return (
              <option key={value} value={value}>
                {value.substring(0, 1).toUpperCase() + value.substring(1, value.length)}
              </option>
            );
          })}
        </select>
        <select key="browser" ref={browserRef} onChange={(e) => setBrowserValue(e.target.value)}>
          <option key="emptyBrowser" value="" disabled selected hidden>
            Browser...
          </option>
          {["chrome", "safari", "edge", "firefox", "ie", "other"].map((value) => {
            return (
              <option key={value} value={value}>
                {value === "ie"
                  ? "Internet Exp."
                  : value.substring(0, 1).toUpperCase() + value.substring(1, value.length)}
              </option>
            );
          })}
        </select>
        <button onClick={() => clearOptions()}>Clear</button>
        <EventLog
          sorting={sortValue}
          type={typeValue}
          browser={browserValue}
          search={searchValue}
        />
      </div>
    </>
  );
};

export default DashBoard;