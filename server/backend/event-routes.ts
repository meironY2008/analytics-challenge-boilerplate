///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";

// some useful database functions in here:
import {
  postEvent,
  getAllEvents,
  sortEvents,
  searchValue,
  countDates,
  countHours,
  reformatDate
} from "./database";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import { ensureAuthenticated, validateMiddleware } from "./helpers";

import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
import { bindAll } from "lodash";
import { date } from "faker";
const router = express.Router();

// Routes

interface Filter {
  sorting: string;
  type?: string;
  browser?: string;
  search?: string;
  offset?: number;
}

interface sessionCount {
  date: string;
  count: number;
}

interface sessionByHourCount {
  hour: string;
  count: number;
}

router.get("/all", (req: Request, res: Response) => {
  res.status(200).json(getAllEvents());
});

router.get("/all-filtered", (req: Request, res: Response) => {
  const { sorting, type, browser, search, offset }: Filter = req.query;
  let more = false;
  console.log("sorting: ", sorting);
  let sortedArray: Event[] = sortEvents(getAllEvents(), sorting);
  if (type) sortedArray = sortedArray.filter((event) => type === event.name);
  if (browser) sortedArray = sortedArray.filter((event) => browser === event.browser);
  if (search) sortedArray = sortedArray.filter((event) => searchValue(event, search));
  if (offset) {
    more = offset < sortedArray.length;
    sortedArray = sortedArray.slice(0, offset);
  }
  res.status(200).json({ events: sortedArray, more });
});

router.get("/by-days/:offset", (req: Request, res: Response) => {
  const eventsArray = getAllEvents();
  const today: Date = new Date(new Date().toDateString());
  const parsedDate: Date = new Date(today.toDateString());
  console.log(parsedDate + " BAAAAA");
  /* should be hours + 2 due to time zone */
  const lastDay: number = today.setDate(today.getDate() - parseInt(req.params.offset) + 1);
  /* should be hours + 3 due to time zone and summer-clock */
  const firstDay: number = parsedDate.setDate(
    parsedDate.getDate() - (parseInt(req.params.offset) + 6)
  );
  const filteredEvents: Event[] = eventsArray.filter(
    (event) => event.date < lastDay && event.date >= firstDay
  );
  const sessionCountArr: sessionCount[] = [];
  for (const [date, value] of Object.entries(countDates(filteredEvents))) {
    sessionCountArr.push({
      date,
      count:
        (value as Event[]).filter((value, index) => date.indexOf(value.session_id) !== index)
          .length || 0,
    });
  }
  console.log("Today: ", today, " Parsed: ", parsedDate);
  console.log("First Date: ", new Date(firstDay), " Last Date: ", new Date(lastDay));
  res.status(200).json(sessionCountArr);
});

router.get("/by-hours/:offset", (req: Request, res: Response) => {
  const eventsArray = getAllEvents();
  const today: Date = new Date(new Date().toDateString());
  const tomorrow: Date = new Date(new Date().toDateString());
  const firstDay: number = new Date(
    today.setDate(today.getDate() - parseInt(req.params.offset))
  ).setHours(0, 0, 0); /* Console Log changes the time to global time. Beware! do not waste time on that. */
  const lastDay: number = new Date(
    tomorrow.setDate(tomorrow.getDate() - parseInt(req.params.offset) + 1)
  ).setHours(0, 0, 0);
  const filteredEvents: Event[] = eventsArray.filter(
    (event) => event.date < lastDay && event.date >= firstDay
  );
  const sessionCountArr: sessionByHourCount[] = [];
  for (const [hour, value] of Object.entries(countHours(filteredEvents))) {
    sessionCountArr.push({
      hour,
      count: (value as Event[]).filter((value, index) => hour.indexOf(value.session_id) !== index)
        .length,
    });
  }
  for (let i = 0; i < 24; i++) {
    const hour = i < 10 ? `0${i}:00` : `${i}:00`;
    if (!sessionCountArr.some((session) => session.hour === hour)) {
      sessionCountArr.push({
        hour,
        count: 0,
      });
    }
  }
  console.log("First Date: ", new Date(firstDay), " Last Date: ", new Date(lastDay));
  res.status(200).json(sessionCountArr);
});

router.get("/today", (req: Request, res: Response) => {
  res.send("/today");
});

router.get("/week", (req: Request, res: Response) => {
  res.send("/week");
});

router.get("/retention", (req: Request, res: Response) => {
  const { dayZero } = req.query;
  const signupArray = getAllEvents().filter((event) => event.name === "signup");
  const retentionArr: weeklyRetentionObject[] = [];
  const today: number = new Date(new Date().toDateString()).getTime();
  const dayZeroDate: Date = new Date(new Date(parseInt(dayZero)).toDateString());
  let count = 0;
  for (let i = dayZeroDate; i <= new Date(today); i.setDate(i.getDate() + 7)) {
    /* Date logs like below may help understand */
    // console.log(`${i.getDate()}/${i.getMonth() + 1}/${i.getFullYear()} ${i.getHours()}:${i.getMinutes()}:${i.getSeconds()}`)
    // console.log(`${new Date(today).getDate()}/${new Date(today).getMonth() + 1}/${new Date(today).getFullYear()} ${new Date(today).getHours()}:${new Date(today).getMinutes()}:${new Date(today).getSeconds()}`)
    const registrationWeek:number = count;
    // console.log(`WEEK NUMBER ${count}`);
    // console.log(signupArray.filter((event) => event.date >= i.getTime() && event.date < new Date(i).setDate(i.getDate() + 7)));
    const signupUserIds:string[] = signupArray
      .filter((event) => event.date >= i.getTime() && event.date < new Date(i).setDate(i.getDate() + 7))
      .map(event => event.distinct_user_id);
    const newUsers:number = signupArray.filter((event) => event.date >= i.getTime() && event.date < new Date(i).setDate(i.getDate() + 7)).length;
    const weeklyRetention:number[] = [100];
    for (let j = new Date(new Date(i).setDate(i.getDate() + 7)); j <= new Date(today); j.setDate(j.getDate() + 7)) {
      const loginArray:Event[] = getAllEvents().filter(event => event.name === 'login')
      .filter(event => event.date >= j.getTime() && event.date < new Date(j).setDate(j.getDate() + 7));
      let weeklyLogin:number = 0;
      signupUserIds.forEach(id => {
        if (loginArray.find(event => event.distinct_user_id === id)) weeklyLogin++;
      })
      const percentage:number = Math.round((weeklyLogin / newUsers) * 100);
      weeklyRetention.push(percentage);
    }
    const start:string = reformatDate(i);
    const end:string =
      new Date(i).setDate(i.getDate() + 6) > today 
        ? reformatDate(today)
        : reformatDate(new Date(i).setDate(i.getDate() + 6));
    retentionArr.push({ registrationWeek, newUsers, weeklyRetention, start, end });
    count++;
  }
  res.status(200).json(retentionArr);
});

router.get("/:eventId", (req: Request, res: Response) => {
  res.send("/:eventId");
});

router.post("/", (req: Request, res: Response) => {
  try {
    const event: Event = req.body;
    postEvent(event);
    res.status(200).json({ message: "event added successfully" });
  } catch (e) {
    res.status(500).json({ message: "post event failed" });
  }
});

router.get("/chart/os/:time", (req: Request, res: Response) => {
  res.send("/chart/os/:time");
});

router.get("/chart/pageview/:time", (req: Request, res: Response) => {
  res.send("/chart/pageview/:time");
});

router.get("/chart/timeonurl/:time", (req: Request, res: Response) => {
  res.send("/chart/timeonurl/:time");
});

router.get("/chart/geolocation/:time", (req: Request, res: Response) => {
  res.send("/chart/geolocation/:time");
});

export default router;