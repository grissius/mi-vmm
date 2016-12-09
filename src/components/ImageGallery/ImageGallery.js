import React, { Component, PropTypes } from 'react';
import convert from 'color-convert';
import { Image, Modal, Label} from 'semantic-ui-react';

export default class ImageGallery extends Component {
    static propTypes = {
        images: PropTypes.array.isRequired,
    };
    static defaultProps = {
        images: [],
    };
    renderImages() {
        return this.props.images
            .map(image => {
                const hexDominant = `#${convert.rgb.hex(image.dominantColor)}`;
                return <Modal trigger={<Image src={image.url} role="presentation" />} key={image.url} dimmer={'blurring'} basic size='small'>
                    <Modal.Content>
                        <Image centered src={image.url.replace('_q.jpg', '.jpg')} role="presentation" />
                        <br/>
                        <div className="ui circular centered image" style={{backgroundColor: hexDominant, width: '100px', height: '100px', paddingTop: '40px', textAlign: 'center'}}>{hexDominant}</div>
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