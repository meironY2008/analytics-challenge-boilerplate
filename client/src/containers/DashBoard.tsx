import React, { useState, useRef } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import SessionsByDays from "../components/charts/SessionsByDays";
import SessionsByHours from "../components/charts/SessionsByHours";
import EventLog from "../components/charts/EventLog";
import EventMap from "../components/charts/EventMap";

export interface Props {
  authService: Interpreter<AuthMachineContext, any, AuthMachineEvents, any>;
}

const DashBoard: React.FC = () => {
  const [daysOffset, setDaysOffset] = useState<number>(0);
  const [hoursOffset, setHoursOffset] = useState<number[]>([0, 0]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortValue, setSortValue] = useState<string>('-date');
  const [typeValue, setTypeValue] = useState<string>('');
  const [browserValue, setBrowserValue] = useState<string>('');

  const searchRef = useRef<any>();
  const typeRef = useRef<any>();
  const sortRef = useRef<any>();
  const browserRef = useRef<any>();

  const calculateDateDiff = (date: Date): number => {
    const diffTime: number = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  };

  const clearOptions = () => {
    setSearchValue('');
    setSortValue('-date');
    setTypeValue('');
    setBrowserValue('');
    searchRef.current.value = '';
    typeRef.current.value = '';
    sortRef.current.value = '';
    browserRef.current.value = '';
  }

  return (
    <>
      {/* container for map */}
      <div>
        <EventMap />
      </div>
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
      <div>
        {" "}
        {/* container for event log */}
        <input placeholder='Search...' ref={searchRef} onChange={(e) => setSearchValue(e.target.value)} />
        <select ref={sortRef} onChange={(e) => setSortValue(e.target.value)}>
          <option value="" disabled selected hidden>
            Sort...
          </option>
          <option value="-date">Newest</option>
          <option value="%2Bdate">Oldest</option>
        </select>
        <select ref={typeRef} onChange={(e) => setTypeValue(e.target.value)}>
          <option value="" disabled selected hidden>
            Type...
          </option>
          {["login", "signup", "admin"].map(value => {
            return (
              <option value={value}>
                {value.substring(0,1).toUpperCase() + value.substring(1,value.length)}
              </option>
            )
          })}
        </select>
        <select ref={browserRef} onChange={(e) => setBrowserValue(e.target.value)}>
          <option value="" disabled selected hidden>
            Browser...
          </option>
          {["chrome", "safari", "edge", "firefox", "ie", "other"].map(value => {
            return(
              <option value={value}>
                  {value === 'ie' ? 'Internet Exp.' : value.substring(0,1).toUpperCase() + value.substring(1,value.length)}
              </option>
            )
          })}
        </select>
        <button onClick={() => clearOptions()}>Clear</button>
        <EventLog sorting={sortValue} type={typeValue} browser={browserValue} search={searchValue} />
      </div>
    </>
  );
};

export default DashBoard;