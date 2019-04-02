import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import DayPicker from 'react-day-picker/DayPicker'
import DayPickerInput from 'react-day-picker/DayPickerInput'

import './school-dates-modal.css'

interface SchoolDatesModalProps {
    show: boolean
    selectedDates: Date[]
    startDate: Date
    endDate: Date
    handleDayClick: (date: Date, mod:{selected: boolean}) => void
    handleBoundsChange: (startDate: Date, endDate: Date) => void
    handleHide: ()=>void   
}

export const SchoolDatesModal: React.SFC<SchoolDatesModalProps> = (props) => {

    return (
        <Modal show={props.show} onHide={props.handleHide} dialogClassName='calendar-modal'>
            <div className='school-dates-modal-boundary-picker'>
                    <span>
                    <p>Start Date</p>
                    <DayPickerInput 
                        format='' 
                        value={props.startDate}
                        onDayChange={(d)=>props.handleBoundsChange(d, props.endDate)}/>
                </span>
                <span>
                    <p>End Date</p>
                    <DayPickerInput 
                        format='' 
                        value={props.endDate}
                        onDayChange={(d)=>props.handleBoundsChange(props.startDate, d)}/>
                </span>
            </div>
            <Modal.Body>
            <DayPicker
                onDayClick={props.handleDayClick}
                canChangeMonth={false}
                initialMonth={new Date(2018, 7)}
                selectedDays={props.selectedDates}
                numberOfMonths={12}/>
            </Modal.Body>
          </Modal>
    )
}