import React from 'react'

class App extends React.Component {
	componentDidMount() {
		//Simple GET request using fetch
		fetch('localhost:3001/users').then(response => response.json())
		.then(data => this.setState({totalReactPackages: data.total}));
	}
	render() {
		return (<div className="text-center">
					<h3 className="p-3">React HTTP GET Requests with Fetch</h3>
				</div>);
	}
}

export {App};