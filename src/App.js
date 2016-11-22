import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import {Header, Icon, Container} from 'semantic-ui-react';
import SearchForm from './components/SearchForm/SearchForm';

class App extends Component {
    render() {
        return (
            <div className="App">
                {/*<div className="App-header">*/}
                {/*<img src={logo} className="App-logo" alt="logo" />*/}
                {/*<h2>Welcome to React</h2>*/}
                {/*</div>*/}
                <Container>
                    <Header as='h1' icon textAlign='center'>
                        <Icon className="App-header" name='flickr' circular/>
                        <Header.Content>
                            Flickr reRank
                        </Header.Content>
                    </Header>
                    <SearchForm />
                </Container>
            </div>
        );
    }
}

export default App;
