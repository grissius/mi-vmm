import React, { Component } from 'react'
import { searchPhotos } from '../../services/Flickr';
import _ from 'lodash';
import { Grid, Icon, Input, Message } from 'semantic-ui-react';
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
                <Input icon>
                    <input onChange={this.onChange} placeholder='Search...' ref="query" />
                    <Icon name='search' />
                </Input>
                {this.renderError()}
                <Grid columns='two' divided>
                    <Grid.Row>
                        <Grid.Column>
                            <ImageGallery images={this.state.images} />
                        </Grid.Column>
                        <Grid.Column>
                            ...
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}
