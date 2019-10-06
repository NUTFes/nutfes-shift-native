import React from 'react';
import { StyleSheet, Image, ActivityIndicator, Dimensions, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const CommonActivityIndicator = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <Image
                style={{ width: SCREEN_WIDTH * 0.9, height: SCREEN_HEIGHT * 0.9 }}
                source={require('../assets/splash.png')}
            />
            <ActivityIndicator size='large' style={styles.activityIndicator} />
        </View>
    );
};

const styles = StyleSheet.create({
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 400,
        bottom: 0,
    }
})

export default CommonActivityIndicator;
