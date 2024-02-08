import {useEffect, useState} from 'react';
import HomeScreen from '../agora/src/app/screens/homescreen';
import {NavigationContainer} from '@react-navigation/native';
import {LogBox, Platform, Text, View} from 'react-native';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
LogBox.ignoreAllLogs();

const App = () => {
  const [gotPermissions, setGotPermissions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize Agora SDK

  useEffect(() => {
    requestMultiple(
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE]
        : [PERMISSIONS.ANDROID.CAMERA],
    )
      .then(val => {
        console.log(Platform.OS, val);
        setIsLoading(false);

        for (const perm of Object.values(val)) {
          if (perm !== 'granted') {
            setGotPermissions(false);
            break;
          }
        }
      })
      .catch(err => {
        console.log(Platform.OS, err);
        setIsLoading(false);
        setGotPermissions(false);
      });
    return () => {};
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
        }}>
        <Text> Loading......</Text>
      </View>
    );
  }
  return gotPermissions ? (
    <NavigationContainer>
      <HomeScreen />
    </NavigationContainer>
  ) : (
    <View
      style={{
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 20,
      }}>
      <Text style={{color: 'black', fontSize: 20, textAlign: 'center'}}>
        Insufficient Permissions
      </Text>
      <Text style={{color: 'black', textAlign: 'center'}}>
        Restart app after granting permissions from settings
      </Text>
    </View>
  );
};

export default App;
