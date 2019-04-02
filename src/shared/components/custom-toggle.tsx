import * as React from 'react'
import gear from '../../shared/icons/simple-gear.svg'

//taken & modified from the react-bootstrap site
export class CustomToggle extends React.PureComponent<any> {
    constructor(props, context) {
      super(props, context);
  
      this.handleClick = this.handleClick.bind(this);
    }
  
    handleClick(e) {
      e.preventDefault();
  
      this.props.onClick(e);
    }
  
    render() {
      return (
        <div>
            <img src={gear} style={{height:'24px', width:'24px'}} onClick={this.handleClick}/>
            {this.props.children}
        </div>
      );
    }
}