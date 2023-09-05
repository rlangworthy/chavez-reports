import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import Alert from 'react-bootstrap/Alert'

interface InstructionModalProps {
    show: boolean
    handleHide: () => any
}

export const InstructionModal: React.SFC<InstructionModalProps> = (props) => {

    return (
        <Modal show={props.show} onHide={props.handleHide} dialogClassName={'modal-report-instrucitons'}>
            <Modal.Header closeButton>
                <Modal.Title>Welcome To Chavez Reports</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant='primary'>
                    Reports open in a new tab, make sure your popup blocker allows this.
                </Alert>
                <p>
                    This website is here to make publicly available several tools for organizing and displaying data in helpful ways.  You school generates a mind boggling amount of information and we are here to help you interpret that data and get it to the people that need to see it.
                </p>
                <p>
                    Click on any of the detail buttons on the reports to see a list of required files.
                </p>
                <p>
                    Information is stored locally in your browser to avoid data security issues.  You can save files for use over multiple sessions, but they are not automatically saved.
                </p>
                <p>
                    This site is a work in progress; more features will be added over time.
                </p>
                <ButtonToolbar>
                    <Button onClick={() => window.open('https://drive.google.com/open?id=1ImOdoG3b-yHEh5mHK4mCb1ChGIauE6EM', '_blank')}>
                        Aspen Instructions
                    </Button>
                    <Button onClick={() => window.open('https://drive.google.com/open?id=1eceutsyzh2u0f_BNv_aP0YXqwiX9s14c', '_blank')}>
                        Dashboard Instructions
                    </Button>
                </ButtonToolbar>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleHide}>
                Close
                </Button>
          </Modal.Footer>
            
        </Modal>
    )
}