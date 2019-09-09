import React, { Component } from "react";

class Widget extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{'display':this.props.visible}} className='widget'>{this.props.msg}</div>
        )
    }
}

export default Widget;