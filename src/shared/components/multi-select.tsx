import * as React from 'react'
import Collapse from 'react-bootstrap/Collapse'
import ListGroup from 'react-bootstrap/ListGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import { CustomToggle } from '../../shared/components/custom-toggle'
import './multi-select.css'
import Button from 'react-bootstrap/Button';
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
    subHeaders: string[]
}

export class MultiSelect extends React.PureComponent<MultiSelectProps, MultiSelectState> {
    constructor(props) {
        super(props)
        this.state= {subHeaders:[], open:false};
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
                <ListGroup.Item onClick={() => this.setState({open: !this.state.open})}>
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
                    this.props.items.map(item => {
                        return (
                            <CollapseListItem
                                in={this.state.open || this.props.selected.includes(item)} key={item}
                                active={this.props.selected.includes(item)}
                                onClick={this.props.handleClick}
                                item={item}
                                disabled={this.props.disabled !== undefined && this.props.disabled.includes(item)}/>
                        )}): Object.keys(this.props.items).map(group => {
                            return(
                                <React.Fragment key={group}>
                                    <Collapse in={this.state.open || 
                                        this.props.items[group].some(s => this.props.selected.includes(s))}>
                                        <div>
                                            <ListGroup.Item 
                                            className='multi-select-list-sub-header'
                                            onClick={()=> {
                                                const h = this.state.subHeaders.includes(group) ? 
                                                    this.state.subHeaders.filter(g=> g!== group) :
                                                    this.state.subHeaders.concat([group])
                                                this.setState({subHeaders: h})
                                            }}>
                                                    {group}
                                                <div className='multi-select-header-controls'>
                                                    <span className={`multi-select-down-caret 
                                                    ${!this.state.subHeaders.includes(group) ? 'multi-select-open-caret':''}`}/>
                                                    <Button size='sm' onClick={(ev: React.MouseEvent)=>{
                                                        ev.stopPropagation()
                                                        this.selectAll(this.props.items[group])}}
                                                        className='multi-select-sub-header-button'>All
                                                        </Button>
                                                </div>
                                            </ListGroup.Item>
                                        </div>
                                    </Collapse>
                                    {this.props.items[group].map(item => {
                                        return (
                                            <CollapseListItem
                                                in={(this.state.open && 
                                                    !this.state.subHeaders.includes(group)) ||
                                                     this.props.selected.includes(item)} key={item}
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

class CollapseListItem extends React.PureComponent<CollapseListProps> {
    render(){
        return (
            <Collapse in={this.props.in}>
                <div>
                    <ListGroup.Item className='multi-select-list-group-item'
                        action
                        disabled={this.props.disabled}
                        active={this.props.active}
                        onClick={()=> this.props.onClick(this.props.item)}>
                        {this.props.item}
                    </ListGroup.Item>
                </div>
            </Collapse>
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
