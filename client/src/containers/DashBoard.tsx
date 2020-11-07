import React, { useState, useEffect, useRef } from "react";
import { Interpreter } from "xstate";
import { AuthMachineContext, AuthMachineEvents } from "../machines/authMachine";
import { Event } from '../models';
import styled, { createGlobalStyle, css } from 'styled-components';
import SessionsByDays from "../components/charts/SessionsByDays";
import SessionsByHours from "../components/charts/SessionsByHours";
import EventLog from "../components/charts/EventLog";
import EventMap from "../components/charts/EventMap";
import RetentionTable from "../components/charts/RetentionTable";
import OSUsage from "../components/charts/OSUsage";
import PageViews from "../components/charts/PageViews";

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
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const searchRef = useRef<any>();
  const typeRef = useRef<any>();
  const sortRef = useRef<any>();
  const browserRef = useRef<any>();

  useEffect(() => {
    fetch('http://localhost:3001/events/all')
    .then(res => res.json())
    .then(res => setAllEvents(res));
  }, [])

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

  interface containerProps {
    direction: "column" | "row";
    width?: string;
    height?: string;
    order?: number;
  }
  
  interface tileProps {
    order?: number;
    width?: string;
    height?: string;
    minHeight?: string;
    minWidth?: string;
    backgroundColor?: string;
    padding?: string;
  }
  
  const Container = styled.div<containerProps>`
    display: flex;
    flex-flow: ${(props) => props.direction} wrap;
    width: ${(props) => props.width};
    height: ${(props) => props.height};
    order: ${(props) => props.order};
    justify-content: space-evenly;
    align-items: center;
  `;
  
  const Tile = styled.div<tileProps>`
    height: ${(props) => props.height};
    width: ${(props) => props.width};
    min-height: ${(props) => props.minHeight};
    min-width: ${(props) => props.minWidth};
    order: ${(props) => props.order};
    resize: both;
    overflow: hidden;
    background-color: ${(props) => props.backgroundColor};
    border: 2px solid black;
    padding: ${(props) => props.padding};
  `;

  return (
    <>
      <Container direction="row" height="100vh" width="80vw">

    <Container order={3} direction="row" width="100%" height="100%">
      {/* container for os-usage pie chart */}
      <Tile order={1} min-width="375px" min-height="275px" width="375px" height="275px">
        <OSUsage allEvents={allEvents} />
      </Tile>

      {/* container for page-views pie chart */}
      <Tile order={2} min-width="375px" min-height="275px" width="40%" height="275px">
        <PageViews allEvents={allEvents} />
      </Tile>
      </Container>

      {/* container for retention table */}
      <Tile order={4} min-width="100%" min-height="100%" padding="10px">
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
      </Tile>

      {/* container for map */}
      <Tile order={1} width="65vw" min-height="400px" height="500px">
        <EventMap mapHeight="100vh" mapWidth="100vw" />
      </Tile>

      {/* container for session by days */}
      <Tile order={5} min-width="400px" min-height="250px" height="45%" width="40%" padding="10px">
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
      </Tile>

      {/* container for session by hours */}
      <Tile order={6}>
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
      </Tile>

      {/* container for event log */}
      <Tile order={7}>
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
      </Tile>

      </Container>
    </>
  );
};

export default DashBoard;