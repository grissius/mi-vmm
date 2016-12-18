import React, { Component, PropTypes } from 'react';
import convert from 'color-convert';
import _ from 'lodash';
import { Image, Modal } from 'semantic-ui-react';

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
                const hexColors = _.map(image.dominantColors, color => `#${convert.rgb.hex(color)}`);
                const colorBubbles = _.map(hexColors, (color, index) => <div className="ui circular image" key={color + index} style={{backgroundColor: color, width: '100px', height: '100px', paddingTop: '40px', textAlign: 'center'}}>{color}</div>);
                return <Modal trigger={<Image src={image.url} role="presentation" />} key={image.url} dimmer={'blurring'} basic size='small'>
                    <Modal.Content>
                        <Image centered src={image.url.replace('_q.jpg', '.jpg')} role="presentation" />
                        <br/>
                        <div className="ui small images" style={{ textAlign: 'center'}}>
                            {colorBubbles}
                        </div>
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