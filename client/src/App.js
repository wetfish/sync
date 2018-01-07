import React from 'react';
import Websocket from 'react-websocket';

class App extends React.Component {

  constructor(props) {
    super(props); 
    this.state = {
      connected: 'false'
    };
  }

  handleOpen(data) {
    this.setState({connected: 'true'}, () => {
      console.log('state set');
    });
  }

  handleClose(data) {
    this.setState({connected: 'false'}, () => {
      console.log('state set');
    });
  }

  handleData(data) {
    var result = JSON.parse(data);
    console.log('result', result);
  }

  render() {
    return (
      <div>
        Connected: <strong>{this.state.connected}</strong>

        <Websocket url='ws://localhost:3001/echo'
          onOpen={this.handleOpen.bind(this)}
          onClose={this.handleClose.bind(this)}
          onMessage={this.handleData.bind(this)}/>
      </div>
    );
  }
}

export default App;