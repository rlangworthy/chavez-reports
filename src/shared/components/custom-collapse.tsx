import * as React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import './custom-collapse.css'

type SelectOptions  = string[] | NestOptions

interface NestOptions {
    [header : string]: SelectOptions
}

interface CollapseSelectProps {
    items: string[] | {[key:string]: string[]}
    title: string
    disabled?: string[]
    callback: (ev: string) => void
    sub?: boolean
}

export class CustomCollapse extends React.PureComponent<{in: boolean}>{
    render(){
        return(
            <div className={`${this.props.in ? 'show':'collapsed'}`}>
                {this.props.children}
            </div>
        )
    }
}


export class CollapseSelect extends React.PureComponent<CollapseSelectProps>{

    render(){
        const items = this.props.items
        return(
            <>
                {Array.isArray(items) ?
                    <Collapsible 
                        callback={this.props.callback} 
                        items={items}
                        title={this.props.title}/> : 
                    <>
                    <ListGroup>
                        <ListGroup.Item>
                            {this.props.title}
                            <div className='multi-select-header-controls'>
                                <span className={`multi-select-down-caret`}/>
                            </div>
                        </ListGroup.Item>
                        {Object.keys(items).map(key => 
                            <Collapsible
                                key={key}
                                callback={this.props.callback}
                                title={key}
                                items={items[key]}/>)}  
                    </ListGroup>
                    </>
                }
            </>
        )
    }
}

interface CollapsibleProps {
    items: string[]
    title: string
    callback: (ev: string) => void
    sub?: boolean
    open? : boolean
}

class Collapsible extends React.PureComponent<CollapsibleProps, {open: boolean}>{
    constructor(props){
        super(props)
        this.state = this.props.open !== undefined ? {open: this.props.open} : {open: true}
    }

    render(){
        const title = this.props.title
        return(
            <ListGroup>
                    <React.Fragment key={title}>
                        <ListGroup.Item onClick={() => this.setState({open: !this.state.open})}>
                            {title}
                            <div className='multi-select-header-controls'>
                                <span className={`multi-select-down-caret ${this.state.open ? 'multi-select-open-caret':''}`}/>
                            </div>
                        </ListGroup.Item>
                        <ListGroup>
                            {this.props.items.map(item => 
                                <CollapseListItem 
                                    key={item} 
                                    itemText={item}
                            open={this.state.open}/>)}
                        </ListGroup>
                    </React.Fragment>
            </ListGroup>
        )
    }
}

interface CollapseListHeaderProps {
    title: string
    open: boolean
    items: string[]
    callback: (ev: string) => void
}

class CollapseListHeader extends React.PureComponent<CollapseListHeaderProps, {open: boolean}>{
    constructor(props){
        super(props)
        this.state = {open: true}
    }


}


interface CollapseListItemProps {
    itemText: string
    open: boolean
}
interface CollapseListItemState {

}

class CollapseListItem extends React.PureComponent<CollapseListItemProps, {active: boolean}>{
    constructor(props){
        super(props)
        this.state={active: false}
    }
    render(){
        return(
            <ListGroup.Item 
                onClick={() => this.setState({active: !this.state.active})}
                action
                active={this.state.active}
                className={`${this.props.open || this.state.active ? 'multi-select-list-group-item' : 'collapsible-content'}`}>
                {this.props.itemText}
            </ListGroup.Item>
        )
    }
}