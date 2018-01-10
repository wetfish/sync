import React from 'react';

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
    // var result = JSON.parse(data);
    alert(data);
  }

  sendMessage(message) {
    console.log(this);
  }

  render() {
    return (
      <div>
        Connected: <strong>{this.state.connected}</strong>
        <button onClick={() => this.sendMessage('Hello')} >Send Message</button>
      </div>
    );
  }
}

export default App;