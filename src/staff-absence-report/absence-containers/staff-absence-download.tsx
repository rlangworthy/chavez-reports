import * as React from 'react';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import {
    isSameDay, 
    isWithinRange,
    isBefore,
    eachDay,
    isWeekend,
    isAfter} from 'date-fns'

import { 
    StaffDisplayContainer } from '../absence-displays/staff-display'
import {
    AbsenceTotals } from '../absence-displays/absence-totals'
import {
    SchoolDatesModal } from '../absence-displays/school-dates-modal' 

import { ReportFiles } from '../../shared/report-types'

import {
    defaultSchoolYear,
    SY_CURRENT } from '../../shared/initial-school-dates'

import { createStaffAbsenceReport } from '../staff-absence-backend'

import { MultiSelect } from '../../shared/components/multi-select'

import { 
    PayCodeKeys,
    TeacherJobCodes, 
    StaffPunchTimes,
    PunchTime,
    StaffDates,
    isPunchTime} from '../../shared/staff-absence-types'
import {
    isTardy } from '../../shared/utils'

import './staff-absence-download.css'
import 'react-day-picker/lib/style.css';

interface StaffAbsenceReportProps {
    reportFiles?: ReportFiles
}

interface StaffAbsenceReportState {
    punchTimes: StaffPunchTimes
    nonTeacherList: {[position: string]:string[]}
    teacherList: {[position: string]:string[]}
    schoolDates: Date[]
    disabledDates: Date[]
    startDate: Date
    endDate: Date
    selectedCodes: string[]
    selectedTeachers: string[]
    selectedNonTeachers: string[]
    dateModal: boolean
}

export class StaffAbsenceReport extends React.PureComponent<StaffAbsenceReportProps, StaffAbsenceReportState> {
    constructor(props){
        super(props);
        this.state={
            punchTimes:{},
            teacherList: {},
            nonTeacherList: {},
            selectedCodes: [],
            selectedTeachers: [],
            selectedNonTeachers: [],
            schoolDates: defaultSchoolYear(SY_CURRENT),
            disabledDates: SY_CURRENT.holidays.reduce( (a:Date[], b)=> a.concat(b.dates), []),
            startDate: SY_CURRENT.startDate,
            endDate: SY_CURRENT.endDate,
            dateModal: false,
        }
        //window.addEventListener('beforeunload', () => {del('Staff Absence Report')});
    }

    componentWillMount(){
        if(this.props.reportFiles){
            const {punchTimes, positions, endDate} = createStaffAbsenceReport(this.props.reportFiles)
            const teacherList = {}
            const nonTeacherList = {}
            Object.keys(positions).forEach( p => {
                if(TeacherJobCodes.includes(p)){
                    teacherList[p] = positions[p]
                }else{
                    nonTeacherList[p]=positions[p]
                }
            })
            this.setState({
                teacherList:teacherList, 
                nonTeacherList:nonTeacherList,
                punchTimes: punchTimes,
                endDate: endDate,
                schoolDates: this.state.schoolDates.filter( d => isBefore(d, endDate))});
        }
    }
    startTime: HTMLInputElement | null = null
    endTime: HTMLInputElement | null = null

    render() {
        return (
        <>
          <Container className='staff-absence-report'>
            <Row>
                <Col className='staff-absence-filter-container'>
                    <h3>Staff Absence Report</h3>
                    <Button onClick={() => this.setState({dateModal:true})}>
                        Select Your Dates
                    </Button>
                    <Form>
                        <label>Choose Start and End Times</label>
                        <Form.Row>
                            <Col>
                                <Form.Control 
                                type='time' 
                                defaultValue='07:00'
                                ref={(ref => this.startTime = ref) as any }
                                    />
                            </Col>
                            <Col>
                                <Form.Control 
                                    type='time' 
                                    defaultValue='15:00'
                                    ref={(ref => this.endTime = ref) as any }/>
                            </Col>
                        </Form.Row>
                        <Button onClick={this.generateTardies}>
                            Generate Tardies for Selected
                        </Button>
                    </Form>
                    <MultiSelect
                        items={PayCodeKeys}
                        selected={this.state.selectedCodes}
                        handleClick={this.handleCodeClick}
                        title={'Pay Codes'}/>
                    <MultiSelect
                        items={this.state.teacherList}
                        selected={this.state.selectedTeachers}
                        handleClick={this.handleTeacherClick}
                        title={'Teachers'}/>
                    <MultiSelect
                        items={this.state.nonTeacherList}
                        selected={this.state.selectedNonTeachers}
                        handleClick={this.handleNonTeacherClick}
                        title={'Non-Teachers'}/>
                </Col>
                <Col className='staff-absence-tabs'>
                    <Tabs defaultActiveKey='staff' id='staff-absence-tabs'>     
                        <Tab eventKey='staff' title='Staff View'>
                            <StaffDisplayContainer
                                absenceData={this.state.punchTimes}
                                staffNames={this.state.selectedTeachers.concat(this.state.selectedNonTeachers)}
                                codes={this.state.selectedCodes}
                                dates={this.state.schoolDates}
                                />
                        </Tab>
                        <Tab eventKey='totals' title='Absence Totals'>
                            <AbsenceTotals
                                absenceData={this.state.punchTimes}
                                staffNames={this.state.selectedTeachers.concat(this.state.selectedNonTeachers)}
                                codes={this.state.selectedCodes}
                                dates={this.state.schoolDates}
                                />
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
          </Container>
          <SchoolDatesModal
            handleDayClick={this.handleDatesModalDayClick}
            handleBoundsChange={this.handleDateBoundsChange}
            handleHide={this.handleDatesModalHide}
            selectedDates={this.state.schoolDates}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            show={this.state.dateModal}
            holidays={SY_CURRENT.holidays}
            handleHolidayClick={this.handleDateList}
          />
        </>
        );
    }

    private handleDatesModalHide = () => {
        this.setState({dateModal: false})
    }

    private handleDatesModalDayClick = (date: Date, mod: {selected: boolean}) => {
        this.setState({schoolDates: mod.selected ? this.state.schoolDates.filter(d => !isSameDay(d, date)):this.state.schoolDates.concat([date])})
    }

    private handleDateBoundsChange = (startDate: Date, endDate: Date) =>{
        if(!isSameDay(this.state.startDate, startDate)){
            if(isBefore(this.state.startDate, startDate)){
                this.setState({
                    schoolDates: this.state.schoolDates.filter(d => isWithinRange(d, startDate, endDate)),
                    startDate: startDate, endDate:endDate})
            }else{
                this.setState({
                    schoolDates: this.state.schoolDates
                        .concat(eachDay(startDate, this.state.startDate).filter(d => !isWeekend(d))),
                    startDate: startDate, endDate:endDate})
            }
        }
        if(!isSameDay(this.state.endDate, endDate)){
            if(isAfter(this.state.endDate, endDate)){
                this.setState({
                    schoolDates: this.state.schoolDates.filter(d => isWithinRange(d, startDate, endDate)),
                    startDate: startDate, endDate:endDate})
            }else{
                this.setState({
                    schoolDates: this.state.schoolDates
                        .concat(eachDay(this.state.endDate, endDate).filter(d => !isWeekend(d))),
                    startDate: startDate, endDate:endDate})
            }
        }   
    }

    private handleDateList = (dates: Date[], selectDates: boolean) => {
        if(selectDates){
            this.setState({schoolDates: this.state.schoolDates.filter( d=> !dates.includes(d)).concat(dates.filter(d=>!isWeekend(d)))})
        } else {
            this.setState({schoolDates: this.state.schoolDates.filter(d=> !dates.includes(d))})
        }
    }

    private handleCodeClick = (staff: string | string[]): void => {
        const selected=this.state.selectedCodes;
        if(Array.isArray(staff)){
            if(staff.every(s => selected.includes(s))){
                this.setState({selectedCodes: selected.filter(f=> !staff.includes(f))})
            }else{
                const newSelected = selected.concat(staff.filter(s=> !selected.includes(s)))
                this.setState({selectedCodes:newSelected})
            }
        }else{
            selected.includes(staff) ? 
                this.setState({selectedCodes: selected.filter(f => f!==staff)}):
                this.setState({selectedCodes: selected.concat([staff])})
        }
    }

    private handleNonTeacherClick = (staff: string | string[]): void => {
        const selected=this.state.selectedNonTeachers;
        if(Array.isArray(staff)){
            if(staff.every(s => selected.includes(s))){
                this.setState({selectedNonTeachers: selected.filter(f=> !staff.includes(f))})
            }else{
                const newSelected = selected.concat(staff.filter(s=> !selected.includes(s)))
                this.setState({selectedNonTeachers:newSelected})
            }
        }else{
            selected.includes(staff) ? 
                this.setState({selectedNonTeachers: selected.filter(f => f!==staff)}):
                this.setState({selectedNonTeachers: selected.concat([staff])})
        }
    }

    private handleTeacherClick = (staff: string | string[]): void => {
        const selected=this.state.selectedTeachers;
        if(Array.isArray(staff)){
            if(staff.every(s => selected.includes(s))){
                this.setState({selectedTeachers: this.state.selectedTeachers.filter(f=> !staff.includes(f))})
            }else{
                const newSelected = selected.concat(staff.filter(s=> !selected.includes(s)))
                this.setState({selectedTeachers:newSelected})
            }
        }else{
            selected.includes(staff) ? 
                this.setState({selectedTeachers: selected.filter(f => f!==staff)}):
                this.setState({selectedTeachers: selected.concat([staff])})
        }
    }

    private generateTardies = (): void => {
        if(this.startTime && this.endTime){
            const staffPunches = this.state.punchTimes;
            const inInt = parseInt(this.startTime.value.slice(0,2)+this.startTime.value.slice(3), 10)
            const outInt = parseInt(this.endTime.value.slice(0,2)+this.endTime.value.slice(3), 10)
            const selected = this.state.selectedTeachers.concat(this.state.selectedNonTeachers)
            selected.forEach( staff => {
                const tardies = new Map<Date, PunchTime>()
                const punchTimes:StaffDates = this.state.punchTimes[staff].punchTimes
                punchTimes.forEach((val,key)=>{
                    if(isPunchTime(val) && SY_CURRENT.irregularDays.map(d => d.dates).flat().every(d => !isSameDay(d,key))){
                        if(isTardy(inInt, outInt, val.in, val.out).some(a => a)){
                            tardies.set(key, val)
                            }
                        }
                    }
                )
                staffPunches[staff].tardies=tardies;
                staffPunches[staff].startTime=inInt;
                staffPunches[staff].endTime=outInt;
                staffPunches[staff].attDays=[...this.state.schoolDates]
            })
            this.setState({punchTimes:staffPunches})
            this.forceUpdate();
        }
    }
    
}