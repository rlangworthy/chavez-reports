import * as React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import { CustomToggle } from '../../shared/components/custom-toggle'
import { CustomCollapse } from '../../shared/components/custom-collapse'
import './multi-select.css'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

//takes a handler, either an array of values or 
export interface MultiSelectProps {
    handleClick: (ev: string | string[]) => void
    items: string[] | {[key:string]: string[]}
    selected: string[]
    title: string
    disabled?: string[]
}
export interface MultiSelectState {
    open: boolean
    subHeaders: {[key: string]:boolean}
}


export class MultiSelect extends React.PureComponent<MultiSelectProps, MultiSelectState> {
    constructor(props) {
        super(props)
        this.state= {subHeaders:{}, open:true};
    }
    
    componentWillMount(){
        if(!Array.isArray(this.props.items)){
            const subheads = {}
            Object.keys(this.props.items).forEach( key => {
                subheads[key] = true
            })
            this.setState({subHeaders: subheads})
            this.forceUpdate()
        }
    }

    selectAll = (items: string[] | {[key:string]: string[]}): void => {
        if(Array.isArray(items)){
            this.props.handleClick(items)
        } else {
            this.props.handleClick(Object.keys(items).reduce((a:string[],b)=> a.concat(items[b]), []))
        }
    }

    subHeaderHelper = (group: string): boolean => {
        return true
    }

    render(){
        return (
            <ListGroup>
                <ListGroup.Item onClick={() => {
                    if(Array.isArray(this.props.items)){
                        this.setState({open: !this.state.open})
                    }else{
                        const subheads = {}
                        Object.keys(this.props.items).forEach( key => {
                            subheads[key] = !this.state.open
                        })
                        this.setState({subHeaders: subheads, open: !this.state.open})
                    }}}>
                    {this.props.title}
                    <div className='multi-select-header-controls'>
                        <span className={`multi-select-down-caret ${this.state.open ? 'multi-select-open-caret':''}`}/>
                        <Button onClick={(ev: React.MouseEvent)=>{
                            ev.stopPropagation()
                            this.selectAll(this.props.items)}}
                            className='multi-select-header-button'>All
                            </Button>
                    </div>
                </ListGroup.Item>
                <ListGroup>
                    {Array.isArray(this.props.items) ? 
                        <>
                        {this.props.items.map(item => {
                            return (
                                <CollapseListItem
                                    in={this.state.open}
                                    key={item}
                                    active={this.props.selected.includes(item)}
                                    onClick={this.props.handleClick}
                                    item={item}
                                    disabled={this.props.disabled !== undefined && this.props.disabled.includes(item)}/>
                            )})}
                        </>
                        : Object.keys(this.props.items).map(group => {
                            return(
                                <React.Fragment key={group}>
                                        <div>
                                            <ListGroup.Item 
                                            className='multi-select-list-sub-header'
                                            onClick={()=> {
                                                const h = this.state.subHeaders
                                                h[group] = !h[group]
                                                this.setState({subHeaders: h})
                                                this.forceUpdate()
                                            }}>
                                                    {group}
                                                <div className='multi-select-header-controls'>
                                                    <span className={`multi-select-down-caret 
                                                    ${this.state.subHeaders[group] ? 'multi-select-open-caret':''}`}/>
                                                    <Button size='sm' onClick={(ev: React.MouseEvent)=>{
                                                        ev.stopPropagation()
                                                        this.selectAll(this.props.items[group])}}
                                                        className='multi-select-sub-header-button'>All
                                                        </Button>
                                                </div>
                                            </ListGroup.Item>
                                        </div>
                                    {this.props.items[group].map(item => {
                                        return (
                                            <CollapseListItem
                                                in={this.state.subHeaders[group]}
                                                key={item}
                                                active={this.props.selected.includes(item)}
                                                onClick={this.props.handleClick}
                                                item={item}
                                                disabled={this.props.disabled !== undefined && this.props.disabled.includes(item)}/>
                                        )})}
                                </React.Fragment>
                        )})} 
                </ListGroup>
            </ListGroup>
        )
    }
}

interface CollapseListProps {
    in: boolean
    active: boolean
    onClick: (s: string) => void
    item: string
    disabled: boolean
}

export class CollapseListItem extends React.PureComponent<CollapseListProps> {
    render(){
        return (
                <div key={this.props.item}>
                    <CustomCollapse in={this.props.in || this.props.active}>
                        <ListGroup.Item className={`multi-select-list-group-item ${this.props.active? 'multi-select-list-group-item-active show' : ''}`}
                            action
                            disabled={this.props.disabled}
                            active={this.props.active}
                            onClick={()=> this.props.onClick(this.props.item)}>
                            {this.props.item}
                        </ListGroup.Item>
                    </CustomCollapse>
                </div>
        )
    }
}

interface SelectDropdownWidgetProps {
    onClick: (items: string[] | {[key:string]:string[]})=>void
    items: string[] | {[key:string]:string[]}
}

/* eslint-disable */
const SelectDropdownWidget: React.SFC<SelectDropdownWidgetProps> = (props) => {
    return (
        <Dropdown style={{float:'right'}}>
            <Dropdown.Toggle id='file-dropdown-widget-toggle' as={CustomToggle}/>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => props.onClick(props.items)}>
                    Select All
                </Dropdown.Item>
                <Dropdown.Item onClick={() => props.onClick([])}>
                    Clear Selection
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}
/* eslint-enable */



export interface MultiSelectPanesState{

}
export interface MultiSelectPanesProps{

}
/*
export class MultiSelectPanes extends React.PureComponent<{}> {
    
    
    render(){
        return (
            <Container>
                <Row>
                    <Col className='grades-filter-container'>
                        <MultiSelect
                            items={this.state.grades}
                            selected={this.state.selectedGrades}
                            title='Teachers'
                            handleClick={this.handleGradeClick}
                        />
                    </Col>
                    <Col className='grades-display-container'>
                        <SummaryPage summary={summary}/>
                        {twoSided ? <div className={'summary-page'}/>:null}
                        {homeRooms.map( hr => {
                                if(this.state.selectedGrades.length===0 || this.state.selectedGrades.includes(hr.grade)){
                                    return (
                                        <WeeklyOnePager hr={hr} key={hr.room} backpage={twoSided}/>
                                    )
                                }else{
                                    return null
                                }
                            }
                        )}
                    </Col>
                </Row>
            </Container>
        )
    }


    handleGradeClick = (grade: string[] | string): void => {
        const selected=this.state.selectedGrades;
        if(Array.isArray(grade)){
            if(grade.every(s => selected.includes(s))){
                this.setState({selectedGrades: selected.filter(f=> !grade.includes(f))})
            }else{
                const newSelected = selected.concat(grade.filter(s=> !selected.includes(s)))
                this.setState({selectedGrades:newSelected})
            }
        }else{
            selected.includes(grade) ? 
                this.setState({selectedGrades: selected.filter(f => f!==grade)}):
                this.setState({selectedGrades: selected.concat([grade])})
        }
    }
}
*/