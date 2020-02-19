import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup'
import DayPicker from 'react-day-picker/DayPicker'
import DayPickerInput from 'react-day-picker/DayPickerInput'

import {HolidayDate, SY_CURRENT} from '../../shared/initial-school-dates'

import './school-dates-modal.css'

interface SchoolDatesModalProps {
    show: boolean
    selectedDates: Date[]
    holidays: HolidayDate[]
    startDate: Date
    endDate: Date
    handleDayClick: (date: Date, mod:{selected: boolean}) => void
    handleBoundsChange: (startDate: Date, endDate: Date) => void
    handleHide: ()=>void
    handleHolidayClick: (dates: Date[], selectDates: boolean) => void
}
interface SchoolDatesModalState {
    selectedHolidays: string[]
}

export class SchoolDatesModal extends React.PureComponent<SchoolDatesModalProps, SchoolDatesModalState> {
    constructor(props){
        super(props)
        this.state={selectedHolidays: this.props.holidays.map(h=> h.name)}
    }

    handleClick = (name:string, dates:Date[]) => {
        if(this.state.selectedHolidays.includes(name)){
            this.setState({selectedHolidays: this.state.selectedHolidays.filter(h => h !== name)})
            this.props.handleHolidayClick(dates, true)
        } else {
            this.setState({selectedHolidays: this.state.selectedHolidays.concat([name])})
            this.props.handleHolidayClick(dates, false)
        }
    }

    render(){
        return (
            <Modal show={this.props.show} onHide={this.props.handleHide} dialogClassName='calendar-modal'>
                <div className='school-dates-modal-boundary-picker'>
                        <span>
                        <p>Start Date</p>
                        <DayPickerInput 
                            format='' 
                            value={this.props.startDate}
                            onDayChange={(d)=>this.props.handleBoundsChange(d, this.props.endDate)}/>
                    </span>
                    <span>
                        <p>End Date</p>
                        <DayPickerInput 
                            format='' 
                            value={this.props.endDate}
                            onDayChange={(d)=>this.props.handleBoundsChange(this.props.startDate, d)}/>
                    </span>
                </div>
                <Modal.Body>
                    <Row>
                        <Col>
                            <DayPicker
                                onDayClick={this.props.handleDayClick}
                                canChangeMonth={false}
                                initialMonth={new Date(2019, 7)}
                                selectedDays={this.props.selectedDates}
                                numberOfMonths={12}/>
                        </Col>
                        <Col md='auto'>
                            <ListGroup variant='flush'>
                                {SY_CURRENT.holidays.map( holiday => {
                                    return (
                                    <ListGroup.Item key={holiday.name} action
                                        active={this.state.selectedHolidays.includes(holiday.name)}
                                        onClick={(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => 
                                            this.handleClick(holiday.name, holiday.dates)}>
                                        {holiday.name}
                                    </ListGroup.Item>)
                                })}
                            </ListGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        )
    }
}