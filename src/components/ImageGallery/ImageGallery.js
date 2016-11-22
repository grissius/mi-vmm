import React, { Component, PropTypes } from 'react';
import { Image, Modal, Header} from 'semantic-ui-react';

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
                return <Modal trigger={<Image src={image} role="presentation" key={image} />} dimmer={'blurring'} basic size='small'>
                    <Modal.Content>
                        <Image centered src={image.replace('_q.jpg', '.jpg')} role="presentation" key={image} />
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