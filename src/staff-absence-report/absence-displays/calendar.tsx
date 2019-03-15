import React from "react";
import dateFns from 'date-fns';

import {
    StaffAbsence, 
    AbsenceDate } from '../../shared/staff-absence-types'

import './calendar.css'

interface CalendarProps {
    //a sorted array of dates with 1 per month, starting with the oldest
    months: Date[]
    absenceData: {absences: StaffAbsence[], dates: AbsenceDate[]}
}

interface CalendarState {
    months: Date[]
    selectedDate: Date
    currentMonth: number
}

export class Calendar extends React.PureComponent<CalendarProps, CalendarState> {
    constructor(props){
        super(props);
        this.state={
            currentMonth: 0,
            selectedDate: this.props.months[0],
            months: this.props.months
        }
    }

    private dates = (): AbsenceDate[] => { 
        return this.props.absenceData.dates
            .filter((a)=>dateFns
            .isSameMonth(this.props.months[this.state.currentMonth], a.date))}

    renderHeader() {
        const dateFormat = 'MMMM YYYY';

        return (
            <div className="header row flex-middle">
                <div className="col col-start">
                    <div className="icon" onClick={this.prevMonth}>
                        chevron_left
                    </div>
                </div>
                <div className="col col-center">
                    <span>
                    {dateFns.format(this.state.months[this.state.currentMonth], dateFormat)}
                    </span>
                </div>
                <div className="col col-end" onClick={this.nextMonth}>
                    <div className="icon">chevron_right</div>
                </div>
            </div>
        );
    }
    
    renderDays(){
        const dateFormat = "dddd";
        const days: JSX.Element[] = [];
        let startDate = dateFns.startOfWeek(this.state.currentMonth);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="col col-center" key={i}>
                {dateFns.format(dateFns.addDays(startDate, i), dateFormat)+' ('+
                this.dates().filter(d => d.date.getDay() === i)
                        .reduce( (a,b) => a+b.absences.length, 0)+')'}
                </div>
            );
        }
        return <div className="days row">{days}</div>;
    }

    renderCells(){
        const { currentMonth, selectedDate } = this.state;
        const monthStart: Date = dateFns.startOfMonth(this.state.months[currentMonth]);
        const monthEnd: Date = dateFns.endOfMonth(monthStart);
        const startDate: Date = dateFns.startOfWeek(monthStart);
        const endDate: Date = dateFns.endOfWeek(monthEnd);

        const dateFormat = "D";
        const rows: JSX.Element []= [];
        let days: JSX.Element [] = [];
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
            formattedDate = dateFns.format(day, dateFormat);
            const cloneDay = day;
            const abDate: AbsenceDate | undefined = this.dates().find( (d) => dateFns.isSameDay(d.date,cloneDay));
            days.push(
              <div
                className={`col cell ${
                  !dateFns.isSameMonth(day, monthStart)
                    ? "disabled"
                    : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
                }`}
                key={day.toString()}
                onClick={() => this.onDateClick(dateFns.parse(cloneDay))}
              >
                <span className="number">{formattedDate}</span>
                <span className="bg">{formattedDate}</span>
                <div>{(abDate === undefined || abDate.absences.length === 0) ? '' : abDate.absences.length + ' Absences'}</div>
              </div>
            );
            day = dateFns.addDays(day, 1);
          }
          rows.push(
            <div className="row" key={day.toString()}>
              {days}
            </div>
          );
          days = [];
        }
        return <div className="body">{rows}</div>;
    }

    onDateClick = day => {
        this.setState({
            selectedDate: day
          });
    }

    nextMonth = () => {
        const newMonth = this.state.currentMonth+1;
        this.setState({
            currentMonth: (newMonth < this.state.months.length ? newMonth : this.state.currentMonth)
          });
    }

    prevMonth = () => {
        const newMonth = this.state.currentMonth-1;
        this.setState({
            currentMonth: (newMonth >= 0 ? newMonth : this.state.currentMonth)
          });
    }

    render() {
        return (
            <div className={'calendar'}>
                {this.renderHeader()}
                {this.renderDays()}
                {this.renderCells()}
            </div>
        );
    }

}