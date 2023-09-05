import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

// note to self - months are 0-indexed for some reason
const holidayList2024: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2023, 8, 4)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2023, 9, 9)],
    },
    {
        name: "Veterans Day",
        dates: [new Date(2023, 10,10)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2023, 10,23),new Date(2023, 10,24)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2024, 0,15)]
    },
    {
        name: "President's Day",
        dates: [new Date(2024, 1,19)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2024, 4, 27)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2023, 11,22), new Date(2024, 0,5))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2024,2,25), new Date(2024, 3,1))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2023, 11,21),new Date(2024, 5, 6)]},
    {name:'School Improvement Days',
    dates: [new Date(2023, 9, 27), new Date(2023, 11, 22), new Date(2024, 3, 1), new Date(2023, 5, 7)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2023, 9,26), new Date(2024, 3, 10)]}]

const defaultStartDay2024 = new Date(2023, 7, 21)
const defaultEndDay2024 = new Date(2024, 5, 6)

export const sy2024: SchoolYear = {
    holidays: holidayList2024,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2024,
    endDate: defaultEndDay2024,
    q1End: new Date(2023, 9, 20),
    q2End: new Date(2023, 11, 21),
    q3End: new Date(2024, 2, 22),
    q4End: new Date(2024, 5, 6),
}