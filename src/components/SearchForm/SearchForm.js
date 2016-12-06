import React, {Component} from 'react'
import {searchPhotos} from '../../services/Flickr';
import _ from 'lodash';
import {Container, Grid, Icon, Form, Message, Header, Segment} from 'semantic-ui-react';
import {CirclePicker} from 'react-color';
import ImageGallery from '../ImageGallery/ImageGallery';
import {stealColors} from '../../services/ColorThief'
import {rgbL2} from '../../services/Colors'

export default class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.onColorChange = this.onColorChange.bind(this);
        this.rerank = this.rerank.bind(this);
        this.dominantColors = this.dominantColors.bind(this);
        this.state = {
            error: null,
            images: [],
            rerankedImages: [],
            color: {}
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
                    images: images,
                    rerankedImages: images,
                });
            })
            .then(this.dominantColors)
            .then(this.rerank)
            .catch(e => {
                this.setState({
                    error: e.message,
                });
            });
    }

    onColorChange = (color, ev) => {
        this.setState({
            color: color
        });
        this.rerank();
    };

    renderError() {
        if (this.state.error) {
            return (<Message error>{this.state.error}</Message>);
        }
    }

    dominantColors() {
        return stealColors(this.state.images)
            .then(colors => _.map(colors, (color, index) => this.state.images[index].dominantColor = color)) // assign dominant
            .then(this.rerank);
    }

    rerank() {
        if(this.state.color) {
            // compute distance
            let userColor = [this.state.color.rgb.r, this.state.color.rgb.g, this.state.color.rgb.b];
            _.map(this.state.images, image => image.distance = rgbL2(image.dominantColor, userColor));
            // sort
            this.setState({
                rerankedImages: _.sortBy(this.state.images, ['distance'])
            });
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
                            <CirclePicker color={ this.state.color } onChangeComplete={this.onColorChange}/>
                        </Form>
                        {this.renderError()}
                    </Segment>
                </Container>
                <Grid columns='two' divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Query relevance'/>
                            <ImageGallery images={this.state.images} ref="flickrGallery"/>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Color rerank'/>
                            <ImageGallery images={this.state.rerankedImages} ref="rerankGallery"/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
