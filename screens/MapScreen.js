import React from 'react';
import { WebView } from 'react-native-webview';

const env = require('../env.json').PRODUCTION;


class MapScreen extends React.Component {
    render() {
        return (
            <WebView
                source={{ uri: env.MAP_URL }}
                style={{ marginTop: 60 }}
            />
        )
    }
}

export default MapScreen;
