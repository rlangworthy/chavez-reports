import * as React from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {ReportTitle} from '../report-types'

interface ReportCardProps{
    cardInfo: ReportTitle
    onClick: (title: string) => void
}

export const ReportCard: React.SFC<ReportCardProps> = (props) => {
    return(
        <Card key={props.cardInfo.title}>
            <Card.Body>
                <Card.Title>{props.cardInfo.title}</Card.Title>
                <Card.Text>{props.cardInfo.description}</Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button variant='primary' onClick={() => props.onClick(props.cardInfo.title)}>Upload Files</Button>
            </Card.Footer>
        </Card>          
    )
}