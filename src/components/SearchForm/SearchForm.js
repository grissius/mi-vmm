import React, {Component} from 'react'
import {searchPhotos} from '../../services/Flickr';
import _ from 'lodash';
import {Container, Grid, Icon, Form, Message, Header, Segment} from 'semantic-ui-react';
import {CirclePicker} from 'react-color';
import ImageGallery from '../ImageGallery/ImageGallery';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.onColorChange = this.onColorChange.bind(this);
        this.state = {
            error: null,
            images: [],
        }
    }

    onQueryChange(e) {
        const query = this.refs.query.value;
        console.log(query);
        e.preventDefault();
        searchPhotos(query)
            .then(response => {
                const images = _.map(response, image => (image.url = `http://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}_q.jpg`, image));
                this.setState({
                    images,
                });
                this.refs.rerankGallery.rerank();
            })
            .catch(e => {
                this.setState({
                    error: e.message,
                });
            });
    }

    onColorChange(color, ev) {
        const rgb = color.rgb;
        console.log(rgb);
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
                                    <input onChange={this.onQueryChange} placeholder='Search...' ref="query"/>
                                    <Icon name='search'/>
                                </Form.Input>
                            </Form.Field>
                            <CirclePicker onChange={this.onColorChange} ref="color" />
                        </Form>
                        {this.renderError()}
                    </Segment>
                </Container>
                <Grid columns='two' divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Query relevance'/>
                            <ImageGallery images={this.state.images} ref="flickrGallery" />
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Color rerank'/>
                            <ImageGallery images={this.state.images} ref="rerankGallery" />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
