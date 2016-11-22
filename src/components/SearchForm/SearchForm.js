import React, {Component} from 'react'
import {searchPhotos} from '../../services/Flickr';
import _ from 'lodash';
import {Container, Grid, Icon, Form, Message, Header, Segment} from 'semantic-ui-react';
import {CirclePicker} from 'react-color';
import ImageGallery from '../ImageGallery/ImageGallery';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            error: null,
            images: [],
        }
    }

    onChange(e) {
        const query = this.refs.query.value;
        console.log(query);
        e.preventDefault();
        searchPhotos(query)
            .then(response => {
                const images = _.map(response, image => `http://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}_q.jpg`);
                this.setState({
                    images,
                });
            })
            .catch(e => {
                this.setState({
                    error: e.message,
                });
            });
    }

    renderError() {
        if (this.state.error) {
            return (<Message error>{this.state.error}</Message>);
        }
    }

    render() {
        return (
            <div>
                <Container text textAlign={'center'}>
                    <Segment padded basic>
                        <Form>
                            <Form.Field inline>
                                <Form.Input icon size={'big'}>
                                    <input onChange={this.onChange} placeholder='Search...' ref="query"/>
                                    <Icon name='search'/>
                                </Form.Input>
                            </Form.Field>
                            <CirclePicker />
                        </Form>
                        {this.renderError()}
                    </Segment>
                </Container>
                <Grid columns='two' divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Query relevance'/>
                            <ImageGallery images={this.state.images}/>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Color rerank'/>
                            ...
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
