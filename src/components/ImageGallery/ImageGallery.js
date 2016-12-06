import React, { Component, PropTypes } from 'react';
import { Image, Modal} from 'semantic-ui-react';

export default class ImageGallery extends Component {
    static propTypes = {
        images: PropTypes.array.isRequired,
        limit: PropTypes.number.isRequired,
        offset: PropTypes.number.isRequired,
    };
    static defaultProps = {
        images: [],
        limit: 100,
        offset: 0
    };
    renderImages() {
        return this.props.images.slice(this.props.offset, this.props.limit)
            .map(image => {
                return <Modal trigger={<Image src={image.url} role="presentation" />} key={image.url} dimmer={'blurring'} basic size='small'>
                    <Modal.Content>
                        <Image centered src={image.url.replace('_q.jpg', '.jpg')} role="presentation" />
                    </Modal.Content>
                </Modal>
            });
    }

    render() {
        return (<Image.Group>
            {this.renderImages()}
        </Image.Group>)
    }
}