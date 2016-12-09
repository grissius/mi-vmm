import React, {Component} from 'react'
import {searchPhotos} from '../../services/Flickr';
import _ from 'lodash';
import {Container, Grid, Icon, Form, Message, Header, Segment, Loader, Dimmer} from 'semantic-ui-react';
import {CirclePicker} from 'react-color';
import ImageGallery from '../ImageGallery/ImageGallery';
import {stealColors} from '../../services/ColorThief'
import {rgbL2} from '../../services/Colors'

export default class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.onQueryChange = this.onQueryChange.bind(this);
        this.onColorChange = this.onColorChange.bind(this);
        this.onLimitChange = this.onLimitChange.bind(this);
        this.onFlickerChange = this.onFlickerChange.bind(this);
        this.rerank = this.rerank.bind(this);
        this.dominantColors = this.dominantColors.bind(this);
        this.state = {
            error: null,
            images: [],
            color: {},
            query: '',
            limit: 10,
            isReranking: false,
            isFlickering: false,
        }
    }

    onFlickerChange() {
        const query = this.state.query;
        const limit = this.state.limit;
        let lastTime = new Date().getTime();
        const timestamp = () => {
            let now = new Date().getTime();
            let len = now - lastTime;
            lastTime = now;
            return len;
        };
        const isCurrent = () => this.state.query === query;
        const E_INVALID = 'E_INVALID';
        this.setState({isFlickering: true, isReranking: true,});
        searchPhotos(this.refs.query.value, this.state.limit)
            .then(response => {
                return _.map(response, image => ((image.url = `http://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}_q.jpg`, image)));
            })
            .then(images => {
                if (!isCurrent()) {
                    throw new Error(E_INVALID);
                }
                this.setState({images, isFlickering: false});
                return images;
            })
            .then(images => (console.info(query, limit, this.state.color.hex, 'fetch done', timestamp()), images))
            .then(this.dominantColors)
            .then(images => (console.info(query, limit, this.state.color.hex, 'dominant done', timestamp()), images))
            .then(images => this.rerank(images, this.state.color))
            .then(images => {
                if (isCurrent()) {
                    this.setState({images});
                }
                console.info(query, limit, this.state.color.hex, 'rerank done', timestamp());
                return images;
            })
            .catch(e => {
                if (e.message !== E_INVALID) {
                    console.error(e);
                    this.setState({
                        error: e.message,
                    });
                }
            });
    }

    onLimitChange(e) {
        const limit = this.refs.limit.value;
        this.setState({
            limit
        }, this.onFlickerChange);
    }

    onQueryChange(e) {
        const query = this.refs.query.value;
        e.preventDefault();
        this.setState({
            query
        }, this.onFlickerChange);
    }

    onColorChange = (color, ev) => {
        this.rerank(this.state.images, color);
        this.setState({
            color,
        });
    };

    renderError() {
        if (this.state.error) {
            return (<Message error>{this.state.error}</Message>);
        }
    }

    dominantColors(images) {
        this.setState({isReranking: true});
        return stealColors(images)
            .then(colors =>
                // assign dominant
                _.map(images, (image, index) => _.assign(_.cloneDeep(image), {dominantColor: colors[index]}))
            )
    }

    rerank(images, color) {
        this.setState({isReranking: true});
        if (!_.isEmpty(color)) {
            // compute distance
            let userColor = [color.rgb.r, color.rgb.g, color.rgb.b];
            _.map(images, (image) => image.distance = rgbL2(image.dominantColor, userColor));
        } else {
            console.warn('No color selected, rerank skipped!');
        }
        this.setState({isReranking: false});
        return images;
    }

    render() {
        return (
            <div>
                <Container text textAlign={'center'}>
                    <Segment padded basic>
                        <Form>
                            <Form.Field inline>
                                <Form.Input icon size={'big'}>
                                    <input onChange={this.onQueryChange} placeholder='Search...' ref="query"
                                           value={this.state.query}/>
                                    <Icon name='search'/>
                                </Form.Input>
                                <Form.Input>
                                    <input onChange={this.onLimitChange} value={this.state.limit} placeholder='Limit'
                                           ref="limit"/>
                                </Form.Input>
                            </Form.Field>
                            <CirclePicker color={ this.state.color} onChangeComplete={this.onColorChange}/>
                        </Form>
                        {this.renderError()}
                    </Segment>
                </Container>
                <Grid columns='two' divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Query relevance'/>
                            <Segment basic>
                                <Dimmer inverted active={this.state.isFlickering}>
                                    <Loader size='large'>Loading</Loader>
                                </Dimmer>
                                <ImageGallery key={this.state.query} images={this.state.images} ref="flickrGallery"/>
                            </Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Header as='h3' icon textAlign='center' content='Color rerank'/>
                            <Segment basic>
                                <Dimmer inverted active={this.state.isReranking}>
                                    <Loader size='large'>Loading</Loader>
                                </Dimmer>
                                <ImageGallery key={this.state.query} images={_.sortBy(this.state.images, ['distance'])}
                                              ref="rerankGallery"/>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
