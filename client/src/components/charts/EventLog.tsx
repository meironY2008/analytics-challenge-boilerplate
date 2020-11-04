import React, { useState, useEffect, useRef, useCallback } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import { Event } from "../../models";

interface Props {
  sorting: string;
  type: string;
  browser: string;
  search: string;
}

const EventLog = (props: Props) => {
  const { sorting, type, browser, search } = props;
  const [offset, setOffset] = useState<number>(10);
  const [eventArray, setEventArray] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMore, setIsMore] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const observer = useRef<any>();
  const lastEventTileRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && isMore) {
            console.log("Visible Mate :D")
            setOffset(offset+10);
        };
    })
    if (node) observer.current.observe(node);
    console.log(node)
  }, [loading, isMore]);

  useEffect(() => {
    setEventArray([]);
    setOffset(10);
  }, [sorting, type, browser, search])

  useEffect(() => {
    setLoading(true);
    setError(false);
    const controller:AbortController = new AbortController();
    const signal:AbortSignal = controller.signal;
    const query: string = `?sorting=${sorting}&type=${type}&browser=${browser}&search=${search}`;
    // const temporary: number = 10;
    fetch(`http://localhost:3001/events/all-filtered${query}&offset=${offset}`, { signal })
      .then((res) => res.json())
      .then((res) => {
        console.log("Response: ", res);
        /* setEventArray([...eventArray, ...res.events].filter((value, index) => eventArray.indexOf(value) !== index)); */
        setEventArray(res.events);
        setIsMore(res.more);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === "AbortError") console.log("Fetch Cancel - Caught Abort");  
      })
    return () => {
        controller.abort();
    }
  }, [sorting, type, browser, search, offset]);

  const makeEventTile = (event: Event) => {
    const date: string = new Date(event.date)
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/");
    const { _id ,name: type, distinct_user_id: userId, os, browser, geolocation } = event;
    const tabColor = type === "login" ? "purple" : type === "signup" ? "green" : "orange";
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          //   id="panel1a-header"
        >
          <RadioButtonCheckedIcon style={{ color: tabColor }} />
          <Typography>Event: {_id} </Typography>
          <Typography>User: {userId} </Typography>
          <Typography>Date: {date} </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Event-type: {type.substring(0, 1).toUpperCase() + type.substring(1, type.length)}{" "}
          </Typography>
          <Typography>
            Operation System: {os.substring(0, 1).toUpperCase() + os.substring(1, os.length)}{" "}
          </Typography>
          <Typography>
            Browser: {browser.substring(0, 1).toUpperCase() + browser.substring(1, browser.length)}{" "}
          </Typography>
          <Typography>
            User's Location: Latitude: {geolocation.location.lat}, Longitude:
            {geolocation.location.lng}
          </Typography>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <div>
        {eventArray && eventArray.map((event, index) => {
            if (eventArray.length === index +1) {
                return <div ref={lastEventTileRef}>{makeEventTile(event)}</div>
            } else {
                return <div>{makeEventTile(event)}</div>
            }
        })}
        <div>{loading && 'Loading...'}</div>
        <div>{error && 'Error'}</div>
    </div>
  )
};

export default EventLog;