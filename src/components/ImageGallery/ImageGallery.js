import React, { Component, PropTypes } from 'react';
import { Image } from 'semantic-ui-react';

export default class ImageGallery extends Component {
    static propTypes = {
        images: PropTypes.array.isRequired,
        limit: PropTypes.number.isRequired,
        offset: PropTypes.number.isRequired,
    };
    static defaultProps = {
        images: [],
        limit: 50,
        offset: 0
    };
    renderImages() {
        return this.props.images.slice(this.props.offset, this.props.limit)
            .map(image => {
                return <Image src={image} role="presentation" key={image} />
            });
    }

    render() {
        return (<Image.Group>
            {this.renderImages()}
        </Image.Group>)
    }
}