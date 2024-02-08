import React from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Switch,
  Dimensions,
} from 'react-native';
import createAgoraRtcEngine, {
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from 'react-native-agora';

const appId = '70d3c1a077464d2c8bf04c0dd22782ce';
const channelName = 'tempStream';
const token =
  '007eJxTYBAUfzqJa1tj1reYVovdpVkVf0/1rtfdnt6RKyrh3Pv+9WUFBnODFONkw0QDc3MTM5MUo2SLpDQDk2SDlBQjI3MLo+TUzT8PpzYEMjKsvqjExMgAgSA+F0NJam5BcElRamIuAwMAZsEjlQ==';
const uid = 0;

const HomeScreen = () => {
  const [isPerformer, setIsPerformer] = useState(false);
  const [notification, setNotification] = useState('');
  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [isHost, setIsHost] = useState(true); // Client role
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user
  const [participantCount, setParticipantCount] = useState(0); // State to track the number of participants

  // Function to update participant count when a user joins or leaves the channel
  const updateParticipantCount = (count: number) => {
    setParticipantCount(count);
    console.log('partcipantt count', participantCount);
  };
  const setupVideoSDKEngine = async () => {
    try {
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
          updateParticipantCount(participantCount + 1); // Increment participant count
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
          updateParticipantCount(participantCount - 1);
        },
      });
      agoraEngine.initialize({
        appId: appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // Simulate performer being set after some time (e.g., after permissions granted)
    setupVideoSDKEngine();
    const timer = setTimeout(() => {
      setIsPerformer(true);
    }, 5000);

    // Clear timer on unmount
    return () => clearTimeout(timer);
  }, [participantCount]);

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileLiveBroadcasting,
      );
      if (isHost) {
        agoraEngineRef.current?.startPreview();
        agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      } else {
        agoraEngineRef.current?.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleAudience,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 2000); // Disappear after 2 seconds
  };

  const sendMessage = () => {};
  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>
        Agora Interactive Live Streaming Quickstart
      </Text>

      <ScrollView style={styles.scroll}>
        <View style={styles.videoContainer}>
          {isJoined && isHost ? (
            <>
              <View></View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}>
                <Text onPress={join} style={styles.button}>
                  Join
                </Text>
                <Text onPress={leave} style={styles.button}>
                  Leave
                </Text>
              </View>
              <React.Fragment key={0}>
                <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
                <Text style={styles.userInfo}>Local user uid: {uid}</Text>
              </React.Fragment>
            </>
          ) : (
            <Text style={styles.userInfo}>{isHost ? 'Join a stream' : ''}</Text>
          )}
          {isJoined && !isHost && remoteUid !== 0 ? (
            <React.Fragment key={remoteUid}>
              <RtcSurfaceView
                canvas={{uid: remoteUid}}
                style={styles.videoView}
              />
              <Text style={styles.userInfo}>Remote user uid: {remoteUid}</Text>
            </React.Fragment>
          ) : (
            <View style={{height: Dimensions.get('screen').height}}>
              <Text style={styles.userInfo}>
                {isJoined && !isHost ? 'Waiting for a Performer to join' : ''}
                <Text style={styles.userInfo}> Live : {participantCount}</Text>
              </Text>
            </View>
          )}
          {message !== '' && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>{message}</Text>
            </View>
          )}
          <View style={styles.overlayButtons}></View>
          <View style={styles.sendMessagebtn}>
            <Text onPress={sendMessage} style={styles.button}>
              Send Message
            </Text>
          </View>
          <View style={styles.overlayButtons}>
            <View style={styles.btnContainer}>
              <Text>Audience</Text>
              <Switch
                onValueChange={switchValue => {
                  setIsHost(switchValue);
                  if (isJoined) {
                    leave();
                  }
                }}
                value={isHost}
              />
              <Text>Host</Text>
            </View>
            <View style={styles.btnContainer}>
              <Text onPress={join} style={styles.button}>
                Join
              </Text>
              <Text onPress={leave} style={styles.button}>
                Leave
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0055cc',
    margin: 5,
  },
  main: {flex: 1, alignItems: 'center'},
  scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
  btnContainer: {flexDirection: 'row', justifyContent: 'center'},
  head: {
    fontSize: 20,
    marginBottom: 10,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  userInfo: {textAlign: 'center', marginBottom: 10},
  videoContainer: {alignItems: 'center'},
  videoView: {
    width: '100%',
    height: Dimensions.get('screen').height,
    marginBottom: 10,
  },
  overlayButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: '150%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    flexDirection: 'row',
  },
  sendMessagebtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: '130%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayText: {fontSize: 20, fontWeight: 'bold', color: 'white'},
});
