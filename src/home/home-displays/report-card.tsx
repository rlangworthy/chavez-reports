import * as React from 'react'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import {ReportTitle} from '../../shared/report-types'

interface ReportCardProps{
    cardInfo: ReportTitle
    onClick: (title: string) => void
}

export const ReportCard: React.SFC<ReportCardProps> = (props) => {
    const CardButton = () => {
        if(props.cardInfo.externalLink){
            return (
                <Button variant='primary'
                        onClick={() => window.open(props.cardInfo.externalLink, '_blank')}>
                    Go To Site
                </Button>)
        } else {
            return (
                <Button variant='primary'
                        onClick={() => props.onClick(props.cardInfo.title)}>
                    Load Files
                </Button>
            )
        }
    }
    
    return(
            <Card key={props.cardInfo.title} style={{minWidth:'15rem',maxWidth:'15rem'}}>
                <Card.Body>
                    <Card.Title>{props.cardInfo.title}</Card.Title>
                    <Card.Text>{props.cardInfo.description}</Card.Text>
                    {props.cardInfo.moreInfoLink && 
                    <Button
                        variant='link'
                        onClick={() => window.open(props.cardInfo.moreInfoLink, '_blank')}
                        style={{textAlign:'center'}}>Report Details</Button>}
                </Card.Body>
                
                <Card.Footer>
                    <CardButton/>
                </Card.Footer>
            </Card>         
    )
}